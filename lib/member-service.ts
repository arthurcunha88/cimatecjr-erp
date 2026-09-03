import { supabaseAdmin } from "./supabase-server";
import type { MemberFormData } from "./member-schema";
import { hashOTC } from "./verification";

export type ServiceResult<T = void> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      field?: string;
      code?: string;
      details?: string;
    };

const PENDING_EXPIRATION_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export async function createPendingRegistration(
  input: MemberFormData,
  otc: string
): Promise<ServiceResult<{ pendingId: string }>> {
  try {
    // ==========================================================
    // 1. Verifica e-mail já cadastrado
    // ==========================================================

    const {
      data: existingEmail,
      error: emailCheckError,
    } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq(
        "institutional_email",
        input.institutional_email
      )
      .maybeSingle();

    if (emailCheckError) {
      console.error(
        "[member-service] erro verificando e-mail:",
        emailCheckError
      );

      return {
        ok: false,
        error:
          "Não foi possível verificar o e-mail. Tente novamente.",
        code: emailCheckError.code,
        details: emailCheckError.message,
      };
    }

    if (existingEmail) {
      return {
        ok: false,
        error:
          "Este e-mail já está cadastrado. Se já é membro, entre em contato com a CIMATEC jr.",
        field: "institutional_email",
        code: "EMAIL_ALREADY_EXISTS",
      };
    }

    // ==========================================================
    // 2. Verifica telefone já cadastrado
    // ==========================================================

    const {
      data: existingPhone,
      error: phoneCheckError,
    } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("phone", input.phone)
      .maybeSingle();

    if (phoneCheckError) {
      console.error(
        "[member-service] erro verificando telefone:",
        phoneCheckError
      );

      return {
        ok: false,
        error:
          "Não foi possível verificar o telefone. Tente novamente.",
        code: phoneCheckError.code,
        details: phoneCheckError.message,
      };
    }

    if (existingPhone) {
      return {
        ok: false,
        error:
          "Este telefone já está cadastrado. Verifique o número informado.",
        field: "phone",
        code: "PHONE_ALREADY_EXISTS",
      };
    }

    // ==========================================================
    // 3. Verifica matrícula já cadastrada
    // ==========================================================

    const {
      data: existingRegistration,
      error: registrationCheckError,
    } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq(
        "course_registration",
        input.course_registration
      )
      .maybeSingle();

    if (registrationCheckError) {
      console.error(
        "[member-service] erro verificando matrícula:",
        registrationCheckError
      );

      return {
        ok: false,
        error:
          "Não foi possível verificar a matrícula. Tente novamente.",
        code: registrationCheckError.code,
        details: registrationCheckError.message,
      };
    }

    if (existingRegistration) {
      return {
        ok: false,
        error:
          "Esta matrícula já está cadastrada. Verifique o número informado.",
        field: "course_registration",
        code: "REGISTRATION_ALREADY_EXISTS",
      };
    }

    // ==========================================================
    // 4. Remove tentativa pendente anterior
    // ==========================================================

    const { error: deleteError } =
      await supabaseAdmin
        .from("pending_member_registrations")
        .delete()
        .eq(
          "institutional_email",
          input.institutional_email
        );

    if (deleteError) {
      console.error(
        "[member-service] erro removendo cadastro pendente:",
        deleteError
      );

      return {
        ok: false,
        error:
          "Não foi possível preparar a verificação. Tente novamente.",
        code: deleteError.code,
        details: deleteError.message,
      };
    }

    // ==========================================================
    // 5. Cria novo cadastro pendente
    // ==========================================================

    const expiresAt = new Date(
      Date.now() +
        PENDING_EXPIRATION_MINUTES * 60 * 1000
    ).toISOString();

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("pending_member_registrations")
      .insert({
        full_name: input.full_name,
        institutional_email:
          input.institutional_email,
        phone: input.phone,
        birth_date: input.birth_date,
        gender: input.gender,
        color: input.color,
        course: input.course,
        course_registration:
          input.course_registration,
        semester: Number(input.semester),
        otc_hash: hashOTC(otc),
        expires_at: expiresAt,
        attempts: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error(
        "[member-service] ERRO AO CRIAR PENDING REGISTRATION",
        {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        }
      );

      return {
        ok: false,
        error:
          "Não foi possível iniciar a verificação. Tente novamente.",
        code: error.code,
        details: error.message,
      };
    }

    if (!data?.id) {
      console.error(
        "[member-service] Supabase não retornou o ID do cadastro pendente."
      );

      return {
        ok: false,
        error:
          "Não foi possível iniciar a verificação. Tente novamente.",
        code: "PENDING_ID_MISSING",
      };
    }

    return {
      ok: true,
      data: {
        pendingId: data.id,
      },
    };
  } catch (error) {
    console.error(
      "[member-service] erro inesperado:",
      error
    );

    return {
      ok: false,
      error:
        "Ocorreu um erro inesperado. Tente novamente.",
      code: "UNEXPECTED_ERROR",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

export async function confirmPendingRegistration(
  pendingId: string,
  otc: string
): Promise<ServiceResult<{ memberId: string }>> {
  try {
    // ==========================================================
    // 1. Busca cadastro pendente
    // ==========================================================

    const {
      data: pending,
      error,
    } = await supabaseAdmin
      .from("pending_member_registrations")
      .select("*")
      .eq("id", pendingId)
      .maybeSingle();

    if (error) {
      console.error(
        "[member-service] erro buscando cadastro pendente:",
        error
      );

      return {
        ok: false,
        error:
          "Não foi possível verificar o código. Tente novamente.",
        code: error.code,
        details: error.message,
      };
    }

    if (!pending) {
      return {
        ok: false,
        error:
          "Cadastro pendente não encontrado. Solicite um novo código.",
        code: "PENDING_NOT_FOUND",
      };
    }

    // ==========================================================
    // 2. Verifica expiração
    // ==========================================================

    if (
      new Date(pending.expires_at).getTime() <
      Date.now()
    ) {
      await supabaseAdmin
        .from("pending_member_registrations")
        .delete()
        .eq("id", pendingId);

      return {
        ok: false,
        error:
          "O código expirou. Solicite um novo código.",
        code: "OTC_EXPIRED",
      };
    }

    // ==========================================================
    // 3. Verifica limite de tentativas
    // ==========================================================

    if (pending.attempts >= MAX_ATTEMPTS) {
      await supabaseAdmin
        .from("pending_member_registrations")
        .delete()
        .eq("id", pendingId);

      return {
        ok: false,
        error:
          "Número máximo de tentativas atingido. Solicite um novo código.",
        code: "MAX_ATTEMPTS",
      };
    }

    // ==========================================================
    // 4. Compara OTC
    // ==========================================================

    const receivedHash = hashOTC(otc);

    if (
      receivedHash !== pending.otc_hash
    ) {
      const nextAttempts =
        pending.attempts + 1;

      await supabaseAdmin
        .from("pending_member_registrations")
        .update({
          attempts: nextAttempts,
        })
        .eq("id", pendingId);

      const remainingAttempts =
        MAX_ATTEMPTS - nextAttempts;

      return {
        ok: false,
        error:
          remainingAttempts > 0
            ? `Código incorreto. Você ainda possui ${remainingAttempts} tentativa(s).`
            : "Número máximo de tentativas atingido. Solicite um novo código.",
        code:
          remainingAttempts > 0
            ? "INVALID_OTC"
            : "MAX_ATTEMPTS",
      };
    }

    // ==========================================================
    // 5. OTC correto → cria membro definitivo
    // ==========================================================

    const {
      data: member,
      error: insertError,
    } = await supabaseAdmin
      .from("members")
      .insert({
        full_name: pending.full_name,
        institutional_email:
          pending.institutional_email,
        phone: pending.phone,
        birth_date: pending.birth_date,
        gender: pending.gender,
        color: pending.color,
        course: pending.course,
        course_registration:
          pending.course_registration,
        semester: pending.semester,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(
        "[member-service] erro criando membro:",
        {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        }
      );

      if (insertError.code === "23505") {
        if (
          insertError.message.includes(
            "institutional_email"
          )
        ) {
          return {
            ok: false,
            error:
              "Este e-mail já está cadastrado.",
            field: "institutional_email",
            code: "EMAIL_ALREADY_EXISTS",
          };
        }

        if (
          insertError.message.includes("phone")
        ) {
          return {
            ok: false,
            error:
              "Este telefone já está cadastrado.",
            field: "phone",
            code: "PHONE_ALREADY_EXISTS",
          };
        }

        if (
          insertError.message.includes(
            "course_registration"
          )
        ) {
          return {
            ok: false,
            error:
              "Esta matrícula já está cadastrada.",
            field: "course_registration",
            code: "REGISTRATION_ALREADY_EXISTS",
          };
        }
      }

      return {
        ok: false,
        error:
          "Não foi possível finalizar seu cadastro. Tente novamente.",
        code: insertError.code,
        details: insertError.message,
      };
    }

    // ==========================================================
    // 6. Cadastro confirmado → remove pending
    // ==========================================================

    const { error: deletePendingError } =
      await supabaseAdmin
        .from("pending_member_registrations")
        .delete()
        .eq("id", pendingId);

    if (deletePendingError) {
      console.error(
        "[member-service] erro removendo cadastro pendente após confirmação:",
        deletePendingError
      );
    }

    return {
      ok: true,
      data: {
        memberId: member.id as string,
      },
    };
  } catch (error) {
    console.error(
      "[member-service] erro inesperado na confirmação:",
      error
    );

    return {
      ok: false,
      error:
        "Ocorreu um erro inesperado. Tente novamente.",
      code: "UNEXPECTED_ERROR",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}
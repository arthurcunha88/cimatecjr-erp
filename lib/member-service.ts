import { supabaseAdmin } from "./supabase-server";
import type { MemberFormData } from "./member-schema";
import { hashOTC } from "./verification";

export type ServiceResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string };

export async function createPendingRegistration(
  input: MemberFormData,
  otc: string
): Promise<ServiceResult<{ pendingId: string }>> {
  // Verifica se o e-mail já existe
  const { data: existingEmail } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("institutional_email", input.institutional_email)
    .maybeSingle();

  if (existingEmail) {
    return {
      ok: false,
      error:
        "Este e-mail já está cadastrado. Se já é membro, entre em contato com a CIMATEC jr.",
      field: "institutional_email",
    };
  }

  // Verifica se o telefone já existe
  const { data: existingPhone } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("phone", input.phone)
    .maybeSingle();

  if (existingPhone) {
    return {
      ok: false,
      error:
        "Este telefone já está cadastrado. Verifique o número informado.",
      field: "phone",
    };
  }

  // Verifica se a matrícula já existe
  const { data: existingRegistration } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("course_registration", input.course_registration)
    .maybeSingle();

  if (existingRegistration) {
    return {
      ok: false,
      error:
        "Esta matrícula já está cadastrada. Verifique o número informado.",
      field: "course_registration",
    };
  }

  // Remove uma tentativa anterior desse mesmo e-mail
  await supabaseAdmin
    .from("pending_member_registrations")
    .delete()
    .eq("institutional_email", input.institutional_email);

  const expiresAt = new Date(
    Date.now() + 10 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabaseAdmin
    .from("pending_member_registrations")
    .insert({
      full_name: input.full_name,
      institutional_email: input.institutional_email,
      phone: input.phone,
      birth_date: input.birth_date,
      gender: input.gender,
      color: input.color,
      course: input.course,
      course_registration: input.course_registration,
      semester: Number(input.semester),
      otc_hash: hashOTC(otc),
      expires_at: expiresAt,
      attempts: 0,
    })
    .select("id")
    .single();

  if (error) {
    console.error(
      "[member-service] pending registration error:",
      error
    );

    return {
      ok: false,
      error:
        "Não foi possível iniciar a verificação. Tente novamente.",
    };
  }

  return {
    ok: true,
    data: {
      pendingId: data.id as string,
    },
  };
}

export async function confirmPendingRegistration(
  pendingId: string,
  otc: string
): Promise<ServiceResult<{ memberId: string }>> {
  const { data: pending, error } = await supabaseAdmin
    .from("pending_member_registrations")
    .select("*")
    .eq("id", pendingId)
    .maybeSingle();

  if (error) {
    console.error(
      "[member-service] pending lookup error:",
      error
    );

    return {
      ok: false,
      error:
        "Não foi possível verificar o código. Tente novamente.",
    };
  }

  if (!pending) {
    return {
      ok: false,
      error:
        "Cadastro pendente não encontrado. Solicite um novo código.",
    };
  }

  if (new Date(pending.expires_at).getTime() < Date.now()) {
    await supabaseAdmin
      .from("pending_member_registrations")
      .delete()
      .eq("id", pendingId);

    return {
      ok: false,
      error:
        "O código expirou. Solicite um novo código.",
    };
  }

  if (pending.attempts >= 5) {
    await supabaseAdmin
      .from("pending_member_registrations")
      .delete()
      .eq("id", pendingId);

    return {
      ok: false,
      error:
        "Número máximo de tentativas atingido. Solicite um novo código.",
    };
  }

  const receivedHash = hashOTC(otc);

  if (receivedHash !== pending.otc_hash) {
    await supabaseAdmin
      .from("pending_member_registrations")
      .update({
        attempts: pending.attempts + 1,
      })
      .eq("id", pendingId);

    const remainingAttempts =
      5 - (pending.attempts + 1);

    return {
      ok: false,
      error:
        remainingAttempts > 0
          ? `Código incorreto. Você ainda possui ${remainingAttempts} tentativa(s).`
          : "Número máximo de tentativas atingido. Solicite um novo código.",
    };
  }

  const { data: member, error: insertError } =
    await supabaseAdmin
      .from("members")
      .insert({
        full_name: pending.full_name,
        institutional_email: pending.institutional_email,
        phone: pending.phone,
        birth_date: pending.birth_date,
        gender: pending.gender,
        color: pending.color,
        course: pending.course,
        course_registration: pending.course_registration,
        semester: pending.semester,
      })
      .select("id")
      .single();

  if (insertError) {
    console.error(
      "[member-service] member insert error:",
      insertError
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
        };
      }

      if (insertError.message.includes("phone")) {
        return {
          ok: false,
          error:
            "Este telefone já está cadastrado.",
          field: "phone",
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
        };
      }
    }

    return {
      ok: false,
      error:
        "Não foi possível finalizar seu cadastro. Tente novamente.",
    };
  }

  // Cadastro confirmado: remove o registro pendente
  await supabaseAdmin
    .from("pending_member_registrations")
    .delete()
    .eq("id", pendingId);

  return {
    ok: true,
    data: {
      memberId: member.id as string,
    },
  };
}
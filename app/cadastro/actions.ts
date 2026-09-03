"use server";

import { cookies } from "next/headers";

import { memberSchema } from "@/lib/member-schema";

import {
  confirmPendingRegistration,
  createPendingRegistration,
} from "@/lib/member-service";

import {
  generateOTC,
  VERIFICATION_COOKIE_NAME,
  VERIFICATION_MAX_AGE,
} from "@/lib/verification";

import { sendOTCEmail } from "@/lib/email-service";

export type ActionState =
  | {
      status: "idle";
    }
  | {
      status: "verification_sent";
      email: string;
    }
  | {
      status: "success";
      email: string;
    }
  | {
      status: "error";
      message: string;
      field?: string;
      code?: string;
    }
  | {
      status: "validation_error";
      errors: Record<string, string>;
    };

export async function requestRegistrationVerification(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // ==========================================================
    // 1. Validação do formulário
    // ==========================================================

    const raw = Object.fromEntries(
      formData.entries()
    );

    const parsed =
      memberSchema.safeParse(raw);

    if (!parsed.success) {
      const errors: Record<string, string> = {};

      parsed.error.issues.forEach(
        (issue) => {
          const key =
            issue.path[0]?.toString();

          if (key && !errors[key]) {
            errors[key] = issue.message;
          }
        }
      );

      return {
        status: "validation_error",
        errors,
      };
    }

    // ==========================================================
    // 2. Gera OTC
    // ==========================================================

    const otc = generateOTC();

    // ==========================================================
    // 3. Cria cadastro pendente
    // ==========================================================

    const result =
      await createPendingRegistration(
        parsed.data,
        otc
      );

    if (!result.ok) {
      console.error(
        "[actions] createPendingRegistration falhou:",
        {
          code: result.code,
          details: result.details,
        }
      );

      return {
        status: "error",
        message: result.error,
        field: result.field,

        // Mostra apenas em desenvolvimento
        code:
          process.env.NODE_ENV ===
          "development"
            ? result.code
            : undefined,
      };
    }

    // ==========================================================
    // 4. Envia OTC por e-mail
    // ==========================================================

    const emailResult =
      await sendOTCEmail({
        to: parsed.data.institutional_email,
        name: parsed.data.full_name,
        otc,
      });

    if (!emailResult.ok) {
      console.error(
        "[actions] envio do OTC falhou:",
        emailResult.error
      );

      await deletePendingRegistration(
        result.data.pendingId
      );

      return {
        status: "error",
        message:
          "Não foi possível enviar o código de confirmação. Tente novamente.",

        code:
          process.env.NODE_ENV ===
          "development"
            ? "RESEND_ERROR"
            : undefined,
      };
    }

    // ==========================================================
    // 5. Guarda ID do pending em cookie HTTP-only
    // ==========================================================

    const cookieStore = await cookies();

    cookieStore.set({
      name: VERIFICATION_COOKIE_NAME,

      value: result.data.pendingId,

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "strict",

      maxAge: VERIFICATION_MAX_AGE,

      path: "/",
    });

    // ==========================================================
    // 6. Avança para VerificationScreen
    // ==========================================================

    return {
      status: "verification_sent",
      email:
        parsed.data.institutional_email,
    };
  } catch (error) {
    console.error(
      "[actions] erro inesperado:",
      error
    );

    return {
      status: "error",

      message:
        "Ocorreu um erro inesperado. Tente novamente.",

      code:
        process.env.NODE_ENV ===
        "development"
          ? "UNEXPECTED_ERROR"
          : undefined,
    };
  }
}

export async function confirmRegistration(
  otcInput: string
): Promise<ActionState> {
  try {
    // ==========================================================
    // 1. Validação básica do OTC
    // ==========================================================

    const otc = otcInput.trim();

    if (!/^\d{5}$/.test(otc)) {
      return {
        status: "error",
        message:
          "Digite um código OTC válido com 5 dígitos.",
      };
    }

    // ==========================================================
    // 2. Recupera cadastro pendente pelo cookie
    // ==========================================================

    const cookieStore = await cookies();

    const pendingCookie =
      cookieStore.get(
        VERIFICATION_COOKIE_NAME
      );

    if (!pendingCookie) {
      return {
        status: "error",
        message:
          "Não encontramos um cadastro pendente. Solicite um novo código.",

        code:
          process.env.NODE_ENV ===
          "development"
            ? "PENDING_COOKIE_MISSING"
            : undefined,
      };
    }

    // ==========================================================
    // 3. Valida OTC
    // ==========================================================

    const result =
      await confirmPendingRegistration(
        pendingCookie.value,
        otc
      );

    if (!result.ok) {
      return {
        status: "error",
        message: result.error,
        field: result.field,

        code:
          process.env.NODE_ENV ===
          "development"
            ? result.code
            : undefined,
      };
    }

    // ==========================================================
    // 4. Remove cookie
    // ==========================================================

    cookieStore.delete(
      VERIFICATION_COOKIE_NAME
    );

    // ==========================================================
    // 5. Busca e-mail do membro confirmado
    // ==========================================================

    const { supabaseAdmin } =
      await import(
        "@/lib/supabase-server"
      );

    const { data: member } =
      await supabaseAdmin
        .from("members")
        .select("institutional_email")
        .eq("id", result.data.memberId)
        .single();

    // ==========================================================
    // 6. Sucesso
    // ==========================================================

    return {
      status: "success",
      email:
        member?.institutional_email ?? "",
    };
  } catch (error) {
    console.error(
      "[actions] erro inesperado na confirmação:",
      error
    );

    return {
      status: "error",

      message:
        "Ocorreu um erro inesperado. Tente novamente.",

      code:
        process.env.NODE_ENV ===
        "development"
          ? "UNEXPECTED_ERROR"
          : undefined,
    };
  }
}

async function deletePendingRegistration(
  pendingId: string
) {
  const { supabaseAdmin } =
    await import(
      "@/lib/supabase-server"
    );

  const { error } =
    await supabaseAdmin
      .from("pending_member_registrations")
      .delete()
      .eq("id", pendingId);

  if (error) {
    console.error(
      "[actions] erro removendo pending:",
      error
    );
  }
}
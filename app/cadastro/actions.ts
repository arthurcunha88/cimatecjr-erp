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
  | { status: "idle" }
  | { status: "verification_sent"; email: string }
  | { status: "success"; email: string }
  | { status: "error"; message: string; field?: string }
  | {
      status: "validation_error";
      errors: Record<string, string>;
    };

export async function requestRegistrationVerification(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = memberSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};

    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0]?.toString();

      if (key && !errors[key]) {
        errors[key] = issue.message;
      }
    });

    return {
      status: "validation_error",
      errors,
    };
  }

  const otc = generateOTC();

  const result = await createPendingRegistration(
    parsed.data,
    otc
  );

  if (!result.ok) {
    return {
      status: "error",
      message: result.error,
      field: result.field,
    };
  }

  const emailResult = await sendOTCEmail({
    to: parsed.data.institutional_email,
    name: parsed.data.full_name,
    otc,
  });

  if (!emailResult.ok) {
    await deletePendingRegistration(
      result.data.pendingId
    );

    return {
      status: "error",
      message:
        "Não foi possível enviar o código de confirmação. Tente novamente.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set({
    name: VERIFICATION_COOKIE_NAME,
    value: result.data.pendingId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: VERIFICATION_MAX_AGE,
    path: "/",
  });

  return {
    status: "verification_sent",
    email: parsed.data.institutional_email,
  };
}

export async function confirmRegistration(
  otcInput: string
): Promise<ActionState> {
  const otc = otcInput.trim();

  if (!/^\d{5}$/.test(otc)) {
    return {
      status: "error",
      message:
        "Digite um código OTC válido com 5 dígitos.",
    };
  }

  const cookieStore = await cookies();

  const pendingCookie = cookieStore.get(
    VERIFICATION_COOKIE_NAME
  );

  if (!pendingCookie) {
    return {
      status: "error",
      message:
        "Não encontramos um cadastro pendente. Solicite um novo código.",
    };
  }

  const result = await confirmPendingRegistration(
    pendingCookie.value,
    otc
  );

  if (!result.ok) {
    return {
      status: "error",
      message: result.error,
      field: result.field,
    };
  }

  cookieStore.delete(VERIFICATION_COOKIE_NAME);

  const { data: member } = await getMemberEmail(
    result.data.memberId
  );

  return {
    status: "success",
    email: member?.institutional_email ?? "",
  };
}

async function deletePendingRegistration(
  pendingId: string
) {
  const { supabaseAdmin } = await import(
    "@/lib/supabase-server"
  );

  await supabaseAdmin
    .from("pending_member_registrations")
    .delete()
    .eq("id", pendingId);
}

async function getMemberEmail(memberId: string) {
  const { supabaseAdmin } = await import(
    "@/lib/supabase-server"
  );

  return await supabaseAdmin
    .from("members")
    .select("institutional_email")
    .eq("id", memberId)
    .single();
}
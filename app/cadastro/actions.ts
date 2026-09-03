"use server";

import { memberSchema } from "@/lib/member-schema";
import { registerMember } from "@/lib/member-service";
import { sendOTCEmail } from "@/lib/email-service";

export type ActionState =
  | { status: "idle" }
  | { status: "success"; email: string; otc: string }
  | { status: "error"; message: string; field?: string }
  | { status: "validation_error"; errors: Record<string, string> };

export async function registerMemberAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());

  const parsed = memberSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0]?.toString();
      if (key && !errors[key]) errors[key] = issue.message;
    });
    return { status: "validation_error", errors };
  }

  const result = await registerMember(parsed.data);
  if (!result.ok) {
    return { status: "error", message: result.error, field: result.field };
  }

  const { otc } = result.data;

  const emailResult = await sendOTCEmail({
    to:   parsed.data.institutional_email,
    name: parsed.data.full_name,
    otc,
  });

  if (!emailResult.ok) {
    console.warn("[action] email failed after successful register");
  }

  return { status: "success", email: parsed.data.institutional_email, otc };
}

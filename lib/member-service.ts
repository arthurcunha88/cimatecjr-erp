import { supabaseAdmin } from "./supabase-server";
import type { MemberFormData } from "./member-schema";

export type ServiceResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string };

// ─── OTC ────────────────────────────────────────────────────────────────────

function generateOTC(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

// ─── Register member + OTC ───────────────────────────────────────────────────

export async function registerMember(
  input: MemberFormData
): Promise<ServiceResult<{ memberId: string; otc: string }>> {
  // 1. Insert member
  const { data: member, error: insertError } = await supabaseAdmin
    .from("members")
    .insert({
      full_name:           input.full_name,
      institutional_email: input.institutional_email,
      phone:               input.phone,
      birth_date:          input.birth_date,
      sex:                 input.sex,
      gender:              input.gender,
      color:               input.color,
      course:              input.course,
      course_registration: input.course_registration,
      semester:            Number(input.semester),
    })
    .select("id")
    .single();

  if (insertError) {
    // Violação de unicidade — código Postgres 23505
    if (insertError.code === "23505") {
      if (insertError.message.includes("institutional_email")) {
        return { ok: false, error: "Este e-mail já está cadastrado.", field: "institutional_email" };
      }
      if (insertError.message.includes("phone")) {
        return { ok: false, error: "Este telefone já está cadastrado.", field: "phone" };
      }
      return { ok: false, error: "Já existe um cadastro com esses dados." };
    }
    console.error("[member-service] insert error:", insertError);
    return { ok: false, error: "Erro ao salvar o cadastro. Tente novamente." };
  }

  const memberId = member.id as string;

  // 2. Generate OTC
  const otc     = generateOTC();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // +10 min

  const { error: otcError } = await supabaseAdmin.from("member_otcs").insert({
    member_id:  memberId,
    code:       otc,
    type:       "create_account",
    expires_at: expires,
    used:       false,
  });

  if (otcError) {
    console.error("[member-service] otc insert error:", otcError);
    // Membro foi salvo; OTC falhou — retorna erro mas não desfaz o cadastro
    return { ok: false, error: "Cadastro salvo, mas não foi possível gerar o código de confirmação." };
  }

  return { ok: true, data: { memberId, otc } };
}

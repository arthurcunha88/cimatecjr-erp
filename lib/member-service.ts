import { supabaseAdmin } from "./supabase-server";
import type { MemberFormData } from "./member-schema";

export type ServiceResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; field?: string };

function generateOTC(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function registerMember(
  input: MemberFormData
): Promise<ServiceResult<{ memberId: string; otc: string }>> {
  const { data: member, error: insertError } = await supabaseAdmin
    .from("members")
    .insert({
      full_name:           input.full_name,
      institutional_email: input.institutional_email,
      phone:               input.phone,
      birth_date:          input.birth_date,
      gender:              input.gender,
      color:               input.color,
      course:              input.course,
      course_registration: input.course_registration,
      semester:            Number(input.semester),
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[member-service] insert error:", insertError);

    if (insertError.code === "23505") {
      if (insertError.message.includes("institutional_email")) {
        return { ok: false, error: "Este e-mail já está cadastrado. Se já é membro, entre em contato com a CIMATEC jr.", field: "institutional_email" };
      }
      if (insertError.message.includes("phone")) {
        return { ok: false, error: "Este telefone já está cadastrado. Verifique o número informado.", field: "phone" };
      }
      if (insertError.message.includes("course_registration")) {
        return { ok: false, error: "Esta matrícula já está cadastrada. Verifique o número informado.", field: "course_registration" };
      }
      return { ok: false, error: "Já existe um cadastro com esses dados." };
    }

    if (insertError.code === "23502") {
      return { ok: false, error: `Campo obrigatório ausente: ${insertError.message}` };
    }

    if (insertError.code === "23514") {
      return { ok: false, error: "Um dos valores informados não é permitido. Verifique os campos e tente novamente." };
    }

    return { ok: false, error: `Erro ao salvar o cadastro (código ${insertError.code}). Tente novamente ou entre em contato com a CIMATEC jr.` };
  }

  const memberId = member.id as string;
  const otc      = generateOTC();
  const expires  = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: otcError } = await supabaseAdmin.from("member_otcs").insert({
    member_id:  memberId,
    code:       otc,
    type:       "create_account",
    expires_at: expires,
    used:       false,
  });

  if (otcError) {
    console.error("[member-service] otc insert error:", otcError);
    return { ok: false, error: "Cadastro salvo, mas não foi possível gerar o código de confirmação. Entre em contato com a CIMATEC jr." };
  }

  return { ok: true, data: { memberId, otc } };
}
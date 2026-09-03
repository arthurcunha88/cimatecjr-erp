"use client";

import { UseFormReturn } from "react-hook-form";
import { COURSES, COLORS, SEXES, GENDERS } from "@/lib/domain";
import type { MemberFormData } from "@/lib/member-schema";

interface Props {
  form: UseFormReturn<MemberFormData>;
  consentError?: string;
  consentChecked: boolean;
  onConsentChange: (v: boolean) => void;
}

function label<T extends { value: string; label: string }>(
  list: readonly T[],
  value: string
) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default function StepReview({
  form,
  consentError,
  consentChecked,
  onConsentChange,
}: Props) {
  const values = form.getValues();

  const birthFormatted = values.birth_date
    ? new Date(values.birth_date + "T12:00:00").toLocaleDateString("pt-BR")
    : "—";

  const rows: [string, string][] = [
    ["Nome",        values.full_name || "—"],
    ["E-mail",      values.institutional_email || "—"],
    ["Telefone",    values.phone || "—"],
    ["Nascimento",  birthFormatted],
    ["Sexo",        label(SEXES as unknown as {value:string;label:string}[], values.sex)],
    ["Gênero",      label(GENDERS as unknown as {value:string;label:string}[], values.gender)],
    ["Cor / raça",  label(COLORS as unknown as {value:string;label:string}[], values.color)],
    ["Curso",       label(COURSES as unknown as {value:string;label:string}[], values.course)],
    ["Matrícula",   values.course_registration || "—"],
    ["Semestre",    values.semester ? `${values.semester}º semestre` : "—"],
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[19px] font-bold text-[#1a1c1c]">Confirme seus dados</h2>
        <p className="text-[13px] text-[#5f5e5e] mt-1 leading-relaxed">
          Revise as informações antes de enviar.
        </p>
      </div>

      {/* Summary table */}
      <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <tbody>
            {rows.map(([k, v], i) => (
              <tr
                key={k}
                className={i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}
              >
                <td className="px-4 py-2.5 text-[#888] w-32">{k}</td>
                <td className="px-4 py-2.5 text-[#1a1c1c] font-medium text-right">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Consent */}
      <div className="bg-[#f9f9f9] border border-[#e5e5e5] border-l-4 border-l-[#c8181e] rounded-lg p-4">
        <p className="text-[12px] text-[#5f5e5e] leading-relaxed">
          Seus dados serão armazenados de forma segura no sistema interno da CIMATEC jr.
          e utilizados exclusivamente para fins organizacionais, em conformidade com a{" "}
          <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
          Nenhuma informação será compartilhada com terceiros sem o seu consentimento.
        </p>
        <label className="flex items-start gap-2 mt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#c8181e] cursor-pointer shrink-0"
          />
          <span className="text-[12px] text-[#1a1c1c] leading-relaxed">
            Li e concordo com o armazenamento e uso dos meus dados pela CIMATEC jr.
          </span>
        </label>
        {consentError && (
          <p className="text-[11px] text-[#ba1a1a] mt-1">{consentError}</p>
        )}
      </div>
    </div>
  );
}

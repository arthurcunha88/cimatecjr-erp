"use client";

import { UseFormReturn } from "react-hook-form";
import Input from "@/components/ui/Input";
import type { MemberFormData } from "@/lib/member-schema";

interface Props {
  form: UseFormReturn<MemberFormData>;
}

function phoneMask(value: string) {
  const v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 2)  return v.length ? `(${v}` : "";
  if (v.length <= 7)  return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
}

export default function StepIdentification({ form }: Props) {
  const { register, formState: { errors }, setValue } = form;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[19px] font-bold text-[#1a1c1c]">Identificação</h2>
        <p className="text-[13px] text-[#5f5e5e] mt-1 leading-relaxed">
          Informe seus dados de contato. O e-mail institucional é obrigatório para o cadastro.
        </p>
      </div>

      <Input
        label="Nome completo"
        required
        placeholder="Ex.: Maria Silva Santos"
        error={errors.full_name?.message}
        {...register("full_name")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="E-mail institucional"
          required
          type="email"
          placeholder="nome@cimatecjr.com.br"
          error={errors.institutional_email?.message}
          {...register("institutional_email")}
        />
        <Input
          label="Telefone"
          required
          type="tel"
          placeholder="(71) 99999-9999"
          maxLength={15}
          error={errors.phone?.message}
          {...register("phone")}
          onChange={(e) => {
            setValue("phone", phoneMask(e.target.value), { shouldValidate: false });
          }}
        />
      </div>
    </div>
  );
}

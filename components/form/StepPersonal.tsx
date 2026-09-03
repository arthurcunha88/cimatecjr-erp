"use client";

import { UseFormReturn } from "react-hook-form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { GENDERS, COLORS } from "@/lib/domain";
import type { MemberFormData } from "@/lib/member-schema";

interface Props {
  form: UseFormReturn<MemberFormData>;
}

export default function StepPersonal({ form }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[19px] font-bold text-[#1a1c1c]">Dados pessoais</h2>
        <p className="text-[13px] text-[#5f5e5e] mt-1 leading-relaxed">
          Essas informações são armazenadas de forma segura e utilizadas apenas internamente pela CIMATEC jr.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data de nascimento"
          required
          type="date"
          error={errors.birth_date?.message}
          {...register("birth_date")}
        />
        <Select
          label="Gênero"
          required
          options={GENDERS as unknown as { value: string; label: string }[]}
          error={errors.gender?.message}
          {...register("gender")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Cor / raça"
          required
          options={COLORS as unknown as { value: string; label: string }[]}
          error={errors.color?.message}
          {...register("color")}
        />
      </div>
    </div>
  );
}
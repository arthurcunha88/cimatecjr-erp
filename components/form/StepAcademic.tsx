"use client";

import { UseFormReturn } from "react-hook-form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { COURSES, SEMESTERS } from "@/lib/domain";
import type { MemberFormData } from "@/lib/member-schema";

interface Props {
  form: UseFormReturn<MemberFormData>;
}

export default function StepAcademic({ form }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[19px] font-bold text-[#1a1c1c]">Dados acadêmicos</h2>
        <p className="text-[13px] text-[#5f5e5e] mt-1 leading-relaxed">
          Informe seu curso e matrícula na CIMATEC.
        </p>
      </div>

      <Select
        label="Curso"
        required
        placeholder="Selecione o curso"
        options={COURSES as unknown as { value: string; label: string }[]}
        error={errors.course?.message}
        {...register("course")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Matrícula"
          required
          placeholder="4s2.000000"
          maxLength={10}
          autoComplete="off"
          hint="Ex.: 4s2.005542 · até 10 caracteres"
          error={errors.course_registration?.message}
          className="font-mono"
          {...register("course_registration")}
        />
        <Select
          label="Semestre atual"
          required
          options={SEMESTERS}
          error={errors.semester?.message}
          {...register("semester")}
        />
      </div>
    </div>
  );
}

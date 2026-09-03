import { z } from "zod";
import { COURSES, COLORS, GENDERS, isInstitutionalEmail } from "./domain";

const courseValues  = COURSES.map((c) => c.value) as [string, ...string[]];
const colorValues   = COLORS.map((c)  => c.value) as [string, ...string[]];
const genderValues  = GENDERS.map((g) => g.value) as [string, ...string[]];

export const memberSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Informe o nome completo.")
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Informe nome e sobrenome.",
    }),

  institutional_email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Informe um e-mail válido.")
    .refine(isInstitutionalEmail, {
      message: "Use o e-mail @cimatecjr.com.br ou o formato trainee (nome.cimatecjr@gmail.com).",
    }),

  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Informe um telefone com DDD.").max(11, "Telefone inválido.")),

  birth_date: z
    .string()
    .min(1, "Informe a data de nascimento.")
    .refine((v) => !isNaN(Date.parse(v)), { message: "Data inválida." }),

  gender: z
    .string()
    .refine((v) => genderValues.includes(v), { message: "Selecione uma opção." }),

  color: z
    .string()
    .refine((v) => colorValues.includes(v), { message: "Selecione uma opção." }),

  course: z
    .string()
    .refine((v) => courseValues.includes(v), { message: "Selecione o curso." }),

  course_registration: z
    .string()
    .trim()
    .min(3, "Informe a matrícula.")
    .max(10, "A matrícula deve ter até 10 caracteres."),

  semester: z
    .string()
    .min(1, "Selecione o semestre.")
    .refine((v) => Number(v) >= 1 && Number(v) <= 10, { message: "Semestre inválido." }),
});

export type MemberFormData = z.infer<typeof memberSchema>;
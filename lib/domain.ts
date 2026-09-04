export const INSTITUTIONAL_DOMAIN =
  process.env.INSTITUTIONAL_EMAIL_DOMAIN ?? "cimatecjr.com.br";

// E-mail válido somente se termina com @cimatecjr.com.br
export function isInstitutionalEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();

  return lower.endsWith(`@${INSTITUTIONAL_DOMAIN}`);
}

export const COURSES = [
  { value: "eng-computacao", label: "Engenharia de Computação" },
  { value: "eng-civil", label: "Engenharia Civil" },
  { value: "eng-mecanica", label: "Engenharia Mecânica" },
  { value: "eng-quimica", label: "Engenharia Química" },
  { value: "eng-producao", label: "Engenharia de Produção" },
  { value: "eng-automacao", label: "Engenharia de Automação" },
  { value: "eng-eletrica", label: "Engenharia Elétrica" },
  { value: "arq-urbanismo", label: "Arquitetura e Urbanismo" },
] as const;

export const COLORS = [
  { value: "branca", label: "Branca" },
  { value: "preta", label: "Preta" },
  { value: "parda", label: "Parda" },
  { value: "amarela", label: "Amarela" },
  { value: "indigena", label: "Indígena" },
  { value: "outra", label: "Outra" },
] as const;

export const GENDERS = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
] as const;

export const SEMESTERS = Array.from(
  { length: 10 },
  (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}º semestre`,
  })
);

export type CourseValue =
  typeof COURSES[number]["value"];

export type ColorValue =
  typeof COLORS[number]["value"];

export type GenderValue =
  typeof GENDERS[number]["value"];
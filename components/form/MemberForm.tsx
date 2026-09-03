"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { memberSchema, type MemberFormData } from "@/lib/member-schema";
import { registerMemberAction, type ActionState } from "@/app/cadastro/actions";

import FormProgress       from "./FormProgress";
import StepIdentification from "./StepIdentification";
import StepPersonal       from "./StepPersonal";
import StepAcademic       from "./StepAcademic";
import StepReview         from "./StepReview";
import SuccessScreen      from "./SuccessScreen";

const STEP_FIELDS: (keyof MemberFormData)[][] = [
  ["full_name", "institutional_email", "phone"],
  ["birth_date", "gender", "color"],
  ["course", "course_registration", "semester"],
  [],
];

const TOTAL_STEPS = 4;

export default function MemberForm() {
  const [step, setStep]                 = useState(1);
  const [consent, setConsent]           = useState(false);
  const [consentError, setConsentError] = useState("");
  const [actionState, setActionState]   = useState<ActionState>({ status: "idle" });
  const [isPending, startTransition]    = useTransition();

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    mode: "onTouched",
    defaultValues: {
      full_name: "", institutional_email: "", phone: "",
      birth_date: "", gender: "" as never,
      color: "" as never, course: "" as never,
      course_registration: "", semester: "",
    },
  });

  const { trigger, handleSubmit } = form;

  async function goNext() {
    const fields = STEP_FIELDS[step - 1];
    const valid  = fields.length ? await trigger(fields) : true;
    if (!valid) return;

    if (step === TOTAL_STEPS) {
      if (!consent) { setConsentError("Aceite os termos para continuar."); return; }
      handleSubmit(onSubmit)();
      return;
    }
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function onSubmit(data: MemberFormData) {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      const result = await registerMemberAction({ status: "idle" }, fd);
      setActionState(result);
    });
  }

  if (actionState.status === "success") {
    return <SuccessScreen email={actionState.email} otc={actionState.otc} />;
  }

  return (
    <div>
      <FormProgress currentStep={step} />
      <hr className="border-[#e5e5e5] mb-6" />

      {actionState.status === "error" && (
        <div className="mb-4 rounded-lg bg-[#fff0f0] border border-[#f5c6c6] px-4 py-3 text-[13px] text-[#ba1a1a]">
          {actionState.message}
        </div>
      )}

      {step === 1 && <StepIdentification form={form} />}
      {step === 2 && <StepPersonal form={form} />}
      {step === 3 && <StepAcademic form={form} />}
      {step === 4 && (
        <StepReview
          form={form}
          consentError={consentError}
          consentChecked={consent}
          onConsentChange={(v) => { setConsent(v); if (v) setConsentError(""); }}
        />
      )}

      <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#e5e5e5]">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="h-10 px-5 rounded-lg text-[14px] font-medium border border-[#d1d1d1] text-[#555] bg-white hover:bg-[#f5f5f5] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          Voltar
        </button>

        <span className="text-[12px] text-[#999]">
          Etapa {step} de {TOTAL_STEPS}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={isPending}
          className="h-10 px-6 rounded-lg text-[14px] font-semibold text-white bg-[#c8181e] hover:bg-[#a81419] disabled:opacity-60 disabled:pointer-events-none transition-colors flex items-center gap-2"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {step === TOTAL_STEPS ? "Confirmar cadastro" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
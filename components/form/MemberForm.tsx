"use client";

import { useState, useTransition } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2 } from "lucide-react";

import {
  memberSchema,
  type MemberFormData,
} from "@/lib/member-schema";

import {
  requestRegistrationVerification,
  confirmRegistration,
  type ActionState,
} from "@/app/cadastro/actions";

import FormProgress from "./FormProgress";
import StepIdentification from "./StepIdentification";
import StepPersonal from "./StepPersonal";
import StepAcademic from "./StepAcademic";
import StepReview from "./StepReview";
import VerificationScreen from "./VerificationScreen";
import SuccessScreen from "./SuccessScreen";

const STEP_FIELDS: (
  keyof MemberFormData
)[][] = [
  [
    "full_name",
    "institutional_email",
    "phone",
  ],

  [
    "birth_date",
    "gender",
    "color",
  ],

  [
    "course",
    "course_registration",
    "semester",
  ],

  [],
];

const TOTAL_STEPS = 4;

export default function MemberForm() {
  const [step, setStep] =
    useState(1);

  const [consent, setConsent] =
    useState(false);

  const [consentError, setConsentError] =
    useState("");

  const [actionState, setActionState] =
    useState<ActionState>({
      status: "idle",
    });

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const form =
    useForm<MemberFormData>({
      resolver:
        zodResolver(memberSchema),

      mode: "onTouched",

      defaultValues: {
        full_name: "",
        institutional_email: "",
        phone: "",
        birth_date: "",
        gender: "" as never,
        color: "" as never,
        course: "" as never,
        course_registration: "",
        semester: "",
      },
    });

  const {
    trigger,
    handleSubmit,
  } = form;

  // ==========================================================
  // Avança etapa
  // ==========================================================

  async function goNext() {
    const fields =
      STEP_FIELDS[step - 1];

    const valid = fields.length
      ? await trigger(fields)
      : true;

    if (!valid) {
      return;
    }

    // ========================================================
    // Última etapa
    // ========================================================

    if (step === TOTAL_STEPS) {
      if (!consent) {
        setConsentError(
          "Aceite os termos para continuar."
        );

        return;
      }

      setConsentError("");

      handleSubmit(onSubmit)();

      return;
    }

    setStep(
      (current) => current + 1
    );
  }

  // ==========================================================
  // Voltar
  // ==========================================================

  function goBack() {
    if (step > 1) {
      setStep(
        (current) => current - 1
      );
    }
  }

  // ==========================================================
  // Envia cadastro para Server Action
  // ==========================================================

  function onSubmit(
    data: MemberFormData
  ) {
    startTransition(
      async () => {
        const formData =
          new FormData();

        Object.entries(data).forEach(
          ([key, value]) => {
            formData.append(
              key,
              value
            );
          }
        );

        const result =
          await requestRegistrationVerification(
            {
              status: "idle",
            },
            formData
          );

        setActionState(result);
      }
    );
  }

  // ==========================================================
  // Confirma OTC
  // ==========================================================

  function handleVerification(
    otc: string
  ) {
    startTransition(
      async () => {
        const result =
          await confirmRegistration(
            otc
          );

        setActionState(result);
      }
    );
  }

  // ==========================================================
  // Verification Screen
  // ==========================================================

  if (
    actionState.status ===
    "verification_sent"
  ) {
    return (
      <VerificationScreen
        email={actionState.email}
        isPending={isPending}
        onVerify={
          handleVerification
        }
      />
    );
  }

  // ==========================================================
  // Success Screen
  // ==========================================================

  if (
    actionState.status ===
    "success"
  ) {
    return (
      <SuccessScreen
        email={actionState.email}
      />
    );
  }

  // ==========================================================
  // Formulário
  // ==========================================================

  return (
    <div>
      <FormProgress
        currentStep={step}
      />

      <hr className="border-[#e5e5e5] mb-6" />

      {/* ======================================================
          ERRO DO SERVIDOR
      ======================================================= */}

      {actionState.status ===
        "error" && (
        <div className="mb-4 rounded-lg bg-[#fff0f0] border border-[#f5c6c6] px-4 py-3 text-[13px] text-[#ba1a1a]">
          <p>
            {actionState.message}
          </p>

          {actionState.code && (
            <p className="mt-2 text-[11px] font-mono text-[#8a3a3a]">
              Código técnico:{" "}
              {actionState.code}
            </p>
          )}
        </div>
      )}

      {/* ======================================================
          ERRO DE VALIDAÇÃO
      ======================================================= */}

      {actionState.status ===
        "validation_error" && (
        <div className="mb-4 rounded-lg bg-[#fff0f0] border border-[#f5c6c6] px-4 py-3 text-[13px] text-[#ba1a1a]">
          Verifique os campos
          preenchidos.
        </div>
      )}

      {/* ======================================================
          ETAPA 1
      ======================================================= */}

      {step === 1 && (
        <StepIdentification
          form={form}
        />
      )}

      {/* ======================================================
          ETAPA 2
      ======================================================= */}

      {step === 2 && (
        <StepPersonal
          form={form}
        />
      )}

      {/* ======================================================
          ETAPA 3
      ======================================================= */}

      {step === 3 && (
        <StepAcademic
          form={form}
        />
      )}

      {/* ======================================================
          ETAPA 4
      ======================================================= */}

      {step === 4 && (
        <StepReview
          form={form}
          consentError={
            consentError
          }
          consentChecked={
            consent
          }
          onConsentChange={(
            value
          ) => {
            setConsent(value);

            if (value) {
              setConsentError(
                ""
              );
            }
          }}
        />
      )}

      {/* ======================================================
          NAVEGAÇÃO
      ======================================================= */}

      <div className="flex justify-between items-center mt-6 pt-5 border-t border-[#e5e5e5]">
        <button
          type="button"
          onClick={goBack}
          disabled={
            step === 1 ||
            isPending
          }
          className="h-10 px-5 rounded-lg text-[14px] font-medium border border-[#d1d1d1] text-[#555] bg-white hover:bg-[#f5f5f5] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          Voltar
        </button>

        <span className="text-[12px] text-[#999]">
          Etapa {step} de{" "}
          {TOTAL_STEPS}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={isPending}
          className="h-10 px-6 rounded-lg text-[14px] font-semibold text-white bg-[#c8181e] hover:bg-[#a81419] disabled:opacity-60 disabled:pointer-events-none transition-colors flex items-center gap-2"
        >
          {isPending && (
            <Loader2
              size={14}
              className="animate-spin"
            />
          )}

          {step === TOTAL_STEPS
            ? "Enviar código por e-mail"
            : "Continuar"}
        </button>
      </div>
    </div>
  );
}
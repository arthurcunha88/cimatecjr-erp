import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Identificação" },
  { label: "Dados pessoais" },
  { label: "Acadêmico" },
  { label: "Revisão" },
];

interface FormProgressProps {
  currentStep: number; // 1-based
}

export default function FormProgress({
  currentStep,
}: FormProgressProps) {
  const currentLabel =
    STEPS[currentStep - 1]?.label;

  return (
    <div className="mb-5 sm:mb-6">
      {/* Indicador das etapas */}
      <div className="flex items-center w-full">
        {STEPS.map((step, idx) => {
          const num = idx + 1;
          const done = num < currentStep;
          const active = num === currentStep;

          return (
            <div
              key={num}
              className="flex items-center flex-1 last:flex-none min-w-0"
            >
              {/* Círculo + nome da etapa */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[12px] sm:text-[13px] font-semibold border-2 shrink-0 transition-all",
                    done &&
                      "bg-[#c8181e] border-[#c8181e] text-white",
                    active &&
                      "bg-[#c8181e] border-[#c8181e] text-white",
                    !done &&
                      !active &&
                      "bg-white border-[#ddd] text-[#999]"
                  )}
                >
                  {done ? (
                    <Check
                      size={14}
                      strokeWidth={3}
                    />
                  ) : (
                    num
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] text-center whitespace-nowrap hidden sm:block",
                    active &&
                      "text-[#c8181e] font-semibold",
                    done &&
                      "text-[#777]",
                    !done &&
                      !active &&
                      "text-[#bbb]"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Linha entre as etapas */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 min-w-[12px] h-0.5 mx-1 sm:mx-2 mb-4 transition-all",
                    done
                      ? "bg-[#c8181e]"
                      : "bg-[#e5e5e5]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Informação da etapa atual */}
      <div className="text-center mt-2">
        <p className="text-[12px] font-semibold text-[#c8181e]">
          {currentLabel}
        </p>

        <p className="text-[10px] text-[#999] mt-0.5">
          Etapa {currentStep} de {STEPS.length}
        </p>
      </div>
    </div>
  );
}
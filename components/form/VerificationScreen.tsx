"use client";

import { useState } from "react";
import {
  Loader2,
  MailCheck,
} from "lucide-react";

interface Props {
  email: string;
  isPending: boolean;
  onVerify: (otc: string) => void;
}

export default function VerificationScreen({
  email,
  isPending,
  onVerify,
}: Props) {
  const [otc, setOtc] =
    useState("");
  const [error, setError] =
    useState("");

  function handleSubmit() {
    const normalized =
      otc.replace(/\D/g, "");

    if (
      normalized.length !== 5
    ) {
      setError(
        "Digite o código de 5 dígitos recebido por e-mail."
      );
      return;
    }

    setError("");
    onVerify(normalized);
  }

  function handleChange(
    value: string
  ) {
    setOtc(
      value
        .replace(/\D/g, "")
        .slice(0, 5)
    );

    if (error) {
      setError("");
    }
  }

  return (
    <div className="w-full text-center py-2 sm:py-4 space-y-5 sm:space-y-6">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto">
        <MailCheck
          size={28}
          className="text-[#c8181e] sm:hidden"
        />

        <MailCheck
          size={32}
          className="text-[#c8181e] hidden sm:block"
        />
      </div>

      <div className="px-1">
        <h2 className="text-[19px] sm:text-[20px] font-bold text-[#1a1c1c]">
          Verifique seu e-mail
        </h2>

        <p className="text-[12px] sm:text-[13px] text-[#5f5e5e] mt-2 leading-relaxed max-w-md mx-auto break-words">
          Enviamos um código de confirmação para{" "}
          <strong className="text-[#1a1c1c] break-all">
            {email}
          </strong>
          .
        </p>
      </div>

      <div className="w-full max-w-xs sm:max-w-sm mx-auto space-y-3">
        <label
          htmlFor="otc"
          className="block text-left text-[12px] font-medium text-[#555]"
        >
          Código de confirmação
        </label>

        <input
          id="otc"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={5}
          autoFocus
          value={otc}
          onChange={(event) =>
            handleChange(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
          placeholder="00000"
          className="w-full h-14 rounded-lg border border-[#d1d1d1] bg-white text-center text-[24px] sm:text-[26px] font-bold tracking-[8px] sm:tracking-[10px] font-mono text-[#1a1c1c] outline-none focus:border-[#c8181e] focus:ring-2 focus:ring-[#c8181e]/10"
        />

        {error && (
          <p className="text-[11px] text-[#ba1a1a] text-left leading-relaxed">
            {error}
          </p>
        )}

        <p className="text-[11px] text-[#999]">
          O código expira em 10 minutos.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            isPending ||
            otc.length !== 5
          }
          className="w-full min-h-11 px-4 py-2.5 rounded-lg text-[13px] sm:text-[14px] font-semibold leading-tight text-white bg-[#c8181e] hover:bg-[#a81419] disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2 text-center"
        >
          {isPending && (
            <Loader2
              size={15}
              className="animate-spin shrink-0"
            />
          )}

          <span className="whitespace-normal">
            {isPending
              ? "Verificando..."
              : "Confirmar e-mail"}
          </span>
        </button>
      </div>

      <p className="text-[11px] sm:text-[12px] text-[#aaa] leading-relaxed px-2">
        Não recebeu? Verifique também sua pasta de spam.
      </p>
    </div>
  );
}
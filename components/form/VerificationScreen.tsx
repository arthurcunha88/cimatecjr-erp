"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";

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
  const [otc, setOtc] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const normalized = otc.replace(/\D/g, "");

    if (normalized.length !== 5) {
      setError(
        "Digite o código de 5 dígitos recebido por e-mail."
      );
      return;
    }

    setError("");
    onVerify(normalized);
  }

  function handleChange(value: string) {
    setOtc(
      value.replace(/\D/g, "").slice(0, 5)
    );

    if (error) {
      setError("");
    }
  }

  return (
    <div className="text-center py-4 space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto">
        <MailCheck
          size={32}
          className="text-[#c8181e]"
        />
      </div>

      <div>
        <h2 className="text-[20px] font-bold text-[#1a1c1c]">
          Verifique seu e-mail
        </h2>

        <p className="text-[13px] text-[#5f5e5e] mt-2 leading-relaxed max-w-md mx-auto">
          Enviamos um código de confirmação para{" "}
          <strong className="text-[#1a1c1c]">
            {email}
          </strong>
          .
        </p>
      </div>

      <div className="space-y-3 max-w-xs mx-auto">
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
            handleChange(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
          placeholder="00000"
          className="w-full h-14 rounded-lg border border-[#d1d1d1] bg-white text-center text-[26px] font-bold tracking-[10px] font-mono text-[#1a1c1c] outline-none focus:border-[#c8181e] focus:ring-2 focus:ring-[#c8181e]/10"
        />

        {error && (
          <p className="text-[11px] text-[#ba1a1a] text-left">
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
            isPending || otc.length !== 5
          }
          className="w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-[#c8181e] hover:bg-[#a81419] disabled:opacity-50 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2"
        >
          {isPending && (
            <Loader2
              size={15}
              className="animate-spin"
            />
          )}

          {isPending
            ? "Verificando..."
            : "Confirmar e-mail"}
        </button>
      </div>

      <p className="text-[12px] text-[#aaa]">
        Não recebeu? Verifique também sua pasta de spam.
      </p>
    </div>
  );
}
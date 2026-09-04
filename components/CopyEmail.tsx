"use client";

import { useState } from "react";

const EMAIL = "dgg@cimatecjr.com.br";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(EMAIL);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Fallback para navegadores que não suportam Clipboard API
      const textArea = document.createElement("textarea");

      textArea.value = EMAIL;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      document.execCommand("copy");

      document.body.removeChild(textArea);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar e-mail"
      className="text-[#c8181e] hover:underline cursor-pointer"
    >
      {copied ? "E-mail copiado!" : EMAIL}
    </button>
  );
}
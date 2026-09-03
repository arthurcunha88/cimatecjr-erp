import { CheckCircle2 } from "lucide-react";

interface Props {
  email: string;
  otc: string;
}

export default function SuccessScreen({ email, otc }: Props) {
  return (
    <div className="text-center py-4 space-y-5">
      <div className="w-16 h-16 rounded-full bg-[#e8f5ee] flex items-center justify-center mx-auto">
        <CheckCircle2 size={32} className="text-[#1e7a3d]" />
      </div>

      <div>
        <h2 className="text-[20px] font-bold text-[#1a1c1c]">Cadastro realizado!</h2>
        <p className="text-[13px] text-[#5f5e5e] mt-2 leading-relaxed max-w-sm mx-auto">
          Seu perfil foi registrado no sistema da CIMATEC jr. Enviamos um código de
          confirmação para{" "}
          <strong className="text-[#1a1c1c]">{email}</strong>.
        </p>
      </div>

      <div className="inline-flex flex-col items-center gap-1 bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl px-8 py-5">
        <span className="text-[10px] text-[#888] uppercase tracking-widest">
          Código OTC
        </span>
        <span className="text-[30px] font-bold text-[#c8181e] tracking-[10px] font-mono">
          {otc}
        </span>
        <span className="text-[11px] text-[#888] mt-1">Expira em 10 minutos</span>
      </div>

      <p className="text-[12px] text-[#aaa]">
        Verifique sua caixa de entrada e a pasta de spam.
      </p>
    </div>
  );
}

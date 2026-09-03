import { CheckCircle2 } from "lucide-react";

interface Props {
  email: string;
}

export default function SuccessScreen({
  email,
}: Props) {
  return (
    <div className="text-center py-4 space-y-5">
      <div className="w-16 h-16 rounded-full bg-[#e8f5ee] flex items-center justify-center mx-auto">
        <CheckCircle2
          size={32}
          className="text-[#1e7a3d]"
        />
      </div>

      <div>
        <h2 className="text-[20px] font-bold text-[#1a1c1c]">
          Cadastro confirmado!
        </h2>

        <p className="text-[13px] text-[#5f5e5e] mt-2 leading-relaxed max-w-sm mx-auto">
          Seu e-mail foi verificado e seu cadastro
          foi registrado com sucesso no sistema da
          CIMATEC jr.
        </p>
      </div>

      <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl px-6 py-5 max-w-md mx-auto">
        <p className="text-[12px] text-[#888]">
          E-mail confirmado
        </p>

        <p className="text-[14px] font-semibold text-[#1a1c1c] mt-1">
          {email}
        </p>
      </div>

      <p className="text-[12px] text-[#aaa]">
        Seu cadastro já está disponível para a
        equipe da CIMATEC jr.
      </p>
    </div>
  );
}
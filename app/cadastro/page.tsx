import MemberForm from "@/components/form/MemberForm";

export const metadata = { title: "Cadastro de Membro — CIMATEC jr." };

export default function CadastroPage() {
  return (
    <main className="min-h-[calc(100vh-112px)] flex items-start justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-[600px] sm:max-w-[780px] lg:max-w-[920px]">
        <div className="bg-white border border-[#e5e5e5] border-t-4 border-t-[#c8181e] rounded-2xl shadow-sm px-6 py-7 sm:px-14 sm:py-12 lg:px-20 lg:py-14">
          <MemberForm />
        </div>
      </div>
    </main>
  );
}
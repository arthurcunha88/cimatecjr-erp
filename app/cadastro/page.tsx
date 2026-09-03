import MemberForm from "@/components/form/MemberForm";

export const metadata = { title: "Cadastro de Membro — CIMATEC jr." };

export default function CadastroPage() {
  return (
    <main className="min-h-[calc(100vh-120px)] flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[620px]">
        <div className="bg-white border border-[#e5e5e5] border-t-4 border-t-[#c8181e] rounded-2xl shadow-sm px-7 py-7">
          <MemberForm />
        </div>
      </div>
    </main>
  );
}

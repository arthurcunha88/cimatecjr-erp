import MemberForm from "@/components/form/MemberForm";

export const metadata = {
  title: "Cadastro de Membro — CIMATEC jr",
};

export default function CadastroPage() {
  return (
    <main className="min-h-[calc(100vh-112px)] flex items-start justify-center px-6 py-12 sm:py-20 overflow-x-hidden bg-[#f9f9f9]">
      <div className="w-full max-w-[900px] sm:max-w-[1170px] lg:max-w-[1380px]">
        <div className="bg-white border border-[#e5e5e5] border-t-4 border-t-[#c8181e] rounded-2xl shadow-sm px-10 py-12 sm:px-24 sm:py-20 lg:px-32 lg:py-24 text-xl [&_input]:text-lg [&_label]:text-lg [&_button]:text-lg">
          <div className="w-full h-full flex flex-col">
            <MemberForm />
          </div>
        </div>
      </div>
    </main>
  );
}
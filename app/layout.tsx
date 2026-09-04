import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIMATEC jr — ERP",
  description: "Sistema interno da CIMATEC jr",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans bg-[#f9f9f9] flex flex-col min-h-screen">
        <header className="bg-[#1a1c1c] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo-cimatecjr.svg"
              alt="CIMATEC jr"
              width={150}
              height={40}
              priority
              className="h-9 w-auto object-contain"
            />
          </div>

          <span className="text-[#888] text-[12px]">
            Cadastro de Membro
          </span>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="bg-white border-t border-[#e5e5e5] py-3.5 px-6 text-center">
          <p className="text-[11px] text-[#aaa]">
            © {new Date().getFullYear()} CIMATEC jr ·{" "}
            <a
              href="mailto:contato@cimatecjr.com.br"
              className="text-[#c8181e] hover:underline"
            >
              contato@cimatecjr.com.br
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
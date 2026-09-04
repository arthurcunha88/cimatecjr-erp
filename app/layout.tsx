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
        <header className="bg-white border-b border-[#e5e5e5] shadow-[0_2px_10px_rgba(0,0,0,0.06)] px-6 py-3.5 flex items-center justify-between relative z-10">
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

          <span className="text-[#666] text-[12px] font-medium">
            Cadastro de Membro
          </span>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="bg-white border-t border-[#e5e5e5] py-3.5 px-6 text-center">
          <p className="text-[11px] text-[#aaa]">
            © {new Date().getFullYear()} CIMATEC jr ·{" "}
            <a
              href="mailto:dgg@cimatecjr.com.br"
              className="text-[#c8181e] hover:underline"
            >
              dgg@cimatecjr.com.br
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
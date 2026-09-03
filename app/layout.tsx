import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIMATEC jr. — ERP",
  description: "Sistema interno da CIMATEC jr.",
};

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans bg-[#f9f9f9] flex flex-col min-h-screen">
        <header className="bg-[#1a1c1c] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#c8181e] rounded-lg flex items-center justify-center shrink-0">
              <GearIcon />
            </div>
            <span className="text-white font-bold text-[15px] tracking-tight">CIMATEC jr.</span>
          </div>
          <span className="text-[#888] text-[12px]">Cadastro de Membro</span>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="bg-white border-t border-[#e5e5e5] py-3.5 px-6 text-center">
          <p className="text-[11px] text-[#aaa]">
            © {new Date().getFullYear()} CIMATEC jr. ·{" "}
            <a href="mailto:contato@cimatecjr.com.br" className="text-[#c8181e] hover:underline">
              contato@cimatecjr.com.br
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}

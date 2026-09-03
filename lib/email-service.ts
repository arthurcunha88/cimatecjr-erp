import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOTCEmail(params: {
  to: string;
  name: string;
  otc: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { to, name, otc } = params;
  const firstName = name.split(" ")[0];

  const { error } = await resend.emails.send({
    from: "CIMATEC jr. <noreply@cimatecjr.com.br>", // troque pelo seu domínio verificado no Resend
    to:      [to],
    subject: "Seu código de confirmação — CIMATEC jr.",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="margin-bottom:24px">
          <div style="display:inline-flex;align-items:center;gap:8px">
            <div style="width:32px;height:32px;background:#c8181e;border-radius:6px;display:flex;align-items:center;justify-content:center">
              <span style="color:#fff;font-size:13px;font-weight:700">CJ</span>
            </div>
            <span style="font-size:15px;font-weight:700;color:#1a1c1c">CIMATEC jr.</span>
          </div>
        </div>

        <h1 style="font-size:20px;font-weight:700;color:#1a1c1c;margin-bottom:8px">
          Olá, ${firstName}!
        </h1>
        <p style="font-size:14px;color:#5f5e5e;line-height:1.6;margin-bottom:24px">
          Seu cadastro no sistema interno da CIMATEC jr. foi registrado com sucesso.
          Use o código abaixo para confirmar seu acesso:
        </p>

        <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">
            Código de confirmação
          </p>
          <p style="font-size:36px;font-weight:700;color:#c8181e;letter-spacing:12px;font-family:'Courier New',monospace;margin:0">
            ${otc}
          </p>
          <p style="font-size:12px;color:#888;margin-top:10px">
            Expira em <strong>10 minutos</strong>
          </p>
        </div>

        <p style="font-size:12px;color:#aaa;line-height:1.6">
          Se você não realizou esse cadastro, ignore este e-mail.<br>
          Este é um e-mail automático — não responda.
        </p>

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="font-size:11px;color:#ccc;text-align:center">
          © ${new Date().getFullYear()} CIMATEC jr. · contato@cimatecjr.com.br
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[email-service] resend error:", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[lead] credenciais não configuradas — email não enviado');
    return res.status(200).json({ ok: true });
  }

  try {
    const { nome, email, telefone, cidade, faixa, mensagem } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"SeguraBox" <${process.env.GMAIL_USER}>`,
      to: 'matheusaveelar@gmail.com',
      subject: 'NOVA LEAD INVESTIDOR SEGURABOX',
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0F4FF;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4FF;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#1A56DB;padding:24px 32px;">
          <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.6);">SeguraBox</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;">Nova lead — Sócio Investidor</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#1E2D4A;padding:28px 32px;">

          ${[
            ['Nome', nome],
            ['E-mail', email],
            ['Telefone / WhatsApp', telefone],
            ['Cidade', cidade],
            ['Faixa de investimento', faixa],
            mensagem ? ['Mensagem', mensagem] : null,
          ].filter(Boolean).map(([label, value]) => `
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#6B7A99;">${label}</p>
          <p style="margin:0 0 20px;font-size:16px;font-weight:500;color:#ffffff;word-break:break-word;">${value || '—'}</p>
          `).join('')}

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0A1F44;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#6B7A99;">SeguraBox — Sistema de captura de leads investidores</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[lead] erro ao enviar email:', err.message);
    res.status(500).json({ error: 'email_failed' });
  }
};

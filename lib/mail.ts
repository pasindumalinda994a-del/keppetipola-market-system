import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  debugCode?: string;
};

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  );
}

export async function sendMail({
  to,
  subject,
  text,
  html,
  debugCode,
}: SendMailInput): Promise<void> {
  if (!isSmtpConfigured()) {
    const extra = debugCode ? `\n[dev] reset code: ${debugCode}` : "";
    console.info(
      `[mail] SMTP is not configured. Would send to ${to}: ${subject}\n${text}${extra}`
    );
    return;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

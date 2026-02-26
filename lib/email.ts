import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM;

const canSendEmail = smtpHost && smtpUser && smtpPass && smtpFrom;

const transporter = canSendEmail
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!transporter || !smtpFrom) {
    return;
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
  } catch {
    // Swallow email errors so API responses remain successful.
  }
}

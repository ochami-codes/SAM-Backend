import { Resend } from "resend";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not defined");
  }

  const resend = new Resend(process.env.RESEND_API_KEY); // created here, not at top

  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is not defined");
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(text && { text }),
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

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
  console.log("[sendEmail] Starting email delivery");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  console.log("[sendEmail] Configuration:", {
    apiKeyConfigured: Boolean(apiKey),
    fromDefined: Boolean(from),
    fromRaw: JSON.stringify(from),
    fromLength: from?.length,
    fromTrimmed: JSON.stringify(from?.trim()),
  });

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not defined");
  }

  if (!from) {
    throw new Error("EMAIL_FROM is not defined");
  }

  const resend = new Resend(apiKey);

  console.log("[sendEmail] Sending email:", {
    from: JSON.stringify(from),
    recipient: to,
    subject,
    htmlProvided: Boolean(html),
    textProvided: Boolean(text),
  });

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(text && { text }),
  });

  if (error) {
    console.error("[sendEmail] Resend API error:", {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
    });

    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log("[sendEmail] Email sent successfully:", {
    id: data?.id,
    from: JSON.stringify(from),
  });
}

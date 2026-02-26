const brevoApiKey = process.env.BREVO_API_KEY;
const brevoFromEmail = process.env.BREVO_FROM_EMAIL;
const brevoFromName = process.env.BREVO_FROM_NAME || "Campus Cleanliness";

const canSendEmail = brevoApiKey && brevoFromEmail;

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!canSendEmail) {
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey!,
      },
      body: JSON.stringify({
        sender: {
          email: brevoFromEmail,
          name: brevoFromName,
        },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.html,
        textContent: params.text || params.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);
    }
  } catch (error) {
    // Swallow email errors so API responses remain successful.
    console.error("Email sending error:", error);
  }
}

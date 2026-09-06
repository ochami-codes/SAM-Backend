interface PasswordResetEmailInput {
  resetUrl: string;
  expiresInMinutes: number;
}

export function passwordResetEmail({
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Reset your Second Advent Ministries password",

    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Reset your password</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            "
          >
            <div
              style="
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 40px;
              "
            >
              <h1
                style="
                  margin: 0 0 20px;
                  color: #238ac4;
                  font-size: 24px;
                "
              >
                Reset your password
              </h1>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                We received a request to reset the password
                for your Second Advent Ministries account.
              </p>

              <p
                style="
                  margin: 0 0 28px;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Click the button below to choose a new password.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a
                  href="${resetUrl}"
                  style="
                    display: inline-block;
                    padding: 14px 24px;
                    background-color: #238ac4;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                  "
                >
                  Reset Password
                </a>
              </div>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #64748b;
                "
              >
                This link will expire in
                ${expiresInMinutes} minutes.
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #64748b;
                "
              >
                If you did not request a password reset, you can
                safely ignore this email.
              </p>

              <hr
                style="
                  margin: 32px 0;
                  border: 0;
                  border-top: 1px solid #e2e8f0;
                "
              />

              <p
                style="
                  margin: 0;
                  font-size: 12px;
                  line-height: 1.5;
                  color: #64748b;
                "
              >
                Second Advent Ministries
              </p>
            </div>
          </div>
        </body>
      </html>
    `,

    text: `
Reset your Second Advent Ministries password

We received a request to reset the password for your
Second Advent Ministries account.

Reset your password:
${resetUrl}

This link will expire in ${expiresInMinutes} minutes.

If you did not request a password reset, you can safely
ignore this email.

Second Advent Ministries
    `.trim(),
  };
}
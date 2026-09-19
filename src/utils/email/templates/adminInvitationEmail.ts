interface AdminInvitationEmailInput {
  fullName: string;
  invitationUrl: string;
  expiresInHours: number;
}

export function adminInvitationEmail({
  fullName,
  invitationUrl,
  expiresInHours,
}: AdminInvitationEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject:
      "You're invited to become an administrator — Second Advent Ministries",

    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Administrator Invitation</title>
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
                Administrator Invitation
              </h1>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Dear ${fullName},
              </p>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                You have been invited to become an administrator
                of Second Advent Ministries.
              </p>

              <p
                style="
                  margin: 0 0 28px;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Click the button below to accept the invitation
                and create your administrator account.
              </p>

              <div
                style="
                  text-align: center;
                  margin: 32px 0;
                "
              >
                <a
                  href="${invitationUrl}"
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
                  Accept Invitation
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
                This invitation will expire in
                ${expiresInHours} hours.
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #64748b;
                "
              >
                If you were not expecting this invitation,
                you can safely ignore this email.
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
Administrator Invitation

Dear ${fullName},

You have been invited to become an administrator
of Second Advent Ministries.

Click the link below to accept the invitation and
create your administrator account:

${invitationUrl}

This invitation will expire in ${expiresInHours} hours.

If you were not expecting this invitation,
you can safely ignore this email.

Second Advent Ministries
    `.trim(),
  };
}

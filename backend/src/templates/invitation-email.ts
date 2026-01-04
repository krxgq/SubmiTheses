/**
 * Email template generator for user invitations
 * Generates both HTML and plain text versions of the invitation email
 */

interface InvitationEmailContent {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate invitation email with HTML and text versions
 * @param firstName - User's first name (optional, defaults to "there")
 * @param email - User's email address
 * @param invitationLink - Full URL with token for password setup
 * @returns Email content object with subject, HTML, and text
 */
export function generateInvitationEmail(
  firstName: string | null | undefined,
  email: string,
  invitationLink: string
): InvitationEmailContent {
  const displayName = firstName || 'there';
  const subject = 'Welcome to SumbiTheses - Set Your Password';

  // HTML version - responsive design with inline styles
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SumbiTheses</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f7; color: #333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to SumbiTheses</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333; font-size: 22px; font-weight: 600;">Hello, ${displayName}!</h2>

              <p style="margin: 0 0 16px; line-height: 1.6; color: #555; font-size: 16px;">
                An administrator has created an account for you on SumbiTheses with the following email address:
              </p>

              <p style="margin: 0 0 24px; padding: 12px; background-color: #f8f9fa; border-left: 4px solid #667eea; font-family: 'Courier New', monospace; font-size: 14px; color: #333;">
                <strong>${email}</strong>
              </p>

              <p style="margin: 0 0 24px; line-height: 1.6; color: #555; font-size: 16px;">
                To activate your account and get started, please set your password by clicking the button below:
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${invitationLink}"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                      Set Your Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative link -->
              <p style="margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #e9ecef; line-height: 1.6; color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0; word-break: break-all; font-size: 13px; color: #667eea;">
                <a href="${invitationLink}" style="color: #667eea; text-decoration: underline;">${invitationLink}</a>
              </p>

              <!-- Expiry warning -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <p style="margin: 0; line-height: 1.5; color: #856404; font-size: 14px;">
                      <strong>⚠️ Important:</strong> This invitation link will expire in <strong>30 days</strong>. Please set your password before then.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security note -->
              <p style="margin: 24px 0 0; line-height: 1.6; color: #999; font-size: 13px; font-style: italic;">
                If you didn't expect this email or believe it was sent in error, please ignore it or contact your administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                © ${new Date().getFullYear()} SumbiTheses. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // Plain text version - fallback for email clients that don't support HTML
  const text = `
Welcome to SumbiTheses, ${displayName}!

An administrator has created an account for you with the following email address:
${email}

To activate your account and get started, please set your password by visiting the following link:

${invitationLink}

IMPORTANT: This invitation link will expire in 30 days. Please set your password before then.

If you didn't expect this email or believe it was sent in error, please ignore it or contact your administrator.

---
© ${new Date().getFullYear()} SumbiTheses. All rights reserved.
  `.trim();

  return { subject, html, text };
}

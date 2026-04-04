import nodemailer from 'nodemailer';
import { google } from 'googleapis';

/* ─── Transporter factory ─────────────────────────────── */
const createTransporter = async () => {
  const useOAuth =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_USER;

  if (useOAuth) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken =
      typeof accessTokenResponse === 'string'
        ? accessTokenResponse
        : accessTokenResponse?.token;

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken,
      },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const FROM = `OmniPilot AI <${process.env.GOOGLE_USER || process.env.EMAIL_USER}>`;

/* ─── Generic send ────────────────────────────────────── */
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = await createTransporter();
  return transporter.sendMail({ from: FROM, to, subject, html });
};

/* ─── OTP email templates ─────────────────────────────── */
const otpHtml = ({ otp, title, subtitle, note }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#111317;font-family:'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111317;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1E2128;border-radius:16px;overflow:hidden;border:1px solid rgba(255,106,0,0.15);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#FF6A00,#FF8C3A);padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">OmniPilot AI</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;">AI that doesn't just answer — it acts.</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#E8EAF0;font-size:22px;font-weight:700;margin:0 0 12px;">${title}</h2>
            <p style="color:#8A8F9A;font-size:15px;line-height:1.6;margin:0 0 32px;">${subtitle}</p>
            <!-- OTP Box -->
            <div style="background:#282A2E;border:1px solid rgba(255,106,0,0.2);border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#5A5F6A;margin-bottom:12px;">Your Verification Code</div>
              <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#FF6A00;font-family:monospace;">${otp}</div>
              <div style="font-size:12px;color:#5A5F6A;margin-top:12px;">⏱ Expires in 5 minutes</div>
            </div>
            <p style="color:#5A5F6A;font-size:13px;line-height:1.6;margin:0;">${note}</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
            <p style="color:#5A5F6A;font-size:12px;margin:0;">© 2026 OmniPilot AI. All rights reserved.</p>
            <p style="color:#5A5F6A;font-size:12px;margin:4px 0 0;">If you didn't request this, you can safely ignore this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export const sendOtpEmail = async (to, otp, type = 'verify') => {
  const configs = {
    verify: {
      subject: 'Verify your OmniPilot AI account',
      title: 'Verify Your Email Address',
      subtitle: "Welcome to OmniPilot AI! Use the code below to verify your email address and activate your account.",
      note: 'This code is valid for 5 minutes. Do not share it with anyone.',
    },
    forgot: {
      subject: 'Reset your OmniPilot AI password',
      title: 'Password Reset Request',
      subtitle: "We received a request to reset your password. Use the code below to proceed.",
      note: 'If you didn\'t request a password reset, please ignore this email and your password will remain unchanged.',
    },
    change: {
      subject: 'Confirm password change — OmniPilot AI',
      title: 'Confirm Password Change',
      subtitle: 'Use the code below to confirm your password change request.',
      note: 'If you didn\'t request this change, please contact support immediately.',
    },
  };

  const cfg = configs[type] || configs.verify;

  return sendEmail({
    to,
    subject: cfg.subject,
    html: otpHtml({ otp, ...cfg }),
  });
};

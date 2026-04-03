import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export const sendEmail = async ({ to, subject, html }) => {
  const useOAuth =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_USER;

  let transporter;

  if (useOAuth) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken =
      typeof accessTokenResponse === 'string'
        ? accessTokenResponse
        : accessTokenResponse?.token;

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken
      }
    });
  } else {
    // Fallback: basic SMTP credentials
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  const mailOptions = {
    from: `AI Assistant <${process.env.GOOGLE_USER || process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

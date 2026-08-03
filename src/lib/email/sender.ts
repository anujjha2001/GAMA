import nodemailer from 'nodemailer';
import { isProductionOtpMode } from '../auth/otp';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Sends an email using Gmail SMTP with retry logic.
 * Retries up to 3 times with a 1 second delay between failures.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const maxRetries = 3;
  let attempt = 0;

  const isProd = isProductionOtpMode();

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('[EMAIL SENDER] Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment variables.');
    if (!isProd) {
      console.log(`[EMAIL SENDER BYPASS] Would send email to ${options.to} with subject "${options.subject}"`);
      return true;
    }
    return false;
  }

  while (attempt < maxRetries) {
    try {
      await transporter.sendMail({
        from: `"GAMA Health" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`[EMAIL SENDER] Email sent successfully to ${options.to} on attempt ${attempt + 1}`);
      return true;
    } catch (error) {
      attempt++;
      console.warn(`[EMAIL SENDER] Attempt ${attempt} failed to send email to ${options.to}:`, error);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.error(`[EMAIL SENDER] Failed to send email to ${options.to} after ${maxRetries} attempts.`);
  return false;
}

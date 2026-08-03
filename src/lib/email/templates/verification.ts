/**
 * Generates custom branded HTML template for GAMA verification.
 */
export function getVerificationEmailTemplate(otp: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your GAMA Account</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #000000;
          color: #ffffff;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #0c0c0e;
          border: 1px solid #1a1614;
          border-radius: 24px;
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          border: 1px solid #2a221f;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 12px;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 14px;
          color: #a3a3a3;
          text-align: center;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .otp-container {
          background-color: #12100e;
          border: 1px solid #f9731630;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          margin-bottom: 32px;
        }
        .otp-code {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: 12px;
          color: #f97316;
          margin: 0;
          font-family: Courier, monospace;
        }
        .expiry-notice {
          font-size: 12px;
          color: #f97316;
          text-align: center;
          margin-top: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .divider {
          height: 1px;
          background-color: #1a1614;
          margin: 32px 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #52525b;
          line-height: 1.5;
        }
        .footer-link {
          color: #a3a3a3;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container" style="margin-top: 40px;">
        <div class="header">
          <img class="logo" src="https://gama.fit/logo.jpg" alt="GAMA" onerror="this.src='https://placehold.co/80x80/black/white?text=GAMA'" />
        </div>
        
        <h1 class="title">Welcome to GAMA</h1>
        ${userName ? `<p style="font-size: 16px; color: #ffffff; text-align: center; margin-bottom: 16px;">Hello ${userName},</p>` : ''}
        <p class="subtitle">Enter the following verification code to activate your account and start your personalized AI health intelligence journey.</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <div class="expiry-notice">Expires in 10 minutes</div>
        </div>
        
        <p class="subtitle" style="margin-bottom: 0;">Didn't request this? If you didn't make this request, you can safely ignore this email.</p>
        <p class="subtitle" style="font-size: 11px; margin-top: 12px; color: #71717a;">Security Notice: This is a one-time verification code. Never share your OTP with anyone. GAMA staff will never ask for your OTP.</p>
        
        <div class="divider"></div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} GAMA. All rights reserved.</p>
          <p>This is an automated security message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const nodemailer = require('nodemailer');
let sgMail = null;
try {
    sgMail = require('@sendgrid/mail');
} catch (e) {
    // SendGrid optional
}

/**
 * Unified Email Service
 * Supports:
 * 1. SendGrid API (over HTTPS port 443 - 100% compatible with Render free tier)
 * 2. Gmail / SMTP via Nodemailer (Port 587 / 465)
 */

/**
 * Sends an email using either Brevo API, SendGrid API, or Nodemailer SMTP
 */
const sendEmail = async ({ to, subject, html, text, fromName, fromEmail }) => {
    const brevoApiKey = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : '';
    const sendgridApiKey = process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.trim() : '';
    const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
    const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : '';
    const emailFrom = fromEmail || process.env.EMAIL_FROM || emailUser || 'ahmedghulam622@gmail.com';
    const emailFromName = fromName || process.env.EMAIL_FROM_NAME || 'SaaS Platform';

    console.log('========================================');
    console.log('📧 SENDING EMAIL');
    console.log('   To:', to);
    console.log('   BREVO_API_KEY:', brevoApiKey ? `✅ Set (${brevoApiKey.substring(0, 12)}...)` : '❌ NOT SET');
    console.log('   EMAIL_USER:', emailUser ? `✅ Set (${emailUser})` : '❌ NOT SET');
    console.log('========================================');

    // 1. Prefer Brevo API if key is provided (Best free alternative: 300 free emails/day, HTTPS port 443)
    if (brevoApiKey) {
        try {
            console.log('📨 Sending email via Brevo REST API to:', to);
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': brevoApiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: emailFromName,
                        email: emailFrom
                    },
                    to: [{ email: to }],
                    subject,
                    htmlContent: html,
                    textContent: text || html.replace(/<[^>]*>?/gm, '')
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Brevo API error: ' + JSON.stringify(data));
            }

            console.log('✅ Email sent successfully via Brevo API! Message ID:', data.messageId);
            return { success: true, provider: 'Brevo', messageId: data.messageId };
        } catch (brevoError) {
            console.error('❌ Brevo API Error:', brevoError.message);
            throw new Error(`Brevo API Error: ${brevoError.message}`);
        }
    }

    // 2. Use SendGrid if API key is provided
    if (sendgridApiKey && sgMail) {
        try {
            console.log('📨 Sending email via SendGrid API to:', to);
            sgMail.setApiKey(sendgridApiKey);
            const msg = {
                to,
                from: emailFrom,
                subject,
                text: text || html.replace(/<[^>]*>?/gm, ''),
                html,
            };
            const [response] = await sgMail.send(msg);
            console.log(`✅ Email sent successfully via SendGrid! Status: ${response.statusCode}`);
            return { success: true, provider: 'SendGrid', statusCode: response.statusCode };
        } catch (sgError) {
            console.error('❌ SendGrid API Error:', sgError.response?.body || sgError.message);
            // If SMTP is also configured, we can fallback, otherwise throw
            if (!emailUser || !emailPass) {
                throw new Error(
                    sgError.response?.body?.errors?.[0]?.message ||
                    sgError.message ||
                    'SendGrid delivery failed'
                );
            }
            console.warn('⚠️ Falling back to Gmail SMTP...');
        }
    }

    // 2. Use Nodemailer SMTP (Gmail / Custom SMTP)
    if (emailUser && emailPass) {
        try {
            console.log('📨 Sending email via Nodemailer SMTP to:', to);
            const isPort465 = process.env.SMTP_PORT === '465';
            const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);

            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: smtpPort,
                secure: isPort465, // true for 465, false for 587
                requireTLS: !isPort465,
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
                connectionTimeout: 15000,
                greetingTimeout: 15000,
                socketTimeout: 15000,
                tls: {
                    rejectUnauthorized: false,
                    minVersion: 'TLSv1.2',
                },
            });

            const info = await transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME || 'SaaS Platform'}" <${emailUser}>`,
                to,
                subject,
                text: text || html.replace(/<[^>]*>?/gm, ''),
                html,
            });

            console.log(`✅ Email sent successfully via SMTP! Message ID: ${info.messageId}`);
            return { success: true, provider: 'SMTP', messageId: info.messageId };
        } catch (smtpError) {
            console.error('❌ Nodemailer SMTP Error:', smtpError.message);
            if (smtpError.code === 'EAUTH') {
                throw new Error('Gmail authentication failed: Invalid App Password (535 BadCredentials). Please check EMAIL_PASS in .env.');
            }
            if (smtpError.code === 'ETIMEDOUT' || smtpError.code === 'ENETUNREACH') {
                throw new Error('Render Free Tier blocks outbound SMTP port 587. Please ensure BREVO_API_KEY is properly set in Render Environment variables.');
            }
            throw smtpError;
        }
    }

    throw new Error('No email service configured. Please set BREVO_API_KEY in Render Environment variables.');
};

/**
 * Sends an organization invitation email
 */
const sendInviteEmail = async ({ to, role, tenantName, senderName, inviteLink }) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const company = tenantName || 'Our Company';
    const inviter = senderName || 'A team administrator';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to join ${company}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
        🚀 You're Invited!
      </h1>
      <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 15px;">
        Join <strong>${company}</strong> on SaaS Platform
      </p>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 30px;">
      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">
        Hello,
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #334155;">
        <strong>${inviter}</strong> has invited you to join the team at <strong style="color: #4f46e5;">${company}</strong> with the role of <strong style="color: #4f46e5;">${role}</strong>.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${inviteLink}" 
           style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 36px; border-radius: 8px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
          Accept Invitation & Register
        </a>
      </div>

      <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 20px;">
        Or copy and paste this URL into your browser:
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; word-break: break-all; font-family: monospace; font-size: 13px; color: #0284c7;">
        ${inviteLink}
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
        Already have an account? <a href="${frontendUrl}/login" style="color: #4f46e5; text-decoration: underline;">Sign in here</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.5;">
        This invitation link will expire in 7 days.<br/>
        If you were not expecting this invitation, you can safely ignore this email.
      </p>
    </div>

  </div>
</body>
</html>
    `;

    return sendEmail({
        to,
        subject: `📨 You have been invited to join ${company}`,
        html,
        fromName: `${company} via SaaS Platform`
    });
};

/**
 * Sends a password reset email
 */
const sendPasswordResetEmail = async ({ to, userName, resetLink }) => {
    const user = userName || 'User';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
        🔐 Password Reset
      </h1>
    </div>

    <div style="padding: 32px 30px;">
      <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">
        Hello <strong>${user}</strong>,
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #334155;">
        We received a request to reset your password. Click the button below to choose a new password:
      </p>

      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetLink}" 
           style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 36px; border-radius: 8px;">
          Reset Password
        </a>
      </div>

      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; word-break: break-all; font-family: monospace; font-size: 13px; color: #0284c7;">
        ${resetLink}
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
        This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>

  </div>
</body>
</html>
    `;

    return sendEmail({
        to,
        subject: '🔐 Password Reset Request',
        html,
    });
};

module.exports = {
    sendEmail,
    sendInviteEmail,
    sendPasswordResetEmail,
};

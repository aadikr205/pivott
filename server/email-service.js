/**
 * Pivott Email & Transactional OTP Service
 * Sends clean transactional verification emails via Nodemailer with Gmail SMTP / custom SMTP config or dev fallback.
 */

const nodemailer = require('nodemailer');

// Ensure environment variables are loaded if dotenv was not called yet
if (!process.env.EMAIL_USER && !process.env.SMTP_USER) {
  try {
    require('dotenv').config();
  } catch (_) {}
}

let transporter = null;

/**
 * Initializes the Nodemailer transporter using EMAIL_USER / EMAIL_PASS (Gmail)
 * or SMTP_HOST / SMTP_USER / SMTP_PASS (generic SMTP).
 */
function initializeTransporter() {
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  let emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim().replace(/^["']|["']$/g, '');

  if (!emailUser || !emailPass) {
    return null;
  }

  // Google displays App Passwords in 4x4 format ("abcd efgh ijkl mnop") - auto-strip spaces
  if (/^[a-zA-Z]{4}\s+[a-zA-Z]{4}\s+[a-zA-Z]{4}\s+[a-zA-Z]{4}$/.test(emailPass)) {
    emailPass = emailPass.replace(/\s+/g, '');
  }

  const host = (process.env.SMTP_HOST || process.env.EMAIL_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT);

  try {
    let transportConfig;
    if (host) {
      transportConfig = {
        host,
        port: port || 587,
        secure: (port || 587) === 465,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };
      console.log(`[EmailService] Configured live SMTP transport (Host: ${host}:${port || 587}, User: ${emailUser})`);
    } else {
      // Default to Gmail service when EMAIL_USER and EMAIL_PASS are provided without custom host
      transportConfig = {
        service: (process.env.EMAIL_SERVICE || 'gmail').trim(),
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };
      console.log(`[EmailService] Configured live Gmail transport for: ${emailUser}`);
    }

    return nodemailer.createTransport(transportConfig);
  } catch (err) {
    console.warn('[EmailService] Transporter initialization failed:', err.message);
    return null;
  }
}

// Initial transporter setup
transporter = initializeTransporter();

/**
 * Get active transporter or attempt re-initialization if environment variables were set late
 */
function getTransporter() {
  if (!transporter) {
    transporter = initializeTransporter();
  }
  return transporter;
}

/**
 * Formats the From header. For Gmail SMTP, sender must match authenticated user unless an alias is configured.
 */
function getSenderAddress(type = 'Verification') {
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const customFrom = (process.env.EMAIL_FROM || process.env.SMTP_FROM || '').trim();
  if (customFrom) {
    return customFrom;
  }
  if (emailUser) {
    return `"Pivott ${type}" <${emailUser}>`;
  }
  return `"Pivott ${type}" <noreply@pivott.app>`;
}

/**
 * Send 6-digit verification code to student's email
 * 
 * @param {string} toEmail 
 * @param {string} otp 
 * @param {string} studentName 
 * @returns {Promise<{ delivered: boolean, messageId?: string, isDevFallback?: boolean, error?: string }>}
 */
async function sendVerificationOtpEmail(toEmail, otp, studentName = 'Student') {
  const activeTransporter = getTransporter();

  // If no email credentials configured, fall back to console logging for local dev/testing
  if (!activeTransporter) {
    console.log(`\n==================================================`);
    console.log(`[Pivott Auth] 📧 6-Digit Email Verification Code (Dev Fallback)`);
    console.log(`Recipient: ${toEmail} (${studentName})`);
    console.log(`OTP Code:  >>> ${otp} <<< (Valid for 10 minutes)`);
    console.log(`[Notice] To send real emails, ensure EMAIL_USER and EMAIL_PASS are set.`);
    console.log(`==================================================\n`);
    return { delivered: true, isDevFallback: true };
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 32px 16px; min-height: 100%; border-radius: 16px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #131d2e; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 24px; text-align: center;">
        <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #0d9488 0%, #4f46e5 100%); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px; line-height: 56px;">🧭</span>
        </div>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-bottom: 8px;">Verify Your Email Address</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Welcome to Pivott, <strong>${studentName}</strong>! Use the code below to verify your account and start your dynamic study plan.</p>
        
        <div style="background-color: #0b0f19; border: 2px dashed #0d9488; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2dd4bf; display: block;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 8px;">
          ⏱️ This verification code is valid for <strong>10 minutes</strong>.<br>
          For your security, never share this code with anyone.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #475569; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Pivott Learning Technologies. All rights reserved.
      </div>
    </div>
  `;

  try {
    console.log(`[EmailService] Sending verification OTP email to ${toEmail}...`);
    const fromAddress = getSenderAddress('Verification');
    const info = await activeTransporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Your Pivott Verification Code: ${otp}`,
      text: `Welcome to Pivott! Your 6-digit verification code is: ${otp}. It expires in 10 minutes.`,
      html: htmlContent
    });

    console.log(`[EmailService] OTP email dispatched successfully to ${toEmail}: ${info.messageId}`);
    return { delivered: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send email via Gmail/SMTP to ${toEmail}:`, error.message);
    // Return error information; fallback true ensures dev/test pipeline isn't completely blocked
    return { delivered: false, error: error.message, isDevFallback: true };
  }
}

/**
 * Send 6-digit password reset code to student's email
 * 
 * @param {string} toEmail 
 * @param {string} otp 
 * @param {string} studentName 
 * @returns {Promise<{ delivered: boolean, messageId?: string, isDevFallback?: boolean, error?: string }>}
 */
async function sendPasswordResetOtpEmail(toEmail, otp, studentName = 'Student') {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    console.log(`\n==================================================`);
    console.log(`[Pivott Auth] 🔑 6-Digit Password Reset Code (Dev Fallback)`);
    console.log(`Recipient: ${toEmail} (${studentName})`);
    console.log(`OTP Code:  >>> ${otp} <<< (Valid for 10 minutes)`);
    console.log(`[Notice] To send real emails, ensure EMAIL_USER and EMAIL_PASS are set.`);
    console.log(`==================================================\n`);
    return { delivered: true, isDevFallback: true };
  }

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 32px 16px; min-height: 100%; border-radius: 16px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #131d2e; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 24px; text-align: center;">
        <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px; line-height: 56px;">🔑</span>
        </div>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-bottom: 8px;">Password Reset Request</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Hello <strong>${studentName}</strong>, use the 6-digit code below to securely reset your Pivott account password.</p>
        
        <div style="background-color: #0b0f19; border: 2px dashed #f59e0b; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #fbbf24; display: block;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 8px;">
          ⏱️ This reset code is valid for <strong>10 minutes</strong>.<br>
          If you did not request this password reset, please ignore this email.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #475569; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Pivott Learning Technologies. All rights reserved.
      </div>
    </div>
  `;

  try {
    console.log(`[EmailService] Sending password reset email to ${toEmail}...`);
    const fromAddress = getSenderAddress('Security');
    const info = await activeTransporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Your Pivott Password Reset Code: ${otp}`,
      text: `Hello ${studentName}! Your 6-digit password reset code is: ${otp}. It expires in 10 minutes.`,
      html: htmlContent
    });

    console.log(`[EmailService] Password reset email dispatched to ${toEmail}: ${info.messageId}`);
    return { delivered: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send password reset email to ${toEmail}:`, error.message);
    return { delivered: false, error: error.message, isDevFallback: true };
  }
}

module.exports = {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail,
  getTransporter,
  initializeTransporter
};

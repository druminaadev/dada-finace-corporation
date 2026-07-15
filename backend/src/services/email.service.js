import nodemailer from 'nodemailer';
import config from '../config/env.js';
import { logger } from '../utils/logger.js';

// ── Transporter ───────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// ── Verify connection on startup ──────────────────────────────────────────────

export const verifyEmailConnection = async () => {
  if (!config.email.user || !config.email.pass) {
    logger.warn('Email not configured — SMTP_USER or SMTP_PASS missing. Emails will be skipped.');
    return false;
  }
  try {
    await transporter.verify();
    logger.info('Email service connected ✓');
    return true;
  } catch (err) {
    logger.error({ err }, 'Email service connection failed');
    return false;
  }
};

// ── Core send function ────────────────────────────────────────────────────────

const sendMail = async ({ to, subject, html, text }) => {
  if (!config.email.user || !config.email.pass) {
    logger.warn({ to, subject }, 'Email skipped — SMTP not configured');
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      text,
    });
    logger.info({ to, subject, messageId: info.messageId }, 'Email sent');
    return info;
  } catch (err) {
    logger.error({ err, to, subject }, 'Email send failed');
    throw err;
  }
};

// ── Email Templates ───────────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#1a56db,#0e3fa8); padding:28px 32px; text-align:center; }
    .header h1 { margin:0; color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.3px; }
    .header p { margin:4px 0 0; color:rgba(255,255,255,0.8); font-size:13px; }
    .body { padding:32px; color:#374151; }
    .body h2 { margin:0 0 16px; font-size:18px; color:#111827; }
    .body p { margin:0 0 14px; font-size:14px; line-height:1.7; color:#4b5563; }
    .info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px 20px; margin:20px 0; }
    .info-box table { width:100%; border-collapse:collapse; }
    .info-box td { padding:6px 0; font-size:13px; color:#374151; }
    .info-box td:first-child { font-weight:600; color:#111827; width:45%; }
    .btn { display:inline-block; background:#1a56db; color:#ffffff !important; text-decoration:none; padding:12px 28px; border-radius:8px; font-size:14px; font-weight:600; margin:8px 0; }
    .badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
    .badge-green { background:#d1fae5; color:#065f46; }
    .badge-red { background:#fee2e2; color:#991b1b; }
    .badge-blue { background:#dbeafe; color:#1e40af; }
    .badge-yellow { background:#fef3c7; color:#92400e; }
    .footer { background:#f8fafc; border-top:1px solid #e5e7eb; padding:20px 32px; text-align:center; }
    .footer p { margin:0; font-size:12px; color:#9ca3af; line-height:1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Dada Finance &amp; Corporation</h1>
      <p>Loan Management System</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>This is an automated email from Dada Finance &amp; Corporation.<br/>
      Please do not reply to this email. For support, contact your branch.</p>
      <p style="margin-top:8px;">© ${new Date().getFullYear()} Dada Finance &amp; Corporation. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

// ── Email Senders ─────────────────────────────────────────────────────────────

export const sendWelcomeEmail = ({ to, name }) =>
  sendMail({
    to,
    subject: 'Welcome to Dada Finance & Corporation',
    html: baseTemplate(`
      <h2>Welcome, ${name}! 👋</h2>
      <p>Your account has been successfully created at <strong>Dada Finance &amp; Corporation</strong>.</p>
      <p>You can now log in to access your loan details, EMI schedule, and more.</p>
      <p>If you have any questions, please contact your nearest branch.</p>
    `),
  });

export const sendPasswordResetEmail = ({ to, name, resetLink }) =>
  sendMail({
    to,
    subject: 'Password Reset Request — Dada Finance',
    html: baseTemplate(`
      <h2>Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${resetLink}" class="btn">Reset Password</a>
      </p>
      <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
    `),
  });

export const sendOtpEmail = ({ to, name, otp }) =>
  sendMail({
    to,
    subject: 'Your OTP — Dada Finance',
    html: baseTemplate(`
      <h2>One-Time Password</h2>
      <p>Hi ${name},</p>
      <p>Your OTP for login is:</p>
      <p style="text-align:center;margin:24px 0;">
        <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1a56db;">${otp}</span>
      </p>
      <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    `),
  });

export const sendLoanApprovedEmail = ({ to, name, loanNumber, amount, tenure, interestRate }) =>
  sendMail({
    to,
    subject: `Loan Approved — ${loanNumber}`,
    html: baseTemplate(`
      <h2>Your Loan Has Been Approved! 🎉</h2>
      <p>Hi ${name},</p>
      <p>We are pleased to inform you that your loan application has been <span class="badge badge-green">Approved</span>.</p>
      <div class="info-box">
        <table>
          <tr><td>Loan Number</td><td>${loanNumber}</td></tr>
          <tr><td>Approved Amount</td><td>₹${Number(amount).toLocaleString('en-IN')}</td></tr>
          <tr><td>Tenure</td><td>${tenure} months</td></tr>
          <tr><td>Interest Rate</td><td>${interestRate}% per annum</td></tr>
        </table>
      </div>
      <p>Our team will contact you shortly to complete the disbursement process.</p>
    `),
  });

export const sendLoanRejectedEmail = ({ to, name, loanNumber, reason }) =>
  sendMail({
    to,
    subject: `Loan Application Update — ${loanNumber}`,
    html: baseTemplate(`
      <h2>Loan Application Status</h2>
      <p>Hi ${name},</p>
      <p>We regret to inform you that your loan application <strong>${loanNumber}</strong> has been <span class="badge badge-red">Rejected</span>.</p>
      ${reason ? `<div class="info-box"><table><tr><td>Reason</td><td>${reason}</td></tr></table></div>` : ''}
      <p>You may re-apply after 30 days or visit your nearest branch for assistance.</p>
    `),
  });

export const sendLoanDisbursedEmail = ({ to, name, loanNumber, amount, disbursedDate }) =>
  sendMail({
    to,
    subject: `Loan Disbursed — ${loanNumber}`,
    html: baseTemplate(`
      <h2>Loan Disbursed Successfully 💰</h2>
      <p>Hi ${name},</p>
      <p>Your loan amount has been <span class="badge badge-green">Disbursed</span> to your account.</p>
      <div class="info-box">
        <table>
          <tr><td>Loan Number</td><td>${loanNumber}</td></tr>
          <tr><td>Disbursed Amount</td><td>₹${Number(amount).toLocaleString('en-IN')}</td></tr>
          <tr><td>Disbursement Date</td><td>${disbursedDate}</td></tr>
        </table>
      </div>
      <p>Please ensure timely EMI payments to maintain a good credit score.</p>
    `),
  });

export const sendEmiReminderEmail = ({ to, name, loanNumber, emiAmount, dueDate, daysLeft }) =>
  sendMail({
    to,
    subject: `EMI Reminder — ${loanNumber} due in ${daysLeft} day(s)`,
    html: baseTemplate(`
      <h2>EMI Payment Reminder ⏰</h2>
      <p>Hi ${name},</p>
      <p>This is a friendly reminder that your EMI payment is due soon.</p>
      <div class="info-box">
        <table>
          <tr><td>Loan Number</td><td>${loanNumber}</td></tr>
          <tr><td>EMI Amount</td><td>₹${Number(emiAmount).toLocaleString('en-IN')}</td></tr>
          <tr><td>Due Date</td><td>${dueDate}</td></tr>
          <tr><td>Days Remaining</td><td><span class="badge badge-yellow">${daysLeft} day(s)</span></td></tr>
        </table>
      </div>
      <p>Please ensure sufficient balance in your account to avoid late payment charges.</p>
    `),
  });

export const sendEmiOverdueEmail = ({ to, name, loanNumber, emiAmount, dueDate, penaltyAmount }) =>
  sendMail({
    to,
    subject: `Overdue EMI Alert — ${loanNumber}`,
    html: baseTemplate(`
      <h2>EMI Payment Overdue ⚠️</h2>
      <p>Hi ${name},</p>
      <p>Your EMI payment for loan <strong>${loanNumber}</strong> is <span class="badge badge-red">Overdue</span>.</p>
      <div class="info-box">
        <table>
          <tr><td>Loan Number</td><td>${loanNumber}</td></tr>
          <tr><td>EMI Amount</td><td>₹${Number(emiAmount).toLocaleString('en-IN')}</td></tr>
          <tr><td>Due Date</td><td>${dueDate}</td></tr>
          ${penaltyAmount ? `<tr><td>Penalty Charges</td><td>₹${Number(penaltyAmount).toLocaleString('en-IN')}</td></tr>` : ''}
        </table>
      </div>
      <p>Please make the payment immediately to avoid further penalties and impact on your credit score.</p>
    `),
  });

export const sendEmiPaidEmail = ({ to, name, loanNumber, emiAmount, paidDate, receiptNumber }) =>
  sendMail({
    to,
    subject: `EMI Payment Received — ${loanNumber}`,
    html: baseTemplate(`
      <h2>EMI Payment Confirmed ✅</h2>
      <p>Hi ${name},</p>
      <p>We have received your EMI payment. Thank you!</p>
      <div class="info-box">
        <table>
          <tr><td>Loan Number</td><td>${loanNumber}</td></tr>
          <tr><td>Amount Paid</td><td>₹${Number(emiAmount).toLocaleString('en-IN')}</td></tr>
          <tr><td>Payment Date</td><td>${paidDate}</td></tr>
          <tr><td>Receipt No.</td><td>${receiptNumber}</td></tr>
        </table>
      </div>
      <p>Keep up the great payment record!</p>
    `),
  });

export default {
  verifyEmailConnection,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOtpEmail,
  sendLoanApprovedEmail,
  sendLoanRejectedEmail,
  sendLoanDisbursedEmail,
  sendEmiReminderEmail,
  sendEmiOverdueEmail,
  sendEmiPaidEmail,
};

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

let transporter: Transporter<SMTPTransport.SentMessageInfo>;

// Create a test SMTP service that actually works
async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return testAccount;
  } catch (error) {
    console.error("Error creating test account:", error);
    return null;
  }
}

async function setupTransporter() {
  const testAccount = await createTestAccount();
  if (!testAccount) {
    console.error("Failed to create test account. Using default credentials.");
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.password"
      },
    });
  }

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Initialize transporter
setupTransporter().then(t => {
  transporter = t;
  console.log("Email transporter initialized");
}).catch(err => {
  console.error("Failed to initialize email transporter:", err);
});

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  if (!transporter) {
    console.error("Email transporter not initialized");
    return false;
  }

  const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/auth/reset-password?token=${resetToken}`;

  try {
    const info = await transporter.sendMail({
      from: '"ResumeAI" <noreply@resumeai.com>',
      to: email,
      subject: "Reset Your Password",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL:", previewUrl);
    }

    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
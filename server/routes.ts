import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { tailorResume } from "../client/src/lib/openai";
import { storage } from "./storage";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "./email";
import { hashPassword } from "./auth";
import multer from "multer";
import { readFile } from "fs/promises";
import path from "path";

// Initialize multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Import pdf-parse dynamically to avoid initialization issues
async function getPdfParser() {
  const pdfParse = await import('pdf-parse/lib/pdf-parse.js');
  return pdfParse.default;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/process-pdf", upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const pdfParse = await getPdfParser();
      const buffer = req.file.buffer;
      const data = await pdfParse(buffer);

      if (!data || !data.text) {
        throw new Error("Failed to extract text from PDF");
      }

      // Get page count from PDF data
      const pageCount = data.numpages || 1;

      res.json({ 
        text: data.text,
        pageCount: pageCount
      });
    } catch (error: any) {
      console.error('PDF processing error:', error);
      res.status(500).json({ 
        message: "Failed to process PDF file",
        error: error.message 
      });
    }
  });

  app.post("/api/forgot-password", async (req, res) => {
    const { username } = req.body;

    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.json({ message: "If an account exists, you will receive reset instructions" });
      }

      const resetToken = randomBytes(32).toString('hex');
      await storage.storeResetToken(user.id, resetToken);

      const emailSent = await sendPasswordResetEmail(username, resetToken);

      if (!emailSent) {
        throw new Error("Failed to send reset email");
      }

      res.json({ message: "If an account exists, you will receive reset instructions" });
    } catch (error: any) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
      const userId = await storage.validateResetToken(token);
      if (!userId) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, hashedPassword);

      res.json({ message: "Password has been reset successfully" });
    } catch (error: any) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post("/api/tailor-resume", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { content, jobDescription, section, preserveFormat } = req.body;

    if (!content || !jobDescription) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const tailoredContent = await tailorResume(content, jobDescription, section, preserveFormat);
      res.json({ content: tailoredContent });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
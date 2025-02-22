import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

interface ResetToken {
  token: string;
  userId: number;
  expiresAt: Date;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
  storeResetToken(userId: number, token: string): Promise<void>;
  validateResetToken(token: string): Promise<number | null>; // returns userId if valid
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resetTokens: Map<string, ResetToken>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.resetTokens = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async storeResetToken(userId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    this.resetTokens.set(token, {
      token,
      userId,
      expiresAt,
    });
  }

  async validateResetToken(token: string): Promise<number | null> {
    const resetToken = this.resetTokens.get(token);
    if (!resetToken) return null;

    if (new Date() > resetToken.expiresAt) {
      this.resetTokens.delete(token);
      return null;
    }

    return resetToken.userId;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.password = newPassword;
      this.users.set(userId, user);
    }
  }
}

export const storage = new MemStorage();
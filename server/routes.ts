import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import adminRoutes from "./routes/admin.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin routes for system configuration
  app.use("/api/admin", adminRoutes);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

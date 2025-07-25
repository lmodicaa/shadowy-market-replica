import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import adminRoutes from "./routes/admin.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin routes for system configuration
  app.use("/api/admin", adminRoutes);

  // Endpoint para obtener todos los planes disponibles
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json({ plans });
    } catch (error) {
      console.error("Error obteniendo planes:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint para crear pedido Pix manual
  app.post("/api/pix/manual", async (req, res) => {
    try {
      const { id, userId, planId, planName, amount, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: "ID del pedido es requerido" });
      }

      // Verificar si el pedido ya existe
      const existingOrder = await storage.getPixOrder(id);
      if (existingOrder) {
        return res.status(409).json({ error: "El pedido ya existe" });
      }

      const order = await storage.createPixOrder({
        id,
        user_id: userId,
        plan_id: planId,
        plan_name: planName,
        amount: amount.toString(),
        description
      });

      res.json({ 
        success: true, 
        message: "Pedido Pix creado exitosamente",
        order 
      });
    } catch (error) {
      console.error("Error creando pedido Pix:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint para obtener todos los pedidos Pix (para admin)
  app.get("/api/pix/orders", async (req, res) => {
    try {
      const orders = await storage.getPixOrders();
      res.json({ orders });
    } catch (error) {
      console.error("Error obteniendo pedidos:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint para obtener un pedido específico
  app.get("/api/pix/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getPixOrder(id);
      
      if (!order) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      res.json({ order });
    } catch (error) {
      console.error("Error obteniendo pedido:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint para actualizar pedido (agregar código Pix, cambiar estado)
  app.patch("/api/pix/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedOrder = await storage.updatePixOrder(id, updates);
      
      if (!updatedOrder) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      res.json({ 
        success: true, 
        message: "Pedido actualizado exitosamente",
        order: updatedOrder 
      });
    } catch (error) {
      console.error("Error actualizando pedido:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint para eliminar pedido
  app.delete("/api/pix/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePixOrder(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      res.json({ 
        success: true, 
        message: "Pedido eliminado exitosamente" 
      });
    } catch (error) {
      console.error("Error eliminando pedido:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

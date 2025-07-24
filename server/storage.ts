import { type Profile as User, type InsertProfile as InsertUser } from "@shared/schema";
import { db } from "./db";

// Tipos para gestión de pedidos Pix
export interface PixOrder {
  id: string;
  userId?: string;
  amount?: number;
  description?: string;
  status: 'pendiente' | 'pagado' | 'cancelado';
  pixCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertPixOrder {
  id: string;
  userId?: string;
  amount?: number;
  description?: string;
}

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Métodos para gestión de pedidos Pix
  createPixOrder(order: InsertPixOrder): Promise<PixOrder>;
  getPixOrders(): Promise<PixOrder[]>;
  getPixOrder(id: string): Promise<PixOrder | undefined>;
  updatePixOrder(id: string, updates: Partial<PixOrder>): Promise<PixOrder | undefined>;
  deletePixOrder(id: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  // Almacenamiento en memoria para pedidos Pix
  private pixOrders: Map<string, PixOrder> = new Map();

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
    
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await db
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
    
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await db
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    return data as User;
  }

  // Métodos para gestión de pedidos Pix
  async createPixOrder(orderData: InsertPixOrder): Promise<PixOrder> {
    const now = new Date();
    const order: PixOrder = {
      ...orderData,
      status: 'pendiente',
      createdAt: now,
      updatedAt: now
    };
    
    this.pixOrders.set(order.id, order);
    
    // Notificación para admin
    console.log(`🔔 NUEVO PAGO PIX PENDIENTE:`, {
      pedidoId: order.id,
      userId: order.userId,
      amount: order.amount,
      hora: order.createdAt.toLocaleString('es-ES')
    });
    
    return order;
  }

  async getPixOrders(): Promise<PixOrder[]> {
    return Array.from(this.pixOrders.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPixOrder(id: string): Promise<PixOrder | undefined> {
    return this.pixOrders.get(id);
  }

  async updatePixOrder(id: string, updates: Partial<PixOrder>): Promise<PixOrder | undefined> {
    const existing = this.pixOrders.get(id);
    if (!existing) return undefined;
    
    const updated: PixOrder = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    
    this.pixOrders.set(id, updated);
    
    console.log(`📝 PEDIDO PIX ACTUALIZADO:`, {
      pedidoId: id,
      cambios: updates,
      estado: updated.status
    });
    
    return updated;
  }

  async deletePixOrder(id: string): Promise<boolean> {
    const deleted = this.pixOrders.delete(id);
    if (deleted) {
      console.log(`🗑️ PEDIDO PIX ELIMINADO: ${id}`);
    }
    return deleted;
  }
}

export const storage = new SupabaseStorage();

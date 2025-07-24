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

  // Métodos para gestión de pedidos Pix usando Supabase
  async createPixOrder(orderData: InsertPixOrder): Promise<PixOrder> {
    const { data, error } = await db
      .from('pix_orders')
      .insert({
        id: orderData.id,
        user_id: orderData.userId,
        amount: orderData.amount,
        description: orderData.description,
        status: 'pendiente'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating pix order:', error);
      throw new Error(`Failed to create pix order: ${error.message}`);
    }
    
    const order: PixOrder = {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      description: data.description,
      status: data.status,
      pixCode: data.pix_code,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
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
    const { data, error } = await db
      .from('pix_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pix orders:', error);
      return [];
    }
    
    return data.map(row => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      description: row.description,
      status: row.status,
      pixCode: row.pix_code,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async getPixOrder(id: string): Promise<PixOrder | undefined> {
    const { data, error } = await db
      .from('pix_orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching pix order:', error);
      return undefined;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      description: data.description,
      status: data.status,
      pixCode: data.pix_code,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updatePixOrder(id: string, updates: Partial<PixOrder>): Promise<PixOrder | undefined> {
    const updateData: any = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.pixCode) updateData.pix_code = updates.pixCode;
    if (updates.amount) updateData.amount = updates.amount;
    if (updates.description) updateData.description = updates.description;
    
    const { data, error } = await db
      .from('pix_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating pix order:', error);
      return undefined;
    }
    
    const updated: PixOrder = {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      description: data.description,
      status: data.status,
      pixCode: data.pix_code,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
    console.log(`📝 PEDIDO PIX ACTUALIZADO:`, {
      pedidoId: id,
      cambios: updates,
      estado: updated.status
    });
    
    return updated;
  }

  async deletePixOrder(id: string): Promise<boolean> {
    const { error } = await db
      .from('pix_orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting pix order:', error);
      return false;
    }
    
    console.log(`🗑️ PEDIDO PIX ELIMINADO: ${id}`);
    return true;
  }
}

export const storage = new SupabaseStorage();

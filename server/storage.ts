import { 
  type Profile as User, 
  type InsertProfile as InsertUser,
  type PixOrder,
  type InsertPixOrder,
  type Plan,
  type InsertSubscription
} from "@shared/schema";
import { db } from "./db";

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
  
  // Métodos para gestión de planes y suscripciones
  getPlan(id: string): Promise<Plan | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<void>;
  activatePlan(userId: string, planId: string, planName: string, duration: number): Promise<void>;
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
        user_id: orderData.user_id,
        plan_id: orderData.plan_id,
        plan_name: orderData.plan_name,
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
    
    // Notificación para admin
    console.log(`🔔 NUEVO PAGO PIX PENDIENTE:`, {
      pedidoId: data.id,
      planName: data.plan_name,
      userId: data.user_id,
      amount: data.amount,
      hora: new Date(data.created_at).toLocaleString('es-ES')
    });
    
    return data as PixOrder;
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
    
    return data as PixOrder[];
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
    
    return data as PixOrder;
  }

  async updatePixOrder(id: string, updates: Partial<PixOrder>): Promise<PixOrder | undefined> {
    const updateData: any = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.pix_code) updateData.pix_code = updates.pix_code;
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
    
    const updated = data as PixOrder;
    
    console.log(`📝 PEDIDO PIX ACTUALIZADO:`, {
      pedidoId: id,
      cambios: updates,
      estado: updated.status
    });
    
    // Si el pago fue marcado como pagado, activar el plan automáticamente
    if (updated.status === 'pagado' && updated.plan_id && updated.user_id && updated.plan_name) {
      try {
        await this.activatePlan(updated.user_id, updated.plan_id, updated.plan_name, 30);
        console.log(`🎉 PLAN ACTIVADO AUTOMÁTICAMENTE:`, {
          userId: updated.user_id,
          planName: updated.plan_name,
          pedidoId: id
        });
      } catch (error) {
        console.error('Error activating plan after payment:', error);
      }
    }
    
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

  // Métodos para gestión de planes y suscripciones
  async getPlan(id: string): Promise<Plan | undefined> {
    const { data, error } = await db
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching plan:', error);
      return undefined;
    }
    
    return data as Plan;
  }

  async createSubscription(subscription: InsertSubscription): Promise<void> {
    const { error } = await db
      .from('subscriptions')
      .insert(subscription);
    
    if (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async activatePlan(userId: string, planId: string, planName: string, duration: number): Promise<void> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    
    // Crear suscripción
    await this.createSubscription({
      user_id: userId,
      plan_id: planId,
      plan_name: planName,
      start_date: new Date(),
      end_date: endDate
    });
    
    // Actualizar perfil con plano ativo
    const { error } = await db
      .from('profiles')
      .update({
        active_plan: planId,
        active_plan_until: endDate.toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw new Error(`Failed to activate plan: ${error.message}`);
    }
    
    console.log(`✅ PLAN ACTIVADO:`, {
      userId,
      planId,
      planName,
      duration,
      endDate: endDate.toISOString()
    });
  }
}

export const storage = new SupabaseStorage();

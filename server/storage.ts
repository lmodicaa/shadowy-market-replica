import { 
  type Profile,
  type Plan,
  type PixOrder,
  db
} from "./db";

// Storage interface for the migration
export interface IStorage {
  getProfile(id: string): Promise<Profile | undefined>;
  createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile>;
  
  // Plan methods
  getPlans(): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  
  // Pix Order methods
  createPixOrder(order: Omit<PixOrder, 'created_at' | 'updated_at'>): Promise<PixOrder>;
  getPixOrders(): Promise<PixOrder[]>;
  getPixOrder(id: string): Promise<PixOrder | undefined>;
  updatePixOrder(id: string, updates: Partial<PixOrder>): Promise<PixOrder | undefined>;
  deletePixOrder(id: string): Promise<boolean>;
}

export class MemoryStorage implements IStorage {
  
  async getProfile(id: string): Promise<Profile | undefined> {
    const profile = await db.getProfile(id);
    return profile || undefined;
  }

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile> {
    return await db.createProfile(profile);
  }

  async getPlans(): Promise<Plan[]> {
    return await db.getPlans();
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const plan = await db.getPlan(id);
    return plan || undefined;
  }

  async createPixOrder(order: Omit<PixOrder, 'created_at' | 'updated_at'>): Promise<PixOrder> {
    const orderId = `PIX_MATE_${order.plan_name?.replace(/\s+/g, '').toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    
    const newOrder = {
      ...order,
      id: orderId,
      status: order.status || 'pendiente'
    };
    
    return await db.createPixOrder(newOrder);
  }

  async getPixOrders(): Promise<PixOrder[]> {
    return await db.getPixOrders();
  }

  async getPixOrder(id: string): Promise<PixOrder | undefined> {
    const orders = await db.getPixOrders();
    return orders.find(order => order.id === id);
  }

  async updatePixOrder(id: string, updates: Partial<PixOrder>): Promise<PixOrder | undefined> {
    const updated = await db.updatePixOrder(id, updates);
    return updated || undefined;
  }

  async deletePixOrder(id: string): Promise<boolean> {
    const orders = await db.getPixOrders();
    const index = orders.findIndex(order => order.id === id);
    if (index === -1) return false;
    
    // Note: In a real implementation, this would actually remove from storage
    // For this in-memory version, we'll just mark as deleted
    await db.updatePixOrder(id, { status: 'deleted' });
    return true;
  }
}

export const storage = new MemoryStorage();
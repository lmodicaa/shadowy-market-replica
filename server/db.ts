import * as schema from "@shared/schema";

// For migration compatibility, we'll use a simple in-memory database
// This can be upgraded to Supabase later when secrets are configured
export type Profile = {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  active_plan?: string;
  active_plan_until?: Date;
};

export type Plan = {
  id: string;
  name: string;
  stock?: number;
  price: string;
  description?: string;
  ram: string;
  cpu: string;
  storage: string;
  gpu: string;
  max_resolution: string;
  status?: string;
  duration?: number;
  created_at: Date;
};

export type PixOrder = {
  id: string;
  user_id?: string;
  plan_id?: string;
  plan_name?: string;
  amount?: string;
  description?: string;
  status?: string;
  pix_code?: string;
  created_at: Date;
  updated_at: Date;
};

// Simple in-memory storage for migration
class InMemoryDatabase {
  private profiles: Profile[] = [];
  private plans: Plan[] = [
    {
      id: "plan-1",
      name: "MATE NOVA",
      stock: 10,
      price: "R$ 19,99",
      description: "Plano ideal para começar",
      ram: "4 GB",
      cpu: "2 vCPUs",
      storage: "50 GB",
      gpu: "Integrada",
      max_resolution: "1080p",
      status: "Online",
      duration: 30,
      created_at: new Date()
    },
    {
      id: "plan-2", 
      name: "MATE PLUS",
      stock: 5,
      price: "R$ 39,99",
      description: "Plano intermediário com mais recursos",
      ram: "8 GB",
      cpu: "4 vCPUs",
      storage: "100 GB",
      gpu: "Dedicada GTX 1060",
      max_resolution: "1440p",
      status: "Online",
      duration: 30,
      created_at: new Date()
    },
    {
      id: "plan-3",
      name: "MATE PRO",
      stock: 3,
      price: "R$ 79,99", 
      description: "Plano profissional de alta performance",
      ram: "16 GB",
      cpu: "8 vCPUs",
      storage: "200 GB",
      gpu: "Dedicada RTX 3070",
      max_resolution: "4K",
      status: "Online",
      duration: 30,
      created_at: new Date()
    }
  ];
  private pixOrders: PixOrder[] = [];

  // Profile methods
  async getProfile(id: string): Promise<Profile | null> {
    return this.profiles.find(p => p.id === id) || null;
  }

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile> {
    const newProfile: Profile = {
      ...profile,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.profiles.push(newProfile);
    return newProfile;
  }

  // Plan methods
  async getPlans(): Promise<Plan[]> {
    return [...this.plans];
  }

  async getPlan(id: string): Promise<Plan | null> {
    return this.plans.find(p => p.id === id) || null;
  }

  // Pix Order methods
  async createPixOrder(order: Omit<PixOrder, 'created_at' | 'updated_at'>): Promise<PixOrder> {
    const newOrder: PixOrder = {
      ...order,
      status: order.status || 'pendiente',
      created_at: new Date(),
      updated_at: new Date()
    };
    this.pixOrders.push(newOrder);
    return newOrder;
  }

  async getPixOrders(): Promise<PixOrder[]> {
    return [...this.pixOrders];
  }

  async updatePixOrder(id: string, updates: Partial<PixOrder>): Promise<PixOrder | null> {
    const index = this.pixOrders.findIndex(o => o.id === id);
    if (index === -1) return null;
    
    this.pixOrders[index] = {
      ...this.pixOrders[index],
      ...updates,
      updated_at: new Date()
    };
    return this.pixOrders[index];
  }
}

export const db = new InMemoryDatabase();

// Export a compatible interface for existing code
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: null } })
  }
};
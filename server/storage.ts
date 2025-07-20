import { type Profile as User, type InsertProfile as InsertUser } from "@shared/schema";
import { db } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
}

export const storage = new SupabaseStorage();

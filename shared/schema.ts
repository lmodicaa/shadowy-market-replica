import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de perfis de usuário (conectada ao auth.users do Supabase)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // UUID do Supabase auth
  username: text("username"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  active_plan: uuid("active_plan"), // UUID do plano ativo (referencia plans.id)
  active_plan_until: timestamp("active_plan_until"), // Data de expiração do plano
});

// Tabela de planos disponíveis
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  price: text("price").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela de assinaturas/histórico de planos
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(), // Referência ao profiles.id
  plan_id: uuid("plan_id").notNull(), // Referência ao plans.id
  plan_name: text("plan_name").notNull(),
  end_date: timestamp("end_date").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabela de configurações administrativas
export const admin_settings = pgTable("admin_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela de estoque de planos
export const plan_stock = pgTable("plan_stock", {
  id: uuid("id").primaryKey().defaultRandom(),
  plan_id: uuid("plan_id").notNull(), // Referência ao plans.id
  available_slots: integer("available_slots").notNull().default(0),
  total_slots: integer("total_slots").notNull().default(0),
  is_available: boolean("is_available").notNull().default(true),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Tabela de administradores
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().unique(), // Referência ao profiles.id
  role: text("role").notNull().default("admin"), // admin, super_admin
  permissions: text("permissions").array(), // array de permissões
  created_at: timestamp("created_at").defaultNow(),
});

// Schemas para inserção
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  created_at: true,
});

export const insertAdminSettingsSchema = createInsertSchema(admin_settings).omit({
  id: true,
  updated_at: true,
});

export const insertPlanStockSchema = createInsertSchema(plan_stock).omit({
  id: true,
  updated_at: true,
});

export const insertAdminsSchema = createInsertSchema(admins).omit({
  id: true,
  created_at: true,
});

// Tipos
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type AdminSettings = typeof admin_settings.$inferSelect;

export type InsertPlanStock = z.infer<typeof insertPlanStockSchema>;
export type PlanStock = typeof plan_stock.$inferSelect;

export type InsertAdmins = z.infer<typeof insertAdminsSchema>;
export type Admins = typeof admins.$inferSelect;

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
  active_plan: text("active_plan"), // Nome do plano ativo
  active_plan_until: timestamp("active_plan_until"), // Data de expiração do plano
});

// Tabela de planos disponíveis
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  price: text("price").notNull(),
  description: text("description"),
});

// Tabela de assinaturas/histórico de planos
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(), // Referência ao profiles.id
  plan_id: integer("plan_id").notNull(), // Referência ao plans.id
  plan_name: text("plan_name").notNull(),
  end_date: timestamp("end_date").notNull(),
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

// Tipos
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/db';
import { pixOrders } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, email, amount } = req.body;

    // Verificar si ya existe una orden
    const existingOrder = await db
      .select()
      .from(pixOrders)
      .where(and(
        eq(pixOrders.planId, planId),
        eq(pixOrders.email, email)
      ))
      .limit(1);

    if (existingOrder.length > 0) {
      return res.status(400).json({ error: 'Order already exists' });
    }

    // Crear nueva orden
    const [newOrder] = await db
      .insert(pixOrders)
      .values({
        planId,
        email,
        amount,
        status: 'pending',
        createdAt: new Date()
      })
      .returning();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating Pix order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
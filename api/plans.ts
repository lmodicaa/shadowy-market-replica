import { VercelRequest, VercelResponse } from '@vercel/node';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 29.99,
    features: ['Feature 1', 'Feature 2']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 59.99,
    features: ['Feature 1', 'Feature 2', 'Feature 3']
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json(plans);
}
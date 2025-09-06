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
  // Configurar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json(plans);
}
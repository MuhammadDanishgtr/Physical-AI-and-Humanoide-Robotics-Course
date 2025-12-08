import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasMongoUri = !!process.env.MONGODB_URI;
  let dbConnected = false;
  let dbError: string | null = null;

  // Test MongoDB connection
  if (hasMongoUri) {
    try {
      const { db } = await connectToDatabase();
      // Try a simple operation
      await db.command({ ping: 1 });
      dbConnected = true;
    } catch (error: any) {
      dbError = error.message || 'Unknown database error';
    }
  }

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      mongodbConfigured: hasMongoUri,
      mongodbConnected: dbConnected,
      mongodbError: dbError,
      nodeEnv: process.env.NODE_ENV || 'not set',
    },
  });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    return res.status(200).json({
      status: 'error',
      message: 'MONGODB_URI not configured',
    });
  }

  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('robotics-course');
    await db.command({ ping: 1 });

    return res.status(200).json({
      status: 'ok',
      message: 'MongoDB connection successful',
      database: 'robotics-course',
    });
  } catch (error: any) {
    return res.status(200).json({
      status: 'error',
      message: error.message || 'Unknown error',
      errorName: error.name,
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

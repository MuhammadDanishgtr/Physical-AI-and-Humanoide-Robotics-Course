import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  let client: MongoClient | null = null;

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ') && MONGODB_URI) {
      const token = authHeader.split(' ')[1];

      if (token) {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db('robotics-course');
        const sessionsCollection = db.collection('sessions');

        // Delete the session
        await sessionsCollection.deleteOne({ token });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return res.status(200).json({ success: true });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

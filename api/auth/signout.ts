import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../lib/mongodb';

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

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token) {
        const { db } = await connectToDatabase();
        const sessionsCollection = db.collection('sessions');

        // Delete the session
        await sessionsCollection.deleteOne({ token });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    // Still return success even on error - user should be signed out client-side
    return res.status(200).json({ success: true });
  }
}

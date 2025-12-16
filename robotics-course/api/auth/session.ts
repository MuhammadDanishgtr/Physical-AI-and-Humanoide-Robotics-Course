import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    return res.status(200).json({ user: null });
  }

  let client: MongoClient | null = null;

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(200).json({ user: null });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(200).json({ user: null });
    }

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('robotics-course');

    // Look up session by token
    const sessionsCollection = db.collection('sessions');
    const session = await sessionsCollection.findOne({ token });

    if (!session) {
      return res.status(200).json({ user: null });
    }

    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      await sessionsCollection.deleteOne({ token });
      return res.status(200).json({ user: null });
    }

    // Get user data
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) });

    if (!user) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return res.status(200).json({ user: null });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

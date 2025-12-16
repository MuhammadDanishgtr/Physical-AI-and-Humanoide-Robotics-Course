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

  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  let client: MongoClient | null = null;

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('robotics-course');

    // Look up user
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userId = user._id.toString();

    // Generate token
    const token = Buffer.from(JSON.stringify({
      userId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })).toString('base64');

    // Store session
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.insertOne({
      token,
      userId,
      email: user.email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: error.message || 'Something went wrong' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

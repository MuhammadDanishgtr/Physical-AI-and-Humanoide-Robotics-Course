import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../lib/mongodb';

interface User {
  _id?: any;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
}

function generateToken(userId: string): string {
  const payload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Look up user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userId = user._id.toString();

    // Generate new token
    const token = generateToken(userId);

    // Store session
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.insertOne({
      token,
      userId,
      email: user.email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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

    // Provide more specific error messages
    if (error.message?.includes('MONGODB_URI')) {
      return res.status(500).json({ error: 'Database not configured. Please contact support.' });
    }
    if (error.message?.includes('Failed to connect')) {
      return res.status(500).json({ error: 'Unable to connect to database. Please try again later.' });
    }

    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

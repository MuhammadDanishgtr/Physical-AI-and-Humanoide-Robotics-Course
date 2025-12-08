import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../lib/mongodb';

interface User {
  _id?: string;
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
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const newUser: User = {
      email: email.toLowerCase(),
      name,
      password, // In production, hash this with bcrypt!
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId.toString();

    // Generate token
    const token = generateToken(userId);

    // Store session
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.insertOne({
      token,
      userId,
      email: newUser.email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return res.status(200).json({
      token,
      user: {
        id: userId,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);

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

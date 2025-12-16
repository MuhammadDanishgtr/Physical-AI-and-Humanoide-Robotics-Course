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
    const { email, password, name } = req.body || {};

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

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('robotics-course');

    // Check if user already exists
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const newUser = {
      email: email.toLowerCase(),
      name,
      password,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId.toString();

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
      email: newUser.email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
    return res.status(500).json({ error: error.message || 'Something went wrong' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

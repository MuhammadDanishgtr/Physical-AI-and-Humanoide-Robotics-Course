import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For GET request, show test form
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Test signup endpoint. Send POST with { email, password, name }',
      method: req.method,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    return res.status(500).json({
      error: 'MONGODB_URI not configured',
      step: 'env_check'
    });
  }

  let client: MongoClient | null = null;

  try {
    // Step 1: Parse body
    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required',
        received: { email: !!email, password: !!password, name: !!name },
        body: req.body,
        step: 'validation'
      });
    }

    // Step 2: Connect to MongoDB
    client = new MongoClient(MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      w: 'majority',
    });
    await client.connect();
    const db = client.db('robotics-course');

    // Step 3: Check if user exists
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        step: 'user_check'
      });
    }

    // Step 4: Create user
    const newUser = {
      email: email.toLowerCase(),
      name,
      password, // In production, hash this!
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId.toString();

    // Step 5: Generate token
    const token = Buffer.from(JSON.stringify({
      userId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })).toString('base64');

    // Step 6: Create session
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.insertOne({
      token,
      userId,
      email: newUser.email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: userId,
        email: newUser.email,
        name: newUser.name,
      },
    });

  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Unknown error',
      errorName: error.name,
      stack: error.stack?.split('\n').slice(0, 3),
      step: 'catch'
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

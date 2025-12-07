import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

function generateId(): string {
  return 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
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

    // Check if user already exists
    const existingUser = await kv.get<User>(`user:${email}`);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user: User = {
      id: generateId(),
      email: email.toLowerCase(),
      name,
      password, // In production, hash this with bcrypt!
      createdAt: new Date().toISOString(),
    };

    // Store user in KV
    await kv.set(`user:${email.toLowerCase()}`, user);

    // Generate token
    const token = generateToken(user.id);

    // Store token -> user mapping for session validation
    await kv.set(`token:${token}`, { userId: user.id, email: user.email }, { ex: 7 * 24 * 60 * 60 }); // 7 days expiry

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

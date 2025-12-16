/**
 * Background Profile API Endpoint
 * Save and retrieve user background questionnaire data
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';

interface BackgroundProfile {
  userId: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  programmingLanguages: string[];
  hasRoboticsExperience: boolean;
  primaryGoals: string[];
  availableHardware: string[];
  weeklyHoursAvailable: number;
  preferredLanguage: 'en' | 'ur';
  additionalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get user from token
async function getUserFromToken(authHeader: string | undefined, db: any): Promise<{ id: string; email: string; name: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const session = await db.collection('sessions').findOne({ token });
  if (!session || new Date(session.expiresAt) < new Date()) {
    return null;
  }

  const user = await db.collection('users').findOne({ _id: new ObjectId(session.userId) });
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('robotics-course');
    const user = await getUserFromToken(req.headers.authorization, db);

    // For POST requests during signup, allow saving without strict auth
    // The questionnaire is filled right after signup
    if (req.method === 'POST') {
      const body = req.body;

      // Validate required fields
      if (!body.experienceLevel) {
        return res.status(400).json({ error: 'experienceLevel is required' });
      }

      const profilesCollection = db.collection<BackgroundProfile>('backgroundProfiles');

      // If we have a user, use their ID; otherwise, this is a new signup
      const userId = user?.id || body.userId;

      if (!userId) {
        // Just return success - profile will be saved later
        return res.status(200).json({ success: true, message: 'Profile data received' });
      }

      const profileData = {
        userId,
        experienceLevel: body.experienceLevel,
        programmingLanguages: body.programmingLanguages || [],
        hasRoboticsExperience: body.hasRoboticsExperience ?? false,
        primaryGoals: body.primaryGoals || [],
        availableHardware: body.availableHardware || [],
        weeklyHoursAvailable: body.weeklyHoursAvailable ?? 5,
        preferredLanguage: body.preferredLanguage || 'en',
        additionalNotes: body.additionalNotes,
        updatedAt: new Date(),
      };

      // Upsert the profile
      await profilesCollection.updateOne(
        { userId },
        {
          $set: profileData,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      return res.status(200).json({ success: true });
    }

    // GET request - need authentication
    if (req.method === 'GET') {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profilesCollection = db.collection<BackgroundProfile>('backgroundProfiles');
      const profile = await profilesCollection.findOne({ userId: user.id });

      return res.status(200).json({ profile: profile || null });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

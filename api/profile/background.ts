/**
 * Background Profile API Endpoint
 * Save and retrieve user background questionnaire data
 */

import { auth } from '../../src/lib/auth';
import { db, backgroundProfiles } from '../../src/lib/db';
import { eq } from 'drizzle-orm';

interface BackgroundProfileData {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  programmingLanguages: string[];
  hasRoboticsExperience: boolean;
  primaryGoals: string[];
  availableHardware: string[];
  weeklyHoursAvailable: number;
  preferredLanguage: 'en' | 'ur';
  additionalNotes?: string;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const profile = await db.query.backgroundProfiles.findFirst({
      where: eq(backgroundProfiles.userId, session.user.id),
    });

    if (!profile) {
      return new Response(JSON.stringify({ profile: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body: BackgroundProfileData = await req.json();

    // Validate required fields
    if (!body.experienceLevel) {
      return new Response(
        JSON.stringify({ error: 'experienceLevel is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const userId = session.user.id;

    // Check if profile exists
    const existingProfile = await db.query.backgroundProfiles.findFirst({
      where: eq(backgroundProfiles.userId, userId),
    });

    if (existingProfile) {
      // Update existing profile
      await db
        .update(backgroundProfiles)
        .set({
          experienceLevel: body.experienceLevel,
          programmingLanguages: body.programmingLanguages || [],
          hasRoboticsExperience: body.hasRoboticsExperience ?? false,
          primaryGoals: body.primaryGoals || [],
          availableHardware: body.availableHardware || [],
          weeklyHoursAvailable: body.weeklyHoursAvailable ?? 5,
          preferredLanguage: body.preferredLanguage || 'en',
          additionalNotes: body.additionalNotes,
          updatedAt: new Date(),
        })
        .where(eq(backgroundProfiles.userId, userId));
    } else {
      // Create new profile
      await db.insert(backgroundProfiles).values({
        userId,
        experienceLevel: body.experienceLevel,
        programmingLanguages: body.programmingLanguages || [],
        hasRoboticsExperience: body.hasRoboticsExperience ?? false,
        primaryGoals: body.primaryGoals || [],
        availableHardware: body.availableHardware || [],
        weeklyHoursAvailable: body.weeklyHoursAvailable ?? 5,
        preferredLanguage: body.preferredLanguage || 'en',
        additionalNotes: body.additionalNotes,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Save profile error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save profile' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    return GET(req);
  } else if (req.method === 'POST') {
    return POST(req);
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}

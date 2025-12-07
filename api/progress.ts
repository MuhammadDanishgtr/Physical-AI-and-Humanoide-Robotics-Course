/**
 * Progress API Endpoint
 * Get and update user progress
 */

import { auth } from '../src/lib/auth';
import { db, progressRecords, users } from '../src/lib/db';
import { eq, and } from 'drizzle-orm';

interface ProgressResponse {
  overallProgress: number;
  currentModule: number;
  currentLesson: string;
  lessonsCompleted: number;
  totalLessons: number;
  streak: number;
  recommendations: string[];
  moduleProgress: Array<{
    moduleId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    percentComplete: number;
    lessonsCompleted: number;
    totalLessons: number;
  }>;
}

const TOTAL_LESSONS = 12;
const LESSONS_PER_MODULE = 3;

const MODULE_LESSONS = {
  'module-1': [
    'module-1/lesson-1-1-intro',
    'module-1/lesson-1-2-hardware',
    'module-1/lesson-1-3-setup',
  ],
  'module-2': [
    'module-2/lesson-2-1-sensors',
    'module-2/lesson-2-2-data',
    'module-2/lesson-2-3-vision',
  ],
  'module-3': [
    'module-3/lesson-3-1-motors',
    'module-3/lesson-3-2-kinematics',
    'module-3/lesson-3-3-planning',
  ],
  'module-4': [
    'module-4/lesson-4-1-integration',
    'module-4/lesson-4-2-capstone',
    'module-4/lesson-4-3-next-steps',
  ],
};

export async function GET(req: Request): Promise<Response> {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      // Return default progress for unauthenticated users
      return new Response(JSON.stringify(getDefaultProgress()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;

    // Get all progress records for user
    const records = await db.query.progressRecords.findMany({
      where: eq(progressRecords.userId, userId),
    });

    // Calculate progress
    const completedLessons = records.filter(r => r.status === 'completed').length;
    const inProgressLessons = records.filter(r => r.status === 'in_progress');

    // Determine current lesson
    let currentLesson = 'module-1/lesson-1-1-intro';
    if (inProgressLessons.length > 0) {
      currentLesson = inProgressLessons[0].lessonId;
    } else if (completedLessons < TOTAL_LESSONS) {
      // Find first uncompleted lesson
      for (const [moduleId, lessons] of Object.entries(MODULE_LESSONS)) {
        for (const lessonId of lessons) {
          const isCompleted = records.some(
            r => r.lessonId === lessonId && r.status === 'completed'
          );
          if (!isCompleted) {
            currentLesson = lessonId;
            break;
          }
        }
      }
    }

    // Calculate module progress
    const moduleProgress = Object.entries(MODULE_LESSONS).map(([moduleId, lessons]) => {
      const moduleRecords = records.filter(r => r.moduleId === moduleId);
      const completed = moduleRecords.filter(r => r.status === 'completed').length;
      const inProgress = moduleRecords.some(r => r.status === 'in_progress');

      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (completed === LESSONS_PER_MODULE) {
        status = 'completed';
      } else if (completed > 0 || inProgress) {
        status = 'in_progress';
      }

      return {
        moduleId,
        status,
        percentComplete: Math.round((completed / LESSONS_PER_MODULE) * 100),
        lessonsCompleted: completed,
        totalLessons: LESSONS_PER_MODULE,
      };
    });

    // Calculate streak (simplified - would need more logic in production)
    const today = new Date();
    const recentRecords = records.filter(r => {
      const accessDate = new Date(r.lastAccessedAt);
      const daysDiff = Math.floor((today.getTime() - accessDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    const streak = recentRecords.length > 0 ? Math.min(recentRecords.length, 7) : 0;

    // Generate recommendations
    const recommendations = generateRecommendations(completedLessons, moduleProgress);

    const currentModuleNum = parseInt(currentLesson.split('-')[1]) || 1;

    const response: ProgressResponse = {
      overallProgress: Math.round((completedLessons / TOTAL_LESSONS) * 100),
      currentModule: currentModuleNum,
      currentLesson,
      lessonsCompleted: completedLessons,
      totalLessons: TOTAL_LESSONS,
      streak,
      recommendations,
      moduleProgress,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Progress API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch progress' }),
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

    const body = await req.json();
    const { lessonId, moduleId, status, percentComplete } = body;

    if (!lessonId || !moduleId) {
      return new Response(JSON.stringify({ error: 'lessonId and moduleId required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;

    // Upsert progress record
    const existingRecord = await db.query.progressRecords.findFirst({
      where: and(
        eq(progressRecords.userId, userId),
        eq(progressRecords.lessonId, lessonId)
      ),
    });

    if (existingRecord) {
      await db
        .update(progressRecords)
        .set({
          status: status || existingRecord.status,
          percentComplete: percentComplete ?? existingRecord.percentComplete,
          lastAccessedAt: new Date(),
          completedAt: status === 'completed' ? new Date() : existingRecord.completedAt,
          updatedAt: new Date(),
        })
        .where(eq(progressRecords.id, existingRecord.id));
    } else {
      await db.insert(progressRecords).values({
        userId,
        moduleId,
        lessonId,
        status: status || 'in_progress',
        percentComplete: percentComplete ?? 0,
        lastAccessedAt: new Date(),
        completedAt: status === 'completed' ? new Date() : null,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update progress' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function getDefaultProgress(): ProgressResponse {
  return {
    overallProgress: 0,
    currentModule: 1,
    currentLesson: 'module-1/lesson-1-1-intro',
    lessonsCompleted: 0,
    totalLessons: TOTAL_LESSONS,
    streak: 0,
    recommendations: [
      'Start with Lesson 1.1 to learn about Physical AI concepts',
      'Set up your development environment in Lesson 1.3',
      'Join our Discord community for support',
    ],
    moduleProgress: Object.keys(MODULE_LESSONS).map(moduleId => ({
      moduleId,
      status: 'not_started' as const,
      percentComplete: 0,
      lessonsCompleted: 0,
      totalLessons: LESSONS_PER_MODULE,
    })),
  };
}

function generateRecommendations(
  completedLessons: number,
  moduleProgress: ProgressResponse['moduleProgress']
): string[] {
  const recommendations: string[] = [];

  if (completedLessons === 0) {
    recommendations.push('Start with Lesson 1.1 to learn about Physical AI concepts');
    recommendations.push('Set up your development environment in Lesson 1.3');
    recommendations.push('Join our Discord community for support');
  } else if (completedLessons < 3) {
    recommendations.push('Complete Module 1 to build a strong foundation');
    recommendations.push('Try the hands-on exercises to reinforce your learning');
    recommendations.push('Use the chatbot to ask questions about concepts');
  } else if (completedLessons < 6) {
    recommendations.push('Explore computer vision in Module 2');
    recommendations.push('Consider building a simple sensor project');
    recommendations.push('Review previous lessons if concepts are unclear');
  } else if (completedLessons < 9) {
    recommendations.push('Master motion control in Module 3');
    recommendations.push('Start planning your capstone project');
    recommendations.push('Practice kinematics calculations');
  } else {
    recommendations.push('Focus on your capstone project');
    recommendations.push('Explore advanced topics in Lesson 4.3');
    recommendations.push('Share your progress with the community');
  }

  return recommendations.slice(0, 3);
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

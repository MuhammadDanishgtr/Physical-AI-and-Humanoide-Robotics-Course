/**
 * Progress API Endpoint
 * Simple progress tracking using client-side storage
 * This endpoint provides default progress data for the dashboard
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    title: string;
    status: 'not_started' | 'in_progress' | 'completed';
    percentComplete: number;
    lessonsCompleted: number;
    totalLessons: number;
  }>;
}

const TOTAL_LESSONS = 12;
const LESSONS_PER_MODULE = 3;

const MODULE_INFO = [
  { id: 'module-1', title: 'Module 1: Foundations' },
  { id: 'module-2', title: 'Module 2: Sensors' },
  { id: 'module-3', title: 'Module 3: Actuators' },
  { id: 'module-4', title: 'Module 4: Integration' },
];

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
      'Use the Course Assistant chatbot for help with concepts',
    ],
    moduleProgress: MODULE_INFO.map(m => ({
      moduleId: m.id,
      title: m.title,
      status: 'not_started' as const,
      percentComplete: 0,
      lessonsCompleted: 0,
      totalLessons: LESSONS_PER_MODULE,
    })),
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

  if (req.method === 'GET') {
    // Return default progress
    // In a full implementation, this would fetch from database based on user session
    return res.status(200).json(getDefaultProgress());
  }

  if (req.method === 'POST') {
    // In a full implementation, this would save progress to database
    // For now, we acknowledge the request but progress is stored client-side
    try {
      const { lessonId, moduleId, status } = req.body || {};

      if (!lessonId || !moduleId) {
        return res.status(400).json({ error: 'lessonId and moduleId required' });
      }

      // Return success - actual storage happens client-side in localStorage
      return res.status(200).json({
        success: true,
        message: 'Progress recorded. Note: Progress is stored in your browser.',
      });
    } catch (error) {
      console.error('Progress API error:', error);
      return res.status(500).json({ error: 'Failed to process progress update' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

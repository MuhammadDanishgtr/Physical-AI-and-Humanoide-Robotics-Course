/**
 * Shared Type Definitions
 * For Physical AI & Humanoid Robotics Course
 */

// ============================================
// Course Content Types
// ============================================

export interface Module {
  id: string;
  title: string;
  description: string;
  weekRange: string;
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  objectives: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  prerequisites?: string[];
  resources?: Resource[];
}

export interface Resource {
  type: 'video' | 'document' | 'link' | 'download';
  title: string;
  url: string;
  description?: string;
}

// ============================================
// User & Profile Types
// ============================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  backgroundProfile?: BackgroundProfileData;
  createdAt: Date;
}

export interface BackgroundProfileData {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  programmingLanguages: string[];
  hasRoboticsExperience: boolean;
  primaryGoals: string[];
  availableHardware: string[];
  weeklyHoursAvailable: number;
  preferredLanguage: 'en' | 'ur';
  additionalNotes?: string;
}

export interface BackgroundQuestionnaireStep {
  id: string;
  question: string;
  description?: string;
  type: 'single' | 'multiple' | 'slider' | 'text';
  options?: { value: string; label: string; description?: string }[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

// ============================================
// Progress Tracking Types
// ============================================

export interface UserProgress {
  userId: string;
  overallProgress: number;
  moduleProgress: ModuleProgress[];
  currentLesson?: string;
  totalTimeSpent: number;
  lastAccessedAt: Date;
  streak: number;
  recommendations: string[];
}

export interface ModuleProgress {
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percentComplete: number;
  lessonsProgress: LessonProgress[];
}

export interface LessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  percentComplete: number;
  exercisesCompleted: number;
  exercisesTotal: number;
  quizScore?: number;
  timeSpentMinutes: number;
  lastAccessedAt: Date;
  completedAt?: Date;
}

// ============================================
// Exercise & Quiz Types
// ============================================

export interface Exercise {
  id: string;
  lessonId: string;
  type: 'code' | 'multiple-choice' | 'short-answer' | 'interactive';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  content: ExerciseContent;
  hints?: string[];
  solution?: ExerciseSolution;
}

export type ExerciseContent =
  | CodeExerciseContent
  | MultipleChoiceContent
  | ShortAnswerContent
  | InteractiveContent;

export interface CodeExerciseContent {
  type: 'code';
  language: 'python' | 'cpp' | 'arduino';
  starterCode: string;
  testCases: TestCase[];
  expectedOutput?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
  hidden?: boolean;
}

export interface MultipleChoiceContent {
  type: 'multiple-choice';
  question: string;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  explanation?: string;
}

export interface ShortAnswerContent {
  type: 'short-answer';
  question: string;
  maxLength?: number;
  rubric?: string;
}

export interface InteractiveContent {
  type: 'interactive';
  componentType: 'simulation' | 'diagram' | 'circuit';
  config: Record<string, unknown>;
}

export interface ExerciseSolution {
  code?: string;
  explanation: string;
  tips?: string[];
}

export interface ExerciseSubmission {
  id: string;
  exerciseId: string;
  userId: string;
  submissionData: {
    code?: string;
    answer?: string;
    selectedOptions?: string[];
  };
  isCorrect?: boolean;
  feedback?: string;
  attemptNumber: number;
  createdAt: Date;
}

// ============================================
// Chatbot Types
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
}

export interface ChatSource {
  lessonId: string;
  title: string;
  relevanceScore: number;
  snippet: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  lessonContext?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  lessonContext?: string;
}

export interface ChatResponse {
  message: string;
  sources: ChatSource[];
  sessionId: string;
}

// ============================================
// Translation Types
// ============================================

export interface TranslationRequest {
  text: string;
  sourceLanguage: 'en';
  targetLanguage: 'ur';
}

export interface TranslationResponse {
  translatedText: string;
  cached: boolean;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardData {
  user: UserProfile;
  progress: UserProgress;
  recentActivity: ActivityItem[];
  upcomingLessons: Lesson[];
  achievements: Achievement[];
}

export interface ActivityItem {
  id: string;
  type: 'lesson_started' | 'lesson_completed' | 'exercise_completed' | 'quiz_passed';
  title: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
}

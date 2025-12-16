/**
 * Database Schema for Physical AI & Humanoid Robotics Course
 * Using Drizzle ORM with PostgreSQL
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
  uuid,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// Enums
// ============================================

export const experienceLevelEnum = pgEnum('experience_level', [
  'beginner',
  'intermediate',
  'advanced',
]);

export const lessonStatusEnum = pgEnum('lesson_status', [
  'not_started',
  'in_progress',
  'completed',
]);

export const moduleIdEnum = pgEnum('module_id', [
  'module-1',
  'module-2',
  'module-3',
  'module-4',
]);

// ============================================
// Users Table (Better-Auth compatible)
// ============================================

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Sessions Table (Better-Auth compatible)
// ============================================

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

// ============================================
// Accounts Table (Better-Auth compatible)
// ============================================

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Verifications Table (Better-Auth compatible)
// ============================================

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Background Profiles Table
// ============================================

export const backgroundProfiles = pgTable('background_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  experienceLevel: experienceLevelEnum('experience_level').notNull(),
  programmingLanguages: text('programming_languages').array().notNull().default([]),
  hasRoboticsExperience: boolean('has_robotics_experience').notNull().default(false),
  primaryGoals: text('primary_goals').array().notNull().default([]),
  availableHardware: text('available_hardware').array().notNull().default([]),
  weeklyHoursAvailable: integer('weekly_hours_available').notNull().default(5),
  preferredLanguage: varchar('preferred_language', { length: 10 }).notNull().default('en'),
  additionalNotes: text('additional_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Progress Records Table
// ============================================

export const progressRecords = pgTable('progress_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  moduleId: varchar('module_id', { length: 20 }).notNull(),
  lessonId: varchar('lesson_id', { length: 50 }).notNull(),
  status: lessonStatusEnum('status').notNull().default('not_started'),
  percentComplete: integer('percent_complete').notNull().default(0),
  exercisesCompleted: integer('exercises_completed').notNull().default(0),
  exercisesTotal: integer('exercises_total').notNull().default(0),
  quizScore: integer('quiz_score'),
  quizAttempts: integer('quiz_attempts').notNull().default(0),
  timeSpentMinutes: integer('time_spent_minutes').notNull().default(0),
  lastAccessedAt: timestamp('last_accessed_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Chatbot Interactions Table
// ============================================

export const chatbotInteractions = pgTable('chatbot_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  lessonContext: varchar('lesson_context', { length: 50 }),
  userMessage: text('user_message').notNull(),
  botResponse: text('bot_response').notNull(),
  sourceDocs: jsonb('source_docs').$type<{
    docId: string;
    title: string;
    relevanceScore: number;
    snippet: string;
  }[]>(),
  responseTimeMs: integer('response_time_ms'),
  feedbackRating: integer('feedback_rating'),
  feedbackComment: text('feedback_comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// Translation Cache Table
// ============================================

export const translationCache = pgTable('translation_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceText: text('source_text').notNull(),
  sourceTextHash: varchar('source_text_hash', { length: 64 }).notNull().unique(),
  targetLanguage: varchar('target_language', { length: 10 }).notNull(),
  translatedText: text('translated_text').notNull(),
  modelUsed: varchar('model_used', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// Exercise Submissions Table
// ============================================

export const exerciseSubmissions = pgTable('exercise_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lessonId: varchar('lesson_id', { length: 50 }).notNull(),
  exerciseId: varchar('exercise_id', { length: 50 }).notNull(),
  submissionData: jsonb('submission_data').$type<{
    code?: string;
    answer?: string;
    selectedOptions?: string[];
    files?: { name: string; content: string }[];
  }>().notNull(),
  isCorrect: boolean('is_correct'),
  feedback: text('feedback'),
  attemptNumber: integer('attempt_number').notNull().default(1),
  timeSpentSeconds: integer('time_spent_seconds'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
  backgroundProfile: one(backgroundProfiles, {
    fields: [users.id],
    references: [backgroundProfiles.userId],
  }),
  sessions: many(sessions),
  accounts: many(accounts),
  progressRecords: many(progressRecords),
  chatbotInteractions: many(chatbotInteractions),
  exerciseSubmissions: many(exerciseSubmissions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const backgroundProfilesRelations = relations(backgroundProfiles, ({ one }) => ({
  user: one(users, {
    fields: [backgroundProfiles.userId],
    references: [users.id],
  }),
}));

export const progressRecordsRelations = relations(progressRecords, ({ one }) => ({
  user: one(users, {
    fields: [progressRecords.userId],
    references: [users.id],
  }),
}));

export const chatbotInteractionsRelations = relations(chatbotInteractions, ({ one }) => ({
  user: one(users, {
    fields: [chatbotInteractions.userId],
    references: [users.id],
  }),
}));

export const exerciseSubmissionsRelations = relations(exerciseSubmissions, ({ one }) => ({
  user: one(users, {
    fields: [exerciseSubmissions.userId],
    references: [users.id],
  }),
}));

// ============================================
// Type Exports
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type BackgroundProfile = typeof backgroundProfiles.$inferSelect;
export type NewBackgroundProfile = typeof backgroundProfiles.$inferInsert;

export type ProgressRecord = typeof progressRecords.$inferSelect;
export type NewProgressRecord = typeof progressRecords.$inferInsert;

export type ChatbotInteraction = typeof chatbotInteractions.$inferSelect;
export type NewChatbotInteraction = typeof chatbotInteractions.$inferInsert;

export type TranslationCacheEntry = typeof translationCache.$inferSelect;
export type NewTranslationCacheEntry = typeof translationCache.$inferInsert;

export type ExerciseSubmission = typeof exerciseSubmissions.$inferSelect;
export type NewExerciseSubmission = typeof exerciseSubmissions.$inferInsert;

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

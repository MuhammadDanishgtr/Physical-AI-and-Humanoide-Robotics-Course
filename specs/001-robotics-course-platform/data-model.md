# Data Model: Physical AI & Humanoid Robotics Course Platform

**Date**: 2025-12-06
**Branch**: `001-robotics-course-platform`

## Overview

This document defines the data entities, relationships, and validation rules for the course platform.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      User       │───────│ BackgroundProfile│
└────────┬────────┘       └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│ ProgressRecord  │───────│     Lesson      │
└─────────────────┘       └────────┬────────┘
                                   │ N:1
                                   ▼
                          ┌─────────────────┐
                          │     Module      │
                          └─────────────────┘

┌─────────────────┐
│ChatbotInteraction│
└─────────────────┘
```

---

## Entities

### 1. User

Represents an enrolled learner on the platform.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, Auto-generated | Unique identifier |
| email | String | Unique, Required, Valid email | User's email address |
| emailVerified | Boolean | Default: false | Email verification status |
| name | String | Optional, Max 100 chars | Display name |
| image | String | Optional, Valid URL | Profile picture URL |
| createdAt | DateTime | Auto-generated | Account creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Relationships**:
- Has one `BackgroundProfile`
- Has many `ProgressRecord`
- Has many `ChatbotInteraction`

**Validation Rules**:
- Email must be unique and valid format
- Name must not contain special characters (alphanumeric, spaces only)

---

### 2. BackgroundProfile

Stores user's self-reported experience levels for personalization.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, Auto-generated | Unique identifier |
| userId | UUID | FK → User.id, Unique | Associated user |
| softwareLevel | Enum | Required | Programming experience level |
| hardwareLevel | Enum | Required | Electronics/hardware experience level |
| goals | String | Optional, Max 500 chars | Learning goals description |
| createdAt | DateTime | Auto-generated | Profile creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Enum Values**:
- `softwareLevel`: `none`, `beginner`, `intermediate`, `advanced`
- `hardwareLevel`: `none`, `beginner`, `intermediate`, `advanced`

**Validation Rules**:
- Each user can have only one background profile
- softwareLevel and hardwareLevel are required

---

### 3. Module

Represents a course module (chapter) containing multiple lessons.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, Format: "module-N" | Module identifier |
| title | String | Required, Max 100 chars | Module title |
| description | String | Required, Max 500 chars | Module description |
| weekStart | Integer | Required, Range: 1-8 | Starting week |
| weekEnd | Integer | Required, Range: 1-8 | Ending week |
| order | Integer | Required, Unique | Display order (1-4) |
| prerequisites | String[] | Optional | Required module IDs |

**Static Data** (defined in content, not database):
```json
[
  { "id": "module-1", "title": "Foundations of Physical AI", "weekStart": 1, "weekEnd": 2, "order": 1 },
  { "id": "module-2", "title": "Sensors and Perception", "weekStart": 3, "weekEnd": 4, "order": 2 },
  { "id": "module-3", "title": "Actuators and Motion", "weekStart": 5, "weekEnd": 6, "order": 3 },
  { "id": "module-4", "title": "Integration and Projects", "weekStart": 7, "weekEnd": 8, "order": 4 }
]
```

---

### 4. Lesson

Represents an individual learning unit within a module.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, Format: "lesson-N-M" | Lesson identifier |
| moduleId | String | FK → Module.id | Parent module |
| title | String | Required, Max 100 chars | Lesson title |
| slug | String | Required, Unique | URL-friendly identifier |
| estimatedMinutes | Integer | Required, Range: 15-180 | Estimated completion time |
| difficulty | Enum | Required | Difficulty level |
| order | Integer | Required | Display order within module |
| prerequisites | String[] | Optional | Required lesson IDs |

**Enum Values**:
- `difficulty`: `beginner`, `intermediate`

**Static Data** (defined in content, not database):
```json
[
  { "id": "lesson-1-1", "moduleId": "module-1", "title": "Introduction to Physical AI", "estimatedMinutes": 45, "difficulty": "beginner" },
  { "id": "lesson-1-2", "moduleId": "module-1", "title": "Hardware Fundamentals", "estimatedMinutes": 60, "difficulty": "beginner" },
  { "id": "lesson-1-3", "moduleId": "module-1", "title": "Software Environment Setup", "estimatedMinutes": 90, "difficulty": "beginner" },
  // ... remaining 9 lessons
]
```

---

### 5. ProgressRecord

Tracks a user's completion status for each lesson.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, Auto-generated | Unique identifier |
| userId | UUID | FK → User.id | Associated user |
| lessonId | String | Required | Lesson identifier |
| status | Enum | Required, Default: not_started | Completion status |
| knowledgeCheckScore | Integer | Optional, Range: 0-100 | Quiz score percentage |
| completedAt | DateTime | Optional | Completion timestamp |
| createdAt | DateTime | Auto-generated | Record creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Enum Values**:
- `status`: `not_started`, `in_progress`, `completed`

**Validation Rules**:
- Unique constraint on (userId, lessonId)
- knowledgeCheckScore only set when status is `completed`
- completedAt only set when status is `completed`

---

### 6. ChatbotInteraction

Stores chatbot conversations for analytics and improvement.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, Auto-generated | Unique identifier |
| userId | UUID | FK → User.id, Optional | Associated user (null if anonymous) |
| sessionId | String | Required | Browser session identifier |
| question | String | Required, Max 1000 chars | User's question |
| response | String | Required, Max 5000 chars | Chatbot response |
| citations | JSON | Optional | Array of lesson citations |
| helpful | Boolean | Optional | User feedback on helpfulness |
| currentLessonId | String | Optional | Lesson user was viewing |
| createdAt | DateTime | Auto-generated | Interaction timestamp |

**Citations Format**:
```json
[
  { "lessonId": "lesson-3-2", "title": "Kinematics Fundamentals", "relevance": 0.92 }
]
```

---

### 7. Session (Better-Auth Managed)

Managed by Better-Auth, stores user session data.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Session identifier |
| userId | UUID | Associated user |
| token | String | Session token |
| expiresAt | DateTime | Expiration timestamp |
| ipAddress | String | Client IP |
| userAgent | String | Browser user agent |
| createdAt | DateTime | Session creation |
| updatedAt | DateTime | Last activity |

---

## Vector Store Schema (Qdrant)

### Collection: `course_content`

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Chunk identifier |
| vector | Float[1024] | Cohere embed-english-v3.0 embedding |
| payload.lessonId | String | Source lesson ID |
| payload.moduleId | String | Source module ID |
| payload.title | String | Lesson title |
| payload.section | String | Section heading |
| payload.content | String | Original text chunk |
| payload.url | String | Full URL to lesson |
| payload.chunkIndex | Integer | Position in lesson |

**Indexing Parameters**:
- Distance metric: Cosine
- Chunk size: 400-512 tokens
- Overlap: 50-100 tokens

---

## Database Schema (Drizzle ORM)

```typescript
// schema.ts
import { pgTable, uuid, varchar, text, timestamp, boolean, integer, json, pgEnum } from 'drizzle-orm/pg-core';

export const softwareLevelEnum = pgEnum('software_level', ['none', 'beginner', 'intermediate', 'advanced']);
export const hardwareLevelEnum = pgEnum('hardware_level', ['none', 'beginner', 'intermediate', 'advanced']);
export const progressStatusEnum = pgEnum('progress_status', ['not_started', 'in_progress', 'completed']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: boolean('email_verified').default(false),
  name: varchar('name', { length: 100 }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const backgroundProfiles = pgTable('background_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).unique().notNull(),
  softwareLevel: softwareLevelEnum('software_level').notNull(),
  hardwareLevel: hardwareLevelEnum('hardware_level').notNull(),
  goals: varchar('goals', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const progressRecords = pgTable('progress_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  lessonId: varchar('lesson_id', { length: 50 }).notNull(),
  status: progressStatusEnum('status').default('not_started').notNull(),
  knowledgeCheckScore: integer('knowledge_check_score'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const chatbotInteractions = pgTable('chatbot_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  question: text('question').notNull(),
  response: text('response').notNull(),
  citations: json('citations'),
  helpful: boolean('helpful'),
  currentLessonId: varchar('current_lesson_id', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## State Transitions

### ProgressRecord Status

```
┌─────────────┐     User opens      ┌─────────────┐    User completes    ┌─────────────┐
│ not_started │ ─────────────────▶  │ in_progress │ ─────────────────▶   │  completed  │
└─────────────┘     lesson          └─────────────┘    knowledge check   └─────────────┘
                                           │                                    │
                                           │ User returns                       │
                                           └────────────────────────────────────┘
                                                  (status unchanged)
```

**Transition Rules**:
1. `not_started` → `in_progress`: When user first views lesson content
2. `in_progress` → `completed`: When user clicks "Mark as Complete" or passes knowledge check
3. `completed` is a terminal state (can be reset by admin only)

---

## Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| users | idx_users_email | email | Fast lookup by email |
| background_profiles | idx_bp_user | userId | FK lookup |
| progress_records | idx_pr_user_lesson | userId, lessonId | Unique progress lookup |
| progress_records | idx_pr_user | userId | User's all progress |
| chatbot_interactions | idx_ci_user | userId | User's chat history |
| chatbot_interactions | idx_ci_session | sessionId | Session lookup |

# Implementation Plan: Physical AI & Humanoid Robotics Course Platform

**Branch**: `001-robotics-course-platform` | **Date**: 2025-12-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-robotics-course-platform/spec.md`

## Summary

Build a Docusaurus-based educational platform for Physical AI and Humanoid Robotics with:
- 4 modules, 12 lessons structured over 8 weeks
- Better-Auth authentication with background questionnaire at signup
- RAG chatbot powered by Cohere embeddings and Qdrant vector database
- English-to-Urdu translation via Claude API
- Progress tracking with personalized recommendations
- WCAG 2.1 AA accessible, mobile-responsive design

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS
**Primary Dependencies**: Docusaurus 3.x, Better-Auth, Drizzle ORM, React 18, TanStack Query
**Storage**: PostgreSQL 16 (user data, progress), Qdrant Cloud (vector embeddings)
**Testing**: Vitest (unit), Playwright (e2e), axe-core (accessibility)
**Target Platform**: Web (modern browsers), Edge deployment (Vercel)
**Project Type**: Web application (Docusaurus frontend + API backend)
**Performance Goals**: <3s page load on 3G, <500ms API response p95, <5s chatbot response
**Constraints**: WCAG 2.1 AA compliance, 99.5% uptime for documentation, graceful AI service degradation
**Scale/Scope**: ~1000 concurrent users, 12 lessons (~14 hours content), 4 custom React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Implementation |
|-----------|-------------|--------|----------------|
| I. Learner-Centric | Background assessment at signup | ✅ PASS | Better-Auth + custom profile table |
| II. Hands-On Learning | Each lesson has exercise | ✅ PASS | HandsOnExercise component + simulations |
| III. Accessibility | WCAG 2.1 AA, Urdu support | ✅ PASS | axe-core testing, Claude translation |
| IV. Progressive Complexity | 4 modules, 8 weeks | ✅ PASS | Docusaurus sidebar structure |
| V. Intelligent Assistance | RAG chatbot with citations | ✅ PASS | Cohere + Qdrant + Claude |
| VI. Secure Auth | Better-Auth, encrypted data | ✅ PASS | Better-Auth with PostgreSQL |
| VII. Documentation Excellence | Consistent formatting, versioning | ✅ PASS | Docusaurus native features |
| VIII. Modular Architecture | Loosely coupled, abstracted integrations | ✅ PASS | Service layer pattern |

**Gate Status**: ✅ ALL PASSED - Proceed to implementation

## Project Structure

### Documentation (this feature)

```text
specs/001-robotics-course-platform/
├── plan.md              # This file
├── research.md          # Technology research findings
├── data-model.md        # Entity definitions and schema
├── quickstart.md        # Developer setup guide
├── contracts/
│   └── api-spec.yaml    # OpenAPI 3.0 specification
└── tasks.md             # Implementation tasks (Phase 2)
```

### Source Code (repository root)

```text
robotics-course/
├── docs/                           # Course content (Docusaurus)
│   ├── intro.md                    # Course overview
│   ├── module-1/                   # Foundations of Physical AI
│   │   ├── _category_.json
│   │   ├── lesson-1-1-intro.md
│   │   ├── lesson-1-2-hardware.md
│   │   └── lesson-1-3-setup.md
│   ├── module-2/                   # Sensors and Perception
│   │   ├── _category_.json
│   │   ├── lesson-2-1-sensors.md
│   │   ├── lesson-2-2-data.md
│   │   └── lesson-2-3-vision.md
│   ├── module-3/                   # Actuators and Motion
│   │   ├── _category_.json
│   │   ├── lesson-3-1-motors.md
│   │   ├── lesson-3-2-kinematics.md
│   │   └── lesson-3-3-planning.md
│   └── module-4/                   # Integration and Projects
│       ├── _category_.json
│       ├── lesson-4-1-integration.md
│       ├── lesson-4-2-capstone.md
│       └── lesson-4-3-next-steps.md
├── src/
│   ├── components/                 # Custom React components
│   │   ├── ChatWidget/
│   │   │   ├── index.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatWidget.module.css
│   │   ├── TranslateButton/
│   │   │   ├── index.tsx
│   │   │   └── TranslateButton.module.css
│   │   ├── KnowledgeCheck/
│   │   │   ├── index.tsx
│   │   │   ├── Question.tsx
│   │   │   └── KnowledgeCheck.module.css
│   │   ├── HandsOnExercise/
│   │   │   ├── index.tsx
│   │   │   └── HandsOnExercise.module.css
│   │   └── ProgressTracker/
│   │       ├── index.tsx
│   │       └── ProgressTracker.module.css
│   ├── pages/
│   │   ├── index.tsx               # Homepage
│   │   ├── dashboard.tsx           # User dashboard (protected)
│   │   ├── signup.tsx              # Registration + questionnaire
│   │   └── signin.tsx              # Login page
│   ├── theme/
│   │   └── Root.tsx                # Swizzled for auth provider
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── auth.ts             # Better-Auth server config
│   │   │   ├── client.ts           # Better-Auth client
│   │   │   └── AuthProvider.tsx    # React context provider
│   │   ├── db/
│   │   │   ├── index.ts            # Drizzle client
│   │   │   ├── schema.ts           # Database schema
│   │   │   └── migrations/         # SQL migrations
│   │   └── ai/
│   │       ├── embeddings.ts       # Cohere embedding service
│   │       ├── vectorStore.ts      # Qdrant operations
│   │       ├── chatbot.ts          # RAG chatbot logic
│   │       └── translation.ts      # Claude translation service
│   └── css/
│       └── custom.css              # Global styles + brand colors
├── static/
│   ├── img/                        # Images and diagrams
│   └── simulations/                # Embedded simulation files
├── api/                            # API routes (serverless functions)
│   ├── auth/
│   │   └── [...auth].ts            # Better-Auth catch-all
│   ├── profile/
│   │   ├── background.ts
│   │   └── recommendations.ts
│   ├── progress/
│   │   ├── index.ts
│   │   └── [lessonId].ts
│   ├── chat/
│   │   └── index.ts
│   └── translate/
│       └── index.ts
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   └── lib/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       ├── auth.spec.ts
│       ├── progress.spec.ts
│       └── chatbot.spec.ts
├── docusaurus.config.ts            # Main configuration
├── sidebars.ts                     # Navigation structure
├── drizzle.config.ts               # Drizzle ORM config
├── package.json
├── tsconfig.json
└── .env.local                      # Environment variables (not committed)
```

**Structure Decision**: Web application structure with Docusaurus as the primary frontend framework, API routes handled via serverless functions (Vercel/Netlify). Content lives in `docs/`, custom components in `src/components/`, and backend logic in `src/lib/` with API endpoints in `api/`.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Docusaurus (React SPA)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Lessons    │  │  Dashboard   │  │  Custom Components   │   │
│  │  (Markdown)  │  │  (Progress)  │  │  Chat, Translate,    │   │
│  │              │  │              │  │  Quiz, Exercise      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Serverless)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  /api/auth   │  │ /api/progress│  │  /api/chat           │   │
│  │ (Better-Auth)│  │  /api/profile│  │  /api/translate      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          ▼                 ▼                     ▼
┌──────────────────┐ ┌──────────────┐ ┌─────────────────────────┐
│   PostgreSQL     │ │   Qdrant     │ │   External APIs         │
│  - Users         │ │  - Vectors   │ │  - Cohere (embeddings)  │
│  - Sessions      │ │  - Course    │ │  - Claude (chat, trans) │
│  - Progress      │ │    content   │ │                         │
│  - Profiles      │ │              │ │                         │
└──────────────────┘ └──────────────┘ └─────────────────────────┘
```

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Docusaurus 3.x | Native documentation features, versioning, search |
| Authentication | Better-Auth | Flexible, TypeScript-native, supports custom flows |
| Database | PostgreSQL + Drizzle | Type-safe ORM, migrations, Better-Auth support |
| Vector Store | Qdrant Cloud | Native Cohere integration, free tier available |
| Embeddings | Cohere embed-english-v3.0 | Optimized for retrieval, input_type parameter |
| LLM (Chat + Trans) | Claude 3.5 Sonnet | Strong multilingual, instruction following |
| Hosting | Vercel + Railway | Edge deployment for static, managed DB |
| Styling | CSS Modules + Custom | Docusaurus native, no extra dependencies |

## Implementation Phases

### Phase 1: Foundation (User Stories P1-P2)
- Docusaurus project setup with module/lesson structure
- Better-Auth integration with signup questionnaire
- Database schema and migrations
- Basic styling and responsive layout

### Phase 2: Core Features (User Stories P3-P4)
- HandsOnExercise and KnowledgeCheck components
- RAG chatbot with Cohere + Qdrant
- Content embedding pipeline
- Progress tracking API

### Phase 3: Enhanced Features (User Stories P5-P6)
- Urdu translation with Claude
- Dashboard with progress visualization
- Personalized recommendations
- Performance optimization and caching

### Phase 4: Polish & Launch
- Accessibility audit and fixes
- End-to-end testing
- Documentation and deployment
- Monitoring and analytics setup

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI API rate limits | Aggressive caching, request queuing, budget alerts |
| Better-Auth learning curve | Follow official docs, start with basic flows |
| Translation quality | Human review of cached translations, glossary management |
| Performance on 3G | Lazy loading, image optimization, service worker |

## Dependencies Between Artifacts

```
spec.md
    │
    ├──▶ research.md (Phase 0)
    │
    └──▶ plan.md (this file)
            │
            ├──▶ data-model.md (Phase 1)
            │
            ├──▶ contracts/api-spec.yaml (Phase 1)
            │
            ├──▶ quickstart.md (Phase 1)
            │
            └──▶ tasks.md (Phase 2 - created by /sp.tasks)
```

## Next Steps

1. Run `/sp.tasks` to generate detailed implementation tasks
2. Review generated tasks and adjust priorities if needed
3. Begin Phase 1 implementation following quickstart.md
4. Create lesson content following spec.md content guidelines

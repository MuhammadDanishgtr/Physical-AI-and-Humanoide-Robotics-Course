# Implementation Tasks: Physical AI & Humanoid Robotics Course Platform

**Branch**: `001-robotics-course-platform`
**Generated**: 2025-12-06
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup & Project Initialization | 12 |
| Phase 2 | Foundational (Blocking Prerequisites) | 10 |
| Phase 3 | US1: Browse Course Content | 14 |
| Phase 4 | US2: Sign Up with Background Assessment | 12 |
| Phase 5 | US3: Complete Hands-On Exercise | 10 |
| Phase 6 | US4: Ask the RAG Chatbot | 12 |
| Phase 7 | US5: Translate Content to Urdu | 8 |
| Phase 8 | US6: Track Learning Progress | 10 |
| Phase 9 | Polish & Cross-Cutting Concerns | 8 |
| **Total** | | **96** |

---

## Phase 1: Setup & Project Initialization

**Goal**: Initialize Docusaurus project with TypeScript, configure development environment, and establish project structure.

**Independent Test**: Project runs locally with `npm start`, TypeScript compiles without errors.

### Tasks

- [ ] T001 Initialize Docusaurus project with classic template in `robotics-course/`
- [ ] T002 [P] Configure TypeScript in `robotics-course/tsconfig.json`
- [ ] T003 [P] Create environment variables template in `robotics-course/.env.example`
- [ ] T004 [P] Configure ESLint and Prettier in `robotics-course/.eslintrc.js` and `.prettierrc`
- [ ] T005 Update `robotics-course/package.json` with all required dependencies (Better-Auth, Drizzle, TanStack Query, Cohere SDK, Qdrant client, Anthropic SDK)
- [ ] T006 [P] Create directory structure for `robotics-course/src/components/` with placeholder index files
- [ ] T007 [P] Create directory structure for `robotics-course/src/lib/` (auth, db, ai subdirectories)
- [ ] T008 [P] Create directory structure for `robotics-course/api/` with placeholder route files
- [ ] T009 [P] Create directory structure for `robotics-course/docs/` with module folders (module-1 through module-4)
- [ ] T010 Configure `robotics-course/docusaurus.config.ts` with site metadata, theme, and navbar
- [ ] T011 Configure `robotics-course/sidebars.ts` with course structure (4 modules, 12 lessons)
- [ ] T012 [P] Create `robotics-course/src/css/custom.css` with brand colors and base styles

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Set up database, authentication infrastructure, and core services that all user stories depend on.

**Independent Test**: Database migrations run successfully, Better-Auth endpoints respond, Drizzle client connects.

### Tasks

- [ ] T013 Create database schema in `robotics-course/src/lib/db/schema.ts` with all entities from data-model.md
- [ ] T014 Configure Drizzle ORM in `robotics-course/drizzle.config.ts`
- [ ] T015 Generate initial database migration in `robotics-course/src/lib/db/migrations/`
- [ ] T016 Create Drizzle client in `robotics-course/src/lib/db/index.ts`
- [ ] T017 Configure Better-Auth server in `robotics-course/src/lib/auth/auth.ts`
- [ ] T018 Create Better-Auth client in `robotics-course/src/lib/auth/client.ts`
- [ ] T019 Create AuthProvider React context in `robotics-course/src/lib/auth/AuthProvider.tsx`
- [ ] T020 Swizzle Docusaurus Root component and integrate AuthProvider in `robotics-course/src/theme/Root.tsx`
- [ ] T021 Create Better-Auth catch-all API route in `robotics-course/api/auth/[...auth].ts`
- [ ] T022 Create lesson metadata JSON files in `robotics-course/src/data/lessons.json` with all 12 lessons

---

## Phase 3: US1 - Browse Course Content (Priority: P1)

**Goal**: Visitors can browse all 4 modules and 12 lessons with descriptions, estimated times, and difficulty indicators.

**Independent Test**: Navigate to `/docs`, verify all modules visible in sidebar, click each lesson and see learning objectives at top.

**Acceptance Criteria**:
- All 4 modules with titles, descriptions, week assignments visible
- All 12 lessons with titles, estimated times, difficulty levels visible
- Learning objectives displayed at top of each lesson page
- Mobile responsive (no horizontal scroll at 320px)

### Tasks

- [ ] T023 [US1] Create Module 1 category file in `robotics-course/docs/module-1/_category_.json`
- [ ] T024 [P] [US1] Create Module 2 category file in `robotics-course/docs/module-2/_category_.json`
- [ ] T025 [P] [US1] Create Module 3 category file in `robotics-course/docs/module-3/_category_.json`
- [ ] T026 [P] [US1] Create Module 4 category file in `robotics-course/docs/module-4/_category_.json`
- [ ] T027 [US1] Create course overview in `robotics-course/docs/intro.md`
- [ ] T028 [P] [US1] Create Lesson 1.1 in `robotics-course/docs/module-1/lesson-1-1-intro.md` with frontmatter and learning objectives
- [ ] T029 [P] [US1] Create Lesson 1.2 in `robotics-course/docs/module-1/lesson-1-2-hardware.md`
- [ ] T030 [P] [US1] Create Lesson 1.3 in `robotics-course/docs/module-1/lesson-1-3-setup.md`
- [ ] T031 [P] [US1] Create Lessons 2.1-2.3 in `robotics-course/docs/module-2/` (3 files)
- [ ] T032 [P] [US1] Create Lessons 3.1-3.3 in `robotics-course/docs/module-3/` (3 files)
- [ ] T033 [P] [US1] Create Lessons 4.1-4.3 in `robotics-course/docs/module-4/` (3 files)
- [ ] T034 [US1] Create LessonHeader component in `robotics-course/src/components/LessonHeader/index.tsx` to display objectives, time, difficulty
- [ ] T035 [US1] Add responsive styles for mobile in `robotics-course/src/css/custom.css`
- [ ] T036 [US1] Configure search plugin (local search or Algolia) in `robotics-course/docusaurus.config.ts`

---

## Phase 4: US2 - Sign Up with Background Assessment (Priority: P2)

**Goal**: Users can sign up, complete background questionnaire, and receive personalized recommendations.

**Independent Test**: Complete signup with email/password, answer background questions, verify dashboard shows recommendations based on responses.

**Acceptance Criteria**:
- Signup form accepts email/password
- Background questionnaire appears after signup
- Profile saved with software/hardware levels
- Dashboard displays personalized recommendations

### Tasks

- [ ] T037 [US2] Create signup page in `robotics-course/src/pages/signup.tsx` with email/password form
- [ ] T038 [US2] Create BackgroundQuestionnaire component in `robotics-course/src/components/BackgroundQuestionnaire/index.tsx`
- [ ] T039 [US2] Create signin page in `robotics-course/src/pages/signin.tsx`
- [ ] T040 [US2] Create background profile API endpoint in `robotics-course/api/profile/background.ts` (GET/POST)
- [ ] T041 [US2] Create recommendations API endpoint in `robotics-course/api/profile/recommendations.ts`
- [ ] T042 [US2] Create recommendation service in `robotics-course/src/lib/services/recommendations.ts`
- [ ] T043 [US2] Create dashboard page in `robotics-course/src/pages/dashboard.tsx` with recommendations display
- [ ] T044 [US2] Create ProtectedRoute component in `robotics-course/src/components/ProtectedRoute/index.tsx`
- [ ] T045 [US2] Add navbar login/signup buttons in `robotics-course/docusaurus.config.ts`
- [ ] T046 [US2] Create password reset flow components in `robotics-course/src/pages/reset-password.tsx`
- [ ] T047 [US2] Style authentication forms in `robotics-course/src/components/BackgroundQuestionnaire/styles.module.css`
- [ ] T048 [US2] Handle signup error (email exists) with user-friendly message

---

## Phase 5: US3 - Complete Hands-On Exercise (Priority: P3)

**Goal**: Learners can complete hands-on exercises with instructions, component lists, and knowledge checks.

**Independent Test**: Navigate to any lesson, scroll to hands-on section, verify component list visible, complete knowledge check and see feedback.

**Acceptance Criteria**:
- Hands-on section with component/requirements list
- Simulation alternative option for hardware exercises
- Knowledge check with 3-5 questions
- Immediate feedback with explanations

### Tasks

- [ ] T049 [US3] Create HandsOnExercise component in `robotics-course/src/components/HandsOnExercise/index.tsx`
- [ ] T050 [US3] Create ComponentList sub-component in `robotics-course/src/components/HandsOnExercise/ComponentList.tsx`
- [ ] T051 [US3] Create SimulationAlternative sub-component in `robotics-course/src/components/HandsOnExercise/SimulationAlternative.tsx`
- [ ] T052 [US3] Create KnowledgeCheck component in `robotics-course/src/components/KnowledgeCheck/index.tsx`
- [ ] T053 [US3] Create Question sub-component in `robotics-course/src/components/KnowledgeCheck/Question.tsx`
- [ ] T054 [US3] Create FeedbackDisplay sub-component in `robotics-course/src/components/KnowledgeCheck/FeedbackDisplay.tsx`
- [ ] T055 [US3] Style HandsOnExercise in `robotics-course/src/components/HandsOnExercise/styles.module.css`
- [ ] T056 [US3] Style KnowledgeCheck in `robotics-course/src/components/KnowledgeCheck/styles.module.css`
- [ ] T057 [US3] Update Lesson 1.2 with hands-on exercise content using new components
- [ ] T058 [US3] Create MDX component exports in `robotics-course/src/theme/MDXComponents.tsx`

---

## Phase 6: US4 - Ask the RAG Chatbot (Priority: P4)

**Goal**: Learners can ask questions and receive AI-generated answers with citations to course content.

**Independent Test**: Click chatbot icon, ask "What is kinematics?", verify response includes citation to Lesson 3.2.

**Acceptance Criteria**:
- Chat widget accessible from all pages
- Response within 5 seconds
- Citations with clickable links to lessons
- Graceful fallback when service unavailable

### Tasks

- [ ] T059 [US4] Create Cohere embeddings service in `robotics-course/src/lib/ai/embeddings.ts`
- [ ] T060 [US4] Create Qdrant vector store service in `robotics-course/src/lib/ai/vectorStore.ts`
- [ ] T061 [US4] Create content indexing script in `robotics-course/scripts/index-content.ts`
- [ ] T062 [US4] Create RAG chatbot service in `robotics-course/src/lib/ai/chatbot.ts`
- [ ] T063 [US4] Create chat API endpoint in `robotics-course/api/chat/index.ts`
- [ ] T064 [US4] Create chat feedback API endpoint in `robotics-course/api/chat/[interactionId]/feedback.ts`
- [ ] T065 [US4] Create ChatWidget component in `robotics-course/src/components/ChatWidget/index.tsx`
- [ ] T066 [US4] Create ChatMessage sub-component in `robotics-course/src/components/ChatWidget/ChatMessage.tsx`
- [ ] T067 [US4] Create Citation sub-component in `robotics-course/src/components/ChatWidget/Citation.tsx`
- [ ] T068 [US4] Style ChatWidget in `robotics-course/src/components/ChatWidget/styles.module.css`
- [ ] T069 [US4] Integrate ChatWidget globally in `robotics-course/src/theme/Root.tsx`
- [ ] T070 [US4] Implement fallback message for service unavailability in ChatWidget

---

## Phase 7: US5 - Translate Content to Urdu (Priority: P5)

**Goal**: Learners can translate lesson content to Urdu while preserving technical terms.

**Independent Test**: Click "Translate to Urdu" button, verify content displays in Urdu, technical terms remain in English with explanations.

**Acceptance Criteria**:
- Translation completes within 3 seconds
- Technical terms preserved in English with Urdu explanation
- Code blocks remain untranslated
- Graceful fallback when service unavailable

### Tasks

- [ ] T071 [US5] Create translation service in `robotics-course/src/lib/ai/translation.ts` with Claude API
- [ ] T072 [US5] Create translation API endpoint in `robotics-course/api/translate/index.ts`
- [ ] T073 [US5] Create lesson translation API endpoint in `robotics-course/api/translate/lesson/[lessonId].ts`
- [ ] T074 [US5] Create technical terms glossary in `robotics-course/src/data/glossary.json`
- [ ] T075 [US5] Create TranslateButton component in `robotics-course/src/components/TranslateButton/index.tsx`
- [ ] T076 [US5] Style TranslateButton in `robotics-course/src/components/TranslateButton/styles.module.css`
- [ ] T077 [US5] Create translation cache layer in `robotics-course/src/lib/ai/translationCache.ts`
- [ ] T078 [US5] Integrate TranslateButton in lesson pages via MDXComponents

---

## Phase 8: US6 - Track Learning Progress (Priority: P6)

**Goal**: Learners can track their progress through the curriculum with completion percentages and time estimates.

**Independent Test**: Mark a lesson complete, verify dashboard shows updated progress percentage and time remaining.

**Acceptance Criteria**:
- Dashboard shows overall progress percentage
- "Mark as Complete" button updates progress immediately
- Module progress shows X/3 lessons completed
- Estimated time remaining displayed

### Tasks

- [ ] T079 [US6] Create progress API endpoint in `robotics-course/api/progress/index.ts` (GET all progress)
- [ ] T080 [US6] Create lesson progress API endpoint in `robotics-course/api/progress/[lessonId].ts` (GET/PUT)
- [ ] T081 [US6] Create lesson complete API endpoint in `robotics-course/api/progress/[lessonId]/complete.ts`
- [ ] T082 [US6] Create progress service in `robotics-course/src/lib/services/progress.ts`
- [ ] T083 [US6] Create ProgressTracker component in `robotics-course/src/components/ProgressTracker/index.tsx`
- [ ] T084 [US6] Create ModuleProgress sub-component in `robotics-course/src/components/ProgressTracker/ModuleProgress.tsx`
- [ ] T085 [US6] Create MarkCompleteButton component in `robotics-course/src/components/MarkCompleteButton/index.tsx`
- [ ] T086 [US6] Style ProgressTracker in `robotics-course/src/components/ProgressTracker/styles.module.css`
- [ ] T087 [US6] Update dashboard page with ProgressTracker integration
- [ ] T088 [US6] Integrate MarkCompleteButton in lesson pages

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Accessibility compliance, performance optimization, and deployment readiness.

**Independent Test**: Run accessibility audit (axe-core), Lighthouse performance score >90, all pages load <3s on throttled connection.

### Tasks

- [ ] T089 Add ARIA labels and roles to all interactive components
- [ ] T090 Ensure 4.5:1 color contrast ratio in `robotics-course/src/css/custom.css`
- [ ] T091 Add keyboard navigation support to ChatWidget and KnowledgeCheck
- [ ] T092 Configure image optimization in `robotics-course/docusaurus.config.ts`
- [ ] T093 Add error boundaries to all API-dependent components
- [ ] T094 Create 404 and error pages in `robotics-course/src/pages/`
- [ ] T095 Configure production build and deployment in `robotics-course/vercel.json` or similar
- [ ] T096 Write deployment documentation in `robotics-course/docs/deployment.md`

---

## Dependency Graph

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)
    │
    ├───────────────────────────────────────────┐
    ▼                                           ▼
Phase 3 (US1: Browse)                    Phase 4 (US2: Auth)
    │                                           │
    │                                           ▼
    │                                    Phase 5 (US3: Exercise)
    │                                           │
    └───────────────┬───────────────────────────┘
                    ▼
            Phase 6 (US4: Chatbot)
                    │
                    ├───────────────────────────┐
                    ▼                           ▼
            Phase 7 (US5: Translation)  Phase 8 (US6: Progress)
                    │                           │
                    └───────────────┬───────────┘
                                    ▼
                            Phase 9 (Polish)
```

**Key Dependencies**:
- US1 (Browse) → No dependencies, can start after Phase 2
- US2 (Auth) → No dependencies, can start after Phase 2
- US3 (Exercise) → Depends on US2 (needs auth for progress tracking)
- US4 (Chatbot) → Depends on US1 (needs content to index)
- US5 (Translation) → Depends on US1 (needs content to translate)
- US6 (Progress) → Depends on US2 and US3

---

## Parallel Execution Opportunities

### Phase 1 Parallel Tasks
```
T001 (init) → T002, T003, T004, T006, T007, T008, T009, T012 (all parallel)
         └─→ T005 (after init) → T010, T011
```

### Phase 3 (US1) Parallel Tasks
```
T023 → T024, T025, T026, T027 (all parallel)
   └─→ T028, T029, T030, T031, T032, T033 (all parallel after categories)
       └─→ T034, T035, T036 (after lesson files)
```

### Cross-Phase Parallelism
```
After Phase 2:
  ├─→ Phase 3 (US1) starts
  └─→ Phase 4 (US2) starts (parallel with US1)

After US1 complete:
  ├─→ Phase 6 (US4) starts
  └─→ Phase 7 (US5) starts (parallel with US4)

After US2 complete:
  └─→ Phase 5 (US3) starts
      └─→ Phase 8 (US6) starts (after US3)
```

---

## MVP Scope Recommendation

**Minimum Viable Product**: Complete Phases 1-4 (Setup, Foundational, US1, US2)

This delivers:
- ✅ Browsable course content (12 lessons)
- ✅ User authentication with background assessment
- ✅ Personalized recommendations
- ✅ Mobile-responsive design

**Estimated MVP Task Count**: 48 tasks (Phases 1-4)

**Post-MVP Features** (Phases 5-9):
- Hands-on exercises with knowledge checks
- RAG chatbot with citations
- Urdu translation
- Progress tracking dashboard
- Accessibility polish

---

## Implementation Strategy

1. **Start with Setup (Phase 1)** - Get the development environment running
2. **Complete Foundational (Phase 2)** - Database and auth are blocking
3. **Parallel US1 + US2** - Content and auth can develop simultaneously
4. **Gate on US1** - Chatbot and translation need content indexed
5. **Gate on US2** - Progress tracking needs authenticated users
6. **Polish Last** - Accessibility and performance after features complete

---

## Verification Checklist

After completing all tasks, verify:

- [ ] All 12 lessons accessible and display correctly
- [ ] Signup/signin flow works end-to-end
- [ ] Background questionnaire saves to database
- [ ] Recommendations appear on dashboard
- [ ] Hands-on exercises render with knowledge checks
- [ ] Chatbot returns relevant answers with citations
- [ ] Translation displays Urdu content correctly
- [ ] Progress tracking updates in real-time
- [ ] WCAG 2.1 AA compliance (automated check passes)
- [ ] Lighthouse performance score >90
- [ ] Mobile responsive at 320px width

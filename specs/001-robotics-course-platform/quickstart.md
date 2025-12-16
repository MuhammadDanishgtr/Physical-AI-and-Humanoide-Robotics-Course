# Quickstart Guide: Physical AI & Humanoid Robotics Course Platform

**Date**: 2025-12-06
**Branch**: `001-robotics-course-platform`

## Prerequisites

Before starting development, ensure you have:

- Node.js 20 LTS or later
- npm 10+ or pnpm 8+
- Git
- PostgreSQL 16 (or Docker for containerized DB)
- Code editor (VS Code recommended)

### API Keys Required

| Service | Purpose | Get Key |
|---------|---------|---------|
| Cohere | Text embeddings for RAG | https://dashboard.cohere.com/api-keys |
| Qdrant Cloud | Vector database | https://cloud.qdrant.io/ |
| Anthropic Claude | Chatbot & Translation | https://console.anthropic.com/ |

---

## Project Setup

### 1. Initialize Docusaurus Project

```bash
# Create new Docusaurus project
npx create-docusaurus@latest robotics-course classic --typescript

cd robotics-course

# Install additional dependencies
npm install @better-auth/client @tanstack/react-query
npm install -D @types/node tailwindcss postcss autoprefixer
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Better-Auth
BETTER_AUTH_SECRET=your-32-character-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/robotics_course

# Cohere
COHERE_API_KEY=your-cohere-api-key

# Qdrant
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. Project Structure Setup

```bash
# Create directory structure
mkdir -p src/components/{ChatWidget,TranslateButton,KnowledgeCheck,HandsOnExercise,ProgressTracker}
mkdir -p src/pages
mkdir -p src/lib/{auth,db,ai}
mkdir -p src/theme
mkdir -p static/{img,simulations}
mkdir -p docs/{module-1,module-2,module-3,module-4}

# Create module category files
for i in 1 2 3 4; do
  echo '{"label": "Module '$i'", "position": '$i'}' > docs/module-$i/_category_.json
done
```

### 4. Database Setup

```bash
# Start PostgreSQL (Docker option)
docker run --name robotics-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=robotics_course -p 5432:5432 -d postgres:16

# Install Drizzle ORM
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 5. Better-Auth Configuration

Create `src/lib/auth/auth.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
```

### 6. Swizzle Root for Auth

```bash
npm run swizzle @docusaurus/theme-classic Root -- --wrap --typescript
```

Edit `src/theme/Root.tsx`:

```tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../lib/auth/AuthProvider';

const queryClient = new QueryClient();

export default function Root({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## Development Workflow

### Start Development Server

```bash
# Terminal 1: Docusaurus dev server
npm run start

# Terminal 2: API server (if separate)
npm run dev:api
```

### Build for Production

```bash
npm run build
npm run serve  # Test production build locally
```

### Run Tests

```bash
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:a11y   # Accessibility tests
```

---

## Verification Checklist

After setup, verify each component:

### Documentation

- [ ] Docusaurus starts without errors
- [ ] All 4 modules visible in sidebar
- [ ] Lessons display with correct metadata
- [ ] Search functionality works
- [ ] Mobile responsive layout works

### Authentication

- [ ] Signup flow completes successfully
- [ ] Background questionnaire appears after signup
- [ ] Login/logout works correctly
- [ ] Protected pages redirect to login
- [ ] Session persists across page refreshes

### RAG Chatbot

- [ ] Chat widget appears on lesson pages
- [ ] Questions receive relevant responses
- [ ] Citations link to correct lessons
- [ ] Fallback message shows when service unavailable

### Translation

- [ ] Translate button visible on lessons
- [ ] Urdu translation displays correctly
- [ ] Technical terms preserved in English
- [ ] Code blocks remain untranslated

### Progress Tracking

- [ ] Dashboard shows user progress
- [ ] Marking lesson complete updates UI
- [ ] Module progress calculated correctly
- [ ] Estimated time remaining accurate

---

## Common Issues & Solutions

### Issue: Better-Auth session not persisting

**Solution**: Ensure `BETTER_AUTH_SECRET` is set and consistent across restarts.

### Issue: Qdrant connection timeout

**Solution**: Check `QDRANT_URL` format includes protocol (`https://`). Verify API key is correct.

### Issue: Translation taking too long

**Solution**: Enable caching. Pre-translate lessons in batch during build.

### Issue: Docusaurus build fails with TypeScript errors

**Solution**: Run `npm run typecheck` to identify issues. Ensure all imports have type definitions.

---

## Next Steps After Setup

1. **Content Creation**: Add lesson markdown files to `docs/module-*/`
2. **Embed Content**: Run embedding script to index lessons in Qdrant
3. **Configure Search**: Set up Algolia DocSearch or local search
4. **Deploy**: Configure Vercel/Netlify for frontend, Railway for backend
5. **Test**: Run full test suite before launch

---

## Useful Commands Reference

```bash
# Docusaurus
npm run start          # Start dev server
npm run build          # Production build
npm run serve          # Serve production build
npm run clear          # Clear Docusaurus cache

# Database
npx drizzle-kit studio # Open Drizzle Studio GUI
npx drizzle-kit push   # Push schema changes
npx drizzle-kit generate # Generate migrations

# Better-Auth
npx @better-auth/cli generate # Generate auth schemas
npx @better-auth/cli migrate  # Run auth migrations

# Testing
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

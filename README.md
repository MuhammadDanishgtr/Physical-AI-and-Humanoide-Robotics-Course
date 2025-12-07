# Physical AI & Humanoid Robotics Course

An 8-week comprehensive course teaching Physical AI and robotics fundamentals, from beginner concepts to building complete robotic systems.

## Features

- **4 Modules, 12 Lessons**: Covering foundations, sensors, actuators, and system integration
- **Bilingual Support**: English and Urdu (RTL) with AI-powered translation
- **RAG Chatbot**: AI assistant trained on course materials using Cohere + Qdrant
- **Progress Tracking**: Personalized dashboard with recommendations
- **Hands-On Exercises**: Practical projects in every lesson
- **Capstone Project**: Build a complete robotic system

## Tech Stack

- **Frontend**: Docusaurus 3.x, React 18, TypeScript
- **Authentication**: Better-Auth with PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM
- **AI/ML**:
  - Cohere embed-english-v3.0 for embeddings
  - Qdrant Cloud for vector storage
  - Anthropic Claude for chatbot and translation
- **Styling**: CSS Modules, Custom CSS variables

## Prerequisites

- Node.js 20 LTS or later
- PostgreSQL 15+
- Qdrant Cloud account
- Cohere API key
- Anthropic API key

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd robotics-course
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: 32+ character secret for auth
- `COHERE_API_KEY`: Cohere API key for embeddings
- `QDRANT_URL` & `QDRANT_API_KEY`: Qdrant Cloud credentials
- `ANTHROPIC_API_KEY`: Claude API key

### 3. Set Up Database

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:push
```

### 4. Index Course Content (Optional)

```bash
npm run index-content
```

### 5. Start Development Server

```bash
npm run start
```

The site will be available at `http://localhost:3000`

## Project Structure

```
robotics-course/
├── api/                    # API endpoints
│   ├── auth/              # Authentication routes
│   ├── chat.ts            # Chatbot endpoint
│   ├── progress.ts        # Progress tracking
│   ├── translate.ts       # Translation endpoint
│   └── profile/           # User profile endpoints
├── docs/                   # Course content (Markdown)
│   ├── intro.md
│   ├── module-1/
│   ├── module-2/
│   ├── module-3/
│   └── module-4/
├── src/
│   ├── components/        # React components
│   │   ├── BackgroundQuestionnaire/
│   │   └── ChatbotWidget/
│   ├── css/
│   │   └── custom.css    # Global styles
│   ├── lib/              # Backend libraries
│   │   ├── auth/         # Better-Auth config
│   │   ├── db/           # Drizzle schema
│   │   ├── cohere/       # Embedding generation
│   │   ├── qdrant/       # Vector database
│   │   └── anthropic/    # Claude integration
│   ├── pages/            # React pages
│   │   ├── index.tsx     # Homepage
│   │   ├── signup.tsx
│   │   ├── signin.tsx
│   │   └── dashboard.tsx
│   ├── theme/            # Docusaurus theme overrides
│   └── types/            # TypeScript types
├── static/               # Static assets
├── docusaurus.config.ts  # Docusaurus config
├── sidebars.ts          # Sidebar navigation
└── package.json
```

## Available Scripts

```bash
# Development
npm run start          # Start dev server
npm run build         # Build for production
npm run serve         # Serve production build

# Database
npm run db:generate   # Generate migrations
npm run db:push       # Apply migrations
npm run db:studio     # Open Drizzle Studio

# Content
npm run index-content # Index docs for RAG

# Code Quality
npm run lint          # Run ESLint
npm run format        # Run Prettier
npm run typecheck     # Run TypeScript check
```

## Course Content

### Module 1: Foundations (Weeks 1-2)
- Introduction to Physical AI
- Hardware Fundamentals
- Software Environment Setup

### Module 2: Sensors (Weeks 3-4)
- Sensor Types and Selection
- Data Acquisition & Processing
- Computer Vision Basics

### Module 3: Actuators (Weeks 5-6)
- Motors and Servo Control
- Kinematics Fundamentals
- Motion Planning

### Module 4: Integration (Weeks 7-8)
- System Integration Patterns
- Capstone Project
- Next Steps & Advanced Topics

## Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to Netlify

```bash
netlify deploy --prod
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Copyright © 2024 Physical AI & Humanoid Robotics Course

## Support

- Discord: [Join Community](https://discord.gg/robotics-course)
- GitHub Issues: Report bugs and feature requests

# Physical AI & Humanoid Robotics Course

<p align="center">
  <img src="static/img/logo.png" alt="Course Logo" width="120" />
</p>

<p align="center">
  <strong>An 8-week comprehensive course teaching Physical AI and robotics fundamentals</strong>
  <br />
  From beginner concepts to building complete robotic systems
</p>

<p align="center">
  <a href="#features">Features</a> |
  <a href="#tech-stack">Tech Stack</a> |
  <a href="#architecture">Architecture</a> |
  <a href="#getting-started">Getting Started</a> |
  <a href="#api-documentation">API Docs</a>
</p>

---

## Features

- **4 Modules, 12 Lessons**: Covering foundations, sensors, actuators, and system integration
- **Bilingual Support**: English and Urdu (RTL) with AI-powered translation
- **RAG Chatbot**: AI assistant trained on course materials using Cohere + Qdrant
- **Progress Tracking**: Personalized dashboard with study schedule based on weekly hours
- **Authentication System**: Secure sign-up/sign-in with MongoDB
- **Hands-On Exercises**: Practical projects in every lesson
- **Capstone Project**: Build a complete robotic system

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Docusaurus 3.9** | Static site generator & documentation framework |
| **React 18.3** | UI component library |
| **TypeScript 5.6** | Type-safe JavaScript |
| **CSS Modules** | Scoped component styling |
| **MDX** | Markdown with JSX components |

### Backend
| Technology | Purpose |
|------------|---------|
| **Vercel Serverless Functions** | API endpoints (production) |
| **Express.js 5.x** | API server (development) |
| **Node.js 18+** | JavaScript runtime |

### Database
| Technology | Purpose |
|------------|---------|
| **MongoDB 7.0** | User authentication & profile storage |
| **Qdrant Cloud** | Vector database for RAG chatbot |
| **Drizzle ORM** | Type-safe database queries |

### AI/ML Services
| Service | Model | Purpose |
|---------|-------|---------|
| **Groq** | llama-3.1-8b-instant | RAG Chatbot responses |
| **Groq** | llama-3.3-70b-versatile | English to Urdu translation |
| **Cohere** | embed-english-v3.0 | Text embeddings (1024 dimensions) |
| **Qdrant** | - | Vector similarity search |

---

## Architecture

### System Architecture Overview

```
                                 ┌─────────────────────────────────────────┐
                                 │           PHYSICAL AI ROBOTICS          │
                                 │              COURSE PLATFORM            │
                                 └─────────────────────────────────────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
                    ▼                               ▼                               ▼
         ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
         │     FRONTEND     │           │     BACKEND      │           │    DATABASES     │
         │   (Docusaurus)   │           │  (Vercel/Express)│           │                  │
         ├──────────────────┤           ├──────────────────┤           ├──────────────────┤
         │ - React 18       │           │ - Auth API       │           │ - MongoDB        │
         │ - TypeScript     │◄─────────►│ - Chat API       │◄─────────►│ - Qdrant Cloud   │
         │ - CSS Modules    │           │ - Translate API  │           │                  │
         │ - MDX Content    │           │ - Profile API    │           │                  │
         └──────────────────┘           └──────────────────┘           └──────────────────┘
                    │                               │
                    │                               │
                    ▼                               ▼
         ┌──────────────────┐           ┌──────────────────┐
         │   COMPONENTS     │           │   AI SERVICES    │
         ├──────────────────┤           ├──────────────────┤
         │ - ChatbotWidget  │           │ - Groq LLaMA     │
         │ - TranslateBtn   │           │ - Cohere Embed   │
         │ - Dashboard      │           │                  │
         │ - UserMenu       │           │                  │
         └──────────────────┘           └──────────────────┘
```

---

## Authentication System

### Overview
Custom JWT-based authentication with MongoDB for user storage and session management.

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION SYSTEM                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                              SIGN UP FLOW                                            ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║   ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  ║
║   │   User   │───>│  /signup     │───>│ POST         │───>│      MongoDB         │  ║
║   │  (Form)  │    │  (React)     │    │ /api/auth/   │    │                      │  ║
║   │          │    │              │    │ signup       │    │  ┌────────────────┐  │  ║
║   │ - Email  │    │ Validation:  │    │              │    │  │ users          │  │  ║
║   │ - Pass   │    │ - Min 8 char │    │ - Hash pass  │    │  │ - _id          │  │  ║
║   │ - Name   │    │ - Email fmt  │    │ - Gen token  │    │  │ - email        │  │  ║
║   └──────────┘    └──────────────┘    │ - Store user │    │  │ - password     │  │  ║
║                                       └──────────────┘    │  │ - name         │  │  ║
║                                              │            │  │ - createdAt    │  │  ║
║                            ┌─────────────────┘            │  └────────────────┘  │  ║
║                            ▼                              │                      │  ║
║                   ┌──────────────┐                        │  ┌────────────────┐  │  ║
║                   │ Questionnaire│                        │  │ sessions       │  │  ║
║                   │              │                        │  │ - token        │  │  ║
║                   │ - Experience │───────────────────────>│  │ - userId       │  │  ║
║                   │ - Goals      │  POST /api/profile/    │  │ - expiresAt    │  │  ║
║                   │ - Weekly hrs │  background            │  └────────────────┘  │  ║
║                   │ - Hardware   │                        │                      │  ║
║                   └──────────────┘                        │  ┌────────────────┐  │  ║
║                            │                              │  │backgroundProfiles│ ║
║                            ▼                              │  │ - weeklyHours  │  │  ║
║                   ┌──────────────┐                        │  │ - experience   │  │  ║
║                   │  /dashboard  │◄───────────────────────│  │ - goals        │  │  ║
║                   │  (Redirect)  │   Token + User stored  │  └────────────────┘  │  ║
║                   └──────────────┘   in localStorage      └──────────────────────┘  ║
║                                                                                      ║
╚═════════════════════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                              SIGN IN FLOW                                            ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║   ┌──────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  ║
║   │   User   │───>│  /signin     │───>│ POST         │───>│      MongoDB         │  ║
║   │  (Form)  │    │  (React)     │    │ /api/auth/   │    │                      │  ║
║   │          │    │              │    │ signin       │    │ 1. Find user by      │  ║
║   │ - Email  │    │              │    │              │    │    email             │  ║
║   │ - Pass   │    │              │    │              │    │ 2. Verify password   │  ║
║   └──────────┘    └──────────────┘    └──────────────┘    │ 3. Create session    │  ║
║                                              │            │ 4. Return token      │  ║
║                                              ▼            └──────────────────────┘  ║
║                                       ┌──────────────┐                              ║
║                                       │  Response    │                              ║
║                                       │              │                              ║
║                                       │ { token,     │───> localStorage             ║
║                                       │   user: {    │     - auth_token            ║
║                                       │     id,      │     - auth_user             ║
║                                       │     email,   │                              ║
║                                       │     name }}  │                              ║
║                                       └──────────────┘                              ║
║                                              │                                      ║
║                                              ▼                                      ║
║                                       ┌──────────────┐                              ║
║                                       │  /dashboard  │                              ║
║                                       │  (Redirect)  │                              ║
║                                       └──────────────┘                              ║
║                                                                                      ║
╚═════════════════════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                           SESSION VERIFICATION                                       ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║   Protected Route (e.g., /dashboard)                                                 ║
║                                                                                      ║
║   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────────┐    ║
║   │  Page Load   │───>│ Check        │───>│ GET          │───>│ MongoDB        │    ║
║   │              │    │ localStorage │    │ /api/auth/   │    │                │    ║
║   │              │    │ auth_token   │    │ session      │    │ Validate token │    ║
║   └──────────────┘    └──────────────┘    │              │    │ Check expiry   │    ║
║                              │            │ Header:      │    │ Return user    │    ║
║                    No Token? │            │ Bearer token │    └────────────────┘    ║
║                              ▼            └──────────────┘           │              ║
║                       ┌──────────────┐           │                   │              ║
║                       │  /signin     │           │            ┌──────┴──────┐       ║
║                       │  (Redirect)  │           │            │             │       ║
║                       └──────────────┘           │          Valid        Invalid    ║
║                                                  │            │             │       ║
║                                                  │            ▼             ▼       ║
║                                                  │     ┌──────────┐  ┌──────────┐   ║
║                                                  │     │  Show    │  │ Redirect │   ║
║                                                  │     │ Dashboard│  │ /signin  │   ║
║                                                  │     └──────────┘  └──────────┘   ║
║                                                  │                                  ║
╚═════════════════════════════════════════════════════════════════════════════════════╝
```

### Auth Components

| File | Purpose |
|------|---------|
| `api/auth/signup.ts` | User registration endpoint |
| `api/auth/signin.ts` | User login endpoint |
| `api/auth/session.ts` | Session validation endpoint |
| `api/auth/signout.ts` | Session termination endpoint |
| `src/lib/auth/client.ts` | Frontend auth client |
| `src/pages/signin.tsx` | Sign in page |
| `src/pages/signup.tsx` | Sign up page with questionnaire |

### Token Structure
```javascript
{
  userId: "64abc123...",
  exp: 1703980800000  // 7 days from creation
}
// Encoded as Base64
```

---

## RAG Chatbot System

### Overview
Retrieval-Augmented Generation (RAG) chatbot that answers questions about robotics using course content stored in a vector database.

### RAG Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           RAG CHATBOT ARCHITECTURE                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                        INDEXING PIPELINE (One-time Setup)                            ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────┐  ║
║   │  Course Content│    │   Text         │    │    Cohere      │    │   Qdrant   │  ║
║   │   (14 docs)    │───>│   Chunking     │───>│   Embeddings   │───>│  Vector DB │  ║
║   │                │    │   (1000 chars) │    │  (1024 dims)   │    │            │  ║
║   │ - Intro        │    │                │    │                │    │            │  ║
║   │ - Module 1-4   │    │ Split by:      │    │ Model:         │    │ Collection:│  ║
║   │ - Lessons 1-12 │    │ - Sentences    │    │ embed-english  │    │ course_    │  ║
║   │ - Advanced     │    │ - Paragraphs   │    │ -v3.0          │    │ content    │  ║
║   └────────────────┘    └────────────────┘    └────────────────┘    └────────────┘  ║
║                                                                                      ║
║   Endpoint: POST /api/index-content                                                  ║
║                                                                                      ║
╚═════════════════════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                        QUERY PIPELINE (Real-time Chat)                               ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║   Step 1: User Query                                                                 ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  User: "What sensors are used in robotics?"                                  │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║                                           │                                          ║
║                                           ▼                                          ║
║   Step 2: Query Embedding                                                            ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  Cohere API                                                                  │   ║
║   │  embed("What sensors are used in robotics?")                                │   ║
║   │  → [0.123, -0.456, 0.789, ...] (1024 dimensions)                            │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║                                           │                                          ║
║                                           ▼                                          ║
║   Step 3: Vector Search                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  Qdrant: searchSimilar(queryVector, {limit: 5, scoreThreshold: 0.7})        │   ║
║   │                                                                              │   ║
║   │  Results:                                                                    │   ║
║   │  ┌─────────────────────────────────────────────────────────────────────┐    │   ║
║   │  │ Score: 0.92 │ lesson-2-1 │ "Sensors are the eyes and ears..."      │    │   ║
║   │  │ Score: 0.85 │ lesson-2-2 │ "Data acquisition involves reading..."  │    │   ║
║   │  │ Score: 0.78 │ lesson-1-1 │ "Physical AI systems interact with..."  │    │   ║
║   │  └─────────────────────────────────────────────────────────────────────┘    │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║                                           │                                          ║
║                                           ▼                                          ║
║   Step 4: Prompt Augmentation                                                        ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  System: "You are an expert robotics teaching assistant..."                  │   ║
║   │  Context: [Retrieved documents from vector search]                           │   ║
║   │  User: "What sensors are used in robotics?"                                  │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║                                           │                                          ║
║                                           ▼                                          ║
║   Step 5: LLM Response                                                               ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  Groq API (llama-3.1-8b-instant)                                             │   ║
║   │                                                                              │   ║
║   │  Response: "Sensors are the eyes and ears of robots. Common types           │   ║
║   │  include: Distance sensors (ultrasonic, infrared, LiDAR), IMU               │   ║
║   │  (accelerometer, gyroscope, magnetometer), cameras (RGB, depth,             │   ║
║   │  thermal), touch sensors, and environmental sensors..."                      │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║                                           │                                          ║
║                                           ▼                                          ║
║   Step 6: Return to User                                                             ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  {                                                                           │   ║
║   │    message: "Sensors are the eyes and ears of robots...",                    │   ║
║   │    sources: [{title: "Sensor Types", lessonId: "lesson-2-1"}]               │   ║
║   │  }                                                                           │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                      ║
╚═════════════════════════════════════════════════════════════════════════════════════╝
```

### Course Content Indexed

| Module | Lessons | Content |
|--------|---------|---------|
| **Intro** | Course Introduction | Physical AI & Humanoid Robotics overview |
| **Module 1** | Lesson 1.1-1.3 | Physical AI, Hardware Basics, Software Setup |
| **Module 2** | Lesson 2.1-2.3 | Sensor Types, Data Acquisition, Computer Vision |
| **Module 3** | Lesson 3.1-3.3 | Motors & Servos, Kinematics, Motion Planning |
| **Module 4** | Lesson 4.1-4.3 | System Integration, Capstone, Advanced Topics |
| **Advanced** | Machine Learning | ML in Robotics |

### RAG Components

| File | Purpose |
|------|---------|
| `api/chat.ts` | Chat endpoint with Groq LLM |
| `api/index-content.ts` | Content indexing endpoint |
| `src/lib/cohere/index.ts` | Cohere embeddings client |
| `src/lib/qdrant/index.ts` | Qdrant vector search client |
| `src/components/ChatbotWidget/` | Chat UI component |

---

## Language Translation System

### Overview
AI-powered English to Urdu translation for bilingual course support with RTL (Right-to-Left) text direction.

### Translation Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        LANGUAGE TRANSLATION SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                           TRANSLATION FLOW                                           ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║   ┌─────────────┐                                                                    ║
║   │  User clicks│                                                                    ║
║   │  "اردو" btn │                                                                    ║
║   └─────────────┘                                                                    ║
║          │                                                                           ║
║          ▼                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  TranslateButton Component (src/components/TranslateButton/)                 │   ║
║   │                                                                              │   ║
║   │  1. Find content element:                                                    │   ║
║   │     - div.markdown                                                           │   ║
║   │     - article .markdown                                                      │   ║
║   │     - .theme-doc-markdown                                                    │   ║
║   │                                                                              │   ║
║   │  2. Store original HTML (for toggle back)                                    │   ║
║   │                                                                              │   ║
║   │  3. Extract text content                                                     │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║          │                                                                           ║
║          ▼                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  Text Chunking (if content > 3500 chars)                                     │   ║
║   │                                                                              │   ║
║   │  ┌─────────┐  ┌─────────┐  ┌─────────┐                                      │   ║
║   │  │ Chunk 1 │  │ Chunk 2 │  │ Chunk 3 │  ...                                 │   ║
║   │  │ ≤3500   │  │ ≤3500   │  │ ≤3500   │                                      │   ║
║   │  │ chars   │  │ chars   │  │ chars   │                                      │   ║
║   │  └─────────┘  └─────────┘  └─────────┘                                      │   ║
║   │                                                                              │   ║
║   │  Split by paragraphs (\n\n) to preserve structure                            │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║          │                                                                           ║
║          ▼                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  POST /api/translate (for each chunk)                                        │   ║
║   │                                                                              │   ║
║   │  Request:                                                                    │   ║
║   │  {                                                                           │   ║
║   │    "text": "Sensors are the eyes and ears of robots...",                    │   ║
║   │    "targetLanguage": "ur"                                                    │   ║
║   │  }                                                                           │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║          │                                                                           ║
║          ▼                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  Groq API (llama-3.3-70b-versatile)                                          │   ║
║   │                                                                              │   ║
║   │  System Prompt:                                                              │   ║
║   │  "You are an expert translator specializing in technical content             │   ║
║   │   translation from English to Urdu..."                                       │   ║
║   │                                                                              │   ║
║   │  Guidelines:                                                                 │   ║
║   │  ✓ Preserve technical terms in English (sensor, motor, Python, API)         │   ║
║   │  ✓ Keep code snippets and URLs in English                                   │   ║
║   │  ✓ Maintain markdown formatting                                              │   ║
║   │  ✓ Use formal Urdu for educational content                                   │   ║
║   │  ✓ Keep numbers in Western Arabic (1, 2, 3)                                  │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║          │                                                                           ║
║          ▼                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  Response:                                                                   │   ║
║   │  {                                                                           │   ║
║   │    "translatedText": "Sensors روبوٹس کی آنکھیں اور کان ہیں...",              │   ║
║   │    "cached": false                                                           │   ║
║   │  }                                                                           │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║          │                                                                           ║
║          ▼                                                                           ║
║   ┌─────────────────────────────────────────────────────────────────────────────┐   ║
║   │  Update DOM                                                                  │   ║
║   │                                                                              │   ║
║   │  1. Replace content with translated Urdu text                                │   ║
║   │  2. Set document.dir = 'rtl' (Right-to-Left)                                │   ║
║   │  3. Set document.lang = 'ur'                                                 │   ║
║   │  4. Show translation notice                                                  │   ║
║   │  5. Toggle button to "English"                                               │   ║
║   └─────────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                      ║
╚═════════════════════════════════════════════════════════════════════════════════════╝

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                           TOGGLE BACK TO ENGLISH                                     ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║   ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐                     ║
║   │ User clicks │───>│ Restore original│───>│ Set dir='ltr'   │                     ║
║   │ "English"   │    │ HTML from state │    │ Set lang='en'   │                     ║
║   └─────────────┘    └─────────────────┘    └─────────────────┘                     ║
║                                                                                      ║
║   No API call needed - original content stored in React state                        ║
║                                                                                      ║
╚═════════════════════════════════════════════════════════════════════════════════════╝
```

### Translation Components

| File | Purpose |
|------|---------|
| `api/translate.ts` | Translation endpoint with Groq |
| `src/components/TranslateButton/` | UI button component |
| `src/components/TranslateButton/styles.module.css` | RTL styling |

---

## Dashboard System

### Overview
Personalized user dashboard showing progress, study schedule, and recommendations based on user profile.

### Dashboard Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD SYSTEM                                           │
└─────────────────────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════════════════════╗
║                           DASHBOARD DATA FLOW                                        ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                      ║
║   ┌───────────────────────────────────────────────────────────────────────────┐     ║
║   │                          PAGE LOAD                                         │     ║
║   └───────────────────────────────────────────────────────────────────────────┘     ║
║                                      │                                               ║
║                    ┌─────────────────┼─────────────────┐                            ║
║                    │                 │                 │                            ║
║                    ▼                 ▼                 ▼                            ║
║   ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐             ║
║   │ 1. Check Auth      │ │ 2. Load Progress   │ │ 3. Fetch Profile   │             ║
║   │                    │ │                    │ │                    │             ║
║   │ localStorage:      │ │ localStorage:      │ │ GET /api/profile/  │             ║
║   │ - auth_token       │ │ - course_progress  │ │ background         │             ║
║   │ - auth_user        │ │                    │ │                    │             ║
║   │                    │ │ Contains:          │ │ Returns:           │             ║
║   │ Then verify:       │ │ - completedLessons │ │ - weeklyHours      │             ║
║   │ GET /api/auth/     │ │ - overallProgress  │ │ - experienceLevel  │             ║
║   │ session            │ │ - streak           │ │ - primaryGoals     │             ║
║   └────────────────────┘ └────────────────────┘ └────────────────────┘             ║
║            │                       │                       │                        ║
║            │                       │                       │                        ║
║            └───────────────────────┼───────────────────────┘                        ║
║                                    │                                                ║
║                                    ▼                                                ║
║   ┌───────────────────────────────────────────────────────────────────────────┐    ║
║   │                    CALCULATE STUDY SCHEDULE                                │    ║
║   │                                                                            │    ║
║   │  Input: weeklyHoursAvailable (from profile)                               │    ║
║   │                                                                            │    ║
║   │  ┌─────────────────────────────────────────────────────────────────┐      │    ║
║   │  │  if (weeklyHours <= 3)  → 2 days/week, hours/2 per day          │      │    ║
║   │  │  if (weeklyHours <= 7)  → 3 days/week, hours/3 per day          │      │    ║
║   │  │  if (weeklyHours <= 12) → 4 days/week, hours/4 per day          │      │    ║
║   │  │  if (weeklyHours > 12)  → 5 days/week, hours/5 per day          │      │    ║
║   │  └─────────────────────────────────────────────────────────────────┘      │    ║
║   │                                                                            │    ║
║   │  Output:                                                                   │    ║
║   │  {                                                                         │    ║
║   │    hoursPerWeek: 10,                                                       │    ║
║   │    hoursPerDay: 2.5,                                                       │    ║
║   │    daysPerWeek: 4,                                                         │    ║
║   │    lessonsPerWeek: 6,                                                      │    ║
║   │    estimatedCompletionWeeks: 2                                             │    ║
║   │  }                                                                         │    ║
║   └───────────────────────────────────────────────────────────────────────────┘    ║
║                                    │                                                ║
║                                    ▼                                                ║
║   ┌───────────────────────────────────────────────────────────────────────────┐    ║
║   │                    GENERATE RECOMMENDATIONS                                │    ║
║   │                                                                            │    ║
║   │  Based on:                                                                 │    ║
║   │  - Experience level → "Take your time with fundamentals..."               │    ║
║   │  - Weekly hours     → "Study X days/week, Y hours each..."                │    ║
║   │  - Primary goals    → "Focus on hands-on projects for career..."          │    ║
║   │  - Available hardware → "Your Raspberry Pi is perfect for..."             │    ║
║   │  - Current progress → "Start with Lesson 1.1..." or "Great progress!"     │    ║
║   └───────────────────────────────────────────────────────────────────────────┘    ║
║                                    │                                                ║
║                                    ▼                                                ║
║   ┌───────────────────────────────────────────────────────────────────────────┐    ║
║   │                         RENDER DASHBOARD                                   │    ║
║   │  ┌─────────────────────────────────────────────────────────────────────┐  │    ║
║   │  │  Good morning, {userName}!                                          │  │    ║
║   │  ├─────────────────┬──────────────────┬────────────────────────────────┤  │    ║
║   │  │ Overall Progress│ Continue Learning│ Your Study Plan                │  │    ║
║   │  │     25%         │    [Button]      │ 10 hours/week                  │  │    ║
║   │  │    ┌───┐        │                  │ 4 days × 2.5h each             │  │    ║
║   │  │    │   │        │                  │ 6 lessons/week                 │  │    ║
║   │  │    └───┘        │                  │ ~2 weeks to complete           │  │    ║
║   │  ├─────────────────┴──────────────────┴────────────────────────────────┤  │    ║
║   │  │ 🔥 0 Day Streak | Next session: 2.5h today                          │  │    ║
║   │  ├─────────────────────────────────────────────────────────────────────┤  │    ║
║   │  │ Course Progress                                                     │  │    ║
║   │  │ [Module 1: Foundations    ████████░░ 80%]                           │  │    ║
║   │  │ [Module 2: Sensors        ████░░░░░░ 40%]                           │  │    ║
║   │  │ [Module 3: Actuators      ░░░░░░░░░░  0%]                           │  │    ║
║   │  │ [Module 4: Integration    ░░░░░░░░░░  0%]                           │  │    ║
║   │  ├─────────────────────────────────────────────────────────────────────┤  │    ║
║   │  │ Personalized Recommendations                                        │  │    ║
║   │  │ 1. Study 4 days/week, about 2.5 hours each session...              │  │    ║
║   │  │ 2. Focus on hands-on projects to build your portfolio...           │  │    ║
║   │  │ 3. Your Raspberry Pi is perfect for computer vision lessons...     │  │    ║
║   │  └─────────────────────────────────────────────────────────────────────┘  │    ║
║   └───────────────────────────────────────────────────────────────────────────┘    ║
║                                                                                      ║
╚═════════════════════════════════════════════════════════════════════════════════════╝
```

---

## Project Structure

```
robotics-course/
├── api/                         # Vercel Serverless Functions
│   ├── auth/                    # Authentication endpoints
│   │   ├── signin.ts            # POST /api/auth/signin
│   │   ├── signup.ts            # POST /api/auth/signup
│   │   ├── session.ts           # GET /api/auth/session
│   │   ├── signout.ts           # POST /api/auth/signout
│   │   └── [...all].ts          # Better-Auth catch-all
│   ├── profile/
│   │   └── background.ts        # User profile/questionnaire
│   ├── chat.ts                  # RAG Chatbot endpoint
│   ├── translate.ts             # Urdu translation endpoint
│   ├── progress.ts              # Progress tracking
│   ├── index-content.ts         # Content indexing for RAG
│   └── health.ts                # Health check endpoint
│
├── docs/                        # Course Content (MDX)
│   ├── intro.md                 # Course introduction
│   ├── module-1/                # Module 1: Foundations
│   │   ├── lesson-1-1-intro.md
│   │   ├── lesson-1-2-hardware.md
│   │   └── lesson-1-3-setup.md
│   ├── module-2/                # Module 2: Sensors
│   ├── module-3/                # Module 3: Actuators
│   └── module-4/                # Module 4: Integration
│
├── src/
│   ├── components/              # React Components
│   │   ├── BackgroundQuestionnaire/  # Signup questionnaire
│   │   ├── ChatbotWidget/       # RAG chatbot UI
│   │   ├── TranslateButton/     # Urdu translation button
│   │   ├── ProgressTracker/     # Progress bar component
│   │   └── UserMenu/            # User profile dropdown
│   │
│   ├── lib/                     # Backend Libraries
│   │   ├── auth/
│   │   │   ├── client.ts        # Frontend auth client
│   │   │   └── index.ts         # Better-Auth config
│   │   ├── db/
│   │   │   ├── index.ts         # Drizzle client
│   │   │   └── schema.ts        # Database schema
│   │   ├── cohere/
│   │   │   └── index.ts         # Cohere embeddings
│   │   └── qdrant/
│   │       └── index.ts         # Qdrant vector search
│   │
│   ├── pages/                   # React Pages
│   │   ├── index.tsx            # Homepage
│   │   ├── signin.tsx           # Sign in page
│   │   ├── signup.tsx           # Sign up + questionnaire
│   │   ├── dashboard.tsx        # User dashboard
│   │   └── profile.tsx          # User profile
│   │
│   ├── theme/                   # Docusaurus Theme Overrides
│   │   └── Navbar/Content/      # Custom navbar with UserMenu
│   │
│   └── css/
│       └── custom.css           # Global styles
│
├── static/                      # Static Assets
│   └── img/                     # Images and icons
│
├── server/
│   └── index.ts                 # Express dev server
│
├── docusaurus.config.ts         # Docusaurus configuration
├── sidebars.ts                  # Sidebar navigation
├── vercel.json                  # Vercel deployment config
├── drizzle.config.ts            # Drizzle ORM config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

---

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# MongoDB (Required for Auth)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/robotics-course

# Groq API (Required for Chat & Translation)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cohere API (Optional - for RAG embeddings)
COHERE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Qdrant Cloud (Optional - for RAG vector search)
QDRANT_URL=https://xxxxxxxx.qdrant.io
QDRANT_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
QDRANT_COLLECTION_NAME=course_content

# PostgreSQL (Optional - for Drizzle ORM)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Better-Auth (Optional)
BETTER_AUTH_SECRET=your-32-character-secret-key
```

---

## Getting Started

### Prerequisites
- Node.js 18+ LTS
- MongoDB Atlas account (free tier works)
- Groq API key (free tier available)

### Installation

```bash
# Clone repository
git clone https://github.com/MuhammadDanishgtr/Physical-AI-and-Humanoide-Robotics-Course.git
cd Physical-AI-and-Humanoide-Robotics-Course/robotics-course

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run start
```

### Production Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | User registration |
| `/api/auth/signin` | POST | User login |
| `/api/auth/session` | GET | Validate session |
| `/api/auth/signout` | POST | Logout |
| `/api/profile/background` | GET/POST | User profile |
| `/api/chat` | POST | RAG chatbot |
| `/api/translate` | POST | Urdu translation |
| `/api/progress` | GET/POST | Progress tracking |
| `/api/health` | GET | Health check |
| `/api/index-content` | POST | Index content for RAG |

---

## Course Content

| Module | Duration | Topics |
|--------|----------|--------|
| **Module 1: Foundations** | Weeks 1-2 | Physical AI concepts, Hardware basics, Software setup |
| **Module 2: Sensors** | Weeks 3-4 | Sensor types, Data acquisition, Computer vision |
| **Module 3: Actuators** | Weeks 5-6 | Motors & servos, Kinematics, Motion planning |
| **Module 4: Integration** | Weeks 7-8 | System integration, Capstone project, Advanced topics |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Copyright 2024 Physical AI & Humanoid Robotics Course

---

## Contact

- **GitHub**: [MuhammadDanishgtr](https://github.com/MuhammadDanishgtr)
- **Repository**: [Physical-AI-and-Humanoide-Robotics-Course](https://github.com/MuhammadDanishgtr/Physical-AI-and-Humanoide-Robotics-Course)
- **Live Demo**: [robotics-course.vercel.app](https://robotics-course.vercel.app)

# Research: Physical AI & Humanoid Robotics Course Platform

**Date**: 2025-12-06
**Branch**: `001-robotics-course-platform`

## Overview

This document consolidates research findings for the key technical decisions required to implement the course platform.

---

## 1. Docusaurus + Better-Auth Integration

### Decision: Hybrid Static Site with API Backend

**Rationale**: Docusaurus is a static site generator that requires custom integration for authentication. Better-Auth provides a comprehensive authentication solution that can be integrated via API routes.

### Architecture

```
User Browser
    ↓
Docusaurus (React) - Swizzled Root
    ├→ Check session via useSession()
    ├→ Display login form if unauthenticated
    └→ Show protected docs if authenticated
    ↓
/api/auth/* (Better-Auth Backend)
    ├→ Sign-in/up endpoints
    ├→ Custom learning endpoints
    └→ Session validation
    ↓
Database (PostgreSQL)
    ├→ users, sessions, accounts, verification
    ├→ userProgress (custom table)
    └→ backgroundProfiles (custom table)
```

### Key Implementation Details

1. **Swizzle Root Component** (`src/theme/Root.tsx`) - Renders at top of React tree, ideal for auth state
2. **Cookie-based Sessions** - Default 7-day expiration with optional caching (compact strategy)
3. **Custom Tables** - Extend Better-Auth schema for learning data (progress, background profiles)
4. **Protected Routes** - Use `useSession()` hook for conditional rendering

### Database Recommendation

| Environment | Database | Rationale |
|-------------|----------|-----------|
| Development | SQLite | Fast setup, no external dependencies |
| Production | PostgreSQL | Scales well, complex queries, Better-Auth native support |

### Alternatives Considered

- **Firebase Auth**: More vendor lock-in, less customizable
- **NextAuth.js**: Requires Next.js, not Docusaurus-native
- **Custom JWT**: More implementation work, reinventing the wheel

---

## 2. RAG Chatbot (Cohere + Qdrant)

### Decision: Cohere Embed v3.0 + Qdrant Cloud (then self-hosted)

**Rationale**: Cohere provides excellent English embeddings with input_type parameter for semantic search. Qdrant offers both managed cloud and self-hosted options with native Cohere integration.

### Embedding Strategy

- **Model**: `embed-english-v3.0` (1024 dimensions)
- **Input Types**:
  - `search_document` for indexing lesson content
  - `search_query` for user questions
- **Critical**: Always pass `input_type` parameter for semantic accuracy

### Document Chunking for Educational Content

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Chunk Size | 400-512 tokens | Research-backed for 40-70% accuracy improvement |
| Overlap | 10-20% | Prevents context loss at boundaries |
| Method | Recursive + Structure-aware | Respects lesson section boundaries |

**Special Handling**:
- Preserve section headers as metadata
- Keep code blocks intact
- Store lesson ID, module ID, page URL in payload

### Citation Tracking

1. Store metadata at index time: `lesson_id`, `lesson_title`, `module_id`, `url`, `section`
2. Include chunk-to-response mapping in pipeline
3. Prompt LLM: "Cite only from provided context using format [Lesson X.Y: Title]"
4. Post-process to convert citations to clickable links

### Deployment Strategy

| Phase | Platform | Cost | Notes |
|-------|----------|------|-------|
| MVP | Qdrant Cloud Free Tier | $0 | 1GB storage, sufficient for 12 lessons |
| Production | Self-hosted (Docker/K8s) | ~70% savings | Full control, SSD/NVMe required |

### Cost Optimization

- **Embedding Cache**: TTL 1 hour (Redis or in-memory)
- **Retrieval Cache**: TTL 30 minutes for frequent queries
- **Response Cache**: TTL 2 hours for complete answers
- **Expected Savings**: 40-60% reduction in API costs

### Fallback Handling

1. **Primary**: Cohere API → Qdrant retrieval → LLM response
2. **Secondary**: Cached embeddings → Local search → Template responses
3. **Tertiary**: "The assistant is temporarily unavailable" message

### Alternatives Considered

- **OpenAI Embeddings**: More expensive, less specialized for retrieval
- **Pinecone**: Good but higher cost than Qdrant
- **ChromaDB**: Less mature, fewer production features

---

## 3. Urdu Translation

### Decision: Claude API with Terminology Preservation

**Rationale**: Anthropic Claude provides strong multilingual support including Urdu, with excellent instruction-following for technical term preservation.

### Translation Approach

**Dual-Stage Process**:
1. **Identify Technical Terms** - Extract domain-specific vocabulary pre-translation
2. **Translate with Glossary** - Provide glossary to LLM with instructions to preserve terms

### Prompt Template

```
Translate the following educational content from English to Urdu.

IMPORTANT RULES:
1. Keep technical terms in English with Urdu explanation in parentheses
   Example: "servo motor (سروو موٹر - ایک قسم کی موٹر)"
2. Do NOT translate code blocks, URLs, or file names
3. Maintain markdown formatting (headings, lists, bold, etc.)
4. Use formal Urdu appropriate for educational content

GLOSSARY (keep in English):
- servo motor
- microcontroller
- sensor
- actuator
- kinematics
- PWM
- GPIO
[...extend as needed]

CONTENT TO TRANSLATE:
{content}
```

### Caching Strategy

| Layer | Type | TTL | Purpose |
|-------|------|-----|---------|
| 1 | Exact Match | 7 days | Identical content |
| 2 | Semantic Cache | 24 hours | Similar paragraphs |
| 3 | Persistent Store | Indefinite | Approved translations |

### Cost Optimization

- **Batch Processing**: Translate lessons in bulk during off-peak hours
- **Incremental Updates**: Only re-translate changed content
- **Model Selection**: Claude 3.5 Sonnet for quality; Haiku for simple content
- **Expected Cost**: ~$0.05-0.10 per lesson (one-time)

### Fallback Handling

1. **Primary**: Claude API real-time translation
2. **Secondary**: Cached translation from previous session
3. **Tertiary**: "Translation temporarily unavailable. Content displayed in English."

### Alternatives Considered

- **Google Cloud Translation**: Less context-aware for technical content
- **DeepL**: Limited Urdu support
- **Alif 1.0 (Open Source)**: Promising but requires self-hosting
- **OpenAI GPT-4**: Higher cost, similar quality to Claude

---

## 4. Hosting & Deployment

### Decision: Vercel (Frontend) + Railway/Render (Backend)

**Rationale**: Docusaurus builds to static files ideal for edge deployment. Backend services need Node.js runtime for Better-Auth and API routes.

### Architecture

```
Vercel (Edge)
├── Docusaurus static site
├── Edge functions for caching
└── CDN for global distribution
    ↓
Railway/Render (Backend)
├── Better-Auth API (/api/auth/*)
├── RAG API (/api/chat/*)
├── Translation API (/api/translate/*)
└── PostgreSQL database
    ↓
External Services
├── Cohere API (embeddings)
├── Qdrant Cloud (vectors)
└── Claude API (translation + chatbot)
```

### Cost Estimates (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| Vercel | Hobby/Pro | $0-20 |
| Railway | Starter | $5-20 |
| PostgreSQL | Railway addon | $5-10 |
| Qdrant Cloud | Free/Starter | $0-25 |
| Cohere | Pay-as-you-go | $10-30 |
| Claude API | Pay-as-you-go | $20-50 |
| **Total** | | **$40-155** |

### Alternatives Considered

- **AWS/GCP**: More complex, higher overhead for small team
- **Netlify**: Good but Vercel has better DX for React
- **Self-hosted VPS**: Requires more ops work

---

## 5. Technology Stack Summary

### Frontend (Docusaurus)

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Docusaurus | 3.x |
| Language | TypeScript | 5.x |
| Styling | CSS Modules + Tailwind | 3.x |
| State | React Context | 18.x |
| Auth Client | Better-Auth React | Latest |

### Backend (API)

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express or Hono | Latest |
| Auth | Better-Auth | Latest |
| ORM | Drizzle | Latest |
| Database | PostgreSQL | 16 |

### AI Services

| Component | Provider | Model/Service |
|-----------|----------|---------------|
| Embeddings | Cohere | embed-english-v3.0 |
| Vector DB | Qdrant | Cloud → Self-hosted |
| Chatbot LLM | Claude | claude-3.5-sonnet |
| Translation | Claude | claude-3.5-sonnet |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cohere API rate limits | Medium | Medium | Implement caching, request queuing |
| Qdrant Cloud downtime | Low | High | Cache recent queries, fallback responses |
| Translation quality issues | Medium | Medium | Human review of cached translations |
| Better-Auth learning curve | Medium | Low | Follow official docs, community support |
| Cost overrun on AI APIs | Medium | Medium | Set budget alerts, aggressive caching |

---

## Sources

- [Better-Auth Official Documentation](https://www.better-auth.com/)
- [Docusaurus Authentication Guides](https://docusaurus.io/docs/swizzling)
- [Qdrant + Cohere RAG Connector](https://qdrant.tech/documentation/examples/cohere-rag-connector/)
- [Cohere Embedding Best Practices](https://docs.cohere.com/v2/docs/qdrant-and-cohere)
- [RAG Chunking Strategies](https://community.databricks.com/t5/technical-blog/the-ultimate-guide-to-chunking-strategies-for-rag-applications/ba-p/113089)
- [LLM Translation Best Practices](https://lokalise.com/blog/what-is-the-best-llm-for-translation/)
- [Alif 1.0 Urdu LLM](https://blog.traversaal.ai/announcing-alif-1-0-our-first-urdu-llm/)

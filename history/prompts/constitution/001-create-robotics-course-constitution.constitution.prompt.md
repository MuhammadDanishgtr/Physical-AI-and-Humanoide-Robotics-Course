---
id: 001
title: Create Robotics Course Constitution
stage: constitution
date: 2025-12-06
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "physical-ai", "robotics-course", "docusaurus", "rag-chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

/sp.constitution
1. Create a constitution document for a book "Physical AI & humanoide robotics course".
2. Target audiance: beginners to intermediate.
3. Tech Stack:Docusaurus for documentation.
4. Focus on hands-on learning.
5. use chat boot for translation in urdu.
6. use RAG chatboot to answer user querry (use cohere for data embadding and qdrant for vector data base).
7. impliment signup and signin using https://www.better-auth.com/ at signup you will ask question from the user about their software and hardware background.
8. book consist of 4 module or chapters and each module consist of three lesson maximum and course divided in 8 weeks.
provide the constitution with vision,core principles,success criteria,stakeholder and brand voice.
through above generate below through chat GPT.

## Response snapshot

Created constitution v1.0.0 for Physical AI & Humanoid Robotics Course with:
- Vision statement emphasizing democratized robotics education
- 8 core principles: Learner-Centric, Hands-On Learning, Accessibility, Progressive Complexity, Intelligent Assistance, Secure Auth, Documentation Excellence, Modular Architecture
- Stakeholder definitions (beginners, intermediate, Urdu-speakers, maintainers, instructors)
- Brand voice guidelines (encouraging, patient, technically precise)
- Success criteria with measurable metrics (learner, platform, technical)
- Tech stack: Docusaurus, Better-Auth, Qdrant, Cohere
- Course structure: 4 modules × 3 lessons over 8 weeks
- Governance: amendment process, versioning policy, compliance review

## Outcome

- ✅ Impact: Established foundational governance document for the entire project
- 🧪 Tests: N/A (documentation artifact)
- 📁 Files: `.specify/memory/constitution.md` created
- 🔁 Next prompts: `/sp.specify` for first feature, setup Docusaurus project structure
- 🧠 Reflection: Constitution captures all user requirements; tech stack and course structure clearly defined

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution against actual implementation during first feature spec

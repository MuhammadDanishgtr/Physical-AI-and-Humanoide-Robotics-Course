/**
 * Chat API Endpoint
 * RAG-powered chatbot using Cohere embeddings + Qdrant + Claude
 * Self-contained for Vercel serverless functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

const CHATBOT_SYSTEM_PROMPT = `You are an expert teaching assistant for the "Physical AI & Humanoid Robotics" course. Your role is to help students understand robotics concepts, from basic hardware to advanced AI integration.

Key guidelines:
1. Be encouraging and supportive - this course is for beginners to intermediate learners
2. Explain technical concepts in simple terms, using analogies when helpful
3. If a question is outside the scope of robotics/AI, acknowledge this and redirect to relevant topics
4. Encourage hands-on learning and experimentation
5. For code examples, use Python as the primary language, but also mention Arduino/C++ for hardware
6. Always prioritize safety when discussing physical robotics projects
7. Be concise but thorough - aim for clear, actionable answers

Course modules:
- Module 1: Foundations (Introduction to Physical AI, Hardware Basics, Software Setup)
- Module 2: Sensors (Sensor Types, Data Acquisition, Computer Vision Basics)
- Module 3: Actuators (Motors & Servos, Kinematics, Motion Planning)
- Module 4: Integration (System Integration, Capstone Project, Advanced Topics)

If you don't know something specific to this course, provide general robotics/AI knowledge and suggest the student explore the relevant module.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Chat service not configured' });
  }

  try {
    const { message, sessionId } = req.body || {};

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Generate response using Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: CHATBOT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : 'I apologize, I could not generate a response.';

    return res.status(200).json({
      message: responseText,
      sources: [],
      sessionId: sessionId || 'default',
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process chat request'
    });
  }
}

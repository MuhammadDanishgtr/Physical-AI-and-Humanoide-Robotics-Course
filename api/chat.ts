/**
 * Chat API Endpoint
 * Chatbot using Groq API (free tier)
 * Self-contained for Vercel serverless functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Chat service not configured' });
  }

  try {
    const { message, sessionId } = req.body || {};

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: CHATBOT_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';

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

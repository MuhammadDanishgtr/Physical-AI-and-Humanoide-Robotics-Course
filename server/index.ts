/**
 * Express API Server
 * Handles translation and chat API requests
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables
config({ path: '.env.local' });

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Translation system prompt
const TRANSLATION_SYSTEM_PROMPT = `You are an expert translator specializing in technical content translation from English to Urdu. Your translations are used for an educational robotics course.

Key guidelines:
1. Preserve all technical terms in English within the Urdu text (e.g., "sensor", "motor", "Python", "API")
2. Keep code snippets, variable names, and commands in English
3. Maintain the structure of the content (headings, lists, paragraphs)
4. Use formal Urdu suitable for educational content
5. Preserve any markdown formatting (headers, bold, code blocks, etc.)
6. For mathematical expressions and formulas, keep them in their original form
7. Translate explanatory text naturally while keeping technical accuracy
8. Numbers should remain in Western Arabic numerals (1, 2, 3) not Eastern Arabic numerals

Output only the translated text, no explanations.`;

// Chatbot system prompt
const CHATBOT_SYSTEM_PROMPT = `You are an expert teaching assistant for the "Physical AI & Humanoid Robotics" course. Your role is to help students understand robotics concepts, from basic hardware to advanced AI integration.

Key guidelines:
1. Be encouraging and supportive - this course is for beginners to intermediate learners
2. Explain technical concepts in simple terms, using analogies when helpful
3. When answering questions, reference the relevant course content provided in the context
4. If a question is outside the scope of the course, acknowledge this and redirect to relevant topics
5. Encourage hands-on learning and experimentation
6. For code examples, use Python as the primary language, but also mention Arduino/C++ for hardware
7. Always prioritize safety when discussing physical robotics projects
8. Be concise but thorough - aim for clear, actionable answers

Course modules:
- Module 1: Foundations (Introduction, Hardware, Software Setup)
- Module 2: Sensors (Types, Data Acquisition, Computer Vision)
- Module 3: Actuators (Motors, Kinematics, Motion Planning)
- Module 4: Integration (System Patterns, Capstone Project, Advanced Topics)`;

// In-memory user storage (for demo - replace with database in production)
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
}

const users: Map<string, User> = new Map();
const sessions: Map<string, Session> = new Map();

// Simple hash function for demo (use bcrypt in production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Generate session token
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth: Sign Up
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: { message: 'Email, password, and name are required' } });
    }

    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists with this email' } });
    }

    // Create user
    const userId = generateToken();
    const user: User = {
      id: userId,
      email,
      name,
      passwordHash: simpleHash(password),
      createdAt: new Date(),
    };
    users.set(userId, user);

    // Create session
    const token = generateToken();
    const session: Session = {
      token,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    sessions.set(token, session);

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: { message: 'Failed to create account' } });
  }
});

// Auth: Sign In
app.post('/api/auth/signin', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'Email and password are required' } });
    }

    // Find user
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // Check password
    if (user.passwordHash !== simpleHash(password)) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    // Create session
    const token = generateToken();
    const session: Session = {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    sessions.set(token, session);

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: { message: 'Failed to sign in' } });
  }
});

// Auth: Get Session
app.get('/api/auth/session', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ user: null });
    }

    const token = authHeader.substring(7);
    const session = sessions.get(token);

    if (!session || session.expiresAt < new Date()) {
      sessions.delete(token);
      return res.json({ user: null });
    }

    const user = users.get(session.userId);
    if (!user) {
      return res.json({ user: null });
    }

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Session error:', error);
    res.json({ user: null });
  }
});

// Auth: Sign Out
app.post('/api/auth/signout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      sessions.delete(token);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    res.json({ success: true });
  }
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'ur' } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (targetLanguage !== 'ur') {
      return res.status(400).json({ error: 'Only Urdu translation is supported' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Translation service not configured' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      system: TRANSLATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Translate the following educational content to Urdu, preserving technical terms in English:\n\n${text}`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    const translation = textContent?.type === 'text' ? textContent.text : '';

    res.json({
      translatedText: translation,
      cached: false,
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Chat service not configured' });
    }

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.slice(-6).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: CHATBOT_SYSTEM_PROMPT,
      messages,
    });

    const textContent = response.content.find((block) => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    res.json({
      response: responseText,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health       - Health check');
  console.log('  POST /api/translate    - Translate text to Urdu');
  console.log('  POST /api/chat         - Chat with AI assistant');
  console.log('  POST /api/auth/signup  - Create new user account');
  console.log('  POST /api/auth/signin  - Sign in with email/password');
  console.log('  GET  /api/auth/session - Get current session');
  console.log('  POST /api/auth/signout - Sign out');
});

/**
 * Anthropic Claude Client
 * For RAG chatbot responses and Urdu translation
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('ANTHROPIC_API_KEY not set. AI features will be disabled.');
}

export const anthropic = new Anthropic({
  apiKey: apiKey || '',
});

// Model configuration
export const CHAT_MODEL = 'claude-3-haiku-20240307'; // Fast, cost-effective for chat
export const TRANSLATION_MODEL = 'claude-3-haiku-20240307';

/**
 * System prompt for the course chatbot
 */
export const CHATBOT_SYSTEM_PROMPT = `You are an expert teaching assistant for the "Physical AI & Humanoid Robotics" course. Your role is to help students understand robotics concepts, from basic hardware to advanced AI integration.

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

/**
 * Generate a chatbot response with RAG context
 */
export async function generateChatResponse(
  userMessage: string,
  context: Array<{ content: string; title: string; lessonId: string }>,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{ response: string; tokensUsed: number }> {
  // Build context string
  const contextStr = context
    .map((doc, i) => `[Source ${i + 1}: ${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n');

  // Prepare messages
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.slice(-6).map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    {
      role: 'user',
      content: `Context from course materials:\n${contextStr}\n\n---\n\nStudent question: ${userMessage}`,
    },
  ];

  const response = await anthropic.messages.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    system: CHATBOT_SYSTEM_PROMPT,
    messages,
  });

  const textContent = response.content.find((block) => block.type === 'text');
  const responseText = textContent?.type === 'text' ? textContent.text : '';

  return {
    response: responseText,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}

/**
 * System prompt for Urdu translation
 */
export const TRANSLATION_SYSTEM_PROMPT = `You are an expert translator specializing in technical content translation from English to Urdu. Your translations are used for an educational robotics course.

Key guidelines:
1. Preserve all technical terms in English within the Urdu text (e.g., "sensor", "motor", "Python", "API")
2. Keep code snippets, variable names, and commands in English
3. Maintain the structure of the content (headings, lists, paragraphs)
4. Use formal Urdu suitable for educational content
5. Preserve any markdown formatting (headers, bold, code blocks, etc.)
6. For mathematical expressions and formulas, keep them in their original form
7. Translate explanatory text naturally while keeping technical accuracy
8. Numbers should remain in Western Arabic numerals (1, 2, 3) not Eastern Arabic numerals

Format your output as:
- Urdu translation followed by preserved formatting
- Do not add explanations or notes`;

/**
 * Translate content to Urdu
 */
export async function translateToUrdu(
  text: string
): Promise<{ translation: string; tokensUsed: number }> {
  const response = await anthropic.messages.create({
    model: TRANSLATION_MODEL,
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

  return {
    translation,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}

/**
 * Generate a brief summary of lesson content
 */
export async function generateLessonSummary(
  lessonContent: string,
  lessonTitle: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: CHAT_MODEL,
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `Summarize the following lesson "${lessonTitle}" in 2-3 sentences for a robotics course student:\n\n${lessonContent}`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  return textContent?.type === 'text' ? textContent.text : '';
}

/**
 * Generate personalized learning recommendations
 */
export async function generateRecommendations(
  completedLessons: string[],
  currentProgress: number,
  userBackground: {
    experienceLevel: string;
    primaryGoals: string[];
  }
): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: CHAT_MODEL,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Based on the following student profile, generate 3 personalized learning recommendations:

Completed lessons: ${completedLessons.join(', ') || 'None yet'}
Overall progress: ${currentProgress}%
Experience level: ${userBackground.experienceLevel}
Learning goals: ${userBackground.primaryGoals.join(', ')}

Provide exactly 3 concise, actionable recommendations as a JSON array of strings.`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  const text = textContent?.type === 'text' ? textContent.text : '[]';

  try {
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    console.error('Failed to parse recommendations:', text);
  }

  return [
    'Continue with your current lesson',
    'Review the fundamentals if concepts are unclear',
    'Try the hands-on exercises to reinforce learning',
  ];
}

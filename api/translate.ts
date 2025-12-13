/**
 * Translation API Endpoint
 * Translate content to Urdu using Groq API
 * Self-contained for Vercel serverless functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const TRANSLATION_SYSTEM_PROMPT = `You are an expert translator specializing in technical content translation from English to Urdu. Your translations are used for an educational robotics course.

Key guidelines:
1. Preserve all technical terms in English within the Urdu text (e.g., "sensor", "motor", "Python", "API", "Arduino", "robot", "AI")
2. Keep code snippets, variable names, commands, and URLs in English
3. Maintain the structure of the content (headings, lists, paragraphs)
4. Use formal Urdu suitable for educational content
5. Preserve any markdown formatting (headers, bold, code blocks, etc.)
6. For mathematical expressions and formulas, keep them in their original form
7. Translate explanatory text naturally while keeping technical accuracy
8. Numbers should remain in Western Arabic numerals (1, 2, 3) not Eastern Arabic numerals

Output only the translated text, no explanations or notes.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Translation service not configured' });
  }

  try {
    const { text, targetLanguage = 'ur' } = req.body || {};

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Only support Urdu for now
    if (targetLanguage !== 'ur') {
      return res.status(400).json({ error: 'Only Urdu translation is supported' });
    }

    // Call Groq API for translation
    // Using llama-3.3-70b-versatile for better multilingual support
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: TRANSLATION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Translate the following educational content to Urdu, preserving technical terms in English:\n\n${text}`,
          },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content || '';

    if (!translatedText) {
      throw new Error('No translation received from API');
    }

    return res.status(200).json({
      translatedText,
      cached: false,
    });
  } catch (error: any) {
    console.error('Translation API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to translate text',
    });
  }
}

/**
 * Translation API Endpoint
 * Translate content to Urdu using Groq API
 * Self-contained for Vercel serverless functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const TRANSLATION_SYSTEM_PROMPT = `You are a professional translator specializing in English to Urdu translation for educational content about robotics and AI.

Guidelines:
1. Translate the text naturally into Urdu while preserving technical terms in English (e.g., "sensor", "motor", "Arduino", "Python", "API")
2. Maintain the meaning and tone of the original text
3. Use formal Urdu appropriate for educational content
4. Keep proper nouns, code snippets, and technical acronyms in English
5. Return ONLY the translated text, no explanations or notes`;

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
            content: TRANSLATION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Translate the following text to Urdu:\n\n${text}`,
          },
        ],
        max_tokens: 2048,
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

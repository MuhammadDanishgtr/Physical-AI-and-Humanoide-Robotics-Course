/**
 * Translation API Endpoint
 * Translate content to Urdu using Claude with caching
 */

import { translateToUrdu } from '../src/lib/anthropic';
import { db, translationCache } from '../src/lib/db';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';

interface TranslateRequest {
  text: string;
  targetLanguage?: 'ur';
}

interface TranslateResponse {
  translatedText: string;
  cached: boolean;
}

function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: TranslateRequest = await req.json();
    const { text, targetLanguage = 'ur' } = body;

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only support Urdu for now
    if (targetLanguage !== 'ur') {
      return new Response(JSON.stringify({ error: 'Only Urdu translation is supported' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate hash for caching
    const textHash = hashText(text);

    // Check cache first
    try {
      const cached = await db.query.translationCache.findFirst({
        where: eq(translationCache.sourceTextHash, textHash),
      });

      if (cached) {
        const response: TranslateResponse = {
          translatedText: cached.translatedText,
          cached: true,
        };
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed:', cacheError);
      // Continue without cache
    }

    // Generate translation
    const { translation, tokensUsed } = await translateToUrdu(text);

    // Cache the result
    try {
      await db.insert(translationCache).values({
        sourceText: text,
        sourceTextHash: textHash,
        targetLanguage: 'ur',
        translatedText: translation,
        modelUsed: 'claude-3-haiku-20240307',
      });
    } catch (cacheError) {
      console.error('Failed to cache translation:', cacheError);
      // Don't fail if caching fails
    }

    const response: TranslateResponse = {
      translatedText: translation,
      cached: false,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Translation API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to translate text' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

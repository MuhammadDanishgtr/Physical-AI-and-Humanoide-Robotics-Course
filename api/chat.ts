/**
 * Chat API Endpoint
 * RAG-powered chatbot using Cohere embeddings + Qdrant + Claude
 */

import { generateQueryEmbedding } from '../src/lib/cohere';
import { searchSimilar } from '../src/lib/qdrant';
import { generateChatResponse } from '../src/lib/anthropic';
import { db, chatbotInteractions } from '../src/lib/db';

interface ChatRequest {
  message: string;
  sessionId: string;
  lessonContext?: string;
}

interface ChatResponse {
  message: string;
  sources: Array<{
    title: string;
    lessonId: string;
    relevanceScore: number;
  }>;
  sessionId: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const startTime = Date.now();

  try {
    const body: ChatRequest = await req.json();
    const { message, sessionId, lessonContext } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate embedding for the query
    let context: Array<{ content: string; title: string; lessonId: string }> = [];
    let sources: ChatResponse['sources'] = [];

    try {
      const queryEmbedding = await generateQueryEmbedding(message);

      // Search for relevant content
      const searchResults = await searchSimilar(queryEmbedding, {
        limit: 3,
        lessonId: lessonContext,
        scoreThreshold: 0.7,
      });

      context = searchResults.map((result) => ({
        content: result.payload.content,
        title: result.payload.title,
        lessonId: result.payload.lessonId,
      }));

      sources = searchResults.map((result) => ({
        title: result.payload.title,
        lessonId: result.payload.lessonId,
        relevanceScore: result.score,
      }));
    } catch (embeddingError) {
      console.warn('Embedding search failed, using fallback:', embeddingError);
      // Continue without RAG context
    }

    // Generate response using Claude
    const { response, tokensUsed } = await generateChatResponse(
      message,
      context,
      [] // Could add conversation history here
    );

    const responseTime = Date.now() - startTime;

    // Log interaction to database
    try {
      await db.insert(chatbotInteractions).values({
        sessionId,
        lessonContext,
        userMessage: message,
        botResponse: response,
        sourceDocs: sources.length > 0 ? sources.map(s => ({
          docId: s.lessonId,
          title: s.title,
          relevanceScore: s.relevanceScore,
          snippet: '',
        })) : null,
        responseTimeMs: responseTime,
      });
    } catch (dbError) {
      console.error('Failed to log interaction:', dbError);
      // Don't fail the request if logging fails
    }

    const chatResponse: ChatResponse = {
      message: response,
      sources,
      sessionId,
    };

    return new Response(JSON.stringify(chatResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

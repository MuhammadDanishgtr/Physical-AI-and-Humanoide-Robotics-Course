/**
 * Cohere Client Configuration
 * For text embeddings used in RAG chatbot
 */

import { CohereClient } from 'cohere-ai';

// Initialize Cohere client
const apiKey = process.env.COHERE_API_KEY;

if (!apiKey) {
  console.warn('COHERE_API_KEY not set. Embedding features will be disabled.');
}

export const cohere = new CohereClient({
  token: apiKey || '',
});

// Embedding model configuration
export const EMBEDDING_MODEL = 'embed-english-v3.0';
export const EMBEDDING_DIMENSION = 1024;

/**
 * Generate embeddings for text content
 * @param texts Array of text strings to embed
 * @param inputType Type of input: 'search_document' for indexing, 'search_query' for queries
 * @returns Array of embedding vectors
 */
export async function generateEmbeddings(
  texts: string[],
  inputType: 'search_document' | 'search_query' = 'search_document'
): Promise<number[][]> {
  if (!apiKey) {
    throw new Error('COHERE_API_KEY is required for generating embeddings');
  }

  const response = await cohere.embed({
    texts,
    model: EMBEDDING_MODEL,
    inputType,
    truncate: 'END',
  });

  // Handle the response - embeddings can be in different formats
  if (response.embeddings && Array.isArray(response.embeddings)) {
    // If embeddings is already an array of arrays
    if (Array.isArray(response.embeddings[0])) {
      return response.embeddings as number[][];
    }
  }

  // Fallback for different response structures
  const embeddings = response.embeddings as unknown;
  if (embeddings && typeof embeddings === 'object' && 'float' in embeddings) {
    return (embeddings as { float: number[][] }).float;
  }

  throw new Error('Unexpected embedding response format');
}

/**
 * Generate a single embedding for a query
 * @param query The search query text
 * @returns Single embedding vector
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const embeddings = await generateEmbeddings([query], 'search_query');
  return embeddings[0];
}

/**
 * Chunk text into smaller pieces for embedding
 * @param text The full text to chunk
 * @param chunkSize Target chunk size in characters
 * @param overlap Overlap between chunks in characters
 * @returns Array of text chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to find a natural break point (sentence end, paragraph)
    if (end < text.length) {
      const breakPoints = ['. ', '.\n', '\n\n', '\n', ' '];
      for (const breakPoint of breakPoints) {
        const lastBreak = text.lastIndexOf(breakPoint, end);
        if (lastBreak > start + chunkSize / 2) {
          end = lastBreak + breakPoint.length;
          break;
        }
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;

    // Prevent infinite loop
    if (start <= chunks.length - 1 && chunks.length > 0) {
      start = end;
    }
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Prepare document for embedding with metadata
 */
export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    lessonId: string;
    moduleId: string;
    title: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

export function prepareDocumentChunks(
  content: string,
  lessonId: string,
  moduleId: string,
  title: string
): DocumentChunk[] {
  const chunks = chunkText(content);

  return chunks.map((chunk, index) => ({
    id: `${lessonId}-chunk-${index}`,
    content: chunk,
    metadata: {
      lessonId,
      moduleId,
      title,
      chunkIndex: index,
      totalChunks: chunks.length,
    },
  }));
}

/**
 * Qdrant Vector Database Client
 * For storing and retrieving course content embeddings
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { EMBEDDING_DIMENSION } from '../cohere';

// Initialize Qdrant client
const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;
const collectionName = process.env.QDRANT_COLLECTION_NAME || 'course_conten';

if (!qdrantUrl) {
  console.warn('QDRANT_URL not set. Vector search features will be disabled.');
}

export const qdrant = new QdrantClient({
  url: qdrantUrl || 'http://localhost:6333',
  apiKey: qdrantApiKey,
});

export const COLLECTION_NAME = collectionName;

/**
 * Payload structure for stored points
 */
export interface CourseContentPayload {
  lessonId: string;
  moduleId: string;
  title: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Search result structure
 */
export interface SearchResult {
  id: string;
  score: number;
  payload: CourseContentPayload;
}

/**
 * Initialize the collection if it doesn't exist
 */
export async function initializeCollection(): Promise<void> {
  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: EMBEDDING_DIMENSION,
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      // Create payload indexes for filtering
      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'lessonId',
        field_schema: 'keyword',
      });

      await qdrant.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'moduleId',
        field_schema: 'keyword',
      });

      console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
    }
  } catch (error) {
    console.error('Failed to initialize Qdrant collection:', error);
    throw error;
  }
}

/**
 * Upsert vectors into the collection
 */
export async function upsertVectors(
  points: Array<{
    id: string;
    vector: number[];
    payload: CourseContentPayload;
  }>
): Promise<void> {
  if (points.length === 0) return;

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: points.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload,
    })),
  });
}

/**
 * Search for similar content
 */
export async function searchSimilar(
  queryVector: number[],
  options: {
    limit?: number;
    lessonId?: string;
    moduleId?: string;
    scoreThreshold?: number;
  } = {}
): Promise<SearchResult[]> {
  const { limit = 5, lessonId, moduleId, scoreThreshold = 0.7 } = options;

  // Build filter conditions
  const must: Array<{ key: string; match: { value: string } }> = [];

  if (lessonId) {
    must.push({ key: 'lessonId', match: { value: lessonId } });
  }

  if (moduleId) {
    must.push({ key: 'moduleId', match: { value: moduleId } });
  }

  const results = await qdrant.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    score_threshold: scoreThreshold,
    with_payload: true,
    filter: must.length > 0 ? { must } : undefined,
  });

  return results.map((result) => ({
    id: result.id as string,
    score: result.score,
    payload: result.payload as unknown as CourseContentPayload,
  }));
}

/**
 * Delete vectors by lesson ID
 */
export async function deleteByLessonId(lessonId: string): Promise<void> {
  await qdrant.delete(COLLECTION_NAME, {
    wait: true,
    filter: {
      must: [{ key: 'lessonId', match: { value: lessonId } }],
    },
  });
}

/**
 * Get collection info
 */
export async function getCollectionInfo() {
  return qdrant.getCollection(COLLECTION_NAME);
}

/**
 * Count points in collection
 */
export async function countPoints(): Promise<number> {
  const info = await qdrant.getCollection(COLLECTION_NAME);
  return info.points_count || 0;
}

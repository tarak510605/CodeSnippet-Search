/**
 * Embedding Service
 * Google Gemini text embeddings for semantic search
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';

let genAI = null;

const getClient = () => {
  if (!genAI && config.geminiApiKey) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
};

/**
 * Generate a 768-dimension embedding vector for text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
export const generateEmbedding = async (text) => {
  const client = getClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = client.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
};

/**
 * Compute cosine similarity between two vectors (0-1)
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) {
    return 0;
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  if (denominator === 0) return 0;
  return dot / denominator;
};

export default {
  generateEmbedding,
  cosineSimilarity
};

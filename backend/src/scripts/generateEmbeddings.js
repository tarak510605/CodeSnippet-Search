/**
 * Migration Script: Generate embeddings for existing snippets
 * Run: node src/scripts/generateEmbeddings.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Snippet from '../models/Snippet.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { connectDB, disconnectDB } from '../config/database.js';

dotenv.config();

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1000;

const buildEmbeddingText = (snippet) => {
  const tags = (snippet.tags || []).join(' ');
  const codePreview = (snippet.code || '').substring(0, 1000);
  return `${snippet.title} ${snippet.description} ${tags} ${codePreview}`.trim();
};

const run = async () => {
  try {
    await connectDB();

    const snippets = await Snippet.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: null }
      ],
      isActive: true
    }).select('+embedding');

    const total = snippets.length;
    if (total === 0) {
      console.log('No snippets need embeddings. Done.');
      await disconnectDB();
      process.exit(0);
    }

    const totalBatches = Math.ceil(total / BATCH_SIZE);
    let processed = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batch = snippets.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}...`);

      await Promise.all(
        batch.map(async (snippet) => {
          try {
            const text = buildEmbeddingText(snippet);
            const embedding = await generateEmbedding(text);
            snippet.embedding = embedding;
            await snippet.save({ validateBeforeSave: false });
            processed += 1;
          } catch (err) {
            console.warn(`Failed to embed snippet ${snippet._id}: ${err.message}`);
          }
        })
      );

      console.log(`done. ${processed}/${total} snippets embedded.`);

      if (batchIndex < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    console.log(`Migration complete. ${processed}/${total} snippets embedded.`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

run();

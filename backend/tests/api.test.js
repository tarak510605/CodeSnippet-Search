/**
 * API Endpoint Tests
 * Tests for the snippet API endpoints using Supertest
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { Snippet } from '../src/models/index.js';

// Test database URI
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/code_snippets_test';

// Sample test data
const testSnippet = {
  title: 'Test Debounce Function',
  language: 'javascript',
  tags: ['utility', 'performance'],
  code: `function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
  description: 'A test debounce function for testing purposes',
};

let createdSnippetId;

describe('Snippet API Endpoints', () => {
  // Connect to test database before all tests
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
    // Clear test data
    await Snippet.deleteMany({});
    // Create text indexes
    await Snippet.collection.createIndex(
      { title: 'text', tags: 'text', description: 'text', code: 'text' },
      { weights: { title: 10, tags: 8, description: 5, code: 2 } }
    );
  });

  // Close database connection after all tests
  afterAll(async () => {
    await Snippet.deleteMany({});
    await mongoose.connection.close();
  });

  // ==========================================
  // Health Check
  // ==========================================
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('API is running');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  // ==========================================
  // Create Snippet
  // ==========================================
  describe('POST /api/snippets', () => {
    it('should create a new snippet', async () => {
      const res = await request(app)
        .post('/api/snippets')
        .send(testSnippet);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testSnippet.title);
      expect(res.body.data.language).toBe(testSnippet.language);
      expect(res.body.data.tags).toEqual(testSnippet.tags);
      expect(res.body.data._id).toBeDefined();

      createdSnippetId = res.body.data._id;
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/snippets')
        .send({ title: 'Incomplete Snippet' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid language', async () => {
      const res = await request(app)
        .post('/api/snippets')
        .send({
          ...testSnippet,
          language: 'invalid_language',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // Get All Snippets
  // ==========================================
  describe('GET /api/snippets', () => {
    it('should return paginated snippets', async () => {
      const res = await request(app).get('/api/snippets');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by language', async () => {
      const res = await request(app)
        .get('/api/snippets')
        .query({ language: 'javascript' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((snippet) => {
        expect(snippet.language).toBe('javascript');
      });
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/snippets')
        .query({ page: 1, limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  // ==========================================
  // Get Snippet by ID
  // ==========================================
  describe('GET /api/snippets/:id', () => {
    it('should return a snippet by ID', async () => {
      const res = await request(app).get(`/api/snippets/${createdSnippetId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(createdSnippetId);
    });

    it('should return 404 for non-existent snippet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/snippets/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/snippets/invalid-id');

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // Rate Snippet
  // ==========================================
  describe('POST /api/snippets/:id/rate', () => {
    it('should add a rating to a snippet', async () => {
      const res = await request(app)
        .post(`/api/snippets/${createdSnippetId}/rate`)
        .send({ rating: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.average).toBe(5);
      expect(res.body.data.count).toBe(1);
    });

    it('should update average after multiple ratings', async () => {
      await request(app)
        .post(`/api/snippets/${createdSnippetId}/rate`)
        .send({ rating: 3 });

      const res = await request(app)
        .post(`/api/snippets/${createdSnippetId}/rate`)
        .send({ rating: 4 });

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(3);
      expect(res.body.data.average).toBe(4); // (5 + 3 + 4) / 3 = 4
    });

    it('should fail with invalid rating', async () => {
      const res = await request(app)
        .post(`/api/snippets/${createdSnippetId}/rate`)
        .send({ rating: 10 });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // Toggle Favorite
  // ==========================================
  describe('POST /api/snippets/:id/favorite', () => {
    it('should add snippet to favorites', async () => {
      const res = await request(app)
        .post(`/api/snippets/${createdSnippetId}/favorite`)
        .send({ userId: 'test_user_1' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFavorited).toBe(true);
      expect(res.body.data.favoritesCount).toBe(1);
    });

    it('should remove snippet from favorites when toggled again', async () => {
      const res = await request(app)
        .post(`/api/snippets/${createdSnippetId}/favorite`)
        .send({ userId: 'test_user_1' });

      expect(res.status).toBe(200);
      expect(res.body.data.isFavorited).toBe(false);
      expect(res.body.data.favoritesCount).toBe(0);
    });
  });

  // ==========================================
  // Search Snippets
  // ==========================================
  describe('POST /api/snippets/search', () => {
    it('should search snippets by query', async () => {
      const res = await request(app)
        .post('/api/snippets/search')
        .send({ query: 'debounce', includeAI: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.snippets)).toBe(true);
    });

    it('should fail with empty query', async () => {
      const res = await request(app)
        .post('/api/snippets/search')
        .send({ query: '' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should filter by language in search', async () => {
      const res = await request(app)
        .post('/api/snippets/search')
        .send({ query: 'function', language: 'javascript', includeAI: false });

      expect(res.status).toBe(200);
      res.body.data.snippets.forEach((snippet) => {
        expect(snippet.language).toBe('javascript');
      });
    });
  });

  // ==========================================
  // Popular Snippets
  // ==========================================
  describe('GET /api/snippets/popular', () => {
    it('should return popular snippets', async () => {
      const res = await request(app).get('/api/snippets/popular');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const res = await request(app)
        .get('/api/snippets/popular')
        .query({ limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  // ==========================================
  // Get Languages
  // ==========================================
  describe('GET /api/snippets/languages', () => {
    it('should return available languages', async () => {
      const res = await request(app).get('/api/snippets/languages');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==========================================
  // Delete Snippet
  // ==========================================
  describe('DELETE /api/snippets/:id', () => {
    it('should soft delete a snippet', async () => {
      const res = await request(app).delete(`/api/snippets/${createdSnippetId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not return deleted snippet in list', async () => {
      const res = await request(app).get('/api/snippets');

      const deletedSnippet = res.body.data.find(
        (s) => s._id === createdSnippetId
      );
      expect(deletedSnippet).toBeUndefined();
    });
  });
});

/**
 * API Endpoint Tests
 * Tests for the snippet API endpoints using Supertest
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only-must-be-long-enough';
process.env.JWT_EXPIRES_IN = '7d';
process.env.SKIP_RATE_LIMIT = 'true';

const { default: app } = await import('../src/app.js');
const { Snippet, User, SearchLog } = await import('../src/models/index.js');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/code_snippets_test';

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

const strongPassword = 'TestPass1!';

let createdSnippetId;
let authToken;

const registerAndLogin = async (suffix = '') => {
  const username = `testuser${suffix}${Date.now()}`;
  const email = `test${suffix}${Date.now()}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, email, password: strongPassword });
  return { token: res.body.token, user: res.body.user, username, email };
};

describe('Rate Limiting', () => {
  let rateLimitApp;

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
    jest.resetModules();
    delete process.env.SKIP_RATE_LIMIT;
    rateLimitApp = (await import('../src/app.js')).default;
  });

  it('21st request to POST /api/snippets/search within window returns 429', async () => {
    const requests = [];
    for (let i = 0; i < 21; i++) {
      requests.push(
        request(rateLimitApp)
          .post('/api/snippets/search')
          .send({ query: 'debounce test', includeAI: false, includeSemanticSearch: false })
      );
    }

    const results = await Promise.all(requests);
    const last = results[20];
    expect(last.status).toBe(429);
    expect(last.body.message).toMatch(/AI request limit/i);
  }, 30000);

  it('11th request to POST /api/auth/login within window returns 429', async () => {
    const loginUser = {
      username: `ratelimit${Date.now()}`,
      email: `ratelimit${Date.now()}@example.com`,
      password: strongPassword,
    };
    await request(rateLimitApp).post('/api/auth/register').send(loginUser);

    const requests = [];
    for (let i = 0; i < 11; i++) {
      requests.push(
        request(rateLimitApp)
          .post('/api/auth/login')
          .send({ email: loginUser.email, password: 'WrongPass1!' })
      );
    }

    const results = await Promise.all(requests);
    const last = results[10];
    expect(last.status).toBe(429);
    expect(last.body.message).toMatch(/Too many login attempts/i);
  }, 30000);
});

describe('Snippet API Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
    await Snippet.deleteMany({});
    await User.deleteMany({});
    await SearchLog.deleteMany({});

    const auth = await registerAndLogin('main');
    authToken = auth.token;
  });

  afterAll(async () => {
    await Snippet.deleteMany({});
    await User.deleteMany({});
    await SearchLog.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('API is running');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/snippets', () => {
    it('should create a new snippet', async () => {
      const res = await request(app)
        .post('/api/snippets')
        .set('Authorization', `Bearer ${authToken}`)
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
      expect(res.body.data.average).toBe(4);
    });

    it('should fail with invalid rating', async () => {
      const res = await request(app)
        .post(`/api/snippets/${createdSnippetId}/rate`)
        .send({ rating: 10 });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/snippets/:id/favorite', () => {
    it('should add snippet to favorites', async () => {
      const res = await request(app)
        .post(`/api/snippets/${createdSnippetId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFavorited).toBe(true);
      expect(res.body.data.favoritesCount).toBe(1);
    });

    it('should remove snippet from favorites when toggled again', async () => {
      const res = await request(app)
        .post(`/api/snippets/${createdSnippetId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isFavorited).toBe(false);
      expect(res.body.data.favoritesCount).toBe(0);
    });
  });

  describe('POST /api/snippets/search', () => {
    it('should search snippets by query', async () => {
      const res = await request(app)
        .post('/api/snippets/search')
        .send({ query: 'debounce', includeAI: false, includeSemanticSearch: false });

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
        .send({ query: 'function', language: 'javascript', includeAI: false, includeSemanticSearch: false });

      expect(res.status).toBe(200);
      res.body.data.snippets.forEach((snippet) => {
        expect(snippet.language).toBe('javascript');
      });
    });
  });

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

  describe('GET /api/snippets/languages', () => {
    it('should return available languages', async () => {
      const res = await request(app).get('/api/snippets/languages');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/snippets/:id', () => {
    it('should soft delete a snippet', async () => {
      const res = await request(app)
        .delete(`/api/snippets/${createdSnippetId}`)
        .set('Authorization', `Bearer ${authToken}`);

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

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    const baseUser = () => ({
      username: `authuser${Date.now()}`,
      email: `auth${Date.now()}@example.com`,
      password: strongPassword,
    });

    it('registers successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(baseUser());

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('returns JWT token and user object on success', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(baseUser());

      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({
        id: expect.any(String),
        username: expect.any(String),
        email: expect.any(String),
      });
      expect(res.body.user.password).toBeUndefined();
    });

    it('rejects password without uppercase letter (400)', async () => {
      const user = baseUser();
      user.password = 'testpass1!';
      const res = await request(app).post('/api/auth/register').send(user);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('uppercase')])
      );
    });

    it('rejects password without number (400)', async () => {
      const user = baseUser();
      user.password = 'TestPass!!';
      const res = await request(app).post('/api/auth/register').send(user);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('number')])
      );
    });

    it('rejects password without special character (400)', async () => {
      const user = baseUser();
      user.password = 'TestPass12';
      const res = await request(app).post('/api/auth/register').send(user);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('special character')])
      );
    });

    it('rejects password under 8 characters (400)', async () => {
      const user = baseUser();
      user.password = 'Te1!';
      const res = await request(app).post('/api/auth/register').send(user);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('at least 8 characters')])
      );
    });

    it('rejects duplicate email with 409', async () => {
      const user = baseUser();
      await request(app).post('/api/auth/register').send(user);
      const res = await request(app).post('/api/auth/register').send({
        ...baseUser(),
        username: `other${Date.now()}`,
        email: user.email,
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email already registered');
    });

    it('rejects duplicate username with 409', async () => {
      const user = baseUser();
      await request(app).post('/api/auth/register').send(user);
      const res = await request(app).post('/api/auth/register').send({
        ...baseUser(),
        username: user.username,
        email: `other${Date.now()}@example.com`,
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Username already taken');
    });

    it('rejects missing required fields (422)', async () => {
      const res = await request(app).post('/api/auth/register').send({ username: 'onlyname' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let loginUser;

    beforeAll(async () => {
      loginUser = {
        username: `loginuser${Date.now()}`,
        email: `login${Date.now()}@example.com`,
        password: strongPassword,
      };
      await request(app).post('/api/auth/register').send(loginUser);
    });

    it('logs in successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: loginUser.email, password: loginUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns same JWT structure as register', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: loginUser.email, password: loginUser.password });

      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({
        id: expect.any(String),
        username: loginUser.username,
        email: loginUser.email,
      });
    });

    it('returns 401 for wrong password with generic message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: loginUser.email, password: 'WrongPass1!' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
      expect(res.body.message).not.toMatch(/wrong password/i);
    });

    it('returns 401 for non-existent email with generic message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: strongPassword });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('returns 422 for missing email or password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: loginUser.email });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let meToken;

    beforeAll(async () => {
      const auth = await registerAndLogin('me');
      meToken = auth.token;
    });

    it('returns user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${meToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBeDefined();
      expect(res.body.user.username).toBeDefined();
      expect(res.body.user.email).toBeDefined();
      expect(res.body.user.createdAt).toBeDefined();
    });

    it('returns 401 with no token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('returns 401 with malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-valid-jwt');

      expect(res.status).toBe(401);
    });

    it('returns 401 with expired token', async () => {
      const expired = jwt.sign(
        { id: new mongoose.Types.ObjectId().toString(), username: 'x', email: 'x@y.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );

      await new Promise((resolve) => setTimeout(resolve, 5));

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expired}`);

      expect(res.status).toBe(401);
    });
  });
});

describe('Snippet Ownership', () => {
  let userAToken;
  let userBToken;
  let userASnippetId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }

    const userA = await registerAndLogin('ownerA');
    const userB = await registerAndLogin('ownerB');
    userAToken = userA.token;
    userBToken = userB.token;

    const createRes = await request(app)
      .post('/api/snippets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send(testSnippet);

    userASnippetId = createRes.body.data._id;
  });

  it('authenticated user can update their own snippet', async () => {
    const res = await request(app)
      .put(`/api/snippets/${userASnippetId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });

  it('authenticated user gets 403 updating someone else\'s snippet', async () => {
    const res = await request(app)
      .put(`/api/snippets/${userASnippetId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Not authorized to edit this snippet');
  });

  it('authenticated user can delete their own snippet', async () => {
    const createRes = await request(app)
      .post('/api/snippets')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ ...testSnippet, title: 'To Delete' });

    const res = await request(app)
      .delete(`/api/snippets/${createRes.body.data._id}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
  });

  it('authenticated user gets 403 deleting someone else\'s snippet', async () => {
    const res = await request(app)
      .delete(`/api/snippets/${userASnippetId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(403);
  });

  it('unauthenticated user gets 401 attempting to update any snippet', async () => {
    const res = await request(app)
      .put(`/api/snippets/${userASnippetId}`)
      .send({ title: 'No Auth' });

    expect(res.status).toBe(401);
  });

  it('unauthenticated user gets 401 attempting to delete any snippet', async () => {
    const res = await request(app).delete(`/api/snippets/${userASnippetId}`);

    expect(res.status).toBe(401);
  });
});

describe('Concurrent Ratings', () => {
  let ratingSnippetId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }

    const res = await request(app)
      .post('/api/snippets')
      .send({
        ...testSnippet,
        title: 'Concurrent Rating Test',
      });

    ratingSnippetId = res.body.data._id;
  });

  it('handles 5 concurrent ratings correctly', async () => {
    const ratings = [1, 2, 3, 4, 5];
    await Promise.all(
      ratings.map((rating) =>
        request(app)
          .post(`/api/snippets/${ratingSnippetId}/rate`)
          .send({ rating })
      )
    );

    const snippetRes = await request(app).get(`/api/snippets/${ratingSnippetId}`);

    expect(snippetRes.body.data.ratings.count).toBe(5);
    expect(snippetRes.body.data.ratings.average).toBe(3);
  });
});

describe('Semantic Search', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }
  });

  it('search with includeSemanticSearch: true returns results array', async () => {
    const res = await request(app)
      .post('/api/snippets/search')
      .send({ query: 'debounce function', includeAI: false, includeSemanticSearch: true });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.snippets)).toBe(true);
  });

  it('search with includeSemanticSearch: false still returns results', async () => {
    const res = await request(app)
      .post('/api/snippets/search')
      .send({ query: 'debounce function', includeAI: false, includeSemanticSearch: false });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.snippets)).toBe(true);
  });

  it('embedding failure does not crash search', async () => {
    // GEMINI_API_KEY is not set in test env — embedding fails and search falls back to text-only
    const res = await request(app)
      .post('/api/snippets/search')
      .send({ query: 'debounce function', includeAI: false, includeSemanticSearch: true });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.snippets)).toBe(true);
  });
});

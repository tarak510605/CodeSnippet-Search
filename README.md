# Intelligent Code Snippet Search with AI

A full-stack application for searching and discovering code snippets using natural language queries, JWT authentication, semantic vector search, AI code generation, and search analytics.

## Features

- **JWT Authentication**: Register, login, and protected snippet ownership
- **Natural Language Search**: MongoDB text search with optional hybrid semantic ranking
- **Semantic Search**: Google Gemini `text-embedding-004` embeddings blended with text scores
- **AI Code Generator**: Generate snippets from descriptions via Groq (llama-3.3-70b-versatile)
- **AI-Powered Suggestions**: Search-time improvements and edge cases from Groq
- **Rating System**: Rate snippets with concurrent-safe aggregation
- **Favorites**: Authenticated users can favorite snippets
- **Search Analytics**: 7-day dashboards with top queries and AI usage rates
- **Rate Limiting**: API, AI, and auth endpoint protection

## Tech Stack

### Frontend
- React 18, Vite, Material UI, Axios, React Router, React Context API

### Backend
- Node.js, Express.js, MongoDB (Mongoose)
- Groq SDK (AI suggestions & code generation)
- Google Generative AI (embeddings)
- bcryptjs, jsonwebtoken, express-rate-limit

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key (optional, for AI features)
- Google Gemini API key (optional, for semantic search embeddings)
- JWT secret (required for server startup)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Seed Database

```bash
cd backend
npm run seed
```

### Embedding Migration (existing snippets)

After configuring `GEMINI_API_KEY`, generate embeddings for snippets created before semantic search was enabled:

```bash
cd backend
npm run embeddings
```

This processes snippets in batches of 10 with a 1-second delay between batches.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `GROQ_API_KEY` | No | Groq API key for AI search suggestions and code generation |
| `GEMINI_API_KEY` | No | Google Gemini API key for semantic search embeddings |
| `JWT_SECRET` | **Yes** | Long random string for signing JWTs (`openssl rand -base64 64`) |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `CORS_ORIGIN` | No | Allowed frontend origin in production |

Example `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/code_snippets
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here_make_it_long_random_and_secure
JWT_EXPIRES_IN=7d
```

## Password Requirements

Registration passwords must meet **all** of the following:

- At least **8 characters**
- At least one **uppercase** letter (A–Z)
- At least one **lowercase** letter (a–z)
- At least one **number** (0–9)
- At least one **special character** from: `!@#$%^&*()_+-=[]{}|;:,.<>?`

## API Documentation

Base URL: `http://localhost:5000/api`

### Auth

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "coder123",
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

**Success (201):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "username": "coder123", "email": "user@example.com" }
}
```

**Password validation error (400):**

```json
{
  "success": false,
  "message": "Password does not meet requirements",
  "errors": ["Password must be at least 8 characters", "..."]
}
```

#### Login

```http
POST /api/auth/login

{ "email": "user@example.com", "password": "SecurePass1!" }
```

#### Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Snippets

#### Search (with semantic + AI options)

```http
POST /api/snippets/search
Authorization: Bearer <token>   # optional

{
  "query": "debounce function javascript",
  "language": "javascript",
  "includeAI": false,
  "includeSemanticSearch": true,
  "page": 1,
  "limit": 10
}
```

#### Generate Code (not saved)

```http
POST /api/snippets/generate
Authorization: Bearer <token>   # optional

{
  "description": "a Python function that retries API calls with exponential backoff",
  "language": "python"
}
```

**Success:**

```json
{
  "success": true,
  "data": {
    "title": "...",
    "code": "...",
    "description": "...",
    "tags": ["retry", "api"],
    "language": "python"
  }
}
```

#### Create / Update / Delete

- `POST /api/snippets` — optional auth; sets `createdBy` when authenticated
- `PUT /api/snippets/:id` — requires auth + ownership
- `DELETE /api/snippets/:id` — requires auth + ownership

### Analytics

```http
GET /api/analytics/searches
```

**Response:**

```json
{
  "success": true,
  "data": {
    "topQueries": [{ "query": "debounce", "count": 12 }],
    "totalSearches": 45,
    "averageResults": 3.2,
    "searchesPerDay": [{ "date": "2026-05-24", "count": 8 }],
    "aiUsageRate": 0.35,
    "semanticUsageRate": 0.82
  }
}
```

## Testing

```bash
cd backend
JWT_SECRET=test-secret-for-ci-only-must-be-long-enough npm test
```

Set `TEST_MONGODB_URI` to point at a dedicated test database.

## Rate Limits

| Scope | Window | Max |
|-------|--------|-----|
| All `/api` routes | 15 min | 100 |
| `/api/snippets/search`, `/api/snippets/generate` | 15 min | 20 |
| `/api/auth/register`, `/api/auth/login` | 15 min | 10 |

## Supported Languages

JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, HTML, CSS, SQL, Bash, PowerShell, YAML, JSON, Markdown, Other

## License

MIT License

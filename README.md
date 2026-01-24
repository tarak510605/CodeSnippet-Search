# Intelligent Code Snippet Search with AI

A full-stack application for searching and discovering code snippets using natural language queries, powered by AI for intelligent suggestions and improvements.

![Code Snippet Search](https://via.placeholder.com/800x400?text=Code+Snippet+Search)

## Features

- 🔍 **Natural Language Search**: Search for code snippets using everyday language
- 🤖 **AI-Powered Suggestions**: Get intelligent recommendations, improvements, and edge cases from OpenAI
- ⭐ **Rating System**: Rate and discover highly-rated snippets
- ❤️ **Favorites**: Save snippets for quick access
- 🏷️ **Tags & Languages**: Filter by programming language and tags
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

### Frontend
- **React.js** (with Vite)
- **Material-UI (MUI)** for UI components
- **Axios** for API calls
- **React Syntax Highlighter** for code display

### Backend
- **Node.js** + **Express.js**
- **MongoDB** with **Mongoose**
- **Google Gemini API** for AI features
- **Express Validator** for input validation

## Project Structure

```
mern/
├── backend/
│   ├── src/
│   │   ├── config/           # Database & app configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (AI service)
│   │   ├── utils/            # Helper functions
│   │   ├── validators/       # Request validators
│   │   ├── scripts/          # Database seed script
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server entry point
│   ├── tests/                # API tests
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # Entry point
│   │   ├── theme.js          # MUI theme config
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Google Gemini API key (optional, for AI features)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mern
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# - MONGODB_URI: Your MongoDB connection string
# - GEMINI_API_KEY: Your Google Gemini API key (optional)
```

**Environment Variables:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/code_snippets
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Seed the Database

```bash
# From backend directory
npm run seed
```

This will populate the database with sample code snippets for testing.

### 4. Start the Backend Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The API will be available at `http://localhost:5000`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```

#### Search Snippets (with AI)
```http
POST /api/snippets/search

Body:
{
  "query": "debounce function javascript",
  "language": "javascript",      // optional
  "tags": ["utility"],           // optional
  "minRating": 3,                // optional
  "page": 1,                     // optional
  "limit": 10,                   // optional
  "sortBy": "score",             // score, rating, favorites, recent
  "includeAI": true              // optional, default: true
}

Response:
{
  "success": true,
  "message": "Found 5 snippets",
  "data": {
    "snippets": [...],
    "ai": {
      "available": true,
      "suggestions": {
        "summary": "...",
        "bestMatch": {...},
        "improvements": [...],
        "missingEdgeCases": [...],
        "alternativeApproaches": [...]
      }
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 5,
    "totalPages": 1
  }
}
```

#### Create Snippet
```http
POST /api/snippets

Body:
{
  "title": "My Snippet",
  "language": "javascript",
  "tags": ["utility", "helper"],
  "code": "function example() {...}",
  "description": "Description of what this code does",
  "author": "username"           // optional
}
```

#### Get All Snippets
```http
GET /api/snippets?page=1&limit=10&language=javascript&sortBy=recent
```

#### Get Snippet by ID
```http
GET /api/snippets/:id
```

#### Rate a Snippet
```http
POST /api/snippets/:id/rate

Body:
{
  "rating": 5    // 1-5
}
```

#### Toggle Favorite
```http
POST /api/snippets/:id/favorite

Body:
{
  "userId": "user123"    // optional
}
```

#### Get Popular Snippets
```http
GET /api/snippets/popular?limit=10
```

#### Get Available Languages
```http
GET /api/snippets/languages
```

## Testing

### Run Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

### Manual API Testing

You can use curl or tools like Postman:

```bash
# Health check
curl http://localhost:5000/api/health

# Search snippets
curl -X POST http://localhost:5000/api/snippets/search \
  -H "Content-Type: application/json" \
  -d '{"query": "debounce function", "includeAI": false}'

# Get popular snippets
curl http://localhost:5000/api/snippets/popular
```

## AI Integration

The application uses Google's Gemini 1.5 Flash model to provide intelligent suggestions. When AI is enabled during search:

1. **Database Search**: First, MongoDB text search finds relevant snippets
2. **AI Analysis**: Top results are sent to Gemini for analysis
3. **Smart Suggestions**: AI returns:
   - Best match recommendation
   - Improvement suggestions for each snippet
   - Missing edge cases to consider
   - Alternative approaches
   - Suggested new snippet if applicable

**Note**: AI features are optional. If `GEMINI_API_KEY` is not configured, the app functions normally without AI suggestions.

## Performance Optimizations

- **Text Indexes**: MongoDB text indexes on title, tags, description, and code fields with weighted scoring
- **Pagination**: All list endpoints support pagination to limit response size
- **Async/Await**: All database operations are async for non-blocking I/O
- **Request Validation**: Input validation prevents unnecessary database queries
- **Error Handling**: Centralized error handling for consistent error responses

## Supported Languages

JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, HTML, CSS, SQL, Bash, PowerShell, YAML, JSON, Markdown

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Material-UI](https://mui.com/) for the beautiful UI components
- [OpenAI](https://openai.com/) for AI capabilities
- [MongoDB](https://www.mongodb.com/) for the flexible document database
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) for code highlighting

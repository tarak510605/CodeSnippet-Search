/**
 * Snippet Controller
 * Handles all snippet-related HTTP requests
 */

import { Snippet } from '../models/index.js';
import { generateAISuggestions, generateCodeSnippet } from '../services/aiService.js';
import { generateEmbedding } from '../services/embeddingService.js';
import SearchLog from '../models/SearchLog.js';
import { asyncHandler, sendSuccess, sendPaginated, NotFoundError, BadRequestError, ForbiddenError, UnauthorizedError } from '../utils/index.js';
import { config } from '../config/index.js';

/**
 * @desc    Search snippets with AI suggestions
 * @route   POST /api/snippets/search
 * @access  Public
 */
export const searchSnippets = asyncHandler(async (req, res) => {
  const {
    query,
    language,
    tags,
    minRating,
    page = 1,
    limit = config.pagination.defaultLimit,
    sortBy = 'score',
    includeAI = true,
    includeSemanticSearch = true
  } = req.body;

  const startTime = Date.now();

  if (!query || query.trim().length === 0) {
    throw BadRequestError('Search query is required');
  }

  const sanitizedPage = Math.max(1, parseInt(page) || 1);
  const sanitizedLimit = Math.min(
    Math.max(1, parseInt(limit) || config.pagination.defaultLimit),
    config.pagination.maxLimit
  );

  const useSemanticSearch = includeSemanticSearch !== false;
  let queryEmbedding = null;

  if (useSemanticSearch) {
    try {
      queryEmbedding = await generateEmbedding(query.trim());
    } catch (embedErr) {
      console.warn('Query embedding failed, falling back to text-only search:', embedErr.message);
    }
  }

  const { results, pagination } = await Snippet.textSearch(query.trim(), {
    language,
    tags: tags ? (Array.isArray(tags) ? tags : [tags]) : null,
    minRating: parseFloat(minRating) || 0,
    page: sanitizedPage,
    limit: sanitizedLimit,
    sortBy,
    queryEmbedding,
    useSemanticSearch: useSemanticSearch && Boolean(queryEmbedding)
  });

  let aiSuggestions = null;
  if (includeAI) {
    aiSuggestions = await generateAISuggestions(query, results);
  }

  const responseTimeMs = Date.now() - startTime;

  SearchLog.create({
    query: query.trim(),
    language: language || null,
    resultCount: pagination.totalCount,
    usedAI: Boolean(includeAI),
    usedSemanticSearch: useSemanticSearch && Boolean(queryEmbedding),
    userId: req.user?.id || null,
    responseTimeMs
  }).catch((err) => console.warn('Failed to log search:', err.message));

  res.status(200).json({
    success: true,
    message: `Found ${pagination.totalCount} snippets`,
    data: {
      snippets: results,
      ai: aiSuggestions
    },
    pagination
  });
});

/**
 * @desc    Create a new snippet
 * @route   POST /api/snippets
 * @access  Public
 */
export const createSnippet = asyncHandler(async (req, res) => {
  const { title, language, tags, code, description, author } = req.body;

  const snippet = await Snippet.create({
    title,
    language: language.toLowerCase(),
    tags: tags || [],
    code,
    description,
    author: req.user?.username || author || 'anonymous',
    createdBy: req.user?.id || null
  });

  sendSuccess(res, snippet, 'Snippet created successfully', 201);

  const embeddingText = `${snippet.title} ${snippet.description} ${(snippet.tags || []).join(' ')} ${snippet.code.substring(0, 1000)}`;
  generateEmbedding(embeddingText)
    .then(async (embedding) => {
      await Snippet.findByIdAndUpdate(snippet._id, { embedding });
    })
    .catch((err) => {
      console.warn(`Embedding generation failed for snippet ${snippet._id}:`, err.message);
    });
});

/**
 * @desc    Get snippets saved by the authenticated user
 * @route   GET /api/snippets/mine
 * @access  Private
 */
export const getMySnippets = asyncHandler(async (req, res) => {
  if (!req.user?.id) {
    throw UnauthorizedError('Authentication required');
  }

  const {
    page = 1,
    limit = config.pagination.defaultLimit,
    language,
    sortBy = 'recent'
  } = req.query;

  const query = {
    isActive: true,
    createdBy: req.user.id
  };

  if (language) {
    query.language = language.toLowerCase();
  }

  let sort = { createdAt: -1 };
  switch (sortBy) {
    case 'rating':
      sort = { 'ratings.average': -1 };
      break;
    case 'favorites':
      sort = { favoritesCount: -1 };
      break;
    case 'recent':
    default:
      sort = { createdAt: -1 };
  }

  const sanitizedPage = Math.max(1, parseInt(page) || 1);
  const sanitizedLimit = Math.min(
    Math.max(1, parseInt(limit) || config.pagination.defaultLimit),
    config.pagination.maxLimit
  );
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  const [snippets, totalCount] = await Promise.all([
    Snippet.find(query).sort(sort).skip(skip).limit(sanitizedLimit).lean(),
    Snippet.countDocuments(query)
  ]);

  const pagination = {
    page: sanitizedPage,
    limit: sanitizedLimit,
    totalCount,
    totalPages: Math.ceil(totalCount / sanitizedLimit),
    hasNextPage: sanitizedPage * sanitizedLimit < totalCount,
    hasPrevPage: sanitizedPage > 1
  };

  sendPaginated(res, snippets, pagination, 'Your library retrieved successfully');
});

/**
 * @desc    Get all snippets with pagination
 * @route   GET /api/snippets
 * @access  Public
 */
export const getAllSnippets = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = config.pagination.defaultLimit,
    language,
    sortBy = 'recent' // 'recent', 'rating', 'favorites'
  } = req.query;

  // Build query
  const query = { isActive: true };
  if (language) {
    query.language = language.toLowerCase();
  }

  // Determine sort order
  let sort = {};
  switch (sortBy) {
    case 'rating':
      sort = { 'ratings.average': -1 };
      break;
    case 'favorites':
      sort = { favoritesCount: -1 };
      break;
    case 'recent':
    default:
      sort = { createdAt: -1 };
  }

  // Pagination
  const sanitizedPage = Math.max(1, parseInt(page) || 1);
  const sanitizedLimit = Math.min(
    Math.max(1, parseInt(limit) || config.pagination.defaultLimit),
    config.pagination.maxLimit
  );
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  // Execute query
  const [snippets, totalCount] = await Promise.all([
    Snippet.find(query).sort(sort).skip(skip).limit(sanitizedLimit).lean(),
    Snippet.countDocuments(query)
  ]);

  const pagination = {
    page: sanitizedPage,
    limit: sanitizedLimit,
    totalCount,
    totalPages: Math.ceil(totalCount / sanitizedLimit),
    hasNextPage: sanitizedPage * sanitizedLimit < totalCount,
    hasPrevPage: sanitizedPage > 1
  };

  sendPaginated(res, snippets, pagination, 'Snippets retrieved successfully');
});

/**
 * @desc    Get a single snippet by ID
 * @route   GET /api/snippets/:id
 * @access  Public
 */
export const getSnippetById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const snippet = await Snippet.findById(id);

  if (!snippet) {
    throw NotFoundError('Snippet not found');
  }

  sendSuccess(res, snippet, 'Snippet retrieved successfully');
});

/**
 * @desc    Rate a snippet
 * @route   POST /api/snippets/:id/rate
 * @access  Public
 */
export const rateSnippet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  // Validate rating value
  const ratingValue = parseFloat(rating);
  if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    throw BadRequestError('Rating must be a number between 1 and 5');
  }

  const snippet = await Snippet.findById(id).select('+ratings.values +ratings.ratedBy');

  if (!snippet) {
    throw NotFoundError('Snippet not found');
  }

  if (req.user?.id) {
    const userObjectId = req.user.id;
    if (snippet.ratings.ratedBy?.some((uid) => uid.toString() === userObjectId)) {
      throw BadRequestError('You have already rated this snippet');
    }
  }

  await snippet.addRating(ratingValue, req.user?.id || null);

  sendSuccess(res, {
    average: snippet.ratings.average,
    count: snippet.ratings.count
  }, 'Rating added successfully');
});

/**
 * @desc    Toggle favorite status for a snippet
 * @route   POST /api/snippets/:id/favorite
 * @access  Public
 */
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.user?.id) {
    throw UnauthorizedError('Authentication required');
  }

  const userId = req.user.id;

  // Find snippet with favoritedBy array
  const snippet = await Snippet.findById(id).select('+favoritedBy');

  if (!snippet) {
    throw NotFoundError('Snippet not found');
  }

  // Toggle the favorite
  const isFavorited = await snippet.toggleFavorite(userId);

  sendSuccess(res, {
    isFavorited,
    favoritesCount: snippet.favoritesCount
  }, isFavorited ? 'Added to favorites' : 'Removed from favorites');
});

/**
 * @desc    Update a snippet
 * @route   PUT /api/snippets/:id
 * @access  Public
 */
export const updateSnippet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, language, tags, code, description } = req.body;

  const snippet = await Snippet.findById(id);

  if (!snippet) {
    throw NotFoundError('Snippet not found');
  }

  if (!req.user?.id) {
    throw UnauthorizedError('Authentication required');
  }

  if (!snippet.createdBy || snippet.createdBy.toString() !== req.user.id) {
    throw ForbiddenError('Not authorized to edit this snippet');
  }

  // Update fields if provided
  if (title) snippet.title = title;
  if (language) snippet.language = language.toLowerCase();
  if (tags) snippet.tags = tags;
  if (code) snippet.code = code;
  if (description) snippet.description = description;

  await snippet.save();

  sendSuccess(res, snippet, 'Snippet updated successfully');
});

/**
 * @desc    Delete a snippet (soft delete)
 * @route   DELETE /api/snippets/:id
 * @access  Public
 */
export const deleteSnippet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const snippet = await Snippet.findById(id);

  if (!snippet) {
    throw NotFoundError('Snippet not found');
  }

  if (!req.user?.id) {
    throw UnauthorizedError('Authentication required');
  }

  if (!snippet.createdBy || snippet.createdBy.toString() !== req.user.id) {
    throw ForbiddenError('Not authorized to edit this snippet');
  }

  snippet.isActive = false;
  await snippet.save();

  sendSuccess(res, null, 'Snippet deleted successfully');
});

/**
 * @desc    Get popular snippets
 * @route   GET /api/snippets/popular
 * @access  Public
 */
export const getPopularSnippets = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const sanitizedLimit = Math.min(Math.max(1, parseInt(limit) || 10), 50);

  const snippets = await Snippet.getPopular(sanitizedLimit);

  sendSuccess(res, snippets, 'Popular snippets retrieved successfully');
});

/**
 * @desc    Get available languages
 * @route   GET /api/snippets/languages
 * @access  Public
 */
const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'html',
  'css', 'sql', 'bash', 'powershell', 'yaml', 'json', 'markdown', 'other'
];

/**
 * @desc    Generate a code snippet with AI (not saved)
 * @route   POST /api/snippets/generate
 * @access  Public (optional auth)
 */
export const generateSnippet = asyncHandler(async (req, res) => {
  const { description, language } = req.body;

  if (!description || description.trim().length < 10 || description.trim().length > 500) {
    throw BadRequestError('Description must be between 10 and 500 characters');
  }

  const lang = (language || 'javascript').toLowerCase();
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    throw BadRequestError(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }

  const result = await generateCodeSnippet(description.trim(), lang);

  if (!result.available) {
    return res.status(503).json({
      success: false,
      message: result.message || 'Code generation is not available'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      title: result.generated.title,
      code: result.generated.code,
      description: result.generated.description,
      tags: result.generated.tags || [],
      language: lang
    }
  });
});

export const getLanguages = asyncHandler(async (req, res) => {
  // Get distinct languages that have active snippets
  const languages = await Snippet.distinct('language', { isActive: true });

  sendSuccess(res, languages.sort(), 'Languages retrieved successfully');
});

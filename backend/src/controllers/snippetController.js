/**
 * Snippet Controller
 * Handles all snippet-related HTTP requests
 */

import { Snippet } from '../models/index.js';
import { generateAISuggestions } from '../services/aiService.js';
import { asyncHandler, sendSuccess, sendPaginated, NotFoundError, BadRequestError } from '../utils/index.js';
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
    includeAI = true
  } = req.body;

  // Validate that query is provided
  if (!query || query.trim().length === 0) {
    throw BadRequestError('Search query is required');
  }

  // Sanitize pagination values
  const sanitizedPage = Math.max(1, parseInt(page) || 1);
  const sanitizedLimit = Math.min(
    Math.max(1, parseInt(limit) || config.pagination.defaultLimit),
    config.pagination.maxLimit
  );

  // Perform MongoDB text search
  const { results, pagination } = await Snippet.textSearch(query.trim(), {
    language,
    tags: tags ? (Array.isArray(tags) ? tags : [tags]) : null,
    minRating: parseFloat(minRating) || 0,
    page: sanitizedPage,
    limit: sanitizedLimit,
    sortBy
  });

  // Generate AI suggestions if enabled and results exist
  let aiSuggestions = null;
  if (includeAI) {
    aiSuggestions = await generateAISuggestions(query, results);
  }

  // Return combined results
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

  // Create the snippet
  const snippet = await Snippet.create({
    title,
    language: language.toLowerCase(),
    tags: tags || [],
    code,
    description,
    author: author || 'anonymous'
  });

  sendSuccess(res, snippet, 'Snippet created successfully', 201);
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

  // Find snippet with ratings values
  const snippet = await Snippet.findById(id).select('+ratings.values');

  if (!snippet) {
    throw NotFoundError('Snippet not found');
  }

  // Add the rating
  await snippet.addRating(ratingValue);

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
  const { userId = `user_${Date.now()}` } = req.body; // In production, get from auth

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

  // Soft delete
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
export const getLanguages = asyncHandler(async (req, res) => {
  // Get distinct languages that have active snippets
  const languages = await Snippet.distinct('language', { isActive: true });

  sendSuccess(res, languages.sort(), 'Languages retrieved successfully');
});

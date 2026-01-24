/**
 * Snippet Routes
 * Defines all routes for snippet operations
 */

import { Router } from 'express';
import { validate } from '../middleware/index.js';
import {
  searchSnippets,
  createSnippet,
  getAllSnippets,
  getSnippetById,
  rateSnippet,
  toggleFavorite,
  updateSnippet,
  deleteSnippet,
  getPopularSnippets,
  getLanguages
} from '../controllers/index.js';
import {
  searchValidator,
  createSnippetValidator,
  rateValidator,
  favoriteValidator,
  idParamValidator,
  updateSnippetValidator,
  listQueryValidator
} from '../validators/index.js';

const router = Router();

// ============================================
// SEARCH ROUTES
// ============================================

/**
 * @route   POST /api/snippets/search
 * @desc    Search snippets with AI-powered suggestions
 */
router.post('/search', searchValidator, validate, searchSnippets);

// ============================================
// SPECIAL ROUTES (must come before /:id)
// ============================================

/**
 * @route   GET /api/snippets/popular
 * @desc    Get popular snippets
 */
router.get('/popular', getPopularSnippets);

/**
 * @route   GET /api/snippets/languages
 * @desc    Get list of available languages
 */
router.get('/languages', getLanguages);

// ============================================
// CRUD ROUTES
// ============================================

/**
 * @route   GET /api/snippets
 * @desc    Get all snippets with pagination
 */
router.get('/', listQueryValidator, validate, getAllSnippets);

/**
 * @route   POST /api/snippets
 * @desc    Create a new snippet
 */
router.post('/', createSnippetValidator, validate, createSnippet);

/**
 * @route   GET /api/snippets/:id
 * @desc    Get a single snippet by ID
 */
router.get('/:id', idParamValidator, validate, getSnippetById);

/**
 * @route   PUT /api/snippets/:id
 * @desc    Update a snippet
 */
router.put('/:id', updateSnippetValidator, validate, updateSnippet);

/**
 * @route   DELETE /api/snippets/:id
 * @desc    Delete a snippet (soft delete)
 */
router.delete('/:id', idParamValidator, validate, deleteSnippet);

// ============================================
// ACTION ROUTES
// ============================================

/**
 * @route   POST /api/snippets/:id/rate
 * @desc    Rate a snippet (1-5 stars)
 */
router.post('/:id/rate', rateValidator, validate, rateSnippet);

/**
 * @route   POST /api/snippets/:id/favorite
 * @desc    Toggle favorite status for a snippet
 */
router.post('/:id/favorite', favoriteValidator, validate, toggleFavorite);

export default router;

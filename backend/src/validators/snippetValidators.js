/**
 * Snippet Validators
 * Validation rules for snippet-related requests using express-validator
 */

import { body, param, query } from 'express-validator';

// List of supported programming languages
const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'html',
  'css', 'sql', 'bash', 'powershell', 'yaml', 'json', 'markdown', 'other'
];

/**
 * Validation rules for searching snippets
 */
export const searchValidator = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Search query must be between 2 and 500 characters'),
  
  body('language')
    .optional({ values: 'falsy' })
    .trim()
    .toLowerCase()
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
  
  body('tags')
    .optional({ values: 'falsy' })
    .custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value) && value.every(v => typeof v === 'string')) return true;
      throw new Error('Tags must be a string or array of strings');
    }),
  
  body('minRating')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),
  
  body('page')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  body('limit')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  body('sortBy')
    .optional({ values: 'falsy' })
    .isIn(['score', 'rating', 'favorites', 'recent'])
    .withMessage('Sort must be one of: score, rating, favorites, recent'),
  
  body('includeAI')
    .optional()
    .isBoolean()
    .withMessage('includeAI must be a boolean'),

  body('includeSemanticSearch')
    .optional()
    .isBoolean()
    .withMessage('includeSemanticSearch must be a boolean')
];

/**
 * Validation rules for creating a snippet
 */
export const createSnippetValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Programming language is required')
    .toLowerCase()
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with at most 10 items'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code content is required')
    .isLength({ min: 1, max: 50000 })
    .withMessage('Code must be between 1 and 50000 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters')
];

/**
 * Validation rules for rating a snippet
 */
export const rateValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid snippet ID'),
  
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

/**
 * Validation rules for favoriting a snippet
 */
export const favoriteValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid snippet ID'),
  
  body('userId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID must be between 1 and 100 characters')
];

/**
 * Validation rules for getting a snippet by ID
 */
export const idParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid snippet ID')
];

/**
 * Validation rules for updating a snippet
 */
export const updateSnippetValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid snippet ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('language')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with at most 10 items'),
  
  body('code')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Code must be between 1 and 50000 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
];

/**
 * Validation rules for query parameters in GET requests
 */
export const listQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('language')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
  
  query('sortBy')
    .optional()
    .isIn(['recent', 'rating', 'favorites'])
    .withMessage('Sort must be one of: recent, rating, favorites')
];

/**
 * Snippet Model
 * Defines the schema for code snippets with text search indexes
 */

import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema(
  {
    // Title of the code snippet
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    
    // Programming language of the snippet
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      trim: true,
      lowercase: true,
      enum: {
        values: [
          'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
          'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'html',
          'css', 'sql', 'bash', 'powershell', 'yaml', 'json', 'markdown', 'other'
        ],
        message: '{VALUE} is not a supported language'
      }
    },
    
    // Tags for categorization and search
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags'
      }
    },
    
    // The actual code content
    code: {
      type: String,
      required: [true, 'Code content is required'],
      maxlength: [50000, 'Code cannot exceed 50000 characters']
    },
    
    // Human-readable description of what the code does
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    
    // Rating system
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0,
        min: 0
      },
      // Store individual ratings for recalculation
      values: {
        type: [Number],
        default: [],
        select: false // Don't include in queries by default
      }
    },
    
    // Number of times this snippet was favorited
    favoritesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Users who favorited this snippet (for tracking)
    favoritedBy: {
      type: [String],
      default: [],
      select: false // Don't include in queries by default
    },
    
    // Author information (optional for future user system)
    author: {
      type: String,
      default: 'anonymous',
      trim: true
    },
    
    // Whether the snippet is active/visible
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================
// INDEXES
// ============================================

/**
 * Text index for full-text search across multiple fields
 * Weights determine the importance of each field in search ranking
 * Note: language_override prevents conflict with our 'language' field
 */
snippetSchema.index(
  {
    title: 'text',
    tags: 'text',
    description: 'text',
    code: 'text'
  },
  {
    weights: {
      title: 10,      // Title is most important
      tags: 8,        // Tags are very relevant
      description: 5, // Description is moderately important
      code: 2         // Code has lowest weight (but still searchable)
    },
    name: 'snippet_text_index',
    language_override: 'textSearchLanguage', // Avoid conflict with our 'language' field
    default_language: 'english'
  }
);

// Compound index for filtering by language and sorting by rating
snippetSchema.index({ language: 1, 'ratings.average': -1 });

// Index for sorting by favorites
snippetSchema.index({ favoritesCount: -1 });

// Index for filtering active snippets
snippetSchema.index({ isActive: 1 });

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Add a new rating and recalculate the average
 * @param {number} rating - Rating value (1-5)
 */
snippetSchema.methods.addRating = async function(rating) {
  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // Add the rating to values array
  this.ratings.values.push(rating);
  
  // Recalculate average
  const total = this.ratings.values.reduce((sum, val) => sum + val, 0);
  this.ratings.count = this.ratings.values.length;
  this.ratings.average = Math.round((total / this.ratings.count) * 10) / 10;
  
  return this.save();
};

/**
 * Toggle favorite status for a user
 * @param {string} userId - User identifier
 * @returns {boolean} - New favorite status
 */
snippetSchema.methods.toggleFavorite = async function(userId) {
  const index = this.favoritedBy.indexOf(userId);
  let isFavorited;
  
  if (index === -1) {
    // Add to favorites
    this.favoritedBy.push(userId);
    this.favoritesCount += 1;
    isFavorited = true;
  } else {
    // Remove from favorites
    this.favoritedBy.splice(index, 1);
    this.favoritesCount = Math.max(0, this.favoritesCount - 1);
    isFavorited = false;
  }
  
  await this.save();
  return isFavorited;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Perform a text search with optional filters
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} - Array of matching snippets
 */
snippetSchema.statics.textSearch = async function(query, options = {}) {
  const {
    language,
    tags,
    minRating = 0,
    page = 1,
    limit = 10,
    sortBy = 'score' // 'score', 'rating', 'favorites', 'recent'
  } = options;
  
  // List of supported languages for detection
  const supportedLanguages = [
    'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'html',
    'css', 'sql', 'bash', 'powershell', 'yaml', 'json', 'markdown'
  ];
  
  // Check if query is a language name (helps with stop word issues)
  const queryLower = query.toLowerCase().trim();
  const isLanguageQuery = supportedLanguages.includes(queryLower);
  
  // Build the search query
  let searchQuery;
  
  if (isLanguageQuery && !language) {
    // If the query is a language name, search by language field directly
    // This bypasses the text search stop word issue
    searchQuery = {
      $or: [
        { $text: { $search: query } },
        { language: queryLower }
      ],
      isActive: true
    };
  } else {
    // Standard text search
    searchQuery = {
      $text: { $search: query },
      isActive: true
    };
  }
  
  // Add optional filters
  if (language) {
    searchQuery.language = language.toLowerCase();
  }
  
  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }
  
  if (minRating > 0) {
    searchQuery['ratings.average'] = { $gte: minRating };
  }
  
  // Determine sort order
  let sortOptions = {};
  const useTextScore = !isLanguageQuery || language;
  
  switch (sortBy) {
    case 'rating':
      sortOptions = useTextScore 
        ? { 'ratings.average': -1, score: { $meta: 'textScore' } }
        : { 'ratings.average': -1 };
      break;
    case 'favorites':
      sortOptions = useTextScore
        ? { favoritesCount: -1, score: { $meta: 'textScore' } }
        : { favoritesCount: -1 };
      break;
    case 'recent':
      sortOptions = useTextScore
        ? { createdAt: -1, score: { $meta: 'textScore' } }
        : { createdAt: -1 };
      break;
    case 'score':
    default:
      sortOptions = useTextScore
        ? { score: { $meta: 'textScore' } }
        : { 'ratings.average': -1 };
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Execute the search query
  const projection = useTextScore ? { score: { $meta: 'textScore' } } : {};
  
  const [results, totalCount] = await Promise.all([
    this.find(searchQuery, projection)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(searchQuery)
  ]);
  
  return {
    results,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Get popular snippets based on ratings and favorites
 * @param {number} limit - Number of snippets to return
 * @returns {Promise<Array>} - Array of popular snippets
 */
snippetSchema.statics.getPopular = async function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'ratings.average': -1, favoritesCount: -1 })
    .limit(limit)
    .lean();
};

// ============================================
// PRE-SAVE HOOKS
// ============================================

/**
 * Normalize tags before saving
 */
snippetSchema.pre('save', function(next) {
  // Normalize tags: lowercase and remove duplicates
  if (this.tags && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.map(tag => tag.toLowerCase().trim()))];
  }
  next();
});

// Create and export the model
const Snippet = mongoose.model('Snippet', snippetSchema);

export default Snippet;

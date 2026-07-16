/**
 * SearchLog Model
 * Analytics for search queries with TTL auto-expiry
 */

import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: null
  },
  resultCount: {
    type: Number,
    default: 0
  },
  usedAI: {
    type: Boolean,
    default: false
  },
  usedSemanticSearch: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  responseTimeMs: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d'
  }
});

searchLogSchema.index({ query: 1 });

const SearchLog = mongoose.model('SearchLog', searchLogSchema);

export default SearchLog;

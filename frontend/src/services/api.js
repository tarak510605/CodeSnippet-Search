/**
 * API Service
 * Centralized API client using Axios
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('❌ Response Error:', errorMessage);
    return Promise.reject(error);
  }
);

/**
 * Snippet API endpoints
 */
export const snippetApi = {
  /**
   * Search snippets with AI suggestions
   * @param {Object} params - Search parameters
   * @returns {Promise} API response
   */
  search: async (params) => {
    const response = await api.post('/snippets/search', params);
    return response.data;
  },

  /**
   * Get all snippets with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getAll: async (params = {}) => {
    const response = await api.get('/snippets', { params });
    return response.data;
  },

  getMyLibrary: async (params = {}) => {
    const response = await api.get('/snippets/mine', { params });
    return response.data;
  },

  /**
   * Get a single snippet by ID
   * @param {string} id - Snippet ID
   * @returns {Promise} API response
   */
  getById: async (id) => {
    const response = await api.get(`/snippets/${id}`);
    return response.data;
  },

  /**
   * Create a new snippet
   * @param {Object} snippet - Snippet data
   * @returns {Promise} API response
   */
  create: async (snippet) => {
    const response = await api.post('/snippets', snippet);
    return response.data;
  },

  /**
   * Rate a snippet
   * @param {string} id - Snippet ID
   * @param {number} rating - Rating value (1-5)
   * @returns {Promise} API response
   */
  rate: async (id, rating) => {
    const response = await api.post(`/snippets/${id}/rate`, { rating });
    return response.data;
  },

  /**
   * Toggle favorite status
   * @param {string} id - Snippet ID
   * @param {string} userId - User identifier
   * @returns {Promise} API response
   */
  toggleFavorite: async (id, userId) => {
    const response = await api.post(`/snippets/${id}/favorite`, { userId });
    return response.data;
  },

  /**
   * Get popular snippets
   * @param {number} limit - Number of snippets to return
   * @returns {Promise} API response
   */
  getPopular: async (limit = 10) => {
    const response = await api.get('/snippets/popular', { params: { limit } });
    return response.data;
  },

  /**
   * Get available languages
   * @returns {Promise} API response
   */
  getLanguages: async () => {
    const response = await api.get('/snippets/languages');
    return response.data;
  },

  generate: async (description, language) => {
    const response = await api.post('/snippets/generate', { description, language });
    return response.data;
  },
};

export const analyticsApi = {
  getSearches: async () => {
    const response = await api.get('/analytics/searches');
    return response.data;
  },
};

export const authApi = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;

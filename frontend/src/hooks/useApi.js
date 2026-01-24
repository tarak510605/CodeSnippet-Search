/**
 * Custom hook for API data fetching
 * Handles loading, error states, and data management
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Generic hook for API calls with state management
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Hook options
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export function useApi(apiFunction, options = {}) {
  const {
    immediate = false,
    initialData = null,
    onSuccess = null,
    onError = null,
    params = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  const mountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      
      if (mountedRef.current) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      
      if (mountedRef.current) {
        setError(errorMessage);
        setLoading(false);
        onError?.(errorMessage);
      }
      
      throw err;
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate && params !== null) {
      execute(params);
    } else if (immediate) {
      execute();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook for search functionality with debouncing
 * @param {Function} searchFunction - The search API function
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Object} - Search state and functions
 */
export function useSearch(searchFunction, debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const timeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const search = useCallback(async (searchParams) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const result = await searchFunction(searchParams);
      setResults(result);
      setLoading(false);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        const errorMessage = err.response?.data?.message || err.message || 'Search failed';
        setError(errorMessage);
        setLoading(false);
      }
      throw err;
    }
  }, [searchFunction]);

  const debouncedSearch = useCallback((searchParams) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      search(searchParams);
    }, debounceMs);
  }, [search, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setLoading(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    debouncedSearch,
    clearSearch,
  };
}

export default useApi;

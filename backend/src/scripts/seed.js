/**
 * Database Seed Script
 * Populates the database with sample code snippets for testing
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Snippet } from '../models/index.js';

// Load environment variables
dotenv.config();

// Sample code snippets covering various languages and use cases
const sampleSnippets = [
  // JavaScript snippets
  {
    title: 'Debounce Function Implementation',
    language: 'javascript',
    tags: ['utility', 'performance', 'events', 'optimization'],
    code: `/**
 * Creates a debounced version of a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @param {boolean} immediate - Whether to trigger on leading edge
 * @returns {Function} - The debounced function
 */
function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

// Usage example
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);`,
    description: 'A reusable debounce function that limits how often a function can fire. Perfect for search inputs, window resize handlers, and scroll events. Includes optional immediate execution on the leading edge.',
    author: 'seed-script',
    ratings: { average: 4.8, count: 25, values: Array(25).fill(5).map((_, i) => i % 3 === 0 ? 4 : 5) },
    favoritesCount: 150
  },
  {
    title: 'Deep Clone Object',
    language: 'javascript',
    tags: ['utility', 'object', 'clone', 'deep-copy'],
    code: `/**
 * Deep clones an object or array
 * Handles nested objects, arrays, dates, and regular expressions
 * @param {*} obj - The value to clone
 * @returns {*} - The cloned value
 */
function deepClone(obj) {
  // Handle null, undefined, and primitives
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  
  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  // Handle Object
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// Usage
const original = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
const clone = deepClone(original);`,
    description: 'A comprehensive deep clone function that properly handles nested objects, arrays, Date objects, and RegExp. Unlike JSON.parse(JSON.stringify()), this preserves Date and RegExp instances.',
    author: 'seed-script',
    ratings: { average: 4.5, count: 18, values: Array(18).fill(5).map((_, i) => i % 4 === 0 ? 4 : 5) },
    favoritesCount: 89
  },
  {
    title: 'Promise Retry with Exponential Backoff',
    language: 'javascript',
    tags: ['async', 'promise', 'retry', 'error-handling', 'api'],
    code: `/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - The result of the function
 */
async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    onRetry = null
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(factor, attempt),
        maxDelay
      );
      
      // Add jitter (±10%)
      const jitter = delay * 0.1 * (Math.random() * 2 - 1);
      const actualDelay = delay + jitter;
      
      if (onRetry) {
        onRetry({ attempt, delay: actualDelay, error });
      }
      
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }
  
  throw lastError;
}

// Usage
const fetchData = () => retryWithBackoff(
  () => fetch('/api/data').then(r => r.json()),
  { 
    maxRetries: 5,
    onRetry: ({ attempt }) => console.log(\`Retry attempt \${attempt}\`)
  }
);`,
    description: 'Robust retry mechanism for async operations with exponential backoff and jitter. Essential for API calls that may fail due to network issues or rate limiting.',
    author: 'seed-script',
    ratings: { average: 4.9, count: 32, values: Array(32).fill(5) },
    favoritesCount: 210
  },

  // TypeScript snippets
  {
    title: 'Type-Safe Event Emitter',
    language: 'typescript',
    tags: ['events', 'type-safe', 'generics', 'design-pattern'],
    code: `/**
 * Type-safe event emitter with full TypeScript support
 */
type EventHandler<T = any> = (data: T) => void;

interface EventMap {
  [event: string]: any;
}

class TypedEventEmitter<Events extends EventMap> {
  private listeners: {
    [K in keyof Events]?: Set<EventHandler<Events[K]>>;
  } = {};

  on<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(handler);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): void {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners[event]?.forEach(handler => handler(data));
  }

  once<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): void {
    const onceHandler: EventHandler<Events[K]> = (data) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }
}

// Usage with type safety
interface AppEvents {
  userLogin: { userId: string; timestamp: Date };
  userLogout: { userId: string };
  error: Error;
}

const emitter = new TypedEventEmitter<AppEvents>();

// TypeScript ensures correct event names and data types
emitter.on('userLogin', ({ userId, timestamp }) => {
  console.log(\`User \${userId} logged in at \${timestamp}\`);
});`,
    description: 'A fully type-safe event emitter implementation using TypeScript generics. Provides compile-time checking for event names and payload types.',
    author: 'seed-script',
    ratings: { average: 4.7, count: 15, values: Array(15).fill(5).map((_, i) => i % 5 === 0 ? 4 : 5) },
    favoritesCount: 78
  },
  {
    title: 'Generic API Response Handler',
    language: 'typescript',
    tags: ['api', 'generics', 'error-handling', 'http'],
    code: `/**
 * Generic API response types and handler
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

type Result<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Wraps fetch with type-safe error handling
 */
async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<Result<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: \`HTTP_\${response.status}\`,
          message: json.message || response.statusText,
          details: json.errors,
        },
      };
    }

    return { success: true, data: json as T };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Usage
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string) {
  const result = await apiRequest<User>(\`/api/users/\${id}\`);
  
  if (result.success) {
    console.log(result.data.name); // Fully typed!
  } else {
    console.error(result.error.message);
  }
}`,
    description: 'Type-safe API request wrapper with discriminated union return type. Eliminates null checks and provides exhaustive error handling.',
    author: 'seed-script',
    ratings: { average: 4.6, count: 22, values: Array(22).fill(5).map((_, i) => i % 3 === 0 ? 4 : 5) },
    favoritesCount: 134
  },

  // Python snippets
  {
    title: 'Async Rate Limiter Decorator',
    language: 'python',
    tags: ['async', 'decorator', 'rate-limiting', 'asyncio'],
    code: `"""
Async rate limiter decorator with token bucket algorithm
"""
import asyncio
import time
from functools import wraps
from typing import Callable, TypeVar, ParamSpec

P = ParamSpec('P')
T = TypeVar('T')

class RateLimiter:
    """Token bucket rate limiter for async functions."""
    
    def __init__(self, rate: float, burst: int = 1):
        """
        Initialize rate limiter.
        
        Args:
            rate: Number of tokens per second
            burst: Maximum number of tokens (bucket size)
        """
        self.rate = rate
        self.burst = burst
        self.tokens = burst
        self.last_update = time.monotonic()
        self._lock = asyncio.Lock()
    
    async def acquire(self) -> None:
        """Wait until a token is available."""
        async with self._lock:
            while True:
                now = time.monotonic()
                elapsed = now - self.last_update
                self.tokens = min(
                    self.burst,
                    self.tokens + elapsed * self.rate
                )
                self.last_update = now
                
                if self.tokens >= 1:
                    self.tokens -= 1
                    return
                
                # Wait for next token
                wait_time = (1 - self.tokens) / self.rate
                await asyncio.sleep(wait_time)

def rate_limit(rate: float, burst: int = 1) -> Callable:
    """
    Decorator to rate limit async functions.
    
    Usage:
        @rate_limit(rate=10, burst=5)  # 10 req/sec, burst of 5
        async def fetch_data(url: str) -> dict:
            ...
    """
    limiter = RateLimiter(rate, burst)
    
    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            await limiter.acquire()
            return await func(*args, **kwargs)
        return wrapper
    
    return decorator

# Usage example
@rate_limit(rate=5, burst=2)  # 5 requests per second, burst of 2
async def call_api(endpoint: str) -> dict:
    print(f"Calling {endpoint} at {time.time():.2f}")
    await asyncio.sleep(0.1)  # Simulate API call
    return {"status": "ok"}

# Run example
async def main():
    tasks = [call_api(f"/api/{i}") for i in range(10)]
    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())`,
    description: 'Production-ready async rate limiter using the token bucket algorithm. Perfect for API clients that need to respect rate limits.',
    author: 'seed-script',
    ratings: { average: 4.8, count: 28, values: Array(28).fill(5).map((_, i) => i % 4 === 0 ? 4 : 5) },
    favoritesCount: 167
  },
  {
    title: 'Context Manager for Database Transactions',
    language: 'python',
    tags: ['database', 'context-manager', 'transactions', 'sqlalchemy'],
    code: `"""
Database transaction context manager with automatic rollback
"""
from contextlib import contextmanager
from typing import Generator, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

class TransactionManager:
    """Manages database transactions with automatic rollback."""
    
    def __init__(self, session_factory):
        """
        Initialize with a session factory.
        
        Args:
            session_factory: Callable that returns a new Session
        """
        self.session_factory = session_factory
    
    @contextmanager
    def transaction(self) -> Generator[Session, None, None]:
        """
        Context manager for database transactions.
        
        Automatically commits on success, rolls back on error.
        
        Usage:
            with tx_manager.transaction() as session:
                user = User(name="John")
                session.add(user)
                # Auto-commits if no exception
        """
        session: Session = self.session_factory()
        try:
            yield session
            session.commit()
            logger.debug("Transaction committed successfully")
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Transaction rolled back: {e}")
            raise
        except Exception as e:
            session.rollback()
            logger.error(f"Unexpected error, rolling back: {e}")
            raise
        finally:
            session.close()
    
    @contextmanager
    def nested_transaction(
        self, 
        session: Session
    ) -> Generator[Session, None, None]:
        """
        Nested transaction using savepoints.
        
        Usage:
            with tx_manager.transaction() as session:
                # Outer transaction
                with tx_manager.nested_transaction(session):
                    # Inner transaction with savepoint
                    pass
        """
        savepoint = session.begin_nested()
        try:
            yield session
            savepoint.commit()
        except Exception:
            savepoint.rollback()
            raise

# Usage example
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("sqlite:///app.db")
SessionFactory = sessionmaker(bind=engine)
tx_manager = TransactionManager(SessionFactory)

def create_user(name: str, email: str) -> dict:
    """Create a user within a transaction."""
    with tx_manager.transaction() as session:
        # All operations in this block are transactional
        user = User(name=name, email=email)
        session.add(user)
        profile = Profile(user=user)
        session.add(profile)
        return {"id": user.id, "name": user.name}`,
    description: 'Robust database transaction management using context managers. Provides automatic commit/rollback and supports nested transactions with savepoints.',
    author: 'seed-script',
    ratings: { average: 4.7, count: 19, values: Array(19).fill(5).map((_, i) => i % 3 === 0 ? 4 : 5) },
    favoritesCount: 95
  },
  {
    title: 'Recursive Dict Merge',
    language: 'python',
    tags: ['utility', 'dictionary', 'recursive', 'merge'],
    code: `"""
Deep merge dictionaries recursively
"""
from typing import Any, Dict
from copy import deepcopy

def deep_merge(
    base: Dict[str, Any],
    override: Dict[str, Any],
    *,
    in_place: bool = False
) -> Dict[str, Any]:
    """
    Recursively merge two dictionaries.
    
    Values from 'override' take precedence over 'base'.
    Nested dictionaries are merged recursively.
    
    Args:
        base: The base dictionary
        override: Dictionary with override values
        in_place: If True, modifies base dict. If False, returns new dict.
    
    Returns:
        Merged dictionary
    
    Example:
        >>> base = {'a': 1, 'b': {'c': 2, 'd': 3}}
        >>> override = {'b': {'c': 4, 'e': 5}, 'f': 6}
        >>> deep_merge(base, override)
        {'a': 1, 'b': {'c': 4, 'd': 3, 'e': 5}, 'f': 6}
    """
    if not in_place:
        base = deepcopy(base)
    
    for key, value in override.items():
        if (
            key in base
            and isinstance(base[key], dict)
            and isinstance(value, dict)
        ):
            # Recursively merge nested dicts
            deep_merge(base[key], value, in_place=True)
        else:
            # Override the value
            base[key] = deepcopy(value) if not in_place else value
    
    return base

def deep_merge_many(*dicts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge multiple dictionaries from left to right.
    
    Later dictionaries take precedence.
    
    Example:
        >>> deep_merge_many({'a': 1}, {'b': 2}, {'a': 3})
        {'a': 3, 'b': 2}
    """
    if not dicts:
        return {}
    
    result = {}
    for d in dicts:
        result = deep_merge(result, d, in_place=True)
    
    return result

# Usage
config_defaults = {
    'database': {
        'host': 'localhost',
        'port': 5432,
        'options': {'ssl': False, 'timeout': 30}
    },
    'cache': {'enabled': True}
}

config_production = {
    'database': {
        'host': 'prod-db.example.com',
        'options': {'ssl': True}
    }
}

final_config = deep_merge(config_defaults, config_production)
# Result: nested dicts merged, prod values override defaults`,
    description: 'Deep merge utility for dictionaries with support for nested structures. Perfect for merging configuration objects or API response data.',
    author: 'seed-script',
    ratings: { average: 4.4, count: 14, values: Array(14).fill(4).map((_, i) => i % 2 === 0 ? 5 : 4) },
    favoritesCount: 62
  },

  // React/JSX snippets
  {
    title: 'Custom React Hook for API Calls',
    language: 'javascript',
    tags: ['react', 'hooks', 'api', 'state-management'],
    code: `import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for handling API calls with loading/error states
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options and hook configuration
 */
function useApi(url, options = {}) {
  const {
    immediate = true,     // Fetch on mount
    initialData = null,   // Initial data value
    onSuccess = null,     // Success callback
    onError = null,       // Error callback
    ...fetchOptions
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (overrideUrl, overrideOptions = {}) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(overrideUrl || url, {
        ...fetchOptions,
        ...overrideOptions,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const result = await response.json();

      if (mountedRef.current) {
        setData(result);
        setLoading(false);
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
        onError?.(err);
      }
      
      throw err;
    }
  }, [url, fetchOptions, onSuccess, onError]);

  // Refetch function
  const refetch = useCallback(() => execute(), [execute]);

  // Reset state
  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  // Fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
  };
}

// Usage Example
function UserProfile({ userId }) {
  const { data: user, loading, error, refetch } = useApi(
    \`/api/users/\${userId}\`,
    {
      onSuccess: (user) => console.log('Loaded:', user.name),
      onError: (err) => console.error('Failed:', err.message),
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message} <button onClick={refetch}>Retry</button></div>;
  
  return <div>Welcome, {user?.name}!</div>;
}

export default useApi;`,
    description: 'Production-ready React hook for API calls with automatic loading states, error handling, request cancellation, and cleanup on unmount.',
    author: 'seed-script',
    ratings: { average: 4.9, count: 45, values: Array(45).fill(5) },
    favoritesCount: 320
  },
  {
    title: 'Intersection Observer Hook for Lazy Loading',
    language: 'javascript',
    tags: ['react', 'hooks', 'performance', 'lazy-loading', 'intersection-observer'],
    code: `import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Intersection Observer API
 * Perfect for lazy loading, infinite scroll, and animations
 */
function useIntersectionObserver(options = {}) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);
  const frozen = useRef(false);

  const updateEntry = useCallback(([entry]) => {
    setEntry(entry);
    setIsIntersecting(entry.isIntersecting);
    
    // Freeze if element became visible and freezeOnceVisible is true
    if (freezeOnceVisible && entry.isIntersecting) {
      frozen.current = true;
    }
  }, [freezeOnceVisible]);

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) {
      return;
    }

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin, updateEntry]);

  return { ref: elementRef, entry, isIntersecting };
}

// Lazy Image Component using the hook
function LazyImage({ src, alt, className, placeholder = '/placeholder.png' }) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  });
  
  const [loaded, setLoaded] = useState(false);

  return (
    <div ref={ref} className={className}>
      <img
        src={isIntersecting ? src : placeholder}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </div>
  );
}

// Infinite Scroll Component
function InfiniteList({ items, loadMore, hasMore }) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && hasMore) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loadMore]);

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
      <div ref={ref}>
        {hasMore ? 'Loading more...' : 'End of list'}
      </div>
    </div>
  );
}

export { useIntersectionObserver, LazyImage, InfiniteList };`,
    description: 'Versatile Intersection Observer hook with examples for lazy loading images and infinite scroll. Includes freeze-on-visible feature to prevent re-triggers.',
    author: 'seed-script',
    ratings: { average: 4.8, count: 36, values: Array(36).fill(5).map((_, i) => i % 6 === 0 ? 4 : 5) },
    favoritesCount: 245
  },

  // Go snippets
  {
    title: 'Concurrent Worker Pool',
    language: 'go',
    tags: ['concurrency', 'goroutines', 'channels', 'worker-pool'],
    code: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// Job represents a unit of work
type Job struct {
	ID   int
	Data interface{}
}

// Result represents the outcome of processing a job
type Result struct {
	JobID int
	Data  interface{}
	Err   error
}

// WorkerPool manages a pool of concurrent workers
type WorkerPool struct {
	workerCount int
	jobs        chan Job
	results     chan Result
	wg          sync.WaitGroup
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(workerCount, jobBufferSize int) *WorkerPool {
	return &WorkerPool{
		workerCount: workerCount,
		jobs:        make(chan Job, jobBufferSize),
		results:     make(chan Result, jobBufferSize),
	}
}

// Start initializes and starts all workers
func (wp *WorkerPool) Start(ctx context.Context, processor func(Job) Result) {
	for i := 0; i < wp.workerCount; i++ {
		wp.wg.Add(1)
		go wp.worker(ctx, i, processor)
	}
}

// worker processes jobs from the jobs channel
func (wp *WorkerPool) worker(ctx context.Context, id int, processor func(Job) Result) {
	defer wp.wg.Done()

	for {
		select {
		case <-ctx.Done():
			fmt.Printf("Worker %d: shutting down\\n", id)
			return
		case job, ok := <-wp.jobs:
			if !ok {
				fmt.Printf("Worker %d: jobs channel closed\\n", id)
				return
			}
			result := processor(job)
			wp.results <- result
		}
	}
}

// Submit adds a job to the queue
func (wp *WorkerPool) Submit(job Job) {
	wp.jobs <- job
}

// Results returns the results channel
func (wp *WorkerPool) Results() <-chan Result {
	return wp.results
}

// Close shuts down the worker pool
func (wp *WorkerPool) Close() {
	close(wp.jobs)
	wp.wg.Wait()
	close(wp.results)
}

// Example usage
func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Create pool with 5 workers
	pool := NewWorkerPool(5, 100)

	// Define job processor
	processor := func(job Job) Result {
		// Simulate work
		time.Sleep(100 * time.Millisecond)
		return Result{
			JobID: job.ID,
			Data:  fmt.Sprintf("Processed: %v", job.Data),
			Err:   nil,
		}
	}

	// Start workers
	pool.Start(ctx, processor)

	// Submit jobs
	go func() {
		for i := 0; i < 20; i++ {
			pool.Submit(Job{ID: i, Data: fmt.Sprintf("Task %d", i)})
		}
		pool.Close()
	}()

	// Collect results
	for result := range pool.Results() {
		if result.Err != nil {
			fmt.Printf("Job %d failed: %v\\n", result.JobID, result.Err)
		} else {
			fmt.Printf("Job %d: %v\\n", result.JobID, result.Data)
		}
	}
}`,
    description: 'Production-ready worker pool implementation in Go using channels and goroutines. Supports graceful shutdown via context and buffered job queues.',
    author: 'seed-script',
    ratings: { average: 4.9, count: 27, values: Array(27).fill(5) },
    favoritesCount: 189
  },

  // SQL snippets
  {
    title: 'Window Functions for Running Totals',
    language: 'sql',
    tags: ['window-functions', 'analytics', 'aggregation', 'postgresql'],
    code: `-- Running totals and moving averages using window functions

-- Sample: Sales data with running total
SELECT 
    order_date,
    customer_id,
    amount,
    -- Running total per customer
    SUM(amount) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total,
    -- 7-day moving average
    AVG(amount) OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7d,
    -- Rank within customer orders
    ROW_NUMBER() OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
    ) AS order_number,
    -- Percentage of customer's total spend
    ROUND(
        amount * 100.0 / SUM(amount) OVER (PARTITION BY customer_id),
        2
    ) AS pct_of_total
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY customer_id, order_date;

-- Year-over-year comparison
WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', order_date) AS month,
        SUM(amount) AS total_sales
    FROM orders
    GROUP BY DATE_TRUNC('month', order_date)
)
SELECT 
    month,
    total_sales,
    LAG(total_sales, 12) OVER (ORDER BY month) AS sales_last_year,
    ROUND(
        (total_sales - LAG(total_sales, 12) OVER (ORDER BY month)) * 100.0 
        / NULLIF(LAG(total_sales, 12) OVER (ORDER BY month), 0),
        2
    ) AS yoy_growth_pct
FROM monthly_sales
ORDER BY month;

-- Top N per group (e.g., top 3 products per category)
WITH ranked_products AS (
    SELECT 
        category,
        product_name,
        total_sales,
        DENSE_RANK() OVER (
            PARTITION BY category 
            ORDER BY total_sales DESC
        ) AS rank
    FROM product_sales
)
SELECT * FROM ranked_products WHERE rank <= 3;`,
    description: 'Comprehensive examples of SQL window functions including running totals, moving averages, YoY comparisons, and ranking within groups.',
    author: 'seed-script',
    ratings: { average: 4.7, count: 31, values: Array(31).fill(5).map((_, i) => i % 4 === 0 ? 4 : 5) },
    favoritesCount: 156
  },

  // Rust snippet
  {
    title: 'Error Handling with Custom Error Types',
    language: 'rust',
    tags: ['error-handling', 'result', 'thiserror', 'anyhow'],
    code: `//! Custom error handling pattern in Rust
//! Using thiserror for library code and anyhow for applications

use std::io;
use thiserror::Error;

/// Custom error type for the application
#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] DatabaseError),
    
    #[error("Validation error: {message}")]
    Validation { message: String, field: String },
    
    #[error("Not found: {resource} with id {id}")]
    NotFound { resource: &'static str, id: String },
    
    #[error("IO error: {0}")]
    Io(#[from] io::Error),
    
    #[error("Unauthorized: {0}")]
    Unauthorized(String),
}

/// Database-specific errors
#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Connection failed: {0}")]
    ConnectionFailed(String),
    
    #[error("Query failed: {0}")]
    QueryFailed(String),
    
    #[error("Constraint violation: {0}")]
    ConstraintViolation(String),
}

/// Result type alias for convenience
pub type AppResult<T> = Result<T, AppError>;

/// Example user service using custom errors
pub struct UserService;

impl UserService {
    pub fn find_by_id(id: &str) -> AppResult<User> {
        // Simulated database lookup
        if id.is_empty() {
            return Err(AppError::Validation {
                message: "ID cannot be empty".to_string(),
                field: "id".to_string(),
            });
        }
        
        // Simulate not found
        if id == "0" {
            return Err(AppError::NotFound {
                resource: "User",
                id: id.to_string(),
            });
        }
        
        Ok(User {
            id: id.to_string(),
            name: "John Doe".to_string(),
        })
    }
    
    pub fn create(name: &str) -> AppResult<User> {
        if name.len() < 2 {
            return Err(AppError::Validation {
                message: "Name must be at least 2 characters".to_string(),
                field: "name".to_string(),
            });
        }
        
        Ok(User {
            id: uuid::Uuid::new_v4().to_string(),
            name: name.to_string(),
        })
    }
}

pub struct User {
    pub id: String,
    pub name: String,
}

// Usage in main with anyhow for easy error handling
fn main() -> anyhow::Result<()> {
    let user = UserService::find_by_id("123")
        .map_err(|e| anyhow::anyhow!("Failed to find user: {}", e))?;
    
    println!("Found user: {}", user.name);
    
    // Pattern matching on specific errors
    match UserService::find_by_id("0") {
        Ok(u) => println!("User: {}", u.name),
        Err(AppError::NotFound { resource, id }) => {
            println!("{} with id {} not found", resource, id);
        }
        Err(e) => return Err(e.into()),
    }
    
    Ok(())
}`,
    description: 'Idiomatic Rust error handling using thiserror for custom error types. Shows how to create error hierarchies and use the ? operator effectively.',
    author: 'seed-script',
    ratings: { average: 4.8, count: 21, values: Array(21).fill(5).map((_, i) => i % 5 === 0 ? 4 : 5) },
    favoritesCount: 112
  },

  // Bash script
  {
    title: 'Safe Bash Script Template',
    language: 'bash',
    tags: ['bash', 'scripting', 'template', 'best-practices'],
    code: `#!/usr/bin/env bash
#
# Safe Bash Script Template
# Follows best practices for error handling and safety
#

# Exit on error, undefined variables, and pipe failures
set -euo pipefail
IFS=$'\\n\\t'

# Script metadata
readonly SCRIPT_NAME="$(basename "\${BASH_SOURCE[0]}")"
readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_VERSION="1.0.0"

# Colors for output (only if terminal supports it)
if [[ -t 1 ]]; then
    readonly RED='\\033[0;31m'
    readonly GREEN='\\033[0;32m'
    readonly YELLOW='\\033[1;33m'
    readonly NC='\\033[0m' # No Color
else
    readonly RED=''
    readonly GREEN=''
    readonly YELLOW=''
    readonly NC=''
fi

# Logging functions
log_info()    { echo -e "\${GREEN}[INFO]\${NC} $*"; }
log_warn()    { echo -e "\${YELLOW}[WARN]\${NC} $*" >&2; }
log_error()   { echo -e "\${RED}[ERROR]\${NC} $*" >&2; }

# Cleanup function - runs on exit
cleanup() {
    local exit_code=$?
    # Add cleanup tasks here
    # rm -rf "\${TEMP_DIR:-}"
    log_info "Cleanup completed"
    exit "\$exit_code"
}
trap cleanup EXIT

# Error handler
on_error() {
    local line_no=$1
    local error_code=$2
    log_error "Error on line \${line_no} (exit code: \${error_code})"
}
trap 'on_error \${LINENO} $?' ERR

# Usage information
usage() {
    cat << EOF
Usage: \${SCRIPT_NAME} [OPTIONS] <argument>

Description:
    A template for safe bash scripts with error handling.

Options:
    -h, --help      Show this help message
    -v, --version   Show version number
    -d, --debug     Enable debug mode
    -f, --force     Force operation without prompts

Arguments:
    argument        Required argument description

Examples:
    \${SCRIPT_NAME} --help
    \${SCRIPT_NAME} -d my_argument
EOF
}

# Parse command line arguments
parse_args() {
    local debug=false
    local force=false
    local positional_args=()

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -v|--version)
                echo "\${SCRIPT_NAME} version \${SCRIPT_VERSION}"
                exit 0
                ;;
            -d|--debug)
                debug=true
                set -x
                shift
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                positional_args+=("$1")
                shift
                ;;
        esac
    done

    # Restore positional arguments
    set -- "\${positional_args[@]}"

    # Validate required arguments
    if [[ \${#positional_args[@]} -lt 1 ]]; then
        log_error "Missing required argument"
        usage
        exit 1
    fi

    # Export parsed values
    readonly DEBUG="\$debug"
    readonly FORCE="\$force"
    readonly ARG="\${positional_args[0]}"
}

# Main function
main() {
    parse_args "$@"

    log_info "Starting \${SCRIPT_NAME}"
    log_info "Argument: \${ARG}"

    # Your script logic here
    
    log_info "Completed successfully"
}

# Run main function
main "$@"`,
    description: 'Production-ready Bash script template with proper error handling, argument parsing, logging, and cleanup. Follows strict mode best practices.',
    author: 'seed-script',
    ratings: { average: 4.9, count: 38, values: Array(38).fill(5) },
    favoritesCount: 267
  },

  // CSS snippet
  {
    title: 'Modern CSS Grid Layout System',
    language: 'css',
    tags: ['css', 'grid', 'layout', 'responsive'],
    code: `/**
 * Modern CSS Grid Layout System
 * Flexible, responsive grid with auto-fit/auto-fill
 */

/* CSS Variables for customization */
:root {
  --grid-gap: 1rem;
  --grid-min-column: 250px;
  --container-max-width: 1200px;
  --container-padding: 1rem;
}

/* Container with max-width and centering */
.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin-inline: auto;
  padding-inline: var(--container-padding);
}

/* Auto-fit grid: columns shrink then wrap */
.grid-auto-fit {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, var(--grid-min-column)), 1fr)
  );
}

/* Auto-fill grid: maintains column size, creates empty columns */
.grid-auto-fill {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--grid-min-column), 1fr)
  );
}

/* Fixed column grids with responsive breakpoints */
.grid-cols-2 {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(3, 1fr);
}

.grid-cols-4 {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(4, 1fr);
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

/* Span utilities */
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-full { grid-column: 1 / -1; }
.row-span-2 { grid-row: span 2; }

/* Alignment utilities */
.grid-center {
  place-items: center;
}

.grid-start {
  justify-items: start;
  align-items: start;
}

/* Holy Grail Layout */
.layout-holy-grail {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: minmax(150px, 1fr) minmax(300px, 3fr) minmax(150px, 1fr);
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  gap: var(--grid-gap);
}

.layout-holy-grail > header { grid-area: header; }
.layout-holy-grail > nav    { grid-area: nav; }
.layout-holy-grail > main   { grid-area: main; }
.layout-holy-grail > aside  { grid-area: aside; }
.layout-holy-grail > footer { grid-area: footer; }

@media (max-width: 768px) {
  .layout-holy-grail {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto auto;
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
  }
}

/* Card Grid with aspect ratio */
.card-grid {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.card {
  display: grid;
  grid-template-rows: 200px 1fr auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`,
    description: 'Modern CSS Grid layout system with auto-fit/auto-fill patterns, responsive breakpoints, Holy Grail layout, and utility classes for common grid operations.',
    author: 'seed-script',
    ratings: { average: 4.6, count: 29, values: Array(29).fill(5).map((_, i) => i % 5 === 0 ? 4 : 5) },
    favoritesCount: 178
  }
];

/**
 * Connect to database and seed data
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/code_snippets';
    console.log(`\n🔌 Connecting to MongoDB: ${mongoUri}\n`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing snippets...');
    await Snippet.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Insert sample data
    console.log('📝 Inserting sample snippets...\n');
    
    for (const snippetData of sampleSnippets) {
      const snippet = await Snippet.create(snippetData);
      console.log(`   ✓ Created: "${snippet.title}" (${snippet.language})`);
    }

    console.log(`\n✅ Successfully seeded ${sampleSnippets.length} snippets!\n`);

    // Create text indexes
    console.log('📇 Ensuring text indexes...');
    try {
      // Drop existing text index if it exists
      const indexes = await Snippet.collection.indexes();
      const textIndex = indexes.find(idx => idx.name === 'snippet_text_index' || idx.textIndexVersion);
      if (textIndex) {
        await Snippet.collection.dropIndex(textIndex.name);
        console.log('   Dropped existing text index');
      }
    } catch (e) {
      // Ignore if no index exists
    }
    
    await Snippet.collection.createIndex(
      { title: 'text', tags: 'text', description: 'text', code: 'text' },
      { 
        weights: { title: 10, tags: 8, description: 5, code: 2 },
        language_override: 'textSearchLanguage',
        default_language: 'english',
        name: 'snippet_text_index'
      }
    );
    console.log('✅ Text indexes created\n');

    // Display summary
    const stats = await Snippet.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 Snippets by language:');
    stats.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed\n');
  }
}

// Run the seed script
seedDatabase();

/**
 * Additional Snippets Seed Script
 * Adds more code snippets to the database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Snippet } from '../models/index.js';

// Load environment variables
dotenv.config();

// Additional code snippets - 2 more for each language
const additionalSnippets = [
  // ============================================
  // JAVASCRIPT - 2 more
  // ============================================
  {
    title: 'Throttle Function Implementation',
    language: 'javascript',
    tags: ['utility', 'performance', 'events', 'optimization'],
    code: `/**
 * Creates a throttled version of a function
 * Limits function calls to once per specified time period
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - The throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  let lastFunc;
  let lastRan;

  return function executedFunction(...args) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Usage example
const handleScroll = throttle(() => {
  console.log('Scroll event:', window.scrollY);
}, 100);

window.addEventListener('scroll', handleScroll);`,
    description: 'A throttle function that limits how often a function can be called. Unlike debounce, throttle ensures the function is called at regular intervals during continuous events like scrolling.',
    ratings: { average: 4.7, count: 28 },
    favoritesCount: 145,
    author: 'seed-script',
  },
  {
    title: 'LocalStorage Wrapper with Expiry',
    language: 'javascript',
    tags: ['storage', 'utility', 'browser', 'cache'],
    code: `/**
 * LocalStorage wrapper with automatic expiry
 * Stores data with TTL (time-to-live) support
 */
const storage = {
  /**
   * Set item with optional expiry
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = null) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  /**
   * Get item if not expired
   * @param {string} key - Storage key
   * @returns {*} - Stored value or null if expired/missing
   */
  get(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      
      // Check if item has expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch {
      return null;
    }
  },

  /**
   * Remove item from storage
   */
  remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clear all expired items
   */
  clearExpired() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      this.get(key); // This will auto-remove if expired
    }
  },
};

// Usage
storage.set('user', { name: 'John' }, 3600000); // 1 hour TTL
const user = storage.get('user');`,
    description: 'A localStorage wrapper that adds expiration support. Automatically removes expired items when accessed, perfect for caching API responses or session data.',
    ratings: { average: 4.8, count: 35 },
    favoritesCount: 178,
    author: 'seed-script',
  },

  // ============================================
  // TYPESCRIPT - 2 more
  // ============================================
  {
    title: 'Type-Safe Fetch Wrapper',
    language: 'typescript',
    tags: ['fetch', 'api', 'http', 'generics'],
    code: `/**
 * Type-safe fetch wrapper with automatic JSON parsing
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class HttpClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string, headers: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T, B = unknown>(endpoint: string, body: B): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T, B = unknown>(endpoint: string, body: B): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      ...options,
      headers: this.headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An error occurred',
        status: response.status,
      }));
      throw error;
    }

    const data: T = await response.json();
    return { data, status: response.status, ok: true };
  }
}

// Usage
const api = new HttpClient('https://api.example.com');
const { data: users } = await api.get<User[]>('/users');`,
    description: 'A fully type-safe HTTP client wrapper around fetch. Provides generic type inference for responses, automatic JSON parsing, and consistent error handling.',
    ratings: { average: 4.9, count: 42 },
    favoritesCount: 234,
    author: 'seed-script',
  },
  {
    title: 'React useReducer with TypeScript',
    language: 'typescript',
    tags: ['react', 'hooks', 'state-management', 'reducer'],
    code: `import { useReducer, Dispatch } from 'react';

// Define state type
interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Define action types using discriminated unions
type TodoAction =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_COMPLETED' };

// Initial state
const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null,
};

// Type-safe reducer
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: crypto.randomUUID(), text: action.payload, completed: false },
        ],
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter((todo) => !todo.completed),
      };
    default:
      return state;
  }
}

// Custom hook
function useTodos(): [TodoState, Dispatch<TodoAction>] {
  return useReducer(todoReducer, initialState);
}

// Usage in component
function TodoApp() {
  const [state, dispatch] = useTodos();
  
  const addTodo = (text: string) => dispatch({ type: 'ADD_TODO', payload: text });
  const toggleTodo = (id: string) => dispatch({ type: 'TOGGLE_TODO', payload: id });
  
  return <div>{/* ... */}</div>;
}`,
    description: 'Complete TypeScript pattern for useReducer with discriminated union actions. Provides full type safety for state and actions with autocompletion support.',
    ratings: { average: 4.8, count: 38 },
    favoritesCount: 198,
    author: 'seed-script',
  },

  // ============================================
  // PYTHON - 2 more
  // ============================================
  {
    title: 'Retry Decorator with Exponential Backoff',
    language: 'python',
    tags: ['decorator', 'retry', 'error-handling', 'api'],
    code: `"""
Retry decorator with exponential backoff and jitter
"""
import time
import random
from functools import wraps
from typing import Callable, Type, Tuple, TypeVar, Any

T = TypeVar('T')

def retry(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,),
    jitter: bool = True
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    Decorator that retries a function with exponential backoff.
    
    Args:
        max_attempts: Maximum number of retry attempts
        base_delay: Initial delay between retries in seconds
        max_delay: Maximum delay between retries
        exponential_base: Base for exponential backoff calculation
        exceptions: Tuple of exceptions to catch and retry
        jitter: Whether to add random jitter to delays
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_attempts - 1:
                        raise
                    
                    # Calculate delay with exponential backoff
                    delay = min(
                        base_delay * (exponential_base ** attempt),
                        max_delay
                    )
                    
                    # Add jitter (±25%)
                    if jitter:
                        delay *= (0.75 + random.random() * 0.5)
                    
                    print(f"Attempt {attempt + 1} failed: {e}")
                    print(f"Retrying in {delay:.2f} seconds...")
                    time.sleep(delay)
            
            raise last_exception  # type: ignore
        return wrapper
    return decorator


# Usage examples
@retry(max_attempts=5, base_delay=2.0, exceptions=(ConnectionError, TimeoutError))
def fetch_data(url: str) -> dict:
    """Fetch data from API with automatic retries."""
    import requests
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.json()


@retry(max_attempts=3, base_delay=0.5)
def unreliable_operation() -> str:
    """Simulate an unreliable operation."""
    if random.random() < 0.7:
        raise ConnectionError("Random failure")
    return "Success!"`,
    description: 'Production-ready retry decorator with exponential backoff and jitter. Configurable exception handling, delays, and attempt limits for reliable API calls.',
    ratings: { average: 4.9, count: 45 },
    favoritesCount: 267,
    author: 'seed-script',
  },
  {
    title: 'Singleton Metaclass Pattern',
    language: 'python',
    tags: ['design-pattern', 'singleton', 'metaclass', 'oop'],
    code: `"""
Thread-safe Singleton pattern using metaclass
"""
import threading
from typing import Dict, Any, Type, TypeVar

T = TypeVar('T')


class SingletonMeta(type):
    """
    Thread-safe Singleton metaclass.
    
    Any class using this metaclass will only have one instance.
    """
    _instances: Dict[Type, Any] = {}
    _lock: threading.Lock = threading.Lock()
    
    def __call__(cls, *args, **kwargs):
        # Double-checked locking pattern
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    instance = super().__call__(*args, **kwargs)
                    cls._instances[cls] = instance
        return cls._instances[cls]


class Database(metaclass=SingletonMeta):
    """
    Example singleton database connection class.
    """
    def __init__(self, host: str = "localhost", port: int = 5432):
        # This will only run once
        self.host = host
        self.port = port
        self.connection = None
        print(f"Creating database connection to {host}:{port}")
    
    def connect(self) -> None:
        if not self.connection:
            self.connection = f"Connected to {self.host}:{self.port}"
            print(self.connection)
    
    def query(self, sql: str) -> str:
        return f"Executing: {sql}"


class ConfigManager(metaclass=SingletonMeta):
    """
    Singleton configuration manager.
    """
    def __init__(self):
        self._config: Dict[str, Any] = {}
        print("Loading configuration...")
    
    def set(self, key: str, value: Any) -> None:
        self._config[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        return self._config.get(key, default)


# Usage - both return the same instance
db1 = Database("prod.db.com", 5432)
db2 = Database("other.db.com", 3306)  # Ignored, returns existing instance
print(db1 is db2)  # True

config = ConfigManager()
config.set("debug", True)
print(ConfigManager().get("debug"))  # True - same instance`,
    description: 'Thread-safe Singleton implementation using Python metaclass. Uses double-checked locking pattern for thread safety. Includes practical examples for database connections and config management.',
    ratings: { average: 4.7, count: 32 },
    favoritesCount: 156,
    author: 'seed-script',
  },

  // ============================================
  // GO - 2 more
  // ============================================
  {
    title: 'Graceful HTTP Server Shutdown',
    language: 'go',
    tags: ['http', 'server', 'graceful-shutdown', 'signals'],
    code: `package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	// Create a new server mux
	mux := http.NewServeMux()
	
	// Register handlers
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Simulate some work
		time.Sleep(2 * time.Second)
		fmt.Fprintf(w, "Hello, World!")
	})
	
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "OK")
	})

	// Configure the server
	server := &http.Server{
		Addr:         ":8080",
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Channel to listen for shutdown signals
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	// Channel to listen for server errors
	serverError := make(chan error, 1)

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s", server.Addr)
		serverError <- server.ListenAndServe()
	}()

	// Block until we receive a signal or error
	select {
	case err := <-serverError:
		if err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	case sig := <-shutdown:
		log.Printf("Received signal %v, initiating graceful shutdown...", sig)

		// Create a deadline for the shutdown
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		// Attempt graceful shutdown
		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Graceful shutdown failed: %v", err)
			// Force close if graceful shutdown fails
			if err := server.Close(); err != nil {
				log.Fatalf("Forced shutdown failed: %v", err)
			}
		}
		
		log.Println("Server stopped gracefully")
	}
}`,
    description: 'Production-ready HTTP server with graceful shutdown handling. Properly handles OS signals (SIGINT, SIGTERM), allows in-flight requests to complete, and includes timeout configuration.',
    ratings: { average: 4.9, count: 41 },
    favoritesCount: 223,
    author: 'seed-script',
  },
  {
    title: 'Generic LRU Cache',
    language: 'go',
    tags: ['cache', 'generics', 'data-structure', 'lru'],
    code: `package main

import (
	"container/list"
	"fmt"
	"sync"
)

// LRUCache is a thread-safe generic LRU cache
type LRUCache[K comparable, V any] struct {
	capacity int
	cache    map[K]*list.Element
	list     *list.List
	mu       sync.RWMutex
}

type entry[K comparable, V any] struct {
	key   K
	value V
}

// NewLRUCache creates a new LRU cache with the specified capacity
func NewLRUCache[K comparable, V any](capacity int) *LRUCache[K, V] {
	return &LRUCache[K, V]{
		capacity: capacity,
		cache:    make(map[K]*list.Element),
		list:     list.New(),
	}
}

// Get retrieves a value from the cache
func (c *LRUCache[K, V]) Get(key K) (V, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if elem, ok := c.cache[key]; ok {
		// Move to front (most recently used)
		c.list.MoveToFront(elem)
		return elem.Value.(*entry[K, V]).value, true
	}
	var zero V
	return zero, false
}

// Put adds or updates a value in the cache
func (c *LRUCache[K, V]) Put(key K, value V) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Update existing entry
	if elem, ok := c.cache[key]; ok {
		c.list.MoveToFront(elem)
		elem.Value.(*entry[K, V]).value = value
		return
	}

	// Add new entry
	elem := c.list.PushFront(&entry[K, V]{key: key, value: value})
	c.cache[key] = elem

	// Evict oldest if over capacity
	if c.list.Len() > c.capacity {
		c.evict()
	}
}

// evict removes the least recently used item
func (c *LRUCache[K, V]) evict() {
	oldest := c.list.Back()
	if oldest != nil {
		c.list.Remove(oldest)
		delete(c.cache, oldest.Value.(*entry[K, V]).key)
	}
}

// Delete removes a key from the cache
func (c *LRUCache[K, V]) Delete(key K) bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	if elem, ok := c.cache[key]; ok {
		c.list.Remove(elem)
		delete(c.cache, key)
		return true
	}
	return false
}

// Len returns the current number of items in the cache
func (c *LRUCache[K, V]) Len() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.list.Len()
}

func main() {
	// Create a cache for string keys and int values
	cache := NewLRUCache[string, int](3)
	
	cache.Put("a", 1)
	cache.Put("b", 2)
	cache.Put("c", 3)
	
	fmt.Println(cache.Get("a")) // 1, true
	
	cache.Put("d", 4) // Evicts "b" (least recently used)
	
	fmt.Println(cache.Get("b")) // 0, false (evicted)
	fmt.Println(cache.Get("c")) // 3, true
}`,
    description: 'Thread-safe generic LRU (Least Recently Used) cache implementation using Go 1.18+ generics. O(1) operations for get, put, and delete with automatic eviction.',
    ratings: { average: 4.8, count: 36 },
    favoritesCount: 189,
    author: 'seed-script',
  },

  // ============================================
  // RUST - 2 more
  // ============================================
  {
    title: 'Builder Pattern Implementation',
    language: 'rust',
    tags: ['design-pattern', 'builder', 'struct', 'api-design'],
    code: `//! Builder pattern for constructing complex objects
//! with validation and fluent API

use std::fmt;

#[derive(Debug, Clone)]
pub struct Server {
    host: String,
    port: u16,
    max_connections: usize,
    timeout_seconds: u64,
    tls_enabled: bool,
}

#[derive(Debug)]
pub struct ServerBuilder {
    host: Option<String>,
    port: Option<u16>,
    max_connections: usize,
    timeout_seconds: u64,
    tls_enabled: bool,
}

#[derive(Debug)]
pub enum BuilderError {
    MissingHost,
    MissingPort,
    InvalidPort,
}

impl fmt::Display for BuilderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            BuilderError::MissingHost => write!(f, "Host is required"),
            BuilderError::MissingPort => write!(f, "Port is required"),
            BuilderError::InvalidPort => write!(f, "Port must be between 1 and 65535"),
        }
    }
}

impl std::error::Error for BuilderError {}

impl ServerBuilder {
    pub fn new() -> Self {
        ServerBuilder {
            host: None,
            port: None,
            max_connections: 100,
            timeout_seconds: 30,
            tls_enabled: false,
        }
    }

    pub fn host(mut self, host: impl Into<String>) -> Self {
        self.host = Some(host.into());
        self
    }

    pub fn port(mut self, port: u16) -> Self {
        self.port = Some(port);
        self
    }

    pub fn max_connections(mut self, max: usize) -> Self {
        self.max_connections = max;
        self
    }

    pub fn timeout(mut self, seconds: u64) -> Self {
        self.timeout_seconds = seconds;
        self
    }

    pub fn with_tls(mut self) -> Self {
        self.tls_enabled = true;
        self
    }

    pub fn build(self) -> Result<Server, BuilderError> {
        let host = self.host.ok_or(BuilderError::MissingHost)?;
        let port = self.port.ok_or(BuilderError::MissingPort)?;
        
        if port == 0 {
            return Err(BuilderError::InvalidPort);
        }

        Ok(Server {
            host,
            port,
            max_connections: self.max_connections,
            timeout_seconds: self.timeout_seconds,
            tls_enabled: self.tls_enabled,
        })
    }
}

impl Default for ServerBuilder {
    fn default() -> Self {
        Self::new()
    }
}

fn main() -> Result<(), BuilderError> {
    let server = ServerBuilder::new()
        .host("localhost")
        .port(8080)
        .max_connections(500)
        .timeout(60)
        .with_tls()
        .build()?;
    
    println!("Server config: {:?}", server);
    Ok(())
}`,
    description: 'Idiomatic Rust builder pattern with fluent API, validation, and error handling. Demonstrates Option types, Result returns, and method chaining.',
    ratings: { average: 4.8, count: 29 },
    favoritesCount: 167,
    author: 'seed-script',
  },
  {
    title: 'Async Stream Processing',
    language: 'rust',
    tags: ['async', 'streams', 'tokio', 'futures'],
    code: `//! Async stream processing with tokio
//! Demonstrates concurrent data processing pipelines

use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};
use futures::stream::{self, StreamExt};

#[derive(Debug, Clone)]
struct DataItem {
    id: u32,
    value: String,
}

/// Process items concurrently with a configurable concurrency limit
async fn process_items(items: Vec<DataItem>, concurrency: usize) -> Vec<String> {
    stream::iter(items)
        .map(|item| async move {
            // Simulate async processing
            sleep(Duration::from_millis(100)).await;
            format!("Processed: {} - {}", item.id, item.value.to_uppercase())
        })
        .buffer_unordered(concurrency)
        .collect()
        .await
}

/// Producer-consumer pattern with channels
async fn producer_consumer_example() {
    let (tx, mut rx) = mpsc::channel::<DataItem>(32);
    
    // Spawn producer
    let producer = tokio::spawn(async move {
        for i in 0..10 {
            let item = DataItem {
                id: i,
                value: format!("item_{}", i),
            };
            if tx.send(item).await.is_err() {
                break;
            }
            sleep(Duration::from_millis(50)).await;
        }
    });

    // Consumer with processing
    let consumer = tokio::spawn(async move {
        let mut results = Vec::new();
        while let Some(item) = rx.recv().await {
            println!("Received: {:?}", item);
            results.push(item.value.to_uppercase());
        }
        results
    });

    producer.await.unwrap();
    let results = consumer.await.unwrap();
    println!("Final results: {:?}", results);
}

/// Batch processing with chunks
async fn batch_process(items: Vec<DataItem>, batch_size: usize) {
    let chunks: Vec<_> = items.chunks(batch_size).collect();
    
    for (i, chunk) in chunks.iter().enumerate() {
        println!("Processing batch {} with {} items", i + 1, chunk.len());
        
        let futures: Vec<_> = chunk.iter().map(|item| async {
            sleep(Duration::from_millis(50)).await;
            item.value.len()
        }).collect();
        
        let results: Vec<_> = futures::future::join_all(futures).await;
        println!("Batch {} results: {:?}", i + 1, results);
    }
}

#[tokio::main]
async fn main() {
    // Create test data
    let items: Vec<DataItem> = (0..20)
        .map(|i| DataItem {
            id: i,
            value: format!("data_{}", i),
        })
        .collect();

    // Process with concurrency limit of 5
    let results = process_items(items.clone(), 5).await;
    println!("Concurrent results: {} items", results.len());

    // Run producer-consumer example
    producer_consumer_example().await;

    // Run batch processing
    batch_process(items, 5).await;
}`,
    description: 'Comprehensive async stream processing patterns in Rust using tokio and futures. Includes concurrent processing with limits, producer-consumer with channels, and batch processing.',
    ratings: { average: 4.9, count: 34 },
    favoritesCount: 198,
    author: 'seed-script',
  },

  // ============================================
  // SQL - 2 more
  // ============================================
  {
    title: 'Recursive CTE for Hierarchical Data',
    language: 'sql',
    tags: ['cte', 'recursive', 'hierarchy', 'tree'],
    code: `-- Recursive CTE for hierarchical/tree data
-- Example: Organization chart, categories, file system

-- Create sample employee hierarchy table
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT REFERENCES employees(id),
    title VARCHAR(100),
    salary DECIMAL(10, 2)
);

-- Insert sample data
INSERT INTO employees VALUES
    (1, 'Alice', NULL, 'CEO', 150000),
    (2, 'Bob', 1, 'CTO', 120000),
    (3, 'Carol', 1, 'CFO', 120000),
    (4, 'David', 2, 'Engineering Manager', 100000),
    (5, 'Eve', 2, 'Product Manager', 95000),
    (6, 'Frank', 4, 'Senior Developer', 85000),
    (7, 'Grace', 4, 'Developer', 70000),
    (8, 'Henry', 3, 'Accountant', 65000);

-- Get full hierarchy with level and path
WITH RECURSIVE org_chart AS (
    -- Base case: top-level employees (no manager)
    SELECT 
        id,
        name,
        title,
        manager_id,
        salary,
        1 AS level,
        ARRAY[name] AS path,
        name AS full_path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: employees with managers
    SELECT 
        e.id,
        e.name,
        e.title,
        e.manager_id,
        e.salary,
        oc.level + 1,
        oc.path || e.name,
        oc.full_path || ' > ' || e.name
    FROM employees e
    INNER JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT 
    REPEAT('  ', level - 1) || name AS org_structure,
    title,
    salary,
    level,
    full_path
FROM org_chart
ORDER BY path;

-- Calculate total salary per subtree
WITH RECURSIVE salary_tree AS (
    SELECT id, name, manager_id, salary
    FROM employees
    
    UNION ALL
    
    SELECT e.id, e.name, e.manager_id, st.salary
    FROM employees e
    INNER JOIN salary_tree st ON e.id = st.manager_id
)
SELECT 
    e.name,
    e.title,
    e.salary AS direct_salary,
    COALESCE(SUM(st.salary), 0) AS total_team_salary
FROM employees e
LEFT JOIN salary_tree st ON st.manager_id = e.id
GROUP BY e.id, e.name, e.title, e.salary
ORDER BY total_team_salary DESC;`,
    description: 'Recursive Common Table Expression (CTE) for traversing hierarchical data like org charts or category trees. Includes level calculation, path building, and aggregate calculations.',
    ratings: { average: 4.8, count: 33 },
    favoritesCount: 176,
    author: 'seed-script',
  },
  {
    title: 'Advanced Pivot and Unpivot',
    language: 'sql',
    tags: ['pivot', 'unpivot', 'aggregation', 'reporting'],
    code: `-- Pivot and Unpivot operations for data transformation
-- Works in PostgreSQL with crosstab or standard SQL CASE

-- Sample sales data
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    product VARCHAR(50),
    region VARCHAR(50),
    quarter VARCHAR(10),
    amount DECIMAL(10, 2)
);

INSERT INTO sales (product, region, quarter, amount) VALUES
    ('Widget A', 'North', 'Q1', 1000),
    ('Widget A', 'North', 'Q2', 1200),
    ('Widget A', 'South', 'Q1', 800),
    ('Widget A', 'South', 'Q2', 950),
    ('Widget B', 'North', 'Q1', 500),
    ('Widget B', 'North', 'Q2', 600),
    ('Widget B', 'South', 'Q1', 450),
    ('Widget B', 'South', 'Q2', 520);

-- PIVOT: Rows to Columns (using CASE statements)
SELECT 
    product,
    region,
    SUM(CASE WHEN quarter = 'Q1' THEN amount ELSE 0 END) AS Q1_sales,
    SUM(CASE WHEN quarter = 'Q2' THEN amount ELSE 0 END) AS Q2_sales,
    SUM(CASE WHEN quarter = 'Q3' THEN amount ELSE 0 END) AS Q3_sales,
    SUM(CASE WHEN quarter = 'Q4' THEN amount ELSE 0 END) AS Q4_sales,
    SUM(amount) AS total_sales
FROM sales
GROUP BY product, region
ORDER BY product, region;

-- PIVOT: Products as columns
SELECT 
    region,
    quarter,
    SUM(CASE WHEN product = 'Widget A' THEN amount ELSE 0 END) AS "Widget A",
    SUM(CASE WHEN product = 'Widget B' THEN amount ELSE 0 END) AS "Widget B",
    SUM(amount) AS total
FROM sales
GROUP BY region, quarter
ORDER BY region, quarter;

-- Create a pivoted summary table
CREATE TABLE quarterly_summary AS
SELECT 
    product,
    SUM(CASE WHEN quarter = 'Q1' THEN amount END) AS q1,
    SUM(CASE WHEN quarter = 'Q2' THEN amount END) AS q2,
    SUM(CASE WHEN quarter = 'Q3' THEN amount END) AS q3,
    SUM(CASE WHEN quarter = 'Q4' THEN amount END) AS q4
FROM sales
GROUP BY product;

-- UNPIVOT: Columns to Rows (using UNION ALL)
SELECT product, 'Q1' AS quarter, q1 AS amount FROM quarterly_summary WHERE q1 IS NOT NULL
UNION ALL
SELECT product, 'Q2' AS quarter, q2 AS amount FROM quarterly_summary WHERE q2 IS NOT NULL
UNION ALL
SELECT product, 'Q3' AS quarter, q3 AS amount FROM quarterly_summary WHERE q3 IS NOT NULL
UNION ALL
SELECT product, 'Q4' AS quarter, q4 AS amount FROM quarterly_summary WHERE q4 IS NOT NULL
ORDER BY product, quarter;

-- UNPIVOT using LATERAL (PostgreSQL)
SELECT 
    qs.product,
    x.quarter,
    x.amount
FROM quarterly_summary qs
CROSS JOIN LATERAL (
    VALUES 
        ('Q1', qs.q1),
        ('Q2', qs.q2),
        ('Q3', qs.q3),
        ('Q4', qs.q4)
) AS x(quarter, amount)
WHERE x.amount IS NOT NULL
ORDER BY qs.product, x.quarter;`,
    description: 'Complete guide to PIVOT (rows to columns) and UNPIVOT (columns to rows) operations in SQL. Shows multiple techniques including CASE statements, UNION ALL, and LATERAL joins.',
    ratings: { average: 4.7, count: 28 },
    favoritesCount: 145,
    author: 'seed-script',
  },

  // ============================================
  // BASH - 2 more
  // ============================================
  {
    title: 'Parallel Task Execution Script',
    language: 'bash',
    tags: ['parallel', 'jobs', 'performance', 'automation'],
    code: `#!/usr/bin/env bash
#
# Parallel task execution with job control
# Runs multiple tasks concurrently with configurable parallelism
#

set -euo pipefail

# Configuration
MAX_PARALLEL=4
LOG_DIR="./logs"
TASKS=()

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

log_info()  { echo -e "\${GREEN}[INFO]\${NC} $*"; }
log_warn()  { echo -e "\${YELLOW}[WARN]\${NC} $*" >&2; }
log_error() { echo -e "\${RED}[ERROR]\${NC} $*" >&2; }

# Track running jobs
declare -A RUNNING_PIDS
declare -A TASK_STATUS

# Cleanup on exit
cleanup() {
    log_warn "Cleaning up..."
    for pid in "\${!RUNNING_PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
}
trap cleanup EXIT

# Wait for a job slot to become available
wait_for_slot() {
    while [[ \${#RUNNING_PIDS[@]} -ge $MAX_PARALLEL ]]; do
        for pid in "\${!RUNNING_PIDS[@]}"; do
            if ! kill -0 "$pid" 2>/dev/null; then
                wait "$pid" && TASK_STATUS["\${RUNNING_PIDS[$pid]}"]="success" \\
                            || TASK_STATUS["\${RUNNING_PIDS[$pid]}"]="failed"
                unset "RUNNING_PIDS[$pid]"
            fi
        done
        sleep 0.1
    done
}

# Run a single task
run_task() {
    local task_name="$1"
    local task_cmd="$2"
    local log_file="\${LOG_DIR}/\${task_name}.log"
    
    mkdir -p "$LOG_DIR"
    
    log_info "Starting task: $task_name"
    
    # Run task in background with output to log file
    (
        echo "=== Task: $task_name ===" >> "$log_file"
        echo "Started: \$(date)" >> "$log_file"
        eval "$task_cmd" >> "$log_file" 2>&1
        echo "Finished: \$(date)" >> "$log_file"
    ) &
    
    local pid=$!
    RUNNING_PIDS[$pid]="$task_name"
}

# Wait for all remaining jobs
wait_all() {
    for pid in "\${!RUNNING_PIDS[@]}"; do
        wait "$pid" && TASK_STATUS["\${RUNNING_PIDS[$pid]}"]="success" \\
                    || TASK_STATUS["\${RUNNING_PIDS[$pid]}"]="failed"
    done
}

# Print summary
print_summary() {
    echo ""
    log_info "=== Execution Summary ==="
    local success=0 failed=0
    
    for task in "\${!TASK_STATUS[@]}"; do
        if [[ "\${TASK_STATUS[$task]}" == "success" ]]; then
            echo -e "  \${GREEN}✓\${NC} $task"
            ((success++))
        else
            echo -e "  \${RED}✗\${NC} $task"
            ((failed++))
        fi
    done
    
    echo ""
    log_info "Success: $success, Failed: $failed"
}

# Example usage
main() {
    log_info "Starting parallel execution (max $MAX_PARALLEL concurrent)"
    
    # Define tasks (name and command)
    TASKS=(
        "task1:sleep 2 && echo 'Task 1 done'"
        "task2:sleep 3 && echo 'Task 2 done'"
        "task3:sleep 1 && echo 'Task 3 done'"
        "task4:sleep 2 && echo 'Task 4 done'"
        "task5:sleep 1 && echo 'Task 5 done'"
    )
    
    # Execute tasks in parallel
    for task_def in "\${TASKS[@]}"; do
        IFS=':' read -r name cmd <<< "$task_def"
        wait_for_slot
        run_task "$name" "$cmd"
    done
    
    # Wait for remaining tasks
    wait_all
    print_summary
}

main "$@"`,
    description: 'Production-ready parallel task execution script with configurable concurrency, job tracking, logging, and execution summary. Uses bash job control and associative arrays.',
    ratings: { average: 4.8, count: 31 },
    favoritesCount: 167,
    author: 'seed-script',
  },
  {
    title: 'File Backup with Rotation',
    language: 'bash',
    tags: ['backup', 'rotation', 'automation', 'sysadmin'],
    code: `#!/usr/bin/env bash
#
# File backup script with rotation and compression
# Maintains N most recent backups, removes older ones
#

set -euo pipefail

# Configuration
BACKUP_SOURCE="/var/www/app"
BACKUP_DEST="/backup"
BACKUP_PREFIX="app_backup"
MAX_BACKUPS=7
COMPRESSION="gzip"  # gzip, bzip2, or none
DATE_FORMAT="%Y%m%d_%H%M%S"

# Notification (optional)
NOTIFY_EMAIL=""
NOTIFY_ON_ERROR=true

# Derived variables
TIMESTAMP=\$(date +"\${DATE_FORMAT}")
BACKUP_NAME="\${BACKUP_PREFIX}_\${TIMESTAMP}"
LOG_FILE="\${BACKUP_DEST}/backup.log"

# Logging
log() {
    local level="$1"
    shift
    echo "[\$(date '+%Y-%m-%d %H:%M:%S')] [\${level}] $*" | tee -a "$LOG_FILE"
}

log_info()  { log "INFO" "$@"; }
log_warn()  { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }

# Send notification
notify() {
    local subject="$1"
    local body="$2"
    
    if [[ -n "$NOTIFY_EMAIL" ]]; then
        echo "$body" | mail -s "$subject" "$NOTIFY_EMAIL" || true
    fi
}

# Error handler
error_handler() {
    local line_no=$1
    local error_code=$2
    log_error "Error on line \${line_no} (exit code: \${error_code})"
    
    if [[ "$NOTIFY_ON_ERROR" == true ]]; then
        notify "Backup Failed" "Backup failed at line \${line_no} with exit code \${error_code}"
    fi
    
    exit "$error_code"
}
trap 'error_handler \${LINENO} $?' ERR

# Create backup
create_backup() {
    log_info "Starting backup: $BACKUP_NAME"
    
    mkdir -p "$BACKUP_DEST"
    
    local archive_path="\${BACKUP_DEST}/\${BACKUP_NAME}.tar"
    
    # Create tar archive
    tar -cf "$archive_path" -C "\$(dirname "$BACKUP_SOURCE")" "\$(basename "$BACKUP_SOURCE")"
    
    # Compress based on configuration
    case "$COMPRESSION" in
        gzip)
            gzip "$archive_path"
            archive_path="\${archive_path}.gz"
            ;;
        bzip2)
            bzip2 "$archive_path"
            archive_path="\${archive_path}.bz2"
            ;;
        none)
            ;;
        *)
            log_warn "Unknown compression: $COMPRESSION, skipping"
            ;;
    esac
    
    local size=\$(du -h "$archive_path" | cut -f1)
    log_info "Backup created: $archive_path ($size)"
    
    echo "$archive_path"
}

# Rotate old backups
rotate_backups() {
    log_info "Rotating backups (keeping last $MAX_BACKUPS)"
    
    # Find and sort backups by date (oldest first)
    local backups=(\$(ls -1t "\${BACKUP_DEST}/\${BACKUP_PREFIX}"* 2>/dev/null || true))
    local count=\${#backups[@]}
    
    if [[ $count -le $MAX_BACKUPS ]]; then
        log_info "No rotation needed ($count backups)"
        return
    fi
    
    # Remove oldest backups
    local to_remove=$((count - MAX_BACKUPS))
    log_info "Removing $to_remove old backup(s)"
    
    for ((i = MAX_BACKUPS; i < count; i++)); do
        local old_backup="\${backups[$i]}"
        rm -f "$old_backup"
        log_info "Removed: $old_backup"
    done
}

# Main
main() {
    log_info "=== Backup Script Started ==="
    
    # Validate source
    if [[ ! -d "$BACKUP_SOURCE" ]]; then
        log_error "Source directory not found: $BACKUP_SOURCE"
        exit 1
    fi
    
    # Create backup
    local backup_file
    backup_file=\$(create_backup)
    
    # Rotate old backups
    rotate_backups
    
    log_info "=== Backup Complete ==="
    
    # Success notification
    if [[ -n "$NOTIFY_EMAIL" ]]; then
        notify "Backup Successful" "Backup completed: $backup_file"
    fi
}

main "$@"`,
    description: 'Comprehensive backup script with automatic rotation, compression options, logging, and email notifications. Maintains configurable number of recent backups.',
    ratings: { average: 4.9, count: 37 },
    favoritesCount: 201,
    author: 'seed-script',
  },

  // ============================================
  // CSS - 2 more
  // ============================================
  {
    title: 'Modern CSS Loading Spinners',
    language: 'css',
    tags: ['animation', 'loading', 'spinner', 'ui'],
    code: `/* Modern CSS Loading Spinners - No JavaScript Required */

/* 1. Classic Spinning Circle */
.spinner-circle {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 2. Pulsing Dots */
.spinner-dots {
  display: flex;
  gap: 8px;
}

.spinner-dots span {
  width: 12px;
  height: 12px;
  background-color: #3498db;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite both;
}

.spinner-dots span:nth-child(1) { animation-delay: -0.32s; }
.spinner-dots span:nth-child(2) { animation-delay: -0.16s; }
.spinner-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 3. Growing Bars */
.spinner-bars {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 40px;
}

.spinner-bars span {
  width: 4px;
  height: 100%;
  background-color: #3498db;
  animation: grow 1.2s ease-in-out infinite;
}

.spinner-bars span:nth-child(1) { animation-delay: 0s; }
.spinner-bars span:nth-child(2) { animation-delay: 0.1s; }
.spinner-bars span:nth-child(3) { animation-delay: 0.2s; }
.spinner-bars span:nth-child(4) { animation-delay: 0.3s; }
.spinner-bars span:nth-child(5) { animation-delay: 0.4s; }

@keyframes grow {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}

/* 4. Rotating Square */
.spinner-square {
  width: 40px;
  height: 40px;
  background-color: #3498db;
  animation: rotate-square 1.2s ease-in-out infinite;
}

@keyframes rotate-square {
  0% {
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  }
  50% {
    transform: perspective(120px) rotateX(-180deg) rotateY(0deg);
  }
  100% {
    transform: perspective(120px) rotateX(-180deg) rotateY(-180deg);
  }
}

/* 5. Gradient Ring */
.spinner-gradient {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, #3498db);
  mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px));
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px));
  animation: spin 1s linear infinite;
}

/* 6. Skeleton Loading */
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Usage HTML:
<div class="spinner-circle"></div>

<div class="spinner-dots">
  <span></span><span></span><span></span>
</div>

<div class="spinner-bars">
  <span></span><span></span><span></span><span></span><span></span>
</div>

<div class="skeleton skeleton-text" style="width: 80%"></div>
*/`,
    description: 'Collection of modern CSS-only loading spinners and skeleton loaders. Includes circle spinner, pulsing dots, growing bars, rotating square, gradient ring, and skeleton loading animation.',
    ratings: { average: 4.9, count: 52 },
    favoritesCount: 312,
    author: 'seed-script',
  },
  {
    title: 'Responsive Card Hover Effects',
    language: 'css',
    tags: ['hover', 'cards', 'transitions', 'responsive'],
    code: `/* Modern Card Hover Effects */

/* Base Card Styles */
.card {
  position: relative;
  width: 300px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* 1. Lift Effect */
.card-lift:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* 2. Scale Effect */
.card-scale:hover {
  transform: scale(1.02);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

/* 3. Border Glow */
.card-glow {
  border: 2px solid transparent;
}

.card-glow:hover {
  border-color: #3b82f6;
  box-shadow: 
    0 0 0 4px rgb(59 130 246 / 0.1),
    0 20px 25px -5px rgb(0 0 0 / 0.1);
}

/* 4. Gradient Border */
.card-gradient-border {
  background: 
    linear-gradient(white, white) padding-box,
    linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
  border: 3px solid transparent;
}

.card-gradient-border:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgb(102 126 234 / 0.3);
}

/* 5. Reveal Overlay */
.card-reveal::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.card-reveal:hover::before {
  opacity: 0.9;
}

.card-reveal .card-content {
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
}

.card-reveal:hover .card-content {
  color: white;
}

/* 6. Tilt Effect (3D) */
.card-tilt {
  transform-style: preserve-3d;
  perspective: 1000px;
}

.card-tilt:hover {
  transform: rotateX(5deg) rotateY(-5deg);
  box-shadow: 
    10px 10px 20px rgb(0 0 0 / 0.1),
    -5px -5px 10px rgb(255 255 255 / 0.5);
}

/* 7. Slide-in Border */
.card-slide-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.card-slide-border:hover::after {
  width: 100%;
}

/* 8. Image Zoom on Hover */
.card-image-zoom .card-image {
  overflow: hidden;
  border-radius: 12px;
}

.card-image-zoom img {
  width: 100%;
  transition: transform 0.5s ease;
}

.card-image-zoom:hover img {
  transform: scale(1.1);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .card {
    width: 100%;
  }
  
  /* Reduce motion for mobile */
  @media (prefers-reduced-motion: reduce) {
    .card {
      transition: none;
    }
    .card:hover {
      transform: none;
    }
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .card {
    background: #1e293b;
    color: #f1f5f9;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
  }
}`,
    description: 'Collection of modern card hover effects including lift, scale, glow, gradient border, reveal overlay, 3D tilt, and slide-in border. Includes responsive and accessibility considerations.',
    ratings: { average: 4.8, count: 45 },
    favoritesCount: 278,
    author: 'seed-script',
  },
];

// Connect to MongoDB and add snippets
async function addSnippets() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📝 Adding new snippets...\n');

    for (const snippetData of additionalSnippets) {
      try {
        const snippet = await Snippet.create(snippetData);
        console.log(`   ✓ Created: "${snippet.title}" (${snippet.language})`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`   ⚠ Skipped (duplicate): "${snippetData.title}"`);
        } else {
          console.error(`   ✗ Failed: "${snippetData.title}" - ${err.message}`);
        }
      }
    }

    // Get counts by language
    const counts = await Snippet.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Total snippets by language:');
    counts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });

    const total = await Snippet.countDocuments();
    console.log(`\n✅ Total snippets in database: ${total}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

addSnippets();

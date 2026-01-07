// lib/types.ts
// TypeScript interfaces for the app's data structures

export interface Answer {
  model: string; // e.g., 'Claude'
  content: string; // The AI-generated text/response
}

export interface Rating {
  fromModel: string; // e.g., 'Claude' (the rater)
  scores: Record<string, number>; // e.g., { claude: 9, gpt: 8, gemini: 10 }
  feedback: string; // Brief explanation from the AI
}

export interface Result {
  query: string; // Original user query
  initials: Answer[]; // Initial answers from each model
  finals: Answer[]; // Peer-reviewed final answers
  ratings: Rating[]; // Ratings from each model on the finals
  aggregatedScores: Record<string, number>; // Avg scores per model (lowercase keys)
  bestAnswer: string; // The content of the highest-scoring final
}

// Extend for API responses or errors if needed
export interface ApiError {
  error: string;
}

// Query History types
export interface QueryHistory {
  id: string; // Unique identifier for the query
  query: string; // The user's original query
  result: Result; // The complete result from the peer review
  userId: string; // User identifier (for multi-user support)
  timestamp: number; // Unix timestamp when query was created
  cacheHit: boolean; // Whether this result came from cache
}

// Cache metadata
export interface CacheMetadata {
  key: string; // Cache key
  result: Result; // Cached result
  timestamp: number; // When cached
  ttl: number; // Time to live in seconds
}

// Cache statistics (for admin)
export interface CacheStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number; // Percentage
  cacheSize: number; // Number of cached entries
}

// History filter options
export interface HistoryFilter {
  startDate?: number;
  endDate?: number;
  minScore?: number;
  maxScore?: number;
  searchQuery?: string;
}

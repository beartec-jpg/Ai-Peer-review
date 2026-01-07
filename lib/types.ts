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
  bestModel?: string; // The model name with the highest score
  fromCache?: boolean; // Whether this result came from cache
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

// Follow-up query types
export interface FollowupContext {
  originalQuery: string; // Original user query
  chosenAnswer: string; // The answer that user chose (bestAnswer)
  chosenModel: string; // The model that produced the chosen answer
  score: number; // The score of the chosen answer
  followupChain: FollowupHistoryItem[]; // Previous follow-ups in the chain
}

export interface FollowupHistoryItem {
  question: string; // Follow-up question
  answer: string; // Answer to the follow-up
  timestamp: number; // When the follow-up was made
}

export interface FollowupRequest {
  followupQuery: string; // The follow-up question
  context: FollowupContext; // Context from original query
}

export interface FollowupResult {
  followupQuery: string; // The follow-up question asked
  answer: string; // Answer from the best model
  model: string; // Model that answered (same as context.chosenModel)
  estimatedCost: number; // Cost estimate for this follow-up
  timestamp: number; // When this follow-up was answered
  context: FollowupContext; // Updated context including this follow-up
}

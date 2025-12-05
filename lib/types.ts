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

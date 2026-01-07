// lib/peer-review.ts
import { callClaude, callGPT, callGemini } from './ai-client';
import type { Answer, Rating } from './types';// Interfaces: { model: string; content: string } and { fromModel: string; scores: Record<string, number>; feedback: string }

// Config: Models and prompts (tune these for your use case)
const MODELS = [
  { name: 'Claude', fn: callClaude },
  { name: 'GPT', fn: callGPT },
  { name: 'Gemini', fn: callGemini },
] as const;

const INITIAL_PROMPT = (query: string) => `
You are an expert coding assistant. Provide a complete, accurate, and efficient solution to: ${query}.
Include code snippets, explanations, and edge cases. Output only the answer.`;

const PEER_REVIEW_PROMPT = (query: string, ownAnswer: string, peer1: string, peer2: string) => `
Original query: ${query}

Your initial answer: ${ownAnswer}

Peer 1 answer: ${peer1}
Peer 2 answer: ${peer2}

Peer review task: Compare these to your own. Refine your answer for better accuracy, completeness, efficiency, and bug-free code. Highlight improvements or disagreements. Output only your refined final answer.`;

const RATING_PROMPT = (query: string, answers: Answer[]) => `
Original query: ${query}

Three final answers:
1. Claude: ${answers[0]?.content || ''}
2. GPT: ${answers[1]?.content || ''}
3. Gemini: ${answers[2]?.content || ''}

Rate each on 1-10 scale for: correctness (accuracy to query), efficiency (optimal code), innovation (creative solutions).
Output JSON: {"scores": {"claude": 10, "gpt": 8, "gemini": 9}, "feedback": "Brief overall thoughts."}
`;

// Helper: Simple retry with exponential backoff
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000)); // Backoff: 1s, 2s, 4s
    }
  }
  throw new Error('Max retries exceeded');
};

// Phase 1: Generate initial answers in parallel
export const generateInitialAnswers = async (query: string): Promise<Answer[]> => {
  const promises = MODELS.map(async ({ name, fn }) => {
    const content = await withRetry(() => fn(INITIAL_PROMPT(query)));
    return { model: name, content } as Answer;
  });
  return Promise.all(promises);
};

// Phase 2: Peer review - each model reviews the other two
export const performPeerReview = async (query: string, initials: Answer[]): Promise<Answer[]> => {
  const finals: Answer[] = [];
  for (let i = 0; i < initials.length; i++) {
    const own = initials[i];
    const peer1 = initials[(i + 1) % 3];
    const peer2 = initials[(i + 2) % 3];
    const refined = await withRetry(() =>
      MODELS[i].fn(PEER_REVIEW_PROMPT(query, own.content, peer1.content, peer2.content))
    );
    finals.push({ model: own.model, content: refined });
  }
  return finals;
};

// Phase 3: Mutual ratings - each rates all finals
export const generateRatings = async (query: string, finals: Answer[]): Promise<Rating[]> => {
  const ratings: Rating[] = [];
  for (let i = 0; i < finals.length; i++) {
    const ratingJson = await withRetry(() =>
      MODELS[i].fn(RATING_PROMPT(query, finals))
    );
    try {
      const parsed = JSON.parse(ratingJson);
      ratings.push({
        fromModel: MODELS[i].name,
        scores: parsed.scores || {},
        feedback: parsed.feedback || '',
      });
    } catch {
      // Fallback if JSON parse fails (AI might not output perfect JSON)
      ratings.push({ fromModel: MODELS[i].name, scores: {}, feedback: ratingJson });
    }
  }
  return ratings;
};

// Main sequence orchestrator
export const runPeerReviewSequence = async (query: string) => {
  if (!query.trim()) throw new Error('Query cannot be empty');

  console.log('Starting peer review sequence for:', query); // For Vercel logs

  try {
    // Round 1: Initials
    const initials = await generateInitialAnswers(query);
    console.log('Initial answers generated');

    // Round 2: Peer reviews
    const finals = await performPeerReview(query, initials);
    console.log('Peer reviews completed');

    // Round 3: Ratings
    const ratings = await generateRatings(query, finals);
    console.log('Ratings generated');

    // Aggregate: Compute average score for each final to pick "best"
    const scores: Record<string, number> = {};
    finals.forEach((_, i) => {
      const modelKey = MODELS[i].name.toLowerCase();
      const avgScore = ratings.reduce((sum, r) => sum + (r.scores[modelKey] || 0), 0) / ratings.length;
      scores[modelKey] = avgScore;
    });
    const bestModel = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const bestAnswer = finals.find(f => f.model.toLowerCase() === bestModel)?.content || finals[0].content;

    return {
      query,
      initials,
      finals,
      ratings,
      aggregatedScores: scores,
      bestAnswer,
      bestModel,
    };
  } catch (error) {
    console.error('Sequence failed:', error);
    throw new Error(`AI sequence error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
};

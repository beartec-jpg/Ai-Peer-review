// lib/followup-service.ts
// Service for handling follow-up queries with context preservation

import { callModel } from './ai-client';
import type { FollowupContext, FollowupResult, FollowupRequest } from './types';

// Configuration
const MAX_FOLLOWUP_RETRIES = 5; // Maximum follow-ups per original query
const FOLLOWUP_COST_MULTIPLIER = 0.17; // Follow-ups cost ~17% of full re-run
const FULL_RUN_COST = 3.0; // Estimated cost of full peer review run in USD

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

// Build the context-aware prompt for follow-up
const buildFollowupPrompt = (context: FollowupContext, followupQuery: string): string => {
  let prompt = \`You are an expert coding assistant. You previously answered this query:\\n\\n\`;
  prompt += \`**Original Query:** \${context.originalQuery}\\n\\n\`;
  prompt += \`**Your Answer (Score: \${context.score.toFixed(1)}/10):**\\n\${context.chosenAnswer}\\n\\n\`;
  
  // Include follow-up chain if exists
  if (context.followupChain && context.followupChain.length > 0) {
    prompt += \`**Previous Follow-up Conversation:**\\n\`;
    context.followupChain.forEach((item, idx) => {
      prompt += \`\${idx + 1}. Q: \${item.question}\\n\`;
      prompt += \`   A: \${item.answer}\\n\\n\`;
    });
  }
  
  prompt += \`**New Follow-up Question:** \${followupQuery}\\n\\n\`;
  prompt += \`Please provide a clear, accurate, and complete answer to this follow-up question. \`;
  prompt += \`Build upon your previous answer and the conversation history. \`;
  prompt += \`Include code snippets if relevant, and explain any changes or additions clearly.\`;
  
  return prompt;
};

// Estimate cost for a follow-up query
export const estimateFollowupCost = (): number => {
  return FULL_RUN_COST * FOLLOWUP_COST_MULTIPLIER;
};

// Process a follow-up query
export const processFollowup = async (request: FollowupRequest): Promise<FollowupResult> => {
  const { followupQuery, context } = request;
  
  // Validate inputs
  if (!followupQuery || !followupQuery.trim()) {
    throw new Error('Follow-up query cannot be empty');
  }
  
  if (!context.originalQuery || !context.chosenAnswer || !context.chosenModel) {
    throw new Error('Invalid context: missing required fields');
  }
  
  // Check follow-up limit
  const followupCount = context.followupChain?.length || 0;
  if (followupCount >= MAX_FOLLOWUP_RETRIES) {
    throw new Error(\`Follow-up limit reached (max \${MAX_FOLLOWUP_RETRIES} per query)\`);
  }
  
  console.log(\`Processing follow-up for model: \${context.chosenModel}\`);
  
  // Determine which model to call based on context
  const modelKey = context.chosenModel.toLowerCase() as 'claude' | 'gpt' | 'gemini';
  
  // Build context-aware prompt
  const prompt = buildFollowupPrompt(context, followupQuery);
  
  // Call the best model with context
  const answer = await withRetry(() => callModel(modelKey, prompt));
  
  // Build updated context with new follow-up
  const updatedFollowupChain = [
    ...(context.followupChain || []),
    {
      question: followupQuery,
      answer: answer,
      timestamp: Date.now(),
    },
  ];
  
  const updatedContext: FollowupContext = {
    ...context,
    followupChain: updatedFollowupChain,
  };
  
  const result: FollowupResult = {
    followupQuery,
    answer,
    model: context.chosenModel,
    estimatedCost: estimateFollowupCost(),
    timestamp: Date.now(),
    context: updatedContext,
  };
  
  console.log(\`Follow-up completed. Chain length: \${updatedFollowupChain.length}\`);
  
  return result;
};

// Generate suggested follow-up questions based on the answer
export const generateFollowupSuggestions = (context: FollowupContext): string[] => {
  // Simple suggestions based on common patterns
  const suggestions: string[] = [];
  
  const answer = context.chosenAnswer.toLowerCase();
  
  // Check for code patterns and suggest relevant follow-ups
  if (answer.includes('hook') || answer.includes('usehook')) {
    suggestions.push('How do I handle cleanup in this hook?');
    suggestions.push('Can you show me how to test this hook?');
  }
  
  if (answer.includes('async') || answer.includes('await')) {
    suggestions.push('How should I handle errors in this async code?');
    suggestions.push('Can you add loading states?');
  }
  
  if (answer.includes('component')) {
    suggestions.push('How can I make this component more reusable?');
    suggestions.push('Can you add TypeScript types for the props?');
  }
  
  if (answer.includes('api') || answer.includes('endpoint')) {
    suggestions.push('How do I add authentication to this endpoint?');
    suggestions.push('Can you show me how to add rate limiting?');
  }
  
  // Generic suggestions if no patterns matched
  if (suggestions.length === 0) {
    suggestions.push('Can you explain this in more detail?');
    suggestions.push('How would I optimize this for performance?');
    suggestions.push('Are there any edge cases I should consider?');
  }
  
  // Limit to 3 suggestions
  return suggestions.slice(0, 3);
};

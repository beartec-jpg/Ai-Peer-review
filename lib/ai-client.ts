// lib/ai-client.ts
// Thin wrappers for AI API calls - handles auth, prompts, and basic error handling
// Requires env vars: ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY

import { Anthropic } from '@anthropic-ai/sdk'; // npm install @anthropic-ai/sdk
import OpenAI from 'openai'; // npm install openai
import { GoogleGenerativeAI } from '@google/generative-ai'; // npm install @google/generative-ai

// Clients (instantiate once)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Models (update to latest as of 2025)
const MODEL_MAP = {
  claude: 'claude-4.5-opus-20251201', // Or latest Opus/Sonnet
  gpt: 'gpt-5.1', // Or gpt-4o-mini for cost savings
  gemini: 'gemini-3.0-pro', // Or gemini-2.0-flash-exp for speed
} as const;

// Universal call function - takes prompt, returns string response
export const callModel = async (modelKey: keyof typeof MODEL_MAP, prompt: string): Promise<string> => {
  const model = MODEL_MAP[modelKey];
  let response: any;

  try {
    switch (modelKey) {
      case 'claude':
        const claudeResp = await anthropic.messages.create({
          model,
          max_tokens: 2000,
          temperature: 0.2, // Low for consistent coding
          messages: [{ role: 'user', content: prompt }],
        });
        response = claudeResp.content[0]?.text || '';
        break;

      case 'gpt':
        const chatCompletion = await openai.chat.completions.create({
          model,
          max_tokens: 2000,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }],
        });
        response = chatCompletion.choices[0]?.message?.content || '';
        break;

      case 'gemini':
        const geminiModel = genAI.getGenerativeModel({ model: `models/${model}` });
        const geminiResp = await geminiModel.generateContent(prompt);
        response = geminiResp.response.text();
        break;

      default:
        throw new Error(`Unsupported model: ${modelKey}`);
    }

    if (!response) throw new Error(`Empty response from ${modelKey}`);
    return response.trim();
  } catch (error) {
    console.error(`Error calling ${modelKey}:`, error);
    throw new Error(`Failed to generate response from ${modelKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Exported helpers for peer-review.ts (matches MODELS array there)
export const callClaude = (prompt: string) => callModel('claude', prompt);
export const callGPT = (prompt: string) => callModel('gpt', prompt);
export const callGemini = (prompt: string) => callModel('gemini', prompt);

// lib/ai-client.ts
import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// === Initialize clients (safe even if keys missing during build) ===
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? '');

// === Model names (update when newer versions drop) ===
const MODEL_MAP = {
  claude: 'claude-4.5-opus-20251201',
  gpt: 'gpt-5.1',
  gemini: 'gemini-3.0-pro', // or 'gemini-2.0-flash-exp' for speed/cost
} as const;

// === Universal call function ===
export const callModel = async (
  modelKey: keyof typeof MODEL_MAP,
  prompt: string
): Promise<string> => {
  const model = MODEL_MAP[modelKey];
  let responseText = '';

  try {
    switch (modelKey) {
      case 'claude': {
        const resp = await anthropic.messages.create({
          model,
          max_tokens: 2000,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }],
        });
        responseText = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
        break;
      }

      case 'gpt': {
        const resp = await openai.chat.completions.create({
          model,
          max_tokens: 2000,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }],
        });
        responseText = resp.choices[0]?.message?.content ?? '';
        break;
      }

      case 'gemini': {
        const geminiModel = genAI.getGenerativeModel({
          model: `models/${model}`,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
          },
        });

        const result = await geminiModel.generateContent(prompt);

        const candidates = result.response.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error('Gemini returned no candidates');
        }

        // Extract text from parts (handles multi-part responses safely)
        const parts = candidates[0].content.parts;
        for (const part of parts) {
          if (typeof part.text === 'string') {
            responseText += part.text;
          }
        }
        break;
      }

      default:
        throw new Error(`Unsupported model: ${modelKey}`);
    }

    if (!responseText.trim()) {
      throw new Error(`Empty response from ${modelKey}`);
    }

    return responseText.trim();
  } catch (error) {
    console.error(`Error calling ${modelKey}:`, error);
    const message =
      error instanceof Error ? error.message : 'Unknown API error';
    throw new Error(`Failed to call ${modelKey}: ${message}`);
  }
};

// === Simple exported helpers (used in peer-review.ts) ===
export const callClaude = (prompt: string) => callModel('claude', prompt);
export const callGPT = (prompt: string) => callModel('gpt', prompt);
export const callGemini = (prompt: string) => callModel('gemini', prompt);

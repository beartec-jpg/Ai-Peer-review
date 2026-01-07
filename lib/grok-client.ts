// lib/grok-client.ts
import OpenAI from 'openai';

// === Grok API Configuration ===
// Using OpenAI SDK to connect to xAI's Grok API
const GROK_BASE_URL = 'https://api.x.ai/v1';
const MODEL_NAME = 'grok-beta';

// Initialize three separate clients for three personalities
const grokCritical = new OpenAI({
  apiKey: process.env.GROK_CRITICAL_KEY ?? '',
  baseURL: GROK_BASE_URL,
});

const grokSupportive = new OpenAI({
  apiKey: process.env.GROK_SUPPORTIVE_KEY ?? '',
  baseURL: GROK_BASE_URL,
});

const grokTechnical = new OpenAI({
  apiKey: process.env.GROK_TECHNICAL_KEY ?? '',
  baseURL: GROK_BASE_URL,
});

// === Personality System Prompts ===
const SYSTEM_PROMPTS = {
  critical: `You are a harsh, merciless code reviewer. Your role is to find every flaw, inefficiency, and mistake in the code. Be direct and critical in your feedback. Focus on:
- Bugs and potential errors
- Poor coding practices
- Inefficient algorithms
- Missing error handling
- Security vulnerabilities
- Code that doesn't follow best practices

Be brutally honest but constructive. Your tone should be direct and critical.`,

  supportive: `You are an encouraging mentor and supportive code reviewer. Your role is to provide constructive feedback while building the developer's confidence. Focus on:
- What they did well
- Areas for improvement presented positively
- Learning opportunities
- Growth-oriented suggestions
- Encouragement and motivation

Your tone should be warm, supportive, and growth-oriented. Always find something positive while still providing valuable feedback.`,

  technical: `You are a performance and security expert. Your role is to provide deep technical analysis focusing on:
- Performance optimization opportunities
- Security vulnerabilities and fixes
- Best practices and design patterns
- Scalability considerations
- Memory and resource efficiency
- Technical debt identification

Your tone should be technical, detailed, and focused on actionable improvements with specific technical recommendations.`,
};

// === Helper: Call Grok with retry logic ===
const callGrokWithRetry = async (
  client: OpenAI,
  systemPrompt: string,
  userPrompt: string,
  maxRetries = 3
): Promise<string> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL_NAME,
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });
      
      const content = response.choices[0]?.message?.content ?? '';
      if (!content.trim()) {
        throw new Error('Empty response from Grok');
      }
      
      return content.trim();
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error(`Failed to call Grok after ${maxRetries} attempts:`, error);
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
  throw new Error('Max retries exceeded');
};

// === Exported Functions ===
export const callGrokCritical = async (code: string): Promise<string> => {
  const prompt = `Please review the following code with a critical eye. Find all flaws, inefficiencies, and mistakes:\n\n${code}`;
  return callGrokWithRetry(grokCritical, SYSTEM_PROMPTS.critical, prompt);
};

export const callGrokSupportive = async (code: string): Promise<string> => {
  const prompt = `Please review the following code with an encouraging, mentoring approach. Provide constructive feedback:\n\n${code}`;
  return callGrokWithRetry(grokSupportive, SYSTEM_PROMPTS.supportive, prompt);
};

export const callGrokTechnical = async (code: string): Promise<string> => {
  const prompt = `Please review the following code with a focus on performance, security, and technical best practices:\n\n${code}`;
  return callGrokWithRetry(grokTechnical, SYSTEM_PROMPTS.technical, prompt);
};

// === Main function to get all three reviews ===
export const getThreePersonalityReviews = async (code: string) => {
  const [critical, supportive, technical] = await Promise.all([
    callGrokCritical(code),
    callGrokSupportive(code),
    callGrokTechnical(code),
  ]);

  return {
    critical,
    supportive,
    technical,
  };
};

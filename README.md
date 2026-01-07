# Peer AI Reviewer

A Next.js web app that orchestrates three AI models (Claude, GPT, Gemini) to generate, peer-review, and rate answers for complex coding queries. Deployed on Vercel for serverless magic.

[![Vercel](https://theregister.s3.amazonaws.com/production/uploads/2021/05/vercel-logo.jpg)](https://vercel.com)  
*Battle-tested code, powered by AI peers.*

## Features
- **Multi-Model Generation**: Initial answers from 3 top AIs.
- **Peer Review Round**: Each model critiques the others and refines its output.
- **Rating & Selection**: Mutual scoring to pick the best final answer.
- **Coding-Focused**: Optimized prompts for accuracy, efficiency, and edge cases.
- **Responsive UI**: Dark mode, loading states, and structured display of all rounds.
- **Query History**: Save and revisit previous peer reviews with timestamps and scores.
- **Smart Caching**: Redis-based caching reduces API costs by 90% for identical queries (24hr TTL).
- **Usage Analytics**: Track cache hit rates and model performance over time.

## Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **AI APIs**: Anthropic (Claude), OpenAI (GPT), Google Generative AI (Gemini)
- **Deployment**: Vercel (serverless API routes)
- **Other**: React Hook Form, Next Themes

## Quick Start

### Prerequisites
- Node.js 20+
- API Keys: Get from [Anthropic](https://console.anthropic.com/), [OpenAI](https://platform.openai.com/), [Google AI Studio](https://aistudio.google.com/)

### Setup
1. Clone/Fork the repo:
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add API keys to `.env.local` (create if missing):
```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...

# Optional: Redis for production caching
REDIS_URL=redis://localhost:6379
CACHE_TTL=86400

# File-based history storage (default)
DATABASE_URL=file:./data/history.json
MAX_HISTORY_PER_USER=100
```

4. Run locally:
   Open [http://localhost:3000](http://localhost:3000). Submit a query like "Write a debounce hook in React" to test.

### Build & Lint
- Build: `npm run build` (checks for errors)
- Lint: `npm run lint`
- Type Check: `npm run type-check`

## Usage
1. Enter a coding query in the form (e.g., "Implement binary search in JS with explanations").
2. Wait ~30-60s for the sequence (initials → reviews → ratings).
3. View: Best answer highlighted, plus breakdowns of all rounds.
4. **Browse History**: Access previous queries in the right sidebar - click any entry to instantly view results.
5. **Cache Benefits**: Re-submitting identical queries within 24 hours loads instantly from cache.

**Example Query**: "Build a React component for user auth with error handling."  
**Output**: Refined code + scores (e.g., Claude: 9.2/10).

## Deployment to Vercel
1. Push to GitHub.
2. Connect repo in [Vercel Dashboard](https://vercel.com/new).
3. Add env vars (ANTHROPIC_API_KEY, etc.) in Project Settings > Environment Variables.
4. Deploy: Auto-builds on push. Custom domain? Add in Domains tab.

**Costs**: ~$2-4 per query (API tokens). Monitor in Vercel Analytics.

## Project Structure
peer-ai-reviewer/
├── app/                  # Pages & API routes
│   ├── api/
│   │   ├── review/       # Main peer review endpoint (with caching)
│   │   ├── history/      # Query history CRUD endpoints
│   │   └── cache/        # Cache statistics endpoint
│   ├── page.tsx          # Main UI with history sidebar
│   └── layout.tsx
├── components/           # UI: QueryForm, AnswerDisplay, HistorySidebar
├── lib/                  # Utils: ai-client.ts, peer-review.ts, types.ts
│   ├── cache-service.ts  # Redis caching layer
│   ├── history-service.ts # Query history persistence
│   └── types.ts          # TypeScript interfaces
├── data/                 # File-based storage (created at runtime)
├── public/               # Static: favicon.ico, og-image.png
├── .env.local            # Secrets (gitignored)
├── next.config.js        # Config
├── tailwind.config.ts    # Styling
├── tsconfig.json         # TS
└── package.json          # Deps

## Customization
- **Swap Models**: Edit `lib/ai-client.ts` (e.g., add Grok via xAI API: https://x.ai/api).
- **Prompts**: Tweak in `lib/peer-review.ts` for non-coding use.
- **Rate Limiting**: Add to `app/api/review/route.ts` (e.g., via `upstash/ratelimit`).
- **Monetization**: Integrate Stripe in API for paid queries.
- **Database**: Replace file-based storage in `lib/history-service.ts` with PostgreSQL, MongoDB, or Supabase.
- **Cache Configuration**: Adjust `CACHE_TTL` in `.env.local` (default: 86400 seconds = 24 hours).
- **History Limits**: Set `MAX_HISTORY_PER_USER` to control storage per user.

## API Endpoints

### POST /api/review
Submit a query for peer review with automatic caching.
```json
{
  "query": "Your coding question",
  "userId": "optional-user-id"
}
```

### GET /api/history
Fetch query history with optional filters:
- `userId`: User identifier (default: "default")
- `search`: Search term for queries
- `startDate`: Unix timestamp for date filtering
- `endDate`: Unix timestamp for date filtering
- `minScore`: Minimum aggregated score
- `maxScore`: Maximum aggregated score

### GET /api/history/{id}
Get specific history entry by ID.

### DELETE /api/history
Clear all history for a user.

### DELETE /api/history/{id}
Delete specific history entry.

### GET /api/cache/stats
Get cache statistics (admin endpoint):
```json
{
  "totalQueries": 100,
  "cacheHits": 45,
  "cacheMisses": 55,
  "hitRate": 45.00,
  "cacheSize": 42
}
```

### DELETE /api/cache/stats
Clear all cached entries.

## Cache Management

The application uses a two-tier caching strategy:

1. **Redis Cache** (production): Configure `REDIS_URL` for persistent, distributed caching
2. **In-Memory Cache** (development): Automatic fallback when Redis is unavailable

**Cache Key Generation**: Queries are normalized (trimmed, lowercased) and hashed with SHA-256 to create consistent cache keys.

**Cache Invalidation**: 
- Automatic expiration after TTL (default: 24 hours)
- Manual clearing via DELETE /api/cache/stats endpoint
- Individual entry invalidation when models are updated

**Performance Impact**:
- Cache hits: ~50ms response time (vs 30-60s for full peer review)
- Cost savings: ~90% reduction in API costs for repeated queries

## Troubleshooting
- **API Errors**: Check Vercel logs (Functions tab). Rate limits? Add retries in `lib/peer-review.ts`.
- **Token Costs**: Monitor via provider dashboards; cap `max_tokens` in ai-client.
- **Build Fails**: Ensure deps match `package.json`; run `npm ci`.

## Contributing
Fork, PRs welcome! Focus: More models, streaming responses, VS Code extension.

## License


---


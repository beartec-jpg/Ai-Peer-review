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
3. Add API keys to `.env.local` (create if missing):
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...

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
├── components/           # UI: QueryForm, AnswerDisplay, etc.
├── lib/                  # Utils: ai-client.ts, peer-review.ts, types.ts
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

## Troubleshooting
- **API Errors**: Check Vercel logs (Functions tab). Rate limits? Add retries in `lib/peer-review.ts`.
- **Token Costs**: Monitor via provider dashboards; cap `max_tokens` in ai-client.
- **Build Fails**: Ensure deps match `package.json`; run `npm ci`.

## Contributing
Fork, PRs welcome! Focus: More models, streaming responses, VS Code extension.

## License


---


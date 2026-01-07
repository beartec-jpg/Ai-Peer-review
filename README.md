# AI Peer Review

A Next.js web app that provides code peer reviews using three distinct Grok AI personalities: Critical, Supportive, and Technical. Features passwordless authentication via magic links and stores review history in a database.

[![Vercel](https://theregister.s3.amazonaws.com/production/uploads/2021/05/vercel-logo.jpg)](https://vercel.com)  
*Get personalized code reviews from three AI personalities.*

## Features

### 🔐 Authentication
- **Magic Link Authentication**: Passwordless sign-in via email
- **Custom Domain Emails**: Sent from noreply@beartec.uk using Resend
- **Session Management**: Powered by NextAuth.js v5
- **Protected Routes**: Secure access to dashboard and reviews

### 🧠 Three Grok AI Personalities
Each review is analyzed by three distinct AI personalities:

1. **Critical Grok** 🔴
   - Harsh, merciless code reviewer
   - Finds flaws, inefficiencies, and mistakes
   - Direct, critical feedback

2. **Supportive Grok** 🟢
   - Encouraging mentor
   - Constructive feedback with confidence building
   - Supportive, growth-oriented tone

3. **Technical Grok** 🔵
   - Performance and security expert
   - Focus on optimization and best practices
   - Technical, detailed analysis

### 💾 Database & Storage
- User management with email verification
- Review history storage
- All three personality responses saved per review
- SQLite database (Prisma ORM)

### 🎨 UI Features
- Responsive design with dark mode support
- Sign-in page with email input
- Magic link verification screen
- Dashboard showing review history
- Review detail page with side-by-side personality responses
- Protected route middleware

## Tech Stack
- **Framework**: Next.js 15.1.4 (App Router, TypeScript)
- **Auth**: NextAuth.js v5.0.0-beta.25
- **Database**: Prisma ORM with SQLite (easily switchable to PostgreSQL)
- **Email**: Resend v3.0.0
- **AI**: Grok API (via x.ai using OpenAI SDK)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Quick Start

### Prerequisites
- Node.js 20+
- Grok API Keys: Get 3 separate keys from [x.ai](https://x.ai)
- Resend API Key: Get from [Resend](https://resend.com)
- Custom domain configured with Resend (e.g., beartec.uk)

### Setup
1. Clone the repo:
   ```bash
   git clone https://github.com/beartec-jpg/Ai-Peer-review.git
   cd Ai-Peer-review
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Create `.env.local` file:
   ```env
   # Grok API Keys (3 separate keys for different personalities)
   GROK_CRITICAL_KEY=xai-...your-grok-critical-key...
   GROK_SUPPORTIVE_KEY=xai-...your-grok-supportive-key...
   GROK_TECHNICAL_KEY=xai-...your-grok-technical-key...

   # NextAuth Configuration
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Resend Email Configuration
   RESEND_API_KEY=re_...your-resend-key...
   EMAIL_FROM=noreply@beartec.uk

   # Database
   DATABASE_URL="file:./dev.db"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Run locally:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Build & Lint
- Build: `npm run build` (checks for errors)
- Lint: `npm run lint`
- Type Check: `npm run type-check`

## Usage

1. **Sign In**: Enter your email to receive a magic link
2. **Submit Code**: Paste your code in the review form
3. **Wait**: Reviews take 30-60 seconds (three AI calls)
4. **View Results**: See all three personality reviews side-by-side
5. **History**: Access past reviews from your dashboard

**Example Flow**:
- Sign in with email → Receive magic link → Click link
- Paste code → Submit → View Critical, Supportive, and Technical reviews
- Return to dashboard to see all past reviews

## Deployment to Vercel

1. Push to GitHub

2. Connect repo in [Vercel Dashboard](https://vercel.com/new)

3. Add environment variables in Project Settings > Environment Variables:
   ```
   GROK_CRITICAL_KEY=...
   GROK_SUPPORTIVE_KEY=...
   GROK_TECHNICAL_KEY=...
   RESEND_API_KEY=...
   EMAIL_FROM=noreply@beartec.uk
   NEXTAUTH_SECRET=... (generate with: openssl rand -base64 32)
   NEXTAUTH_URL=https://your-domain.vercel.app
   DATABASE_URL=... (use Vercel Postgres or external DB)
   ```

4. Deploy: Auto-builds on push

5. **For Production Database**: Switch from SQLite to PostgreSQL:
   ```bash
   # Update prisma/schema.prisma datasource to:
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

## Project Structure
```
ai-peer-review/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth API routes
│   │   └── review/                # Review API endpoints
│   ├── auth/                      # Auth pages (signin, verify, error)
│   ├── dashboard/                 # Review history dashboard
│   ├── review/[id]/               # Individual review detail page
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main review submission page
├── components/                    # UI components
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── grok-client.ts             # Grok AI client with 3 personalities
│   ├── prisma.ts                  # Prisma client singleton
│   └── types.ts                   # TypeScript interfaces
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── middleware.ts                  # Protected route middleware
├── .env.local                     # Local environment variables
└── package.json                   # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Send magic link
- `GET /api/auth/callback/*` - Handle magic link callback

### Reviews (Protected)
- `POST /api/review` - Submit code for review
- `GET /api/review/history` - Get user's review history
- `GET /api/review/[id]` - Get specific review with all 3 personalities

## Customization

### Personality Prompts
Edit `lib/grok-client.ts` to customize the system prompts for each personality.

### Add More Personalities
1. Add new Grok API key to environment variables
2. Create new client in `lib/grok-client.ts`
3. Add new response field to Prisma schema
4. Update UI to display new personality

### Switch Database
Update `prisma/schema.prisma` datasource to use PostgreSQL, MySQL, or other supported databases.

### Rate Limiting
Add rate limiting middleware using `upstash/ratelimit` for production.

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install --legacy-peer-deps`
- Check Node.js version: `node --version` (should be 20+)

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set (generate: `openssl rand -base64 32`)
- Check `NEXTAUTH_URL` matches your deployment URL
- Verify Resend API key and domain configuration

### Database Issues
- Run migrations: `npx prisma migrate dev`
- Regenerate client: `npx prisma generate`
- For production, use PostgreSQL instead of SQLite

### API Errors
- Check Vercel logs (Functions tab) for detailed error messages
- Verify all 3 Grok API keys are correctly set
- Monitor token usage on x.ai dashboard

## Contributing
Fork the repo and submit PRs! Focus areas:
- Additional AI personalities
- Streaming responses
- Code syntax highlighting
- Review comparison tools
- Export reviews to PDF

## License
MIT

---

Built with ❤️ using Next.js, Grok AI, and NextAuth.js

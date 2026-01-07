# Deployment Guide for Vercel

## Prerequisites
- GitHub repository connected to Vercel
- Vercel account
- 3 Grok API keys from x.ai
- Resend API key
- Custom domain configured with Resend

## Environment Variables

Set these in Vercel Project Settings > Environment Variables:

### Required Variables

```env
# Grok API Keys (3 separate keys for different personalities)
GROK_CRITICAL_KEY=xai-XXXXXXXXXXXXXXXXXXXX
GROK_SUPPORTIVE_KEY=xai-XXXXXXXXXXXXXXXXXXXX
GROK_TECHNICAL_KEY=xai-XXXXXXXXXXXXXXXXXXXX

# NextAuth Configuration
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.vercel.app

# Resend Email Configuration
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=noreply@beartec.uk

# Database (for production, use Vercel Postgres or external DB)
DATABASE_URL=postgresql://username:password@host:port/database
```

## Setup Steps

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Click "Import"

### 2. Configure Environment Variables
1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Add each variable from the list above
4. Select environment (Production, Preview, Development)
5. Click "Save"

### 3. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Copy the output and use it as `NEXTAUTH_SECRET`

### 4. Update Database Provider (Production)

For production, switch from SQLite to PostgreSQL:

1. Add Vercel Postgres:
   - Go to Storage tab in Vercel
   - Click "Create Database"
   - Select "Postgres"
   - Copy the connection string to `DATABASE_URL`

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Run migration on Vercel:
   ```bash
   npx prisma migrate deploy
   ```

### 5. Configure Domain with Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain (e.g., beartec.uk)
3. Follow DNS setup instructions
4. Verify domain ownership
5. Create API key with "Sending access"
6. Update `EMAIL_FROM` to use your domain

### 6. Deploy

1. Commit all changes to main/master branch
2. Vercel will automatically deploy
3. Monitor build logs for any errors
4. Once deployed, visit your site

### 7. Verify Deployment

Test the following:
- [ ] Homepage redirects to sign-in page
- [ ] Sign-in page loads correctly
- [ ] Magic link email is received
- [ ] Magic link authentication works
- [ ] Dashboard loads after authentication
- [ ] Code review submission works
- [ ] Three personality reviews are displayed
- [ ] Review history is saved and accessible

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Authentication Issues
- Verify `NEXTAUTH_URL` exactly matches deployment URL (including https://)
- Check `NEXTAUTH_SECRET` is properly set
- Verify Resend domain is verified and API key is valid

### Database Connection Issues
- Verify `DATABASE_URL` is correctly formatted
- Ensure database is accessible from Vercel
- Run `npx prisma generate` before deploying

### Email Not Sending
- Check Resend dashboard for sending status
- Verify domain DNS records are correct
- Check API key permissions

### Grok API Errors
- Verify all 3 API keys are correctly set
- Check x.ai dashboard for API usage and limits
- Monitor Vercel function logs for detailed error messages

## Post-Deployment

### Monitor Usage
- **Vercel**: Check Function Execution and Bandwidth
- **x.ai**: Monitor API usage and token consumption
- **Resend**: Track email delivery rates

### Set Up Alerts
Configure alerts in Vercel for:
- Function errors
- High execution time
- Bandwidth limits

### Performance Optimization
- Enable Vercel Analytics
- Monitor API response times
- Consider caching strategies for review history

## Custom Domain (Optional)

1. Go to Vercel Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to use custom domain
5. Redeploy

## Rollback

If deployment fails:
1. Go to Deployments tab
2. Find last working deployment
3. Click three dots → "Promote to Production"

## Support

- Vercel Issues: [Vercel Support](https://vercel.com/support)
- NextAuth Issues: [NextAuth.js Docs](https://next-auth.js.org/)
- Grok API: [x.ai Documentation](https://x.ai/api)
- Resend: [Resend Docs](https://resend.com/docs)

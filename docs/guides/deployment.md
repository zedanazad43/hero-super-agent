# Hero-Super-Agent Deployment Guide

## Overview

This guide covers deploying hero-super-agent to:
1. **Cloudflare Workers** - Serverless compute
2. **Railway** - Managed cloud platform
3. **GitHub Pages** - Static documentation

## Prerequisites

- Node.js 20+ installed
- GitHub account with repository access
- Cloudflare account with Workers enabled
- Railway account with deployment capability
- GitHub CLI (`gh`) installed

## Step 1: GitHub Repository Setup

### Create New Repository

```bash
# Login to GitHub via CLI
gh auth login

# Create new repository
gh repo create hero-super-agent \
  --public \
  --description "Advanced AI Trading Advisor for DeFi" \
  --source=/path/to/hero-super-agent \
  --remote=origin \
  --push
```

### Add GitHub Secrets

```bash
# Navigate to repository
cd hero-super-agent

# Create GitHub secrets (via gh CLI)
gh secret set CLOUDFLARE_ACCOUNT_ID --body "652e53f35781522e2745784cc4425d9d"
gh secret set CLOUDFLARE_API_TOKEN --body "YOUR_CF_API_TOKEN"
gh secret set RAILWAY_TOKEN --body "YOUR_RAILWAY_TOKEN"
gh secret set RAILWAY_PROJECT_ID --body "YOUR_RAILWAY_PROJECT_ID"
```

## Step 2: Cloudflare Deployment

### Configure Wrangler

File: `wrangler.toml`

```toml
name = "hero-super-agent"
main = "src/index.js"
type = "service"
compatibility_date = "2024-12-19"
account_id = "652e53f35781522e2745784cc4425d9d"

[[kv_namespaces]]
binding = "HERO_STATE"
id = "hero-state-kv"

[[kv_namespaces]]
binding = "HERO_CACHE"
id = "hero-cache-kv"

[env.production.d1_databases]
HERO_DB = { binding = "HERO_DB", database_name = "hero-super-agent-db", database_id = "hero-super-agent-db" }

[[env.production.r2_buckets]]
binding = "ANALYSIS_REPORTS"
bucket_name = "hero-analysis-reports"

routes = [
  { pattern = "hero-super-agent.workers.dev/*", zone_name = "workers.dev" }
]

[env.production.vars]
ENVIRONMENT = "production"
LOG_LEVEL = "info"
API_TIMEOUT = "30000"
```

### Create KV Namespaces

```bash
# Create KV namespaces
wrangler kv:namespace create "HERO_STATE" --preview false
wrangler kv:namespace create "HERO_CACHE" --preview false

# Note the namespace IDs and update wrangler.toml
```

### Create D1 Database

```bash
# Create D1 database
wrangler d1 create "hero-super-agent-db"

# Update wrangler.toml with returned database_id
```

### Deploy to Cloudflare

```bash
# Dry-run first
npm run deploy:dry

# Deploy to production
npm run deploy

# Verify deployment
curl https://hero-super-agent.workers.dev/health
```

## Step 3: Railway Deployment

### Create Railway Project

```bash
# Login to Railway
railway login

# Create new project
railway init

# Link to this directory
railway link

# Set environment
railway environment --set production
```

### Configure Railway

File: `railway.json`

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "start": "node packages/api/server.js",
  "env": {
    "ENVIRONMENT": {
      "value": "production"
    },
    "LOG_LEVEL": {
      "value": "info"
    },
    "NODE_ENV": {
      "value": "production"
    }
  }
}
```

### Add Environment Variables

```bash
# Via Railway CLI
railway variables set ENVIRONMENT production
railway variables set LOG_LEVEL info
railway variables set NODE_ENV production
railway variables set CLOUDFLARE_ACCOUNT_ID 652e53f35781522e2745784cc4425d9d
```

### Deploy to Railway

```bash
# Push to Railway
railway up

# View logs
railway logs

# Verify deployment
railway status
```

## Step 4: GitHub Actions CI/CD

### Workflows Configured

#### CI Workflow (`.github/workflows/ci.yml`)
- Triggered on: push to main/dev, pull requests
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Lint code
  5. Check secrets
  6. Run tests
  7. Verify dry-run

#### Cloudflare Deploy (`.github/workflows/deploy-cloudflare.yml`)
- Triggered on: push to main
- Steps:
  1. Build Cloudflare Worker
  2. Deploy to Cloudflare
  3. Run smoke tests
  4. Send notifications

#### Railway Deploy (`.github/workflows/deploy-railway.yml`)
- Triggered on: push to main
- Steps:
  1. Build packages
  2. Deploy to Railway
  3. Verify deployment
  4. Health check

### Monitor Workflows

```bash
# View workflow status
gh run list

# View specific workflow
gh run view <run-id>

# View job logs
gh run view <run-id> --log
```

## Step 5: Post-Deployment Verification

### Health Checks

```bash
# Cloudflare health check
curl https://hero-super-agent.workers.dev/health

# Railway health check
curl https://hero-super-agent.railway.app/health

# View logs
wrangler tail
railway logs
```

### Smoke Tests

```bash
# Run smoke tests
npm run smoke:prod

# Run full verification
npm run verify:prod
```

### Monitor Performance

```bash
# Local monitoring
npm run monitor

# View Cloudflare Analytics
# https://dash.cloudflare.com/

# View Railway metrics
# https://railway.app/
```

## Deployment Checklist

- [ ] GitHub repository created
- [ ] GitHub secrets configured
- [ ] Cloudflare KV namespaces created
- [ ] Cloudflare D1 database created
- [ ] Wrangler configuration validated
- [ ] Railway project created
- [ ] Railway environment variables set
- [ ] CI/CD workflows enabled
- [ ] Initial deployment successful
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Monitoring configured

## Troubleshooting

### Cloudflare Deployment Issues

**Issue**: "Unauthorized" error
```bash
# Check credentials
wrangler whoami

# Re-authenticate
wrangler login
```

**Issue**: "Database not found"
```bash
# List databases
wrangler d1 list

# Create if missing
wrangler d1 create "hero-super-agent-db"
```

### Railway Deployment Issues

**Issue**: Build fails
```bash
# Check build logs
railway logs --environment=production

# Verify Procfile or railway.json
cat Procfile
```

**Issue**: Service won't start
```bash
# Check start command
cat railway.json

# Verify environment variables
railway variables list
```

### GitHub Actions Issues

**Issue**: Workflow fails
```bash
# View workflow logs
gh run view <run-id> --log

# Check secrets
gh secret list

# Re-run workflow
gh run rerun <run-id>
```

## Rollback Procedures

### Rollback Cloudflare Deployment

```bash
# Revert to previous version
git revert <commit-hash>
git push origin main

# GitHub Actions will trigger automatic redeploy
```

### Rollback Railway Deployment

```bash
# View deployment history
railway deployments

# Rollback to previous version
railway rollback <deployment-id>
```

## Performance Optimization

### Cloudflare Worker Optimization
- Minimize bundle size (target < 1.5 MB)
- Use KV caching for frequently accessed data
- Implement request batching
- Enable Argo Smart Routing

### Railway Optimization
- Use appropriate machine type
- Enable auto-scaling
- Configure health checks
- Monitor resource usage

## Security Best Practices

1. **Never commit secrets**
   ```bash
   # Use .gitignore for sensitive files
   echo ".env" >> .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **Rotate API tokens regularly**
   - Cloudflare API token every 90 days
   - Railway token every 90 days
   - GitHub token when compromised

3. **Enable branch protection**
   ```bash
   # Require PR reviews before merge
   gh repo edit --enable-auto-merge
   ```

4. **Monitor deployments**
   - Enable notifications
   - Review logs regularly
   - Set up alerts

## Support & Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Node.js Best Practices](https://nodejs.org/en/docs/)

---

**Status**: Ready for Production
**Last Updated**: 2024-01-15

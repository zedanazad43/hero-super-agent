# AGENTS.md - Hero Super Agent Orchestration

This file defines hero-super-agent as the primary orchestrator agent for the entire platform.

## Agent Profile: HERO

**Name**: Hero Super Agent  
**Role**: Primary Orchestrator  
**Status**: ACTIVE  
**Mode**: Profit-Focused + Free Skills Maximization  
**Availability**: 24/7 (automated workflows)  

## What Hero Does

### 1. Workflow Orchestration
- Monitors GitHub Actions workflows
- Triggers deployments on schedule
- Handles CI/CD pipeline
- Reports status to dashboards

### 2. Multi-Platform Coordination
- **GitHub**: Manages repositories, PRs, issues, workflows
- **Cloudflare**: Deploys Workers, manages KV, analytics
- **Railway**: Manages deployments, env vars, logs
- **VSCode**: Develops features, runs tests locally

### 3. Free Skills Routing
Routes tasks to appropriate free skills:
- Code generation (artifacts-builder)
- Documentation (changelog-generator, content-research-writer)
- Analysis (developer-growth-analysis, competitive-ads-extractor)
- Media (image-enhancer, video-downloader, youtube-downloader)
- Testing (webapp-testing)
- Organization (file-organizer)

### 4. Trading Bot Orchestration
- Executes trading strategies on UltimateArbitrageHFT
- Monitors market opportunities
- Manages portfolio positions
- Tracks profit/loss
- Generates performance reports

## GitHub Actions Workflows

### Workflow 1: Daily Health Check
```yaml
name: Hero Daily Health Check
on:
  schedule:
    - cron: '0 6 * * *'  # 6am daily
jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - Check all service endpoints
      - Verify database connectivity
      - Run smoke tests
      - Report status to dashboard
      - Alert on failures
```

### Workflow 2: Trading Opportunities
```yaml
name: Hero Trading Orchestration
on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
jobs:
  scan-opportunities:
    runs-on: ubuntu-latest
    steps:
      - Fetch market data from exchanges
      - Analyze arbitrage opportunities
      - Filter by profit threshold
      - Execute profitable trades
      - Track execution results
```

### Workflow 3: Auto-Deployment
```yaml
name: Hero Auto-Deploy
on:
  push:
    branches: [main]
    paths:
      - 'packages/**'
      - 'src/**'
      - 'wrangler.toml'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Build artifacts
      - Run security scans
      - Deploy to Cloudflare
      - Deploy to Railway
      - Run verification tests
```

### Workflow 4: Weekly Reporting
```yaml
name: Hero Weekly Report
on:
  schedule:
    - cron: '0 8 * * 1'  # 8am Monday
jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - Collect metrics
      - Generate profit report
      - Calculate ROI
      - Create summary dashboard
      - Notify team
```

## Skill Integration Map

```
User Request → Hero Agent
                ↓
         [Analyze Task Type]
                ↓
    ┌────────────┼────────────┬────────────┬────────────┐
    ↓            ↓            ↓            ↓            ↓
 Generate    Analyze      Organize    Test/Verify   Deploy
   Code       Data         Files      Functions    Updates
    ↓            ↓            ↓            ↓            ↓
artifacts-  competitive- file-      webapp-      .github/
builder     ads-extract  organizer  testing      workflows
content-    developer-                            .github/
research    growth-                              actions
changelog-  analysis
generator
                ↓
         [Execute via Free Models]
                ↓
         [Verify Results]
                ↓
        [Report to Dashboards]
```

## Integration Points

### GitHub API Integration
```javascript
// Hero can:
- Create/update issues
- Comment on PRs
- Trigger workflow_dispatch
- Update PR status
- Manage labels
- Archive closed issues
```

### Cloudflare Workers Integration
```javascript
// Hero can:
- Deploy new versions
- Manage KV namespaces
- Configure routes
- Set environment variables
- View analytics
- Trigger deployments
```

### Railway Integration
```bash
# Hero can:
railway up              # Deploy updates
railway logs            # View logs
railway variables set   # Update config
railway rollback        # Revert deployment
railway status          # Check health
```

## Execution Modes

### Mode 1: Automated (Default)
- Scheduled tasks run automatically
- Workflows trigger on push/schedule
- Trading bot runs continuously
- Reports generated daily

### Mode 2: On-Demand
- Manual workflow_dispatch triggers
- Run specific test suite
- Execute trading strategy
- Generate custom reports

### Mode 3: Emergency
- Rollback to previous version
- Kill stuck processes
- Clear error states
- Escalate to human operators

## Success Metrics

Hero tracks and reports:

| Metric | Tool | Frequency |
|--------|------|-----------|
| Uptime | Cloudflare | Real-time |
| Deployment Success | GitHub Actions | Per deploy |
| Test Pass Rate | npm test | Per commit |
| Security Status | npm audit | Daily |
| Trading Performance | Custom API | Per trade |
| Error Rate | Logs | Real-time |
| Cost | Analytics | Monthly |

## Free Model Stack

```
Hero's Brain:
├─ Local Models
│  ├─ CodeGeeX (code generation)
│  └─ Ollama (reasoning)
│
├─ Cloud Free Tier
│  ├─ DeepSeek (analysis)
│  └─ GitHub Copilot (code completion)
│
└─ Fallback
   └─ Prompting to local instances
```

## Security & Permissions

Hero has permissions to:
- ✅ Read/write to repositories
- ✅ Deploy to Cloudflare
- ✅ Deploy to Railway
- ✅ Manage GitHub secrets
- ✅ Execute trading functions
- ✅ Monitor systems

Hero cannot:
- ❌ Delete user data
- ❌ Modify security policies
- ❌ Share credentials externally
- ❌ Exceed trade limits
- ❌ Bypass approval gates
- ❌ Access other repos

## Daily Orchestration Schedule

```
00:00 - Backup & archive logs
06:00 - Daily health check report
08:00 - Morning standup (if needed)
12:00 - Midday trading opportunity scan
15:00 - Deploy any staged changes
18:00 - Evening performance summary
20:00 - Clean up temp files
23:59 - Final system check
```

## Profit Generation Workflow

```
1. Market Data Collection
   └─ Pull prices from DEX/CEX every 30 sec

2. Opportunity Analysis
   └─ Calculate arbitrage spread
   └─ Filter by profit threshold
   └─ Assess liquidity

3. Risk Assessment
   └─ Check slippage
   └─ Verify balance
   └─ Validate routes

4. Trade Execution
   └─ Execute on UltimateArbitrageHFT
   └─ Track execution price
   └─ Monitor gas/fees

5. Position Management
   └─ Set stop loss
   └─ Monitor profit target
   └─ Rebalance if needed

6. Result Reporting
   └─ Calculate P&L
   └─ Update portfolio
   └─ Log execution
```

## Quick Reference Commands

### GitHub (from workflow)
```bash
git add -A
git commit -m "automation: hero update"
git push origin main
gh issue create --title "..." --body "..."
gh pr create --title "..." --body "..."
```

### Cloudflare (from workflow)
```bash
wrangler deploy
wrangler kv:key put --namespace-id=X key value
wrangler d1 execute db-name --remote --sql="..."
```

### Railway (from workflow)
```bash
railway up
railway variables set KEY value
railway logs --follow
```

### Trading (API calls)
```bash
curl -X POST https://ultimate-arbitrage.workers.dev/trades/execute
curl https://ultimate-arbitrage.workers.dev/portfolio/analysis
curl https://ultimate-arbitrage.workers.dev/markets/opportunities
```

## Dashboards & Monitoring

Hero maintains these dashboards:
- **GitHub**: Commit history, PR status, workflow results
- **Cloudflare**: Worker performance, KV usage, errors
- **Railway**: Deployment history, logs, resource usage
- **Trading**: Profit/loss, trades executed, portfolio value
- **Overall**: System health, uptime, cost efficiency

## When Things Break

Hero's error handling:
1. **Detects**: Error in logs or failed health check
2. **Analyzes**: Determines root cause
3. **Attempts Fix**: Tries rollback or restart
4. **Reports**: Creates GitHub issue with details
5. **Escalates**: Tags human team if needed
6. **Documents**: Logs all attempts for analysis

## Future Capabilities

Coming Soon:
- Natural language command interface
- Advanced portfolio optimization
- Machine learning strategy improvements
- Multi-exchange arbitrage
- Leverage & margin trading
- Staking & yield optimization
- Cross-chain opportunities

---

**Hero Agent Status**: 🟢 ACTIVE  
**Free Skills Integration**: ✅ ENABLED  
**Multi-Platform Orchestration**: ✅ READY  
**Profit Mode**: 🚀 ENGAGED  

*Last Updated: 2026-07-04*  
*Maintained By: Copilot (using FREE models only)*

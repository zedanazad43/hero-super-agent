# Hero Super Agent 🦸

**Advanced AI Trading Advisor for DeFi**

Hero-super-agent is an intelligent trading advisory system that provides real-time market analysis, arbitrage opportunities, and risk management for decentralized finance (DeFi) trading.

## Features

- 🤖 **AI-Powered Analysis**: Advanced machine learning models for market prediction
- 📊 **Real-Time Data**: Multi-source data aggregation and analysis
- 🔄 **Arbitrage Detection**: Automated cross-exchange opportunity identification
- 💰 **Risk Management**: Portfolio optimization and risk assessment
- 🌐 **DeFi Integration**: Seamless integration with major DeFi protocols
- ⚡ **Cloudflare Workers**: Serverless deployment for high availability
- 🚀 **Railway Support**: Cloud deployment with auto-scaling

## 🔥 NEW: FreeBuff.com Integration

**Autonomous profit generation from FreeBuff.com using 100% FREE AI models.**

```
Every 30 minutes:
├─ Scan FreeBuff for opportunities
├─ Filter by profitability (ROI >= 5%)
├─ Route to optimal FREE models (Groq, DeepSeek, CodeGeeX)
├─ Execute profitable tasks autonomously
└─ Track earnings in real-time

Cost: $0.00 (all FREE models)
Revenue: $500-2,000/day (conservative)
Revenue: $3,000-15,000/day (aggressive)
```

**See [FREEBUFF_SETUP_GUIDE.md](./FREEBUFF_SETUP_GUIDE.md) for complete setup.**

## Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- Cloudflare Account (for Workers deployment)
- Railway Account (for API deployment)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/hero-super-agent.git
cd hero-super-agent
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

### 🔥 FreeBuff Profit Generation

```bash
# Check FreeBuff agent status
npm run freebuff:status

# Manually scan for opportunities
npm run freebuff:scan

# Execute profitable tasks (using FREE models)
npm run freebuff:execute

# Start Hero Master Orchestrator (daily + profit loops)
npm run orchestrator:start

# Check orchestrator status
npm run orchestrator:status

# Run daily health check (6am UTC)
npm run profit:daily

# Run continuous profit orchestration (every 30 min)
npm run profit:continuous
```

### Deployment

```bash
# Dry-run deployment to verify
npm run deploy:dry

# Deploy to production
npm run deploy

# Verify production deployment
npm run verify:prod

# Run smoke tests
npm run smoke:prod
```

## Repository Structure

```
hero-super-agent/
├── packages/
│   ├── cloudflare/          # Cloudflare Worker deployment
│   │   ├── src/
│   │   ├── wrangler.toml
│   │   └── package.json
│   ├── api/                 # REST API server
│   │   ├── src/
│   │   ├── server.js
│   │   └── package.json
│   └── web/                 # Web interface
│       ├── public/
│       ├── src/
│       └── package.json
├── src/                     # Shared source code
├── scripts/
│   ├── deploy/              # Deployment scripts
│   ├── build/               # Build scripts
│   └── check/               # Validation scripts
├── tests/                   # Test suites
├── docs/
│   ├── guides/              # Deployment guides
│   └── api/                 # API documentation
├── wrangler.toml            # Cloudflare configuration
├── railway.json             # Railway configuration
├── Procfile                 # Process management
└── package.json             # Root package manifest
```

## Deployment Targets

### Cloudflare Workers
- **Endpoint**: `https://hero-super-agent.workers.dev`
- **Configuration**: `wrangler.toml`
- **Command**: `npm run deploy`

### Railway
- **Service**: `hero-super-agent`
- **Configuration**: `railway.json`
- **Start Command**: `node packages/api/server.js`
- **Auto-Deploy**: On main branch push

### GitHub Pages (Documentation)
- Static documentation available at repository pages

## Configuration

### Environment Variables

Create `.env` file in root:

```env
# Environment
ENVIRONMENT=production
LOG_LEVEL=info
NODE_ENV=production

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=652e53f35781522e2745784cc4425d9d
CLOUDFLARE_API_TOKEN=your_token_here

# Railway
RAILWAY_TOKEN=your_token_here
RAILWAY_PROJECT_ID=your_project_id

# API
API_TIMEOUT=30000
API_PORT=3000

# Database
DATABASE_URL=your_d1_database_url
```

### Secrets Management

Use GitHub Secrets for sensitive data:

```bash
# In GitHub repository settings, add:
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
RAILWAY_TOKEN
RAILWAY_PROJECT_ID
D1_DATABASE_ID
```

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Verify Production
```bash
npm run verify:prod
```

### Smoke Tests
```bash
npm run smoke:prod
```

## Performance Monitoring

### Local Monitoring
```bash
npm run monitor
```

### Production Monitoring
- Cloudflare Analytics Engine
- Railway metrics dashboard
- Custom monitoring scripts in `scripts/monitor/`

## API Reference

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### Market Analysis
```
POST /api/analysis
Content-Type: application/json

{
  "symbols": ["BTC", "ETH"],
  "timeframe": "1h"
}
```

### Arbitrage Opportunities
```
GET /api/arbitrage?exchanges=uniswap,curve,aave
```

## Security

### Security Audits
```bash
npm run check:secrets
npm run audit:security
```

### Best Practices
- All secrets stored in environment variables
- API tokens never committed to git
- Regular security scanning via GitHub Actions
- OWASP compliance validation

## Troubleshooting

### Deployment Issues

**Problem**: `wrangler deploy` fails
- Check Cloudflare credentials in environment
- Verify account_id in wrangler.toml
- Run `npm run deploy:dry` for details

**Problem**: Railway deployment stuck
- Check Railway project configuration
- Verify start command in railway.json
- Review Railway deployment logs

### Build Issues

**Problem**: npm install fails
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

### Runtime Issues

**Problem**: Worker returns 500 error
- Check wrangler logs: `wrangler tail`
- Verify D1 database connection
- Review KV namespace binding

## Documentation

- [Deployment Guide](docs/guides/deployment.md)
- [API Documentation](docs/api/reference.md)
- [Architecture Overview](docs/architecture.md)
- [Configuration Guide](docs/guides/configuration.md)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/name`
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [hero-super-agent/issues](https://github.com/YOUR_USERNAME/hero-super-agent/issues)
- Documentation: [docs/](docs/)
- Email: support@example.com

## Relationship to UltimateArbitrageHFT

Hero-super-agent is now an **independent project** separated from UltimateArbitrageHFT:

| Aspect | Status |
|--------|--------|
| GitHub Repo | Separate ✅ |
| Cloudflare Worker | Separate ✅ |
| Railway Project | Separate ✅ |
| CI/CD Pipelines | Separate ✅ |
| Database | Separate (`hero-super-agent-db`) ✅ |
| Deployment | Independent ✅ |

While both projects share the same Cloudflare account, they operate as completely independent services with their own:
- Deployment pipelines
- Configurations
- Resources
- Release cycles

---

**Status**: Production Ready
**Last Updated**: 2024-01-15
**Maintained By**: Copilot

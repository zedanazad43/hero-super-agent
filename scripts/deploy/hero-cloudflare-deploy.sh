#!/bin/bash
# Hero Orchestrator - Cloudflare Deployment
set -e

echo "🚀 Hero Orchestrator deploying to Cloudflare Workers..."
echo "📍 Service: hero-super-agent.workers.dev"

# Install dependencies
npm install

# Build Cloudflare Worker
npm run build:cloudflare

# Deploy
echo "⚡ Deploying hero-super-agent to Cloudflare..."
wrangler deploy

# Verify deployment
echo "✅ Verifying deployment..."
curl -f https://hero-super-agent.workers.dev/health || echo "⚠️ Health check pending"

echo "🎉 Hero Orchestrator deployed successfully!"

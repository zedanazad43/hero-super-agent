#!/bin/bash
# Hero Orchestrator - Railway Deployment
set -e

echo "🚀 Hero Orchestrator deploying to Railway..."

# Build all packages
npm run build

# Deploy to Railway
echo "⚡ Deploying hero-super-agent to Railway..."
railway up

echo "🎉 Hero Orchestrator deployed to Railway successfully!"

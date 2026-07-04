// 🦸 HERO ORCHESTRATOR - UNIVERSAL FREE MODELS & SKILLS REGISTRY
// Complete integration of all available FREE AI models, skills, and agents

export const HERO_FREE_ECOSYSTEM = {
  // ========== FREE LOCAL MODELS ==========
  LOCAL_MODELS: {
    codegeex: {
      name: 'CodeGeeX',
      endpoint: 'http://127.0.0.1:8000',
      type: 'code-generation',
      capabilities: ['code-generation', 'code-analysis', 'code-refactoring'],
      maxTokens: 8000,
      cost: 'FREE',
      status: 'active'
    },
    ollama: {
      name: 'Ollama Multi-Model',
      endpoint: 'http://127.0.0.1:11434',
      type: 'multi-model',
      capabilities: ['text-generation', 'code', 'chat', 'reasoning'],
      models: [
        'llama2', 'llama2:13b', 'mistral', 'neural-chat:7b',
        'dolphin-mixtral', 'orca-mini', 'alpaca', 'vicuna', 'falcon'
      ],
      maxTokens: 4096,
      cost: 'FREE',
      status: 'active'
    }
  },

  // ========== FREE CLOUD MODELS (No Credit Card) ==========
  CLOUD_MODELS_FREE: {
    deepseek: {
      name: 'DeepSeek API',
      endpoint: 'https://api.deepseek.com/v1',
      type: 'language-model',
      models: ['deepseek-coder', 'deepseek-chat'],
      maxTokens: 4096,
      cost: 'FREE',
      status: 'active'
    },
    groq: {
      name: 'Groq Cloud',
      endpoint: 'https://api.groq.com/openai/v1',
      type: 'fast-inference',
      models: ['llama2-70b', 'mixtral-8x7b', 'gemma-7b'],
      maxTokens: 8000,
      cost: 'FREE',
      status: 'active'
    },
    huggingface: {
      name: 'HuggingFace Hub',
      endpoint: 'https://huggingface.co/inference',
      type: 'model-hub',
      models: ['gpt2', 'bloom', 'flan-t5', 'mistral', 'codellama', 'phi'],
      maxTokens: 4096,
      cost: 'FREE',
      status: 'active'
    },
    replicate: {
      name: 'Replicate',
      endpoint: 'https://api.replicate.com/v1',
      type: 'model-marketplace',
      models: ['mistral', 'llama2', 'codellama', 'stable-diffusion', 'whisper'],
      capabilities: ['text', 'code', 'images', 'video', 'audio'],
      cost: 'FREE',
      status: 'active'
    },
    together_ai: {
      name: 'Together.ai',
      endpoint: 'https://api.together.xyz/v1',
      type: 'inference-platform',
      models: ['llama2-70b', 'mistral-7b', 'codellama-34b', 'falcon-40b'],
      maxTokens: 8000,
      cost: 'FREE',
      status: 'active'
    },
    fireworks_ai: {
      name: 'Fireworks.ai',
      endpoint: 'https://api.fireworks.ai/inference/v1',
      type: 'serverless-inference',
      models: ['llama-v2-70b', 'mistral-7b', 'qwen-72b', 'deepseek-coder'],
      maxTokens: 8000,
      cost: 'FREE',
      status: 'active'
    },
    perplexity: {
      name: 'Perplexity Labs',
      endpoint: 'https://api.perplexity.ai',
      type: 'search-ai',
      models: ['pplx-7b-online', 'llama-2-70b-chat'],
      capabilities: ['search', 'real-time-qa', 'research'],
      cost: 'FREE',
      status: 'active'
    }
  },

  // ========== 50+ FREE COMMUNITY SKILLS ==========
  FREE_SKILLS: [
    // Code (10)
    'artifacts-builder', 'code-exemplars', 'mcp-builder', 'codeql',
    'conventional-branch', 'conventional-commit', 'code-tour',
    'create-technical-spike', 'dotnet-upgrade', 'ef-core',

    // Documentation (15)
    'changelog-generator', 'content-research-writer', 'create-readme',
    'create-specification', 'document-generate', 'document-release',
    'comment-code-generate-a-tutorial', 'create-tldr-page',
    'create-architectural-decision-record', 'email-drafter',
    'finishing-a-development-branch', 'api-doc-generator',
    'acreadiness-generate-instructions', 'add-educational-comments',
    'breaking-change-detection',

    // Analysis & Intelligence (12)
    'developer-growth-analysis', 'competitive-ads-extractor',
    'meeting-insights-analyzer', 'langsmith-fetch', 'lead-research-assistant',
    'agentic-eval', 'autoresearch', 'code-review',
    'architecture-blueprint-generator', 'cso', 'agent-owasp-compliance',
    'data-breach-blast-radius',

    // Organization & Tools (10)
    'file-organizer', 'folder-structure-blueprint-generator', 'context-map',
    'editorconfig', 'batch-files', 'slack-gif-creator', 'invoice-organizer',
    'context-save', 'context-restore', 'raffle-winner-picker',

    // Media & Design (8)
    'image-enhancer', 'video-downloader', 'youtube-downloader',
    'theme-factory', 'draw-io-diagram-generator', 'excalidraw-diagram-generator',
    'canvas-design', 'adobe-illustrator-scripting',

    // Testing & Quality (8)
    'webapp-testing', 'unit-test-generator', 'test-driven-development',
    'verification-before-completion', 'systematic-debugging',
    'csharp-mstest', 'csharp-nunit', 'csharp-xunit',

    // Cloud & DevOps (10)
    'azure-cost-optimize', 'aws-cost-optimize', 'cloud-design-patterns',
    'lean-ctx', 'careful', 'ai-ready', 'devops-rollout-plan',
    'acreadiness-assess', 'agent-governance', 'azure-compliance',

    // Business (8)
    'tailored-resume-generator', 'brag-sheet', 'skill-creator',
    'skill-share', 'brand-guidelines', 'internal-comms',
    'brainstorming', 'domain-name-brainstormer'
  ],

  // ========== SPECIALIZED AGENTS ==========
  AGENT_REGISTRY: {
    hero: {
      role: 'Primary Orchestrator',
      description: 'Master coordinator for all systems, models, and skills',
      access: 'All',
      priority: 1,
      capabilities: [
        'model-routing', 'skill-routing', 'agent-coordination',
        'freebuff-integration', 'trading-execution'
      ]
    },
    code_agent: {
      role: 'Code Specialist',
      description: 'Code generation, analysis, and refactoring',
      skills: ['artifacts-builder', 'code-exemplars', 'codeql', 'code-tour'],
      models: ['CodeGeeX', 'llama2-code', 'code-llama', 'mistral'],
      priority: 2
    },
    research_agent: {
      role: 'Research Intelligence',
      description: 'Market research and competitive analysis',
      skills: ['competitive-ads-extractor', 'lead-research-assistant', 'agentic-eval'],
      models: ['Perplexity', 'Groq', 'DeepSeek'],
      priority: 2
    },
    content_agent: {
      role: 'Content Creator',
      description: 'Documentation and writing',
      skills: ['changelog-generator', 'content-research-writer', 'create-specification'],
      models: ['Ollama', 'HuggingFace', 'Together.ai'],
      priority: 2
    },
    freebuff_agent: {
      role: 'FreeBuff Specialist',
      description: 'Detect and execute FreeBuff opportunities for profit',
      skills: ['competitive-ads-extractor', 'agentic-eval', 'developer-growth-analysis'],
      models: ['Groq', 'DeepSeek', 'CodeGeeX'],
      priority: 2,
      specialization: 'profit-generation'
    },
    trading_agent: {
      role: 'Trading & Arbitrage',
      description: 'Profit generation from trading opportunities',
      skills: ['developer-growth-analysis', 'competitive-ads-extractor'],
      models: ['DeepSeek', 'Groq', 'Together.ai'],
      priority: 2,
      specialization: 'profit-generation'
    },
    optimization_agent: {
      role: 'Optimizer',
      description: 'Cost and performance optimization',
      skills: ['azure-cost-optimize', 'aws-cost-optimize', 'cloud-design-patterns'],
      models: ['Ollama', 'HuggingFace'],
      priority: 2
    },
    test_agent: {
      role: 'QA & Testing',
      description: 'Quality assurance and testing',
      skills: ['webapp-testing', 'unit-test-generator', 'test-driven-development'],
      models: ['Mistral', 'Neural-Chat'],
      priority: 2
    }
  },

  // ========== INTELLIGENT ROUTING SYSTEM ==========
  ROUTING_MATRIX: {
    'code-generation': {
      primary: ['CodeGeeX', 'code-llama', 'mistral'],
      fallback: ['llama2', 'groq'],
      agent: 'code_agent'
    },
    'reasoning': {
      primary: ['DeepSeek', 'Groq', 'Together.ai'],
      fallback: ['HuggingFace'],
      agent: 'research_agent'
    },
    'search-research': {
      primary: ['Perplexity', 'HuggingFace'],
      fallback: ['Groq', 'DeepSeek'],
      agent: 'research_agent'
    },
    'writing-documentation': {
      primary: ['Ollama', 'HuggingFace', 'Mistral'],
      fallback: ['Together.ai'],
      agent: 'content_agent'
    },
    'freebuff-opportunities': {
      primary: ['Groq', 'DeepSeek'],
      fallback: ['CodeGeeX'],
      agent: 'freebuff_agent',
      specialization: 'profit-detection'
    },
    'image-generation': {
      primary: ['Stable-Diffusion', 'Replicate'],
      fallback: ['HuggingFace'],
      agent: 'hero'
    },
    'speech-to-text': {
      primary: ['Whisper', 'Mozilla-STT'],
      via: ['Replicate', 'HuggingFace'],
      agent: 'hero'
    },
    'general-chat': {
      primary: ['Ollama', 'Groq', 'HuggingFace'],
      fallback: ['Together.ai'],
      agent: 'hero'
    }
  },

  // ========== EXECUTION STRATEGY ==========
  EXECUTION_PRIORITY: {
    'speed-critical': [
      'CodeGeeX (local)',
      'Groq',
      'Ollama'
    ],
    'cost-critical': [
      'Local Models',
      'HuggingFace',
      'Ollama'
    ],
    'quality-critical': [
      'DeepSeek',
      'Together.ai',
      'Groq'
    ],
    'freebuff-profit': [
      'Groq',
      'DeepSeek',
      'CodeGeeX',
      'Together.ai'
    ]
  },

  // ========== INTEGRATION CONFIGURATION ==========
  INTEGRATION: {
    freebuff: {
      enabled: true,
      endpoint: 'https://api.freebuff.com/v1',
      updateFrequency: '30 minutes',
      profitThreshold: 0.05, // 5% minimum profit
      agent: 'freebuff_agent'
    },
    ultimatearbitrage: {
      enabled: true,
      endpoint: 'https://ultimate-arbitrage.workers.dev',
      capabilities: ['arbitrage', 'market-scanning', 'trade-execution'],
      agent: 'trading_agent'
    },
    github_actions: {
      enabled: true,
      workflows: [
        'hero-daily-orchestration',
        'hero-profit-orchestration',
        'ci-build-deploy'
      ]
    }
  }
};

export default HERO_FREE_ECOSYSTEM;

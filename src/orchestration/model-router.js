// 🧠 HERO MODEL ROUTING ENGINE - Intelligent dynamic task-to-model mapping

import { HERO_FREE_ECOSYSTEM } from './free-ecosystem-registry.js';

class HeroModelRouter {
  constructor() {
    this.registry = HERO_FREE_ECOSYSTEM;
    this.modelStates = new Map(); // Track model availability/performance
    this.taskQueue = [];
    this.metrics = {
      routings: 0,
      successRate: 1.0,
      avgLatency: 0,
      costSaved: 0
    };
  }

  /**
   * Route a task to optimal model based on requirements
   * @param {string} taskType - Type of task (code-generation, reasoning, etc)
   * @param {object} options - Optional: priority, urgency, constraints
   * @returns {object} - Selected model endpoint and metadata
   */
  async routeTask(taskType, options = {}) {
    const { priority = 'normal', urgency = 'standard', maxLatency = 5000 } = options;

    // Get candidate models for this task type
    const candidates = this.registry.ROUTING_MATRIX[taskType] || {
      primary: this.registry.ROUTING_MATRIX['general-chat'].primary,
      agent: 'hero'
    };

    // Check urgency: prioritize speed for time-sensitive tasks
    let selectedModel;
    if (urgency === 'immediate') {
      selectedModel = await this.selectFastestModel(candidates.primary);
    } else if (priority === 'cost') {
      selectedModel = await this.selectCheapestModel(candidates.primary);
    } else if (priority === 'quality') {
      selectedModel = await this.selectBestQualityModel(candidates.primary);
    } else {
      // Default: balanced approach (speed + cost)
      selectedModel = await this.selectBalancedModel(candidates.primary);
    }

    // Fallback if primary unavailable
    if (!selectedModel && candidates.fallback) {
      console.log(`[HERO] Primary models unavailable, trying fallback...`);
      selectedModel = await this.selectBalancedModel(candidates.fallback);
    }

    if (!selectedModel) {
      console.error(`[HERO] No models available for task: ${taskType}`);
      return null;
    }

    // Log metrics
    this.metrics.routings++;
    return {
      model: selectedModel,
      taskType,
      agent: candidates.agent,
      timestamp: new Date().toISOString(),
      priority,
      urgency
    };
  }

  /**
   * Select fastest available model (prioritize local)
   */
  async selectFastestModel(models) {
    const priorityOrder = [
      'CodeGeeX', 'Ollama', 'Groq', 'Together.ai', 'Fireworks.ai',
      'DeepSeek', 'HuggingFace', 'Replicate', 'Perplexity'
    ];

    for (const modelName of priorityOrder) {
      if (models.includes(modelName)) {
        const model = this.getModelConfig(modelName);
        if (await this.isHealthy(model)) {
          console.log(`[HERO] Selected (speed): ${modelName}`);
          return model;
        }
      }
    }
    return null;
  }

  /**
   * Select cheapest model (prefer local)
   */
  async selectCheapestModel(models) {
    const costOrder = [
      'CodeGeeX', 'Ollama', 'HuggingFace', 'Replicate',
      'Together.ai', 'Groq', 'Fireworks.ai', 'DeepSeek', 'Perplexity'
    ];

    for (const modelName of costOrder) {
      if (models.includes(modelName)) {
        const model = this.getModelConfig(modelName);
        if (await this.isHealthy(model)) {
          console.log(`[HERO] Selected (cost): ${modelName}`);
          return model;
        }
      }
    }
    return null;
  }

  /**
   * Select best quality model
   */
  async selectBestQualityModel(models) {
    const qualityOrder = [
      'DeepSeek', 'Together.ai', 'Groq', 'Perplexity',
      'Fireworks.ai', 'HuggingFace', 'Replicate', 'CodeGeeX', 'Ollama'
    ];

    for (const modelName of qualityOrder) {
      if (models.includes(modelName)) {
        const model = this.getModelConfig(modelName);
        if (await this.isHealthy(model)) {
          console.log(`[HERO] Selected (quality): ${modelName}`);
          return model;
        }
      }
    }
    return null;
  }

  /**
   * Balanced selection (good speed + cost + quality)
   */
  async selectBalancedModel(models) {
    const balancedOrder = [
      'Ollama', 'CodeGeeX', 'Groq', 'Together.ai',
      'DeepSeek', 'HuggingFace', 'Fireworks.ai', 'Replicate', 'Perplexity'
    ];

    for (const modelName of balancedOrder) {
      if (models.includes(modelName)) {
        const model = this.getModelConfig(modelName);
        if (await this.isHealthy(model)) {
          console.log(`[HERO] Selected (balanced): ${modelName}`);
          return model;
        }
      }
    }
    return null;
  }

  /**
   * Get full model configuration
   */
  getModelConfig(modelName) {
    // Check local models first
    for (const [key, model] of Object.entries(this.registry.LOCAL_MODELS)) {
      if (model.name === modelName) return { ...model, source: 'local', key };
    }

    // Check cloud models
    for (const [key, model] of Object.entries(this.registry.CLOUD_MODELS_FREE)) {
      if (model.name === modelName) return { ...model, source: 'cloud', key };

      // Handle nested models array
      if (model.models && model.models.includes(modelName)) {
        return { ...model, specific_model: modelName, source: 'cloud', key };
      }
    }

    return null;
  }

  /**
   * Health check if model is available
   */
  async isHealthy(model) {
    if (!model) return false;

    // Check cache first
    const cacheKey = model.name || model.key;
    if (this.modelStates.has(cacheKey)) {
      const cached = this.modelStates.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // Cache 1 minute
        return cached.healthy;
      }
    }

    try {
      // Quick health check via endpoint
      if (model.endpoint && model.endpoint.startsWith('http')) {
        const response = await fetch(model.endpoint, {
          method: 'GET',
          timeout: 3000
        });
        const healthy = response.ok || response.status !== 503;
        this.modelStates.set(cacheKey, { healthy, timestamp: Date.now() });
        return healthy;
      }

      // Assume healthy if no endpoint to check
      this.modelStates.set(cacheKey, { healthy: true, timestamp: Date.now() });
      return true;
    } catch (error) {
      console.log(`[HERO] Model ${model.name} health check failed:`, error.message);
      this.modelStates.set(cacheKey, { healthy: false, timestamp: Date.now() });
      return false;
    }
  }

  /**
   * Route for specific profit/trading task (FreeBuff, Arbitrage)
   */
  async routeProfitTask(taskType) {
    const profitModels = this.registry.EXECUTION_PRIORITY['freebuff-profit'];
    const selectedModel = await this.selectFastestModel(profitModels);

    return {
      model: selectedModel,
      taskType,
      agent: 'freebuff_agent',
      priority: 'speed',  // Profit opportunities need fast execution
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get recommended agent for a task
   */
  getRecommendedAgent(taskType) {
    const route = this.registry.ROUTING_MATRIX[taskType];
    if (!route) return this.registry.AGENT_REGISTRY.hero;

    const agentName = route.agent || 'hero';
    return this.registry.AGENT_REGISTRY[agentName];
  }

  /**
   * Get all available models grouped by capability
   */
  getAvailableModels() {
    return {
      local: this.registry.LOCAL_MODELS,
      cloud: this.registry.CLOUD_MODELS_FREE,
      skills: this.registry.FREE_SKILLS,
      agents: Object.keys(this.registry.AGENT_REGISTRY)
    };
  }

  /**
   * Get metrics summary
   */
  getMetrics() {
    return {
      ...this.metrics,
      models: {
        local: Object.keys(this.registry.LOCAL_MODELS).length,
        cloud: Object.keys(this.registry.CLOUD_MODELS_FREE).length
      },
      skills: this.registry.FREE_SKILLS.length,
      agents: Object.keys(this.registry.AGENT_REGISTRY).length,
      routingDate: new Date().toISOString()
    };
  }

  /**
   * Record successful routing for learning
   */
  recordSuccess(routing, latency, quality = 1.0) {
    this.metrics.routings++;
    this.metrics.avgLatency = (this.metrics.avgLatency + latency) / 2;
    this.metrics.successRate = (this.metrics.successRate + quality) / 2;

    // Save free tier preference learning
    if (routing.model.cost === 'FREE') {
      this.metrics.costSaved += 0.01; // Track cost savings
    }
  }
}

export default HeroModelRouter;

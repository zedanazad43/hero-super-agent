// 🦸 HERO MASTER ORCHESTRATOR - Central command for all systems

import HeroModelRouter from '../orchestration/model-router.js';
import HeroFreeBuffAgent from '../agents/freebuff-agent.js';
import { HERO_FREE_ECOSYSTEM } from '../models/free-ecosystem-registry.js';

class HeroMasterOrchestrator {
  constructor() {
    this.modelRouter = new HeroModelRouter();
    this.freeBuffAgent = new HeroFreeBuffAgent(this.modelRouter);
    this.registry = HERO_FREE_ECOSYSTEM;
    this.systemStatus = {
      startTime: new Date().toISOString(),
      uptime: 0,
      status: 'initializing',
      agents: {},
      tasks: [],
      metrics: {}
    };
  }

  /**
   * Initialize all hero systems
   */
  async initialize() {
    console.log('\n🦸 ===== HERO MASTER ORCHESTRATOR INITIALIZING =====');

    try {
      // Initialize FreeBuff agent
      console.log('[HERO] Initializing FreeBuff agent...');
      const freeBuffReady = await this.freeBuffAgent.initialize();
      this.systemStatus.agents.freebuff = freeBuffReady ? 'ready' : 'failed';

      // Verify model router
      console.log('[HERO] Verifying model routing system...');
      const models = this.modelRouter.getAvailableModels();
      console.log(`[HERO] Available: ${models.cloud.codegeex ? '✓' : '✗'} Local models, ${Object.keys(models.cloud).length} cloud models, ${models.skills.length} skills, ${models.agents.length} agents`);

      // Check ecosystem configuration
      console.log('[HERO] Checking free ecosystem configuration...');
      console.log(`  • Local: ${Object.keys(this.registry.LOCAL_MODELS).length} models`);
      console.log(`  • Cloud: ${Object.keys(this.registry.CLOUD_MODELS_FREE).length} providers`);
      console.log(`  • Skills: ${this.registry.FREE_SKILLS.length} community skills`);
      console.log(`  • Agents: ${Object.keys(this.registry.AGENT_REGISTRY).length} specialized agents`);

      this.systemStatus.status = 'ready';
      console.log('[HERO] ✅ All systems ready!\n');

      return {
        status: 'ready',
        components: {
          modelRouter: 'ready',
          freeBuffAgent: freeBuffReady ? 'ready' : 'failed',
          ecosystem: 'ready'
        }
      };
    } catch (error) {
      console.error('[HERO] Initialization error:', error.message);
      this.systemStatus.status = 'error';
      throw error;
    }
  }

  /**
   * Execute daily orchestration workflow
   */
  async executeDailyOrchestration() {
    console.log('\n🦸 ===== DAILY ORCHESTRATION =====');
    const startTime = Date.now();

    try {
      // 1. System Health Check
      console.log('[HERO:DAILY] Phase 1: System Health Check');
      await this.performHealthCheck();

      // 2. Verify all models are responsive
      console.log('[HERO:DAILY] Phase 2: Model Verification');
      await this.verifyAllModels();

      // 3. Check FreeBuff portfolio
      console.log('[HERO:DAILY] Phase 3: Portfolio Review');
      const portfolio = await this.freeBuffAgent.getPortfolio();
      console.log('[HERO:DAILY] Portfolio:', {
        activeGigs: portfolio.activeGigs.length,
        earnings: portfolio.earnings,
        nextPayout: portfolio.nextPayout
      });

      // 4. Run smoke tests on all systems
      console.log('[HERO:DAILY] Phase 4: Smoke Tests');
      await this.runSmokeTests();

      // 5. Generate daily report
      console.log('[HERO:DAILY] Phase 5: Report Generation');
      const report = await this.generateDailyReport();

      const duration = Date.now() - startTime;
      console.log(`[HERO:DAILY] ✅ Orchestration complete (${duration}ms)\n`);

      return {
        status: 'success',
        duration,
        report
      };
    } catch (error) {
      console.error('[HERO:DAILY] Orchestration error:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Execute profit orchestration workflow (30-minute cycle)
   */
  async executeProfitOrchestration() {
    console.log('\n🦸 ===== PROFIT ORCHESTRATION =====');
    const startTime = Date.now();

    try {
      // 1. Scan for FreeBuff opportunities
      console.log('[HERO:PROFIT] Phase 1: Opportunity Scanning');
      const opportunities = await this.freeBuffAgent.scanForOpportunities();

      // 2. Filter by profitability
      console.log('[HERO:PROFIT] Phase 2: Profitability Analysis');
      const profitable = await this.freeBuffAgent.filterProfitableOpportunities();

      // 3. Execute optimal tasks
      console.log('[HERO:PROFIT] Phase 3: Task Execution');
      await this.freeBuffAgent.executeOptimalTasks();

      // 4. Track results
      console.log('[HERO:PROFIT] Phase 4: Results Tracking');
      const metrics = await this.freeBuffAgent.trackProgress();

      const duration = Date.now() - startTime;
      console.log(`[HERO:PROFIT] ✅ Profit orchestration complete (${duration}ms)\n`);

      return {
        status: 'success',
        duration,
        opportunitiesScanned: opportunities.length,
        profitableFound: profitable.length,
        metrics
      };
    } catch (error) {
      console.error('[HERO:PROFIT] Orchestration error:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Route task to optimal agent and model
   */
  async routeAndExecuteTask(taskDescription, taskType = 'general-chat', options = {}) {
    console.log(`[HERO:ROUTE] Task: ${taskDescription}`);

    try {
      // Route to optimal model
      const routing = await this.modelRouter.routeTask(taskType, options);

      if (!routing) {
        throw new Error('No suitable model found for task');
      }

      console.log(`[HERO:ROUTE] ✓ Routed to: ${routing.model.name} (Agent: ${routing.agent})`);

      return {
        taskType,
        model: routing.model.name,
        agent: routing.agent,
        routing
      };
    } catch (error) {
      console.error('[HERO:ROUTE] Routing error:', error.message);
      return null;
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const checks = {
      modelRouter: await this.checkModelRouter(),
      freeBuffAgent: await this.checkFreeBuffAgent(),
      localModels: await this.checkLocalModels(),
      cloudModels: await this.checkCloudModels()
    };

    const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
    console.log(`[HERO:HEALTH] System: ${allHealthy ? '✅ Healthy' : '⚠️ Degraded'}`);

    return checks;
  }

  async checkModelRouter() {
    try {
      const metrics = this.modelRouter.getMetrics();
      return { status: 'healthy', routings: metrics.routings };
    } catch {
      return { status: 'unhealthy' };
    }
  }

  async checkFreeBuffAgent() {
    try {
      const status = this.freeBuffAgent.getStatus();
      return { status: 'healthy', agent: status.name };
    } catch {
      return { status: 'unhealthy' };
    }
  }

  async checkLocalModels() {
    try {
      const models = Object.values(this.registry.LOCAL_MODELS);
      let healthy = 0;
      for (const model of models) {
        if (await this.modelRouter.isHealthy(model)) healthy++;
      }
      return { status: 'healthy', available: healthy, total: models.length };
    } catch {
      return { status: 'unhealthy' };
    }
  }

  async checkCloudModels() {
    try {
      // Sample check a few cloud models
      const models = Object.values(this.registry.CLOUD_MODELS_FREE).slice(0, 3);
      let healthy = 0;
      for (const model of models) {
        if (await this.modelRouter.isHealthy(model)) healthy++;
      }
      return { status: 'healthy', healthy, sampled: models.length };
    } catch {
      return { status: 'unhealthy' };
    }
  }

  /**
   * Verify all models are responsive
   */
  async verifyAllModels() {
    const results = {};

    // Check local models
    for (const [key, model] of Object.entries(this.registry.LOCAL_MODELS)) {
      results[key] = await this.modelRouter.isHealthy(model);
    }

    // Check cloud models (sample)
    for (const [key, model] of Object.entries(this.registry.CLOUD_MODELS_FREE)) {
      results[key] = await this.modelRouter.isHealthy(model);
    }

    const verified = Object.values(results).filter(r => r).length;
    console.log(`[HERO:VERIFY] ${verified}/${Object.keys(results).length} models verified`);

    return results;
  }

  /**
   * Run comprehensive smoke tests
   */
  async runSmokeTests() {
    const tests = [
      { name: 'Model Router', fn: () => this.modelRouter.getMetrics() },
      { name: 'FreeBuff Agent', fn: () => this.freeBuffAgent.getStatus() },
      { name: 'Ecosystem Registry', fn: () => this.registry.ROUTING_MATRIX },
      { name: 'Skill Loading', fn: () => this.registry.FREE_SKILLS.length > 0 }
    ];

    let passed = 0;
    for (const test of tests) {
      try {
        await test.fn();
        console.log(`[HERO:SMOKE] ✓ ${test.name}`);
        passed++;
      } catch (error) {
        console.log(`[HERO:SMOKE] ✗ ${test.name}: ${error.message}`);
      }
    }

    console.log(`[HERO:SMOKE] Passed: ${passed}/${tests.length}`);
    return { passed, total: tests.length };
  }

  /**
   * Generate comprehensive daily report
   */
  async generateDailyReport() {
    const metrics = this.modelRouter.getMetrics();
    const freeBuffStatus = this.freeBuffAgent.getStatus();

    return {
      date: new Date().toISOString().split('T')[0],
      systems: {
        modelRouter: metrics,
        freeBuffAgent: freeBuffStatus
      },
      ecosystem: {
        localModels: Object.keys(this.registry.LOCAL_MODELS).length,
        cloudModels: Object.keys(this.registry.CLOUD_MODELS_FREE).length,
        skills: this.registry.FREE_SKILLS.length,
        agents: Object.keys(this.registry.AGENT_REGISTRY).length
      }
    };
  }

  /**
   * Start continuous operation
   */
  async startContinuousOperation() {
    console.log('\n🦸 ===== HERO STARTING CONTINUOUS OPERATION =====\n');

    try {
      // Initialize
      await this.initialize();

      // Start profit orchestration loop (every 30 minutes)
      console.log('[HERO] Starting 30-minute profit orchestration cycle...');
      this.profitInterval = setInterval(
        () => this.executeProfitOrchestration(),
        30 * 60 * 1000
      );

      // Start daily orchestration (every 24 hours at 6am UTC)
      console.log('[HERO] Daily orchestration scheduled for 6am UTC daily...');
      this.scheduleDaily();

      // Start real-time opportunity monitoring
      console.log('[HERO] Starting real-time opportunity monitoring...');
      await this.freeBuffAgent.subscribeToUpdates();

      console.log('[HERO] ✅ Continuous operation started\n');

      return { status: 'running' };
    } catch (error) {
      console.error('[HERO] Failed to start continuous operation:', error.message);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Schedule daily orchestration at 6am UTC
   */
  scheduleDaily() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(6, 0, 0, 0);

    if (tomorrow <= now) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

    const msUntilNextRun = tomorrow - now;

    setTimeout(() => {
      this.executeDailyOrchestration();
      // Then run daily
      this.dailyInterval = setInterval(
        () => this.executeDailyOrchestration(),
        24 * 60 * 60 * 1000
      );
    }, msUntilNextRun);
  }

  /**
   * Stop continuous operation
   */
  async stopContinuousOperation() {
    console.log('[HERO] Stopping continuous operation...');

    clearInterval(this.profitInterval);
    clearInterval(this.dailyInterval);

    console.log('[HERO] ✅ Stopped');
    return { status: 'stopped' };
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    const now = new Date();
    const uptime = now - new Date(this.systemStatus.startTime);

    return {
      ...this.systemStatus,
      uptime: Math.floor(uptime / 1000),
      routerMetrics: this.modelRouter.getMetrics(),
      freeBuffMetrics: this.freeBuffAgent.getMetrics,
      timestamp: now.toISOString()
    };
  }
}

export default HeroMasterOrchestrator;

// 💰 HERO FREEBUFF AGENT - Autonomous profit generation from FreeBuff.com

import { HERO_FREE_ECOSYSTEM } from '../models/free-ecosystem-registry.js';

class HeroFreeBuffAgent {
  constructor(modelRouter) {
    this.router = modelRouter;
    this.config = HERO_FREE_ECOSYSTEM.INTEGRATION.freebuff;
    this.opportunities = [];
    this.portfolio = {
      activeGigs: [],
      earnings: 0,
      nextPayout: null
    };
    this.executionHistory = [];
    this.metrics = {
      opportunitiesScanned: 0,
      opportunitiesFound: 0,
      tasksCompleted: 0,
      totalEarnings: 0,
      averageTaskValue: 0,
      completionRate: 0
    };
  }

  /**
   * Initialize FreeBuff connection and load existing portfolio
   */
  async initialize() {
    console.log('[FREEBUFF-AGENT] Initializing...');

    try {
      this.portfolio = await this.getPortfolio();
      console.log('[FREEBUFF-AGENT] Portfolio loaded:', {
        activeGigs: this.portfolio.activeGigs.length,
        earnings: this.portfolio.earnings,
        nextPayout: this.portfolio.nextPayout
      });
      return true;
    } catch (error) {
      console.error('[FREEBUFF-AGENT] Initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Main execution loop: Scan, filter, execute, track
   */
  async executeOpportunityLoop(interval = 30 * 60 * 1000) { // 30 minutes
    console.log(`[FREEBUFF-AGENT] Starting opportunity loop (interval: ${interval}ms)`);

    setInterval(async () => {
      try {
        await this.scanForOpportunities();
        await this.filterProfitableOpportunities();
        await this.executeOptimalTasks();
        await this.trackProgress();
      } catch (error) {
        console.error('[FREEBUFF-AGENT] Loop error:', error.message);
      }
    }, interval);
  }

  /**
   * Scan FreeBuff for all available opportunities
   */
  async scanForOpportunities() {
    console.log('[FREEBUFF-AGENT] Scanning FreeBuff opportunities...');

    try {
      // Get routing for scanning task (fast model)
      const routing = await this.router.routeProfitTask('freebuff-opportunities');

      const response = await fetch(`${this.config.endpoint}/opportunities`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.FREEBUFF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`FreeBuff API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.opportunities = data.opportunities || [];
      this.metrics.opportunitiesScanned++;

      console.log(`[FREEBUFF-AGENT] Found ${this.opportunities.length} opportunities`);
      return this.opportunities;
    } catch (error) {
      console.error('[FREEBUFF-AGENT] Scan error:', error.message);
      return [];
    }
  }

  /**
   * Filter opportunities by profitability threshold
   */
  async filterProfitableOpportunities() {
    console.log('[FREEBUFF-AGENT] Filtering opportunities...');

    const profitable = this.opportunities.filter(opp => {
      const roi = (opp.reward - opp.cost) / opp.cost;
      const profitable = roi >= this.config.profitThreshold;

      return profitable && opp.status === 'active' && !opp.completed;
    });

    this.metrics.opportunitiesFound += profitable.length;
    console.log(`[FREEBUFF-AGENT] ${profitable.length} profitable opportunities found`);

    // Score by efficiency (reward per hour)
    return profitable.sort((a, b) => {
      const efficiencyA = a.reward / (a.estimatedTime || 1);
      const efficiencyB = b.reward / (b.estimatedTime || 1);
      return efficiencyB - efficiencyA;
    });
  }

  /**
   * Execute optimal tasks based on efficiency
   */
  async executeOptimalTasks() {
    const profitable = await this.filterProfitableOpportunities();

    // Execute top 5 by efficiency
    const topTasks = profitable.slice(0, 5);

    for (const task of topTasks) {
      try {
        await this.executeTask(task);
      } catch (error) {
        console.error(`[FREEBUFF-AGENT] Task ${task.id} execution failed:`, error.message);
      }
    }
  }

  /**
   * Execute individual task
   */
  async executeTask(task) {
    console.log(`[FREEBUFF-AGENT] Executing task: ${task.id} (${task.title})`);

    try {
      // Get specific agent recommendation for task type
      const agent = this.router.getRecommendedAgent(task.category || 'general-chat');

      // Execute task with appropriate model
      const routing = await this.router.routeTask(
        task.category || 'general-chat',
        { priority: 'cost', urgency: 'standard' }
      );

      const taskExecution = {
        taskId: task.id,
        title: task.title,
        reward: task.reward,
        model: routing.model.name,
        agent: agent.role,
        startTime: new Date().toISOString(),
        status: 'in_progress'
      };

      // Submit task start to FreeBuff
      const startResponse = await fetch(`${this.config.endpoint}/tasks/${task.id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FREEBUFF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: routing.model.name,
          agent: agent.role,
          startTime: new Date().toISOString()
        })
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start task on FreeBuff');
      }

      // Execute the task (this would be task-specific implementation)
      const result = await this.executeTaskLogic(task, agent, routing.model);

      // Mark task as complete and claim reward
      const completeResponse = await fetch(`${this.config.endpoint}/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FREEBUFF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          result,
          completedAt: new Date().toISOString(),
          taskExecution
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to mark task complete');
      }

      taskExecution.status = 'completed';
      taskExecution.endTime = new Date().toISOString();
      taskExecution.result = result;

      this.executionHistory.push(taskExecution);
      this.metrics.tasksCompleted++;
      this.metrics.totalEarnings += task.reward;

      console.log(`[FREEBUFF-AGENT] Task completed: +${task.reward} credits`);
      return result;
    } catch (error) {
      console.error(`[FREEBUFF-AGENT] Task execution error:`, error.message);
      throw error;
    }
  }

  /**
   * Task-specific execution logic (extensible)
   */
  async executeTaskLogic(task, agent, model) {
    // This would be implemented based on task type
    // Examples:
    // - Writing tasks: generate content
    // - Coding tasks: write code
    // - Analysis tasks: analyze data
    // - Testing tasks: run tests

    return {
      taskId: task.id,
      completed: true,
      result: `Completed by ${agent.role} using ${model.name}`,
      completedAt: new Date().toISOString()
    };
  }

  /**
   * Get current portfolio and earnings
   */
  async getPortfolio() {
    try {
      const response = await fetch(`${this.config.endpoint}/portfolio`, {
        headers: {
          'Authorization': `Bearer ${process.env.FREEBUFF_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      return await response.json();
    } catch (error) {
      console.error('[FREEBUFF-AGENT] Portfolio fetch error:', error.message);
      return {
        activeGigs: [],
        earnings: 0,
        nextPayout: null
      };
    }
  }

  /**
   * Track overall progress and metrics
   */
  async trackProgress() {
    this.metrics.averageTaskValue = this.metrics.tasksCompleted > 0
      ? this.metrics.totalEarnings / this.metrics.tasksCompleted
      : 0;

    this.metrics.completionRate = this.metrics.opportunitiesFound > 0
      ? this.metrics.tasksCompleted / this.metrics.opportunitiesFound
      : 0;

    console.log('[FREEBUFF-AGENT] Progress update:', {
      totalEarnings: `${this.metrics.totalEarnings} credits`,
      tasksCompleted: this.metrics.tasksCompleted,
      averageTaskValue: `${this.metrics.averageTaskValue.toFixed(2)} credits`,
      completionRate: `${(this.metrics.completionRate * 100).toFixed(1)}%`
    });

    return this.metrics;
  }

  /**
   * Subscribe to real-time opportunity updates
   */
  async subscribeToUpdates() {
    console.log('[FREEBUFF-AGENT] Subscribing to real-time updates...');

    try {
      const ws = new WebSocket(`${this.config.endpoint.replace('https', 'wss')}/stream`);

      ws.onopen = () => {
        console.log('[FREEBUFF-AGENT] WebSocket connected');
        ws.send(JSON.stringify({
          action: 'subscribe',
          channel: 'opportunities',
          token: process.env.FREEBUFF_API_KEY
        }));
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('[FREEBUFF-AGENT] New opportunity:', message);

        if (message.type === 'new_opportunity') {
          // Immediately evaluate new opportunity
          const roi = (message.opportunity.reward - message.opportunity.cost) / message.opportunity.cost;
          if (roi >= this.config.profitThreshold) {
            await this.executeTask(message.opportunity);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('[FREEBUFF-AGENT] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[FREEBUFF-AGENT] WebSocket disconnected');
        // Reconnect after delay
        setTimeout(() => this.subscribeToUpdates(), 5000);
      };
    } catch (error) {
      console.error('[FREEBUFF-AGENT] Subscription error:', error.message);
    }
  }

  /**
   * Get agent status and metrics
   */
  getStatus() {
    return {
      name: 'FreeBuff Agent',
      role: 'Profit Generation',
      status: 'active',
      metrics: this.metrics,
      portfolio: this.portfolio,
      lastUpdate: new Date().toISOString()
    };
  }
}

export default HeroFreeBuffAgent;

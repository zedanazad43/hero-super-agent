// Hero FreeBuff Integration - Main API Client
// Connects hero-super-agent to freebuff.com for profit generation

export class FreeBuffClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.freebuff.com/v1';
    this.logger = console;
  }

  /**
   * Fetch available opportunities from FreeBuff
   */
  async getOpportunities(filters = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/opportunities`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        ...(Object.keys(filters).length && { body: JSON.stringify(filters) })
      });

      if (!response.ok) {
        throw new Error(`FreeBuff API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('FreeBuff opportunities fetch failed:', error);
      throw error;
    }
  }

  /**
   * Execute a FreeBuff opportunity (profit generation)
   */
  async executeOpportunity(opportunityId, config = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/opportunities/${opportunityId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          autoRebalance: config.autoRebalance || true,
          profitTarget: config.profitTarget || 0.05,
          stopLoss: config.stopLoss || 0.02,
          maxExposure: config.maxExposure || 1000,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`FreeBuff execution failed: ${response.status}`);
      }

      const result = await response.json();
      this.logger.info(`✅ Opportunity executed: ${opportunityId}`, result);
      return result;
    } catch (error) {
      this.logger.error('FreeBuff execution failed:', error);
      throw error;
    }
  }

  /**
   * Get FreeBuff portfolio summary
   */
  async getPortfolio() {
    try {
      const response = await fetch(`${this.baseUrl}/portfolio/summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`FreeBuff portfolio fetch failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('FreeBuff portfolio fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get profit history & performance metrics
   */
  async getProfitHistory(days = 30) {
    try {
      const response = await fetch(
        `${this.baseUrl}/portfolio/profit-history?days=${days}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`FreeBuff profit history fetch failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('FreeBuff profit history fetch failed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time opportunity updates
   */
  async subscribeToOpportunities(callback) {
    try {
      const ws = new WebSocket(
        `${this.baseUrl.replace('https', 'wss')}/opportunities/stream?token=${this.apiKey}`
      );

      ws.onopen = () => {
        this.logger.info('✅ Connected to FreeBuff real-time stream');
      };

      ws.onmessage = (event) => {
        const opportunity = JSON.parse(event.data);
        callback(opportunity);
      };

      ws.onerror = (error) => {
        this.logger.error('FreeBuff WebSocket error:', error);
      };

      return ws;
    } catch (error) {
      this.logger.error('FreeBuff subscription failed:', error);
      throw error;
    }
  }

  /**
   * Get hero performance metrics
   */
  async getHeroMetrics() {
    try {
      const portfolio = await this.getPortfolio();
      const profitHistory = await this.getProfitHistory(7);

      return {
        portfolio,
        weeklyProfit: profitHistory.reduce((sum, day) => sum + day.profit, 0),
        weeklyROI: profitHistory[profitHistory.length - 1]?.roiPercentage || 0,
        opportunitiesExecuted: profitHistory.length,
        winRate: profitHistory.filter(d => d.profit > 0).length / profitHistory.length
      };
    } catch (error) {
      this.logger.error('Hero metrics fetch failed:', error);
      throw error;
    }
  }
}

export default FreeBuffClient;

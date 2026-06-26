import { getRateLimitConfig } from '../config/performance-config.js';

export class EnhancedRateLimiter {
  constructor(config = getRateLimitConfig()) {
    this.config = config;
    this.lastCheck = 0;
    this.rateLimitRemaining = config.fallbackRemaining;
    this.rateLimitReset = Date.now() + config.fallbackResetInterval;
    this.isWaiting = false;
    this.waitStartTime = null;
  }

  async checkRateLimit() {
    const now = Date.now();

    // Re-check rate limit if expired or first check
    if (now >= this.rateLimitReset || this.rateLimitRemaining === null) {
      await this.updateRateLimit();
    }

    return {
      remaining: this.rateLimitRemaining,
      shouldWait: this.rateLimitRemaining < this.config.minRemainingThreshold,
      resetTime: new Date(this.rateLimitReset),
      usagePercentage: this.rateLimitRemaining / 5000 // GitHub's typical limit
    };
  }

  async updateRateLimit() {
    try {
      // Check GitHub API rate limits
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        },
        signal: AbortSignal.timeout(5000) // 5s timeout
      });

      if (response.ok) {
        const data = await response.json();
        const core = data.resources.core;

        this.rateLimitRemaining = core.remaining;
        this.rateLimitReset = Date.now() + (core.reset - Date.now());

        console.log(`📊 Rate limit: ${this.rateLimitRemaining} remaining (${Math.round((this.rateLimitRemaining / 5000) * 100)}%)`);
        console.log(`⏰ Resets at: ${new Date(core.reset).toISOString()}`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ GitHub API rate limit check failed, using fallback data:', error.message);
      // Fallback to mock data
      this.rateLimitRemaining = this.config.fallbackRemaining;
      this.rateLimitReset = Date.now() + this.config.fallbackResetInterval;
    }
  }

  async waitForRateLimit() {
    const status = await this.checkRateLimit();

    if (status.shouldWait) {
      const waitTime = Math.min(
        this.rateLimitReset - Date.now(),
        this.config.maxWaitTime
      );

      if (waitTime > 0) {
        console.log(`⏳ Waiting ${Math.ceil(waitTime / 1000)}s for rate limit reset...`);
        console.log(`   Reset at: ${status.resetTime.toISOString()}`);

        this.isWaiting = true;
        this.waitStartTime = Date.now();

        await new Promise(resolve => setTimeout(resolve, waitTime));

        this.isWaiting = false;
        this.waitStartTime = null;
        await this.updateRateLimit();
      }
    }
  }

  async waitForSafeExecution(agentsCount, additionalRequests = 0) {
    // Calculate total required requests
    const totalRequired = agentsCount + additionalRequests;

    // Ensure we have enough rate limit
    const status = await this.checkRateLimit();

    if (status.remaining < totalRequired) {
      console.log(`⚠️ Insufficient rate limit for ${totalRequired} requests (only ${status.remaining} remaining)`);

      // Calculate required wait time
      const waitNeeded = this.rateLimitReset - Date.now();
      const maxWait = this.config.maxWaitTime;

      if (waitNeeded > maxWait) {
        throw new Error(`Rate limit wait time exceeds maximum allowed (${Math.ceil(waitNeeded / 1000)}s > ${Math.ceil(maxWait / 1000)}s)`);
      }

      await this.waitForRateLimit();
    }

    return status;
  }

  getWaitStatus() {
    if (this.isWaiting && this.waitStartTime) {
      const elapsed = Date.now() - this.waitStartTime;
      return {
        isWaiting: true,
        elapsedMs: elapsed,
        estimatedWaitMs: this.rateLimitReset - Date.now()
      };
    }
    return {
      isWaiting: false
    };
  }

  async getDetailedStatus() {
    const status = await this.checkRateLimit();
    const waitStatus = this.getWaitStatus();

    return {
      rateLimit: status,
      waitStatus,
      totalRequests: this.rateLimitRemaining,
      capacity: {
        current: status.remaining,
        required: this.config.minRemainingThreshold + 1,
        surplus: status.remaining - (this.config.minRemainingThreshold + 1)
      }
    };
  }

  // Static method for quick check
  static async quickCheck() {
    const limiter = new EnhancedRateLimiter();
    return await limiter.checkRateLimit();
  }
}
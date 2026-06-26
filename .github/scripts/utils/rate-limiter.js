export class RateLimiter {
  constructor() {
    this.lastCheck = 0;
    this.rateLimitRemaining = 15;
    this.rateLimitReset = Date.now();
  }

  async checkRateLimit() {
    const now = Date.now();

    // Re-check rate limit if expired or first check
    if (now >= this.rateLimitReset || this.rateLimitRemaining === null) {
      await this.updateRateLimit();
    }

    return {
      remaining: this.rateLimitRemaining,
      shouldWait: this.rateLimitRemaining < 3,
      resetTime: new Date(this.rateLimitReset)
    };
  }

  async updateRateLimit() {
    try {
      // Check GitHub API rate limits
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const core = data.resources.core;

        this.rateLimitRemaining = core.remaining;
        this.rateLimitReset = Date.now() + (core.reset - Date.now());

        console.log(`Rate limit: ${this.rateLimitRemaining} remaining, resets at ${new Date(core.reset).toISOString()}`);
      } else {
        // Fallback to mock data
        this.rateLimitRemaining = 15;
        this.rateLimitReset = Date.now() + 60000; // 1 minute
        console.log('⚠️ Using mock rate limit data');
      }
    } catch (error) {
      console.warn('Rate limit check failed, using mock data:', error.message);
      // Fallback to mock data
      this.rateLimitRemaining = 15;
      this.rateLimitReset = Date.now() + 60000; // 1 minute
    }
  }

  async waitForRateLimit() {
    const status = await this.checkRateLimit();

    if (status.shouldWait) {
      const waitTime = Math.ceil((this.rateLimitReset - Date.now()) / 1000);
      console.log(`⏳ Waiting ${waitTime}s for rate limit reset...`);
      console.log(`Rate limit resets at: ${status.resetTime.toISOString()}`);

      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      await this.updateRateLimit();
    }
  }

  async waitForSafeExecution(agentsCount) {
    // Ensure we have enough rate limit before spawning agents
    const status = await this.checkRateLimit();

    if (status.remaining < agentsCount) {
      console.log(`Insufficient rate limit for ${agentsCount} agents (only ${status.remaining} remaining)`);
      await this.waitForRateLimit();
    }

    return status;
  }
}
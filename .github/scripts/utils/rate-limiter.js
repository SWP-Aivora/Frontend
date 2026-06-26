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
      shouldWait: this.rateLimitRemaining < 3
    };
  }

  async updateRateLimit() {
    // For now, simulate - will be implemented with real GitHub API in future
    this.rateLimitRemaining = 15;
    this.rateLimitReset = Date.now() + 60000; // 1 minute
  }

  async waitForRateLimit() {
    const status = await this.checkRateLimit();

    if (status.shouldWait) {
      const waitTime = Math.ceil((this.rateLimitReset - Date.now()) / 1000);
      console.log(`⏳ Waiting ${waitTime}s for rate limit reset...`);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      await this.updateRateLimit();
    }
  }
}
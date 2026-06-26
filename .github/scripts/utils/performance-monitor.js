export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: null,
      endTime: null,
      agentsSpawned: 0,
      issuesFound: 0,
      apiCalls: 0,
      errors: 0,
      agentTimes: [],
      rateLimitChecks: 0,
      memoryUsage: []
    };
    this.startTime = Date.now();
  }

  start() {
    this.metrics.startTime = Date.now();
    this.metrics.agentsSpawned = 0;
    this.metrics.issuesFound = 0;
    this.metrics.apiCalls = 0;
    this.metrics.errors = 0;
    this.metrics.agentTimes = [];
    this.metrics.rateLimitChecks = 0;
    this.metrics.memoryUsage = [];
    this.collectMemoryUsage();
  }

  recordAgentSpawn(agentName) {
    this.metrics.agentsSpawned++;
    this.metrics.agentTimes.push({
      agent: agentName,
      startTime: Date.now(),
      endTime: null
    });
  }

  recordAgentCompletion(agentName) {
    const agent = this.metrics.agentTimes.find(a => a.agent === agentName && !a.endTime);
    if (agent) {
      agent.endTime = Date.now();
      const duration = agent.endTime - agent.startTime;
      console.log(`📊 ${agentName} completed in ${duration}ms`);
    }
  }

  recordIssuesFound(count) {
    this.metrics.issuesFound += count;
  }

  recordApiCall() {
    this.metrics.apiCalls++;
  }

  recordError(error) {
    this.metrics.errors++;
    console.error(`❌ Error recorded:`, error.message);
  }

  recordRateLimitCheck() {
    this.metrics.rateLimitChecks++;
  }

  async collectMemoryUsage() {
    try {
      const memoryUsage = process.memoryUsage();
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      });
    } catch (error) {
      // Memory usage not available in all environments
    }
  }

  async stop() {
    this.metrics.endTime = Date.now();
    await this.collectMemoryUsage();
    return this.generateReport();
  }

  generateReport() {
    const duration = this.metrics.endTime - this.metrics.startTime;
    const memoryUsage = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1] || {};

    return {
      duration: duration,
      agentsSpawned: this.metrics.agentsSpawned,
      issuesFound: this.metrics.issuesFound,
      apiCalls: this.metrics.apiCalls,
      errors: this.metrics.errors,
      rateLimitChecks: this.metrics.rateLimitChecks,
      averageAgentTime: this.metrics.agentTimes.length > 0
        ? Math.round(this.metrics.agentTimes.reduce((sum, agent) => {
            return sum + (agent.endTime ? agent.endTime - agent.startTime : 0);
          }, 0) / this.metrics.agentTimes.filter(a => a.endTime).length)
        : 0,
      peakMemory: memoryUsage,
      agentDetails: this.metrics.agentTimes.map(agent => ({
        name: agent.agent,
        duration: agent.endTime ? agent.endTime - agent.startTime : null
      })),
      efficiency: this.metrics.issuesFound > 0
        ? Math.round((this.metrics.issuesFound / duration) * 1000 * 60) // issues per minute
        : 0
    };
  }

  logProgress() {
    const elapsed = Date.now() - this.metrics.startTime;
    console.log(`📊 Progress after ${Math.round(elapsed / 1000)}s:`);
    console.log(`   - Agents spawned: ${this.metrics.agentsSpawned}`);
    console.log(`   - Issues found: ${this.metrics.issuesFound}`);
    console.log(`   - API calls: ${this.metrics.apiCalls}`);
    console.log(`   - Errors: ${this.metrics.errors}`);
    console.log(`   - Rate limit checks: ${this.metrics.rateLimitChecks}`);

    const memoryUsage = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    if (memoryUsage) {
      console.log(`   - Memory usage: ${memoryUsage.heapUsed}MB used, ${memoryUsage.heapTotal}MB total`);
    }
  }

  async logMemoryPeriodically(interval = 30000) {
    const intervalId = setInterval(async () => {
      await this.collectMemoryUsage();
      const current = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
      if (current) {
        console.log(`📊 Memory usage: ${current.heapUsed}MB used, ${current.heapTotal}MB total`);
      }
    }, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}
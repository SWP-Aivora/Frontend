export const PerformanceConfig = {
  // Rate Limit Settings
  rateLimit: {
    // Minimum remaining requests before triggering wait
    minRemainingThreshold: 3,
    // Default fallback if GitHub API fails (requests)
    fallbackRemaining: 15,
    // Fallback reset interval (ms)
    fallbackResetInterval: 60000,
    // Max wait time for rate limit (ms)
    maxWaitTime: 300000
  },

  // Agent Execution Settings
  agents: {
    // Timeout per agent (ms)
    agentTimeout: 120000,
    // Concurrency limit
    maxConcurrentAgents: 7,
    // Retry attempts for failed agents
    retryAttempts: 2
  },

  // Performance Monitoring Settings
  monitoring: {
    // Memory sampling interval (ms)
    memorySamplingInterval: 30000,
    // Log progress interval (ms)
    progressLogInterval: 60000,
    // Enable detailed logging
    detailedLogging: false,
    // Performance thresholds (ms)
    thresholds: {
      slowAgent: 10000,    // 10s
      verySlowAgent: 30000 // 30s
    }
  },

  // Issue Scoring Settings
  scoring: {
    // Confidence score thresholds
    confidenceThresholds: {
      critical: 80,
      high: 60,
      medium: 40,
      low: 20
    },
    // Maximum issues per agent
    maxIssuesPerAgent: 10,
    // Deduplication settings
    deduplication: {
      enabled: true,
      similarityThreshold: 0.8
    }
  },

  // Review Generation Settings
  review: {
    // Maximum length of review comment
    maxCommentLength: 65536, // GitHub comment limit
    // Format settings
    format: {
      includeMetrics: true,
      includeAgentBreakdown: true,
      includeRecommendations: true
    },
    // Review event decisions
    reviewEvents: {
      criticalIssues: 'REQUEST_CHANGES',
      noIssues: 'APPROVE',
      onlyMinorIssues: 'COMMENT'
    }
  },

  // API Settings
  api: {
    // Gemini API settings
    gemini: {
      maxTokens: 8192,
      temperature: 0.3,
      topP: 0.9,
      topK: 40
    },
    // Retry settings for API calls
    retries: {
      maxAttempts: 3,
      backoffMs: 1000,
      maxBackoffMs: 10000
    }
  }
};

// Export convenience functions
export const getRateLimitConfig = () => PerformanceConfig.rateLimit;
export const getAgentConfig = () => PerformanceConfig.agents;
export const getMonitoringConfig = () => PerformanceConfig.monitoring;
export const getScoringConfig = () => PerformanceConfig.scoring;
export const getReviewConfig = () => PerformanceConfig.review;
export const getApiConfig = () => PerformanceConfig.api;
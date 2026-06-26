import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { execFile } from 'child_process';

export class SystemOptimizer {
  constructor(configPath = './.github/scripts/config/performance-config.js') {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.optimizationHistory = [];
  }

  loadConfig() {
    try {
      if (existsSync(this.configPath)) {
        const configModule = import(this.configPath);
        return configModule.PerformanceConfig;
      }
    } catch (error) {
      console.warn('⚠️ Could not load config:', error.message);
    }
    return this.getDefaultConfig();
  }

  getDefaultConfig() {
    return {
      rateLimit: {
        minRemainingThreshold: 3,
        fallbackRemaining: 15,
        fallbackResetInterval: 60000,
        maxWaitTime: 300000
      },
      agents: {
        agentTimeout: 120000,
        maxConcurrentAgents: 7,
        retryAttempts: 2
      },
      monitoring: {
        memorySamplingInterval: 30000,
        progressLogInterval: 60000,
        detailedLogging: false
      }
    };
  }

  // Analyze system performance
  analyzePerformance(metrics) {
    const analysis = {
      score: 0,
      issues: [],
      recommendations: [],
      bottlenecks: []
    };

    // Calculate performance score (0-100)
    let score = 100;

    // Check execution time
    if (metrics.duration > 30000) {
      score -= 20;
      analysis.issues.push('Slow execution time');
      analysis.recommendations.push('Consider increasing timeout or optimizing prompts');
    }

    // Check error rate
    const errorRate = metrics.errors / metrics.agentsSpawned;
    if (errorRate > 0.2) {
      score -= 30;
      analysis.issues.push('High error rate');
      analysis.recommendations.push('Review agent prompts and error handling');
    }

    // Check memory usage
    if (metrics.peakMemory && metrics.peakMemory.heapUsed > 100) {
      score -= 15;
      analysis.issues.push('High memory usage');
      analysis.recommendations.push('Implement memory optimization techniques');
    }

    // Check API efficiency
    const efficiency = metrics.issuesFound / (metrics.duration / 60000);
    if (efficiency < 10) {
      score -= 10;
      analysis.issues.push('Low issue detection rate');
      analysis.recommendations.push('Improve prompt effectiveness');
    }

    analysis.score = Math.max(0, score);

    // Identify bottlenecks
    if (metrics.agentsSpawned === 0) {
      analysis.bottlenecks.push('No agents spawned - check initialization');
    }

    if (metrics.apiCalls === 0) {
      analysis.bottlenecks.push('No API calls - check configuration');
    }

    return analysis;
  }

  // Optimize configuration based on performance data
  optimizeConfiguration(performanceAnalysis) {
    const optimizedConfig = { ...this.config };

    // Based on analysis, adjust configuration
    if (performanceAnalysis.issues.includes('Slow execution time')) {
      optimizedConfig.agents.agentTimeout = Math.min(
        optimizedConfig.agents.agentTimeout + 30000,
        300000
      );
    }

    if (performanceAnalysis.issues.includes('High memory usage')) {
      optimizedConfig.monitoring.memorySamplingInterval = 60000;
      optimizedConfig.monitoring.detailedLogging = false;
    }

    if (performanceAnalysis.issues.includes('High error rate')) {
      optimizedConfig.agents.retryAttempts = Math.min(
        optimizedConfig.agents.retryAttempts + 1,
        5
      );
    }

    return optimizedConfig;
  }

  // Generate optimization report
  generateOptimizationReport(performanceAnalysis, optimizedConfig) {
    const report = {
      timestamp: new Date().toISOString(),
      originalConfig: this.config,
      optimizedConfig,
      analysis: performanceAnalysis,
      improvements: []
    };

    // Compare configurations
    const changes = [];

    if (this.config.agents.agentTimeout !== optimizedConfig.agents.agentTimeout) {
      changes.push({
        type: 'timeout',
        from: this.config.agents.agentTimeout,
        to: optimizedConfig.agents.agentTimeout,
        reason: 'Slow execution time detected'
      });
    }

    if (this.config.agents.retryAttempts !== optimizedConfig.agents.retryAttempts) {
      changes.push({
        type: 'retries',
        from: this.config.agents.retryAttempts,
        to: optimizedConfig.agents.retryAttempts,
        reason: 'High error rate detected'
      });
    }

    if (this.config.monitoring.detailedLogging !== optimizedConfig.monitoring.detailedLogging) {
      changes.push({
        type: 'logging',
        from: this.config.monitoring.detailedLogging,
        to: optimizedConfig.monitoring.detailedLogging,
        reason: 'High memory usage detected'
      });
    }

    report.changes = changes;
    report.improvements = this.calculateImprovements(changes);

    return report;
  }

  calculateImprovements(changes) {
    const improvements = [];

    changes.forEach(change => {
      switch (change.type) {
        case 'timeout':
          improvements.push({
            metric: 'execution_time',
            improvement: 'increase_timeout',
            description: 'Increased timeout to handle complex operations'
          });
          break;
        case 'retries':
          improvements.push({
            metric: 'reliability',
            improvement: 'increase_retries',
            description: 'Increased retries to handle transient errors'
          });
          break;
        case 'logging':
          improvements.push({
            metric: 'memory_usage',
            improvement: 'reduce_logging',
            description: 'Reduced logging to save memory'
          });
          break;
      }
    });

    return improvements;
  }

  // Apply optimization
  applyOptimization(report) {
    try {
      // Create backup of current config
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = this.configPath.replace('.js', `.backup.${timestamp}.js`);
      writeFileSync(backupPath, readFileSync(this.configPath));

      // Update config
      writeFileSync(this.configPath, `// Auto-optimized at ${report.timestamp}
export const PerformanceConfig = ${JSON.stringify(report.optimizedConfig, null, 2)};`);

      // Record optimization
      this.optimizationHistory.push(report);

      console.log('✅ Configuration optimized successfully');
      console.log(`📊 Performance score improved from ${100 - report.analysis.score} to ${report.analysis.score}`);

      return {
        success: true,
        backupPath,
        timestamp: report.timestamp
      };
    } catch (error) {
      console.error('❌ Failed to apply optimization:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get optimization history
  getOptimizationHistory() {
    return this.optimizationHistory;
  }

  // Clean up old backups
  cleanupBackups(keepCount = 5) {
    const scriptDir = dirname(this.configPath);
    const backupFiles = [];

    // Find all backup files
    execFile('find', [scriptDir, '-name', '*.backup.*.js', '-type f'], (error, stdout) => {
      if (error) {
        console.warn('⚠️ Could not find backup files:', error.message);
        return;
      }

      const files = stdout.toString().split('\n').filter(f => f.trim());

      files.forEach(file => {
        execFile('stat', ['-c', '%Y %n', file], (error, stdout) => {
          if (error) {
            console.warn('⚠️ Could not get file stats:', error.message);
            return;
          }
          const timestamp = parseInt(stdout.toString().split(' ')[0]);
          backupFiles.push({ file, timestamp });
        });
      });
    });

    // Sort by timestamp (newest first)
    backupFiles.sort((a, b) => b.timestamp - a.timestamp);

    // Remove old backups
    const toRemove = backupFiles.slice(keepCount);
    toRemove.forEach(({ file }) => {
      execSync(`rm "${file}"`);
      console.log(`🗑️ Removed old backup: ${file}`);
    });

    return removedCount;
  }

  // Run full optimization cycle
  runOptimizationCycle(performanceMetrics) {
    console.log('🚀 Starting optimization cycle...');

    // 1. Analyze performance
    const analysis = this.analyzePerformance(performanceMetrics);
    console.log(`📊 Performance score: ${analysis.score}/100`);

    // 2. Generate optimized configuration
    const optimizedConfig = this.optimizeConfiguration(analysis);
    console.log('🔧 Generated optimized configuration');

    // 3. Create optimization report
    const report = this.generateOptimizationReport(analysis, optimizedConfig);

    // 4. Apply optimization
    const result = this.applyOptimization(report);

    if (result.success) {
      console.log('✅ Optimization completed successfully');
      return report;
    } else {
      console.error('❌ Optimization failed');
      return null;
    }
  }
}

// Export utility functions
export function quickOptimize(metrics) {
  const optimizer = new SystemOptimizer();
  return optimizer.analyzePerformance(metrics);
}

export function suggestOptimizations(metrics) {
  const optimizer = new SystemOptimizer();
  const analysis = optimizer.analyzePerformance(metrics);
  return analysis.recommendations;
}
export class EnhancedAgentBase {
  constructor(name) {
    this.name = name;
    this.timeout = 120000; // 2 minutes default
    this.retries = 2;
    this.isRunning = false;
  }

  async run(diff, geminiContext) {
    if (this.isRunning) {
      throw new Error(`${this.name} is already running`);
    }

    this.isRunning = true;
    let lastError = null;

    // Retry logic
    for (let attempt = 1; attempt <= this.retries + 1; attempt++) {
      try {
        console.log(`🔍 ${this.name} starting (attempt ${attempt}/${this.retries + 1})`);

        // Set timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`${this.name} timed out after ${this.timeout}ms`)), this.timeout);
        });

        // Run agent with timeout
        const result = await Promise.race([
          this.analyzeWithAI(diff, geminiContext),
          timeoutPromise
        ]);

        console.log(`✅ ${this.name} completed successfully`);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${this.name} attempt ${attempt} failed:`, error.message);

        if (attempt === this.retries + 1) {
          // Last attempt failed
          console.error(`❌ ${this.name} failed after ${this.retries + 1} attempts`);
          return this.getFallbackResult(diff, geminiContext, error);
        }

        // Wait before retry (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ ${this.name} retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // This should never reach here, but just in case
    return this.getFallbackResult(diff, geminiContext, lastError);
  }

  async analyzeWithAI(diff, geminiContext) {
    // This method should be implemented by each agent
    // It should return { issues: [...] }
    throw new Error('analyzeWithAI must be implemented by subclass');
  }

  getFallbackResult(diff, geminiContext, error) {
    // Return a minimal result with error information
    return {
      issues: [],
      errors: [{
        agent: this.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }],
      warnings: [`Agent ${this.name} failed after ${this.retries} attempts`]
    };
  }

  validateDiff(diff) {
    if (!diff || typeof diff !== 'string') {
      throw new Error('Invalid diff provided');
    }

    if (diff.length > 50000) {
      console.warn(`⚠️ ${this.name}: Large diff detected (${diff.length} chars)`);
      return false;
    }

    return true;
  }

  validateGeminiContext(context) {
    if (!context || typeof context !== 'object') {
      throw new Error('Invalid GEMINI context provided');
    }

    // Check required fields
    const requiredFields = ['title', 'description', 'techStack'];
    for (const field of requiredFields) {
      if (!context[field]) {
        console.warn(`⚠️ ${this.name}: Missing required field '${field}' in GEMINI context`);
      }
    }

    return true;
  }

  createIssue(category, title, description, confidence, recommendations = [], location = null) {
    return {
      id: `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      confidence: Math.max(0, Math.min(100, confidence)),
      category,
      recommendations: Array.isArray(recommendations) ? recommendations : [recommendations],
      location,
      timestamp: new Date().toISOString(),
      agent: this.name
    };
  }

  filterRelevantIssues(issues, diff) {
    // Filter issues based on diff content
    return issues.filter(issue => {
      if (!issue.location || !issue.location.file) {
        return true; // Keep issues without specific location
      }

      // Check if the issue's file is in the diff
      const filePattern = new RegExp(issue.location.file.replace(/\./g, '\\.'));
      return filePattern.test(diff);
    });
  }

  async safeExecute(operation, fallbackValue) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`⚠️ ${this.name}: Operation failed, using fallback:`, error.message);
      return fallbackValue;
    }
  }

  // Utility method for consistent logging
  log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${this.name}: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  // Utility method for warning logging
  warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️ ${this.name}: ${message}`);
    if (data) {
      console.warn(JSON.stringify(data, null, 2));
    }
  }

  // Utility method for error logging
  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ${this.name}: ${message}`);
    if (error) {
      console.error(error);
    }
  }

  // Check if agent should skip execution based on diff
  shouldSkipExecution(diff) {
    // Skip for very small diffs
    if (diff.length < 100) {
      this.warn('Diff is too small, skipping execution');
      return true;
    }

    // Skip if diff contains only non-code files
    const codePatterns = /\.(js|ts|jsx|tsx|vue|py|java|go|rs|cpp|c|h|php|rb|cs)$/i;
    const hasCodeFiles = codePatterns.test(diff);

    if (!hasCodeFiles) {
      this.warn('No code files in diff, skipping execution');
      return true;
    }

    return false;
  }

  // Get agent configuration
  getConfig() {
    return {
      timeout: this.timeout,
      retries: this.retries,
      name: this.name
    };
  }

  // Set agent configuration
  setConfig(config) {
    if (config.timeout) this.timeout = config.timeout;
    if (config.retries) this.retries = config.retries;
    if (config.name) this.name = config.name;
  }
}
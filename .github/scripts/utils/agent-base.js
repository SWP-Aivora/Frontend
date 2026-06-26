export class AgentBase {
  constructor(name, model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite') {
    this.name = name;
    this.model = model;
  }

  async run(diff, context) {
    const prompt = this.getPrompt(context);
    const issues = await this.analyzeWithAI(prompt, diff);

    return {
      agent: this.name,
      summary: this.generateSummary(issues),
      issues: issues.map(issue => ({
        ...issue,
        category: this.getCategory()
      }))
    };
  }

  async analyzeWithAI(prompt, diff) {
    // Implementation must be provided by subclass
    throw new Error(`analyzeWithAI must be implemented by ${this.name} agent`);
  }

  getPrompt(context) {
    throw new Error(`getPrompt must be implemented by ${this.name} agent`);
  }

  generateSummary(issues) {
    const total = issues.length;
    const critical = issues.filter(i => i.confidence >= 80).length;
    return `Found ${total} issues (${critical} critical)`;
  }

  getCategory() {
    throw new Error(`getCategory must be implemented by ${this.name} agent`);
  }
}
import { RequirementsAgent } from './agents/requirements-agent.js';
import { BugHunterAgent } from './agents/bug-hunter-agent.js';
import { SecurityAgent } from './agents/security-agent.js';
import { TypeScriptAgent } from './agents/typescript-agent.js';
import { ArchitectureAgent } from './agents/architecture-agent.js';
import { TestingAgent } from './agents/testing-agent.js';
import { ReactAgent } from './agents/react-agent.js';

export class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.initializeAgents();
  }

  initializeAgents() {
    this.register('requirements', RequirementsAgent);
    this.register('bug-hunter', BugHunterAgent);
    this.register('security', SecurityAgent);
    this.register('typescript', TypeScriptAgent);
    this.register('architecture', ArchitectureAgent);
    this.register('testing', TestingAgent);
    this.register('react', ReactAgent);
  }

  register(name, AgentClass) {
    this.agents.set(name, AgentClass);
  }

  get(name) {
    const AgentClass = this.agents.get(name);
    if (!AgentClass) {
      throw new Error(`Agent '${name}' not found in registry`);
    }
    return new AgentClass();
  }

  getAll() {
    return Array.from(this.agents.keys()).map(name => this.get(name));
  }

  has(name) {
    return this.agents.has(name);
  }
}

// Export singleton instance
export const agentRegistry = new AgentRegistry();
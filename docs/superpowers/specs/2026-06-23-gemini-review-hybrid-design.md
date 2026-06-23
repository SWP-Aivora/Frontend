# Hybrid Gemini Code Review Design Specification

**Goal:** Transform the current single-agent Gemini review workflow into a hybrid system that uses subagents for complex PRs while maintaining efficiency for simple PRs.

## Overview

This design proposes a hybrid approach that combines the best of both worlds:
- **Simple PRs**: Enhanced single-agent review with focused prompts
- **Complex PRs**: Multi-agent parallel review with specialized expertise
- **CI/CD Separation**: Dedicated workflow for automation files

## Architecture

```
PR Trigger → Complexity Assessment → Smart Routing
                    ↓
        ┌─────────────────────────────┐
        │                           │
    Simple PRs                Complex PRs
    (≤5 files, ≤300 lines)    (>5 files, >300 lines)
        │                           │
    Enhanced Single         ┌─────────────────┐
    Agent Review           │ Subagent Router │
                        └─────────────────┘
                                ↓
        ┌─────────────────────────────────────────────────────┐
        │ Specialized Subagents (Parallel Execution)           │
        │                                                     │
        │ 🔒 Security Expert    ⚡ Performance Expert        │
        │ 🎯 Business Logic     🧪 TypeScript/React Expert  │
        │ 🔧 Code Quality       📊 Integration Specialist  │
        └─────────────────────────────────────────────────────┘
                                ↓
                    Review Synthesis & Posting
```

## 1. Complexity Assessment Layer

### 1.1 Assessment Criteria

```typescript
interface PRComplexity {
  fileCount: number;
  totalChanges: number;
  newFiles: string[];
  modifiedFiles: string[];
  deletedFiles: string[];
  riskFactors: RiskFactor[];
}

type RiskFactor = 
  | 'breaking-change'
  | 'new-feature'
  | 'security-related'
  | 'performance-critical'
  | 'api-changes'
  | 'database-schema';
```

### 1.2 Complexity Rules

```yaml
Complexity Thresholds:
  Simple:
    files: ≤ 5
    lines: ≤ 300
    riskFactors: ≤ 1
  
  Medium:
    files: 6-15
    lines: 301-1000
    riskFactors: 2-3
  
  Complex:
    files: > 15
    lines: > 1000
    riskFactors: > 3

Routing Logic:
  Simple → Enhanced Single Agent
  Medium → 2-3 Specialized Subagents
  Complex → All 5 Subagents
```

### 1.3 Risk Factor Detection

Automatically detect based on file patterns and content:

```yaml
Risk Factor Patterns:
  breaking-change:
    files: - api/**/*.{ts,tsx,js,jsx}
              - src/**/*.{ts,tsx}
              - **/schema*.{ts,tsx,sql}
    patterns: - 'export.*interface'
              - 'export.*type'
              - 'database.*schema'
              - 'api.*route'
  
  security-related:
    files: - **/auth/**/*.{ts,tsx,js,jsx}
              - **/security/**/*.*
              - **/api/**/*.{ts,tsx}
    patterns: - 'password'
              - 'token'
              - 'auth'
              - 'jwt'
              - 'bcrypt'
              - 'crypto'
  
  performance-critical:
    files: - **/components/**/*.{ts,tsx}
              - **/hooks/**/*.{ts,tsx}
              - **/utils/**/*.{ts,tsx}
    patterns: - 'useState.*large'
              - 'useMemo.*empty'
              - 'React.memo'
              - 'performance.*'
```

## 2. Smart Routing Layer

### 2.1 Router Logic

```typescript
interface RouterDecision {
  strategy: 'single' | 'multi';
  subagents: SubagentType[];
  priority: 'low' | 'medium' | 'high';
}

function determineRoute(pr: PRInfo): RouterDecision {
  const complexity = assessComplexity(pr);
  
  if (complexity.level === 'simple') {
    return {
      strategy: 'single',
      subagents: [],
      priority: 'low'
    };
  }
  
  // Select subagents based on PR characteristics
  const subagents = selectSubagents(complexity, pr);
  
  return {
    strategy: 'multi',
    subagents,
    priority: complexity.level === 'complex' ? 'high' : 'medium'
  };
}
```

### 2.2 Subagent Selection Matrix

```yaml
Subagent Selection Logic:

Security Expert:
  always: true for all PRs
  focus: auth, validation, input sanitization

Performance Expert:
  trigger: files include components, hooks, utils
  focus: React performance, optimization, bundle size

Business Logic Expert:
  trigger: files in features/, src/
  focus: requirements fulfillment, edge cases, business rules

TypeScript/React Expert:
  always: true for TypeScript projects
  focus: type safety, React patterns, best practices

Integration Specialist:
  trigger: files include api/, services/, external
  focus: API integration, error handling, contracts
```

## 3. Specialized Subagent Architecture

### 3.1 Subagent Structure

Each subagent follows this pattern:

```typescript
interface Subagent {
  id: string;
  name: string;
  expertise: string[];
  prompt: string;
  focusAreas: string[];
  confidence: 'high' | 'medium' | 'low';
}

const subagents: Subagent[] = [
  {
    id: 'security-expert',
    name: 'Security Specialist',
    expertise: ['authentication', 'authorization', 'input validation', 'data protection'],
    prompt: SECURITY_PROMPT_TEMPLATE,
    focusAreas: ['auth', 'validation', 'security'],
    confidence: 'high'
  },
  // ... other subagents
];
```

### 3.2 Parallel Execution Flow

```yaml
Execution Steps:
  1. Router assesses complexity → selects subagents
  2. Single Agent: Enhanced prompt execution
  3. Multi Agent: 
     - Spawn parallel subagent tasks
     - Each gets specialized prompt + PR context
     - Collect results within timeout (60s max)
  4. Synthesize findings
  5. Generate unified review
  6. Post to GitHub
```

### 3.3 Subagent Specialization

#### 🔒 Security Expert
```typescript
const securityPrompt = `
You are a security expert specializing in web application security.
Focus exclusively on:
- Authentication and authorization vulnerabilities
- Input validation and sanitization
- XSS, CSRF, and injection attacks
- Data protection and privacy
- Security best practices in React/TypeScript

For each finding, provide:
- Severity: critical/high/medium/low
- Specific line numbers
- Detailed explanation of risk
- Fix recommendations
`;
```

#### ⚡ Performance Expert  
```typescript
const performancePrompt = `
You are a performance optimization specialist for React/TypeScript applications.
Focus exclusively on:
- React component performance (re-renders, memoization)
- Bundle size and optimization opportunities
- Memory leaks and inefficient patterns
- API call optimization and caching
- Loading states and user experience

For each finding, provide:
- Performance impact: high/medium/low
- Specific optimization opportunities
- Implementation guidance
`;
```

#### 🎯 Business Logic Expert
```typescript
const businessPrompt = `
You are a domain expert focusing on business logic requirements.
Focus exclusively on:
- Requirement fulfillment and completeness
- Edge cases and error handling
- Business rule compliance
- User experience implications
- Data consistency and validation

For each finding, provide:
- Business impact: high/medium/low
- User experience implications
- Requirements alignment check
`;
```

#### 🧪 TypeScript/React Expert
```typescript
const typescriptPrompt = `
You are a TypeScript and React best practices expert.
Focus exclusively on:
- Type safety and correctness
- React patterns and best practices
- Code maintainability and readability
- TypeScript configuration and usage
- Testing and accessibility

For each finding, provide:
- Best practice violation type
- Specific improvement recommendations
- Modern React/TypeScript patterns
`;
```

#### 📊 Integration Specialist
```typescript
const integrationPrompt = `
You are an integration specialist focusing on system interactions.
Focus exclusively on:
- API contract compliance
- Error handling robustness
- Data transformation and validation
- External service integration
- System reliability and monitoring

For each finding, provide:
- Integration risk level
- Error handling completeness
- API contract adherence
- Monitoring and observability needs
`;
```

## 4. Review Synthesis Layer

### 4.1 Finding Consolidation

```typescript
interface ConsolidatedFinding {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'suggestion';
  category: 'security' | 'performance' | 'business' | 'typescript' | 'integration';
  title: string;
  description: string;
  subagents: string[];
  confidence: number;
}

function consolidateFindings(
  securityFindings: Finding[],
  performanceFindings: Finding[],
  businessFindings: Finding[],
  typescriptFindings: Finding[],
  integrationFindings: Finding[]
): ConsolidatedFinding[] {
  // Deduplicate similar findings
  // Merge related findings
  // Calculate confidence scores
  // Prioritize by severity and impact
}
```

### 4.2 Quality Scoring

```yaml
Quality Scoring System:
  Critical Issues (90-100): Must fix before merge
    - Security vulnerabilities
    - Breaking changes
    - Major bugs
  
  High Issues (70-89): Should fix before merge
    - Performance problems
    - Best practice violations
    - Important edge cases
  
  Medium Issues (50-69): Nice to have
    - Code improvements
    - Minor optimizations
    - Documentation
  
  Low Issues (30-49): Consider for future
    - Style suggestions
    - Refactoring opportunities
    - Future enhancements
```

### 4.3 Review Generation

```typescript
interface ReviewOutput {
  summary: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  findings: ConsolidatedFinding[];
  recommendations: string[];
  autoApproval: boolean;
  blockingIssues: number;
  nonBlockingIssues: number;
}
```

## 5. CI/CD Separation

### 5.1 File Classification

```yaml
File Categories:
  Application Code:
    patterns: - src/**/*
              - features/**/*
              - components/**/*
              - pages/**/*
              - hooks/**/*
              - utils/**/*
              - types/**/*
  
  CI/CD Configuration:
    patterns: - .github/**/*
              - .gitlab-ci.yml
              - Dockerfile
              - docker-compose.yml
              - package.json
              - tsconfig.json
              - vite.config.ts
              - tailwind.config.*
```

### 5.2 Workflow Separation

```yaml
Workflow Triggers:
  Application Code Review:
    on: pull_request
    branches: [main]
    paths: ['src/**', 'features/**', 'components/**']
  
  CI/CD Review:
    on: pull_request
    branches: [main] 
    paths: ['.github/**', 'Dockerfile', 'package.json']
    # Separate workflow for configuration changes
```

## 6. Implementation Roadmap

### Phase 1: Enhanced Single Agent (Week 1)
- [ ] Implement complexity assessment
- [ ] Create enhanced prompt template
- [ ] Add quality scoring system
- [ ] Test with existing PRs

### Phase 2: Subagent Infrastructure (Week 2)
- [ ] Create subagent spawning mechanism
- [ ] Implement parallel execution
- [ ] Build result consolidation logic
- [ ] Add timeout handling

### Phase 3: Specialized Subagents (Week 3)
- [ ] Implement Security Expert
- [ ] Implement Performance Expert
- [ ] Implement Business Logic Expert
- [ ] Test and refine prompts

### Phase 4: Full Integration (Week 4)
- [ ] Implement TypeScript/React Expert
- [ ] Implement Integration Specialist
- [ ] Add CI/CD separation
- [ ] End-to-end testing

## 7. Success Metrics

```yaml
Success Criteria:
  Review Quality:
    - Critical issues caught: 100%
    - False positive rate: < 10%
    - Review relevance score: > 8/10
  
  Performance:
    - Simple PR review time: < 30s
    - Complex PR review time: < 120s
    - Success rate: > 95%
  
  Developer Experience:
    - Actionable feedback: > 90%
    - Review clarity: > 8/10
    - Auto-approval accuracy: > 85%
```

## 8. Error Handling & Fallbacks

```yaml
Error Handling Strategy:
  API Failures:
    - Retry with exponential backoff
    - Fallback to simpler model
    - Timeout after 120s
  
  Response Parsing:
    - Graceful JSON extraction
    - Fallback to text analysis
    - Error logging for debugging
  
  Subagent Failures:
    - Continue with working subagents
    - Log missing agent results
    - Adjust confidence scores
```

This hybrid approach will provide comprehensive code reviews for complex PRs while maintaining efficiency for simple changes, exactly matching the `/review` skill's methodology within the GitHub Actions context.
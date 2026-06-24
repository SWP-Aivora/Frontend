# Gemini Code Review Enhanced - Design Specification

**Date:** 2026-06-24  
**Version:** 1.0  
**Status:** Approved for Implementation

## 📋 Overview

Nâng cấp workflow Gemini Code Review hiện tại thành multi-agent pipeline với 7 chuyên gia agent song song, cung cấp coverage chất lượng cao như skill `/review` nhưng với tốc độ nhanh hơn.

## 🎯 Goals

### Primary Goals
1. **Enhanced Coverage**: Review all categories like `/review` skill
2. **Fast Processing**: Complete review in <10 seconds
3. **High Accuracy**: <15% false positives
4. **Actionable Feedback**: Specific, fixable suggestions

### Secondary Goals
1. **Scalability**: Handle 2 concurrent PRs efficiently
2. **Rate Limit Compliance**: Stay within 15 RPM limit
3. **Smart Queuing**: Handle API bursts gracefully

## 🏗️ Architecture

### Multi-Agent Pipeline Design

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Event Trigger                     │
│ (PR opened/synchronize on main branch)                      │
└────────────────────────────┬──────────────────────────────┘
                             │
                    Rate Limit Check
                  (If <3 calls remaining → wait)
                             │
                    ┌─────────────────┐
                    │ Spawn 7 Agents  │ ← Parallel Processing
                    └─────────────────┘
                             │
           ┌───────┬───────┬───────┬───────┬───────┬───────┬───────┐
           │   1   │   2   │   3   │   4   │   5   │   6   │   7   │
           │Req    │Bug    │Sec    │TS     │Arch   │Test   │React │
           │Compl  │Hunter │Spec   │Expert │Guard  │Doc    │Pract │
           └───────┴───────┴───────┴───────┴───────┴───────┴───────┘
                             │
                    ┌─────────────────┐
                    │ Synthesis Agent │ ← Combine & Prioritize
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │ Review Generator│ ← Format GitHub Review
                    └─────────────────┘
                             │
                    GitHub API Submit
```

## 👥 Agent Specifications

### 1. Requirements Compliance Agent
**Focus**: Validate implementation against plan/requirements

**Prompt Structure**:
```yaml
Role: Senior Requirements Analyst
Task: Check PR changes vs original plan/requirements
Input: PR title, body, diff
Checks:
  - Feature completeness vs description
  - Scope adherence (no gold plating)
  - Requirements fulfillment
  - Acceptance criteria met
Output: Array of requirement violations
```

### 2. Bug Hunter Agent
**Focus**: Logic errors, runtime issues

**Prompt Structure**:
```yaml
Role: Senior Debugging Expert  
Task: Find logic errors in PR changes
Checks:
  - Null/undefined risks
  - Race conditions
  - Infinite loops
  - Missing error handling
  - Edge cases not handled
Output: Array of bug issues with confidence scores
```

### 3. Security Specialist Agent
**Focus**: Security vulnerabilities

**Prompt Structure**:
```yaml
Role: Security Engineer
Task: Identify security issues in PR changes
Checks:
  - XSS vulnerabilities
  - Credential exposure
  - Unsafe APIs (eval, innerHTML)
  - Input validation
  - Authentication/authorization issues
Output: Array of security issues
```

### 4. TypeScript Expert Agent
**Focus**: Type safety compliance

**Prompt Structure**:
```yaml
Role: TypeScript Specialist
Task: Verify TypeScript compliance per GEMINI.md
Checks:
  - import type usage (verbatimModuleSyntax)
  - No enum usage (erasableSyntaxOnly)
  - Proper typing for new code
  - Avoid unnecessary any types
  - Generic usage correctness
Output: Array of TypeScript violations
```

### 5. Architecture Guardian Agent
**Focus**: System architecture and design

**Prompt Structure**:
```yaml
Role: Software Architect
Task: Review architecture compliance
Checks:
  - FSD layer violations
  - Cross-feature imports
  - Separation of concerns
  - Design pattern usage
  - Scalability concerns
Output: Array of architecture issues
```

### 6. Testing & Documentation Agent
**Focus**: Tests and documentation quality

**Prompt Structure**:
```yaml
Role: QA Engineer + Technical Writer
Task: Review testing and documentation
Checks:
  - Test coverage for new features
  - Edge cases in tests
  - Integration tests
  - Documentation completeness
  - README/API doc updates
Output: Array of testing/doc issues
```

### 7. React Best Practices Agent
**Focus**: React-specific patterns

**Prompt Structure**:
```yaml
Role: React Expert
Task: Check React best practices
Checks:
  - Hooks rules compliance
  - useEffect dependencies
  - Performance optimizations
  - Component patterns
  - Props validation
Output: Array of React pattern issues
```

## 🔧 Synthesis Agent

**Function**: Combine results from all 7 agents

**Logic**:
```python
class ReviewSynthesizer:
    def synthesize(self, all_agent_results):
        # Cross-reference similar issues
        correlated_issues = self.find_correlated_issues(all_agent_results)
        
        # Calculate final confidence scores
        final_issues = self.calculate_final_confidence(all_agent_results)
        
        # Categorize by severity
        critical = [i for i in final_issues if i.confidence >= 80]
        important = [i for i in final_issues if 50 <= i.confidence < 80]
        minor = [i for i in final_issues if i.confidence < 50]
        
        # Generate actionable summary
        summary = self.generate_summary(critical, important, minor)
        
        return {
            "critical_issues": critical,
            "important_issues": important,
            "minor_issues": minor,
            "summary": summary,
            "recommendations": self.generate_recommendations(all_agent_results)
        }
```

## 📊 Output Format

### GitHub Review Structure

```markdown
## 🤖 Gemini AI Enhanced Code Review

> **Summary**: [Brief summary of changes]
> **Review Time**: <10 seconds
> **Coverage**: 7 expert agents

### 🚨 Critical Issues (Must Fix)
[Issues with confidence >= 80]

### 💬 Important Issues (Should Fix)  
[Issues with confidence 50-79]

### ✅ Minor Notes (Nice to Have)
[Issues with confidence < 50]

### 🎯 Recommendations
[Actionable improvement suggestions]

---
<sub>🤖 Reviewed by 7 AI Experts | React with 👍 if helpful, 👎 if not</sub>
```

## ⚡ Performance Characteristics

### API Calls Breakdown
| Agent | Calls | Time (ms) |
|-------|-------|-----------|
| Requirements | 1 | 1200 |
| Bug Hunter | 1 | 1200 |
| Security Spec | 1 | 1200 |
| TS Expert | 1 | 1200 |
| Arch Guardian | 1 | 1200 |
| Testing & Doc | 1 | 1200 |
| React Pract | 1 | 1200 |
| Synthesis | 1 | 800 |
| **Total** | **8** | **8400ms** |

### Rate Limit Management
- **Max concurrent**: 2 PRs
- **API calls per PR**: 8
- **Time per PR**: ~8.4 seconds
- **Buffer time**: 1.6 seconds
- **Total time**: 10 seconds

### Queue Logic
```yaml
if rate_limit_remaining < 3:
    sleep(60)  # Wait for refresh
    recheck()
else:
    proceed_with_review()
```

## 🎯 Success Metrics

### Quality Metrics
- **Accuracy**: ≥85% of detected issues are real (confidence ≥ 75)
- **Coverage**: 100% of 7 categories reviewed
- **False Positive Rate**: ≤15%
- **Actionability**: ≥90% issues include specific fix suggestions

### Performance Metrics  
- **Review Time**: <10 seconds per PR
- **Throughput**: 2 PRs/minute max
- **Success Rate**: >99% reviews complete successfully

### Business Metrics
- **PR Merge Time**: Reduced by 50%
- **Code Quality Score**: Improved by 30%
- **Developer Satisfaction**: >90% positive feedback

## 🚀 Implementation Roadmap

### Phase 1: Core Pipeline (Week 1)
1. Implement agent spawning framework
2. Create basic prompt templates
3. Set up synthesis logic
4. Implement rate limiting

### Phase 2: Enhanced Prompts (Week 2)
1. Fine-tune prompts for each agent
2. Add project-specific context
3. Improve confidence scoring
4. Test edge cases

### Phase 3: Output Optimization (Week 3)
1. Enhance GitHub review formatting
2. Add issue correlation
3. Implement smart summarization
4. Performance tuning

### Phase 4: Monitoring & Improvements (Ongoing)
1. Track success metrics
2. Collect feedback
3. Continuous prompt optimization
4. Scale as needed

## 🔒 Security Considerations

1. **API Key Protection**: Store as GitHub secrets
2. **Input Validation**: Sanitize all PR content
3. **Rate Limit Compliance**: Smart queuing
4. **No Data Leakage**: Don't store review data externally

## 📚 Dependencies

- **Gemini API**: Key stored as `GEMINI_AI_KEY`
- **GitHub CLI**: For PR interactions
- **jq**: JSON processing
- **Python 3.8+**: For review logic

---

**Review History**:
- Created: 2026-06-24
- Status: Approved for Implementation
- Next Steps: Invoke writing-plans skill for detailed implementation plan
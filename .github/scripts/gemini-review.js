#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Configuration
const MAX_TOKENS = 100000; // Safe limit under context window
const DIFF_TRUNCATE_LINES = 500; // Limit diff to prevent token overflow
const CRITICAL_FILE_SIZE = 50000; // Skip files > 50KB

async function main() {
  try {
    // Load environment and context
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Read PR information from GitHub context (passed via environment)
    const prData = JSON.parse(process.env.PR_DATA || '{}');
    const diffData = JSON.parse(process.env.DIFF_DATA || '{}');

    // Prepare system prompt
    const systemPrompt = `You are a senior frontend engineer reviewing a PR for the AIVORA project.
The codebase uses React, TypeScript (strict), Tailwind v4, and Feature-Sliced Design (FSD).

Architecture standards to enforce:
- Features must be in src/features/ with proper structure
- Use import type for type imports only
- Use const assertions for enums: const STATUS = { ACTIVE: 'active' } as const
- Components should use class-variance-authority for variants
- API endpoints in src/shared/constants/index.ts
- State management with Zustand in feature store.ts
- Zod validation for all forms and APIs

Review criteria by priority:
1. Security: No hardcoded secrets, eval(), Function(), untrusted input
2. TypeScript: Strict types, no any, proper interfaces
3. Architecture: FSD compliance, proper feature organization
4. Performance: Unnecessary re-renders, missing optimizations
5. UI/UX: Tailwind v4 usage, accessibility, component design
6. Code quality: Readability, best practices, consistency

For each issue found, include:
- File path and line number (if available)
- Type: security|typescript|architecture|performance|ui|code-quality
- Severity: critical|major|minor|suggestion
- Specific description
- Fix suggestion

Respond ONLY in this exact JSON format:
{
  "recommendation": "APPROVE|REQUEST_CHANGES|COMMENT",
  "summary": "Brief overall assessment",
  "issues": [
    {
      "file": "src/features/auth/LoginForm.tsx",
      "line": 15,
      "type": "typescript",
      "severity": "major",
      "description": "Missing return type for async function",
      "suggestion": "Add explicit return type: Promise<AuthResponse>"
    }
  ]
}`;

    // Prepare user prompt with PR info and diff
    let userPrompt = `PR Title: ${prData.title}\n`;
    userPrompt += `PR Description: ${prData.description}\n`;
    userPrompt += `Labels: ${prData.labels?.join(', ') || 'none'}\n\n`;
    userPrompt += 'Changed files:\n';

    // Process changed files with truncation
    for (const [file, content] of Object.entries(diffData.files || {})) {
      // Skip large files
      if (content.length > CRITICAL_FILE_SIZE) {
        userPrompt += `\n📁 ${file} [SKIPPED - too large]\n`;
        continue;
      }

      userPrompt += `\n📁 ${file}\n`;
      userPrompt += '```diff\n';

      // Truncate diff if too long
      const lines = content.split('\n');
      if (lines.length > DIFF_TRUNCATE_LINES) {
        userPrompt += lines.slice(0, DIFF_TRUNCATE_LINES).join('\n');
        userPrompt += `\n\n... [TRUNCATED - ${lines.length - DIFF_TRUNCATE_LINES} lines omitted]`;
      } else {
        userPrompt += content;
      }

      userPrompt += '\n```\n';
    }

    // Count tokens roughly (1 token ≈ 4 chars for English)
    const totalChars = systemPrompt.length + userPrompt.length;
    if (totalChars > MAX_TOKENS * 4) {
      console.warn('Warning: Content may exceed token limit');
    }

    // Call Gemini API
    const result = await model.generateContent(systemPrompt + '\n\n' + userPrompt);
    const response = result.response;
    const text = response.text();

    // Parse response
    let review;
    try {
      review = JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse Gemini response:', text);
      throw new Error('Invalid JSON response from Gemini');
    }

    // Validate response structure
    if (!review.recommendation || !review.issues) {
      throw new Error('Invalid response structure from Gemini');
    }

    // Convert recommendation to uppercase for consistency
    review.recommendation = review.recommendation.toUpperCase();

    // Validate recommendation value
    if (!['APPROVE', 'REQUEST_CHANGES', 'COMMENT'].includes(review.recommendation)) {
      console.warn('Invalid recommendation:', review.recommendation, 'falling back to COMMENT');
      review.recommendation = 'COMMENT';
    }

    // Sort issues by severity
    const severityOrder = { critical: 0, major: 1, minor: 2, suggestion: 3 };
    review.issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Save result for next stage
    fs.writeFileSync('review-result.json', JSON.stringify(review, null, 2));

    console.log('Review completed with recommendation:', review.recommendation);
    console.log('Found', review.issues.length, 'issues');

  } catch (error) {
    console.error('Error in Gemini review:', error.message);

    // Create error fallback response
    const errorResponse = {
      recommendation: 'COMMENT',
      summary: 'Review failed due to error. Please check logs.',
      issues: [{
        file: 'unknown',
        type: 'error',
        severity: 'critical',
        description: 'Failed to complete review: ' + error.message,
        suggestion: 'Manual review required'
      }]
    };

    fs.writeFileSync('review-result.json', JSON.stringify(errorResponse, null, 2));
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
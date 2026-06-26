export function generateReviewComment(scoredIssues, prTitle, prSha) {
  const { highConfidence, mediumConfidence, lowConfidence, summary } = scoredIssues;

  const lines = [
    '## 🤖 Gemini AI Code Review (Enhanced)',
    '',
    `> **Summary**: ${summary}`,
    '',
  ];

  // Critical issues section
  if (highConfidence.length > 0) {
    lines.push('### 🚨 Critical Issues (Must Fix):', '');
    highConfidence.forEach((issue, index) => {
      const icon = getIcon(issue.category);
      lines.push(`${index + 1}. ${icon} **[${issue.category.toUpperCase()}]** ${issue.description} (confidence: ${issue.confidence})`);
      lines.push(`   📄 [${issue.file}:${issue.line}](https://github.com/SWP-Aivora/Frontend/blob/${prSha}/${issue.file}#L${issue.line-1}-L${issue.line+1})`);
      if (issue.suggestion) {
        lines.push(`   💡 **Suggestion:** ${issue.suggestion}`);
      }
      lines.push('');
    });
  }

  // Important issues section
  if (mediumConfidence.length > 0) {
    lines.push('### 💬 Important Issues (Should Fix):', '');
    mediumConfidence.forEach((issue, index) => {
      const icon = getIcon(issue.category);
      lines.push(`${index + 1}. ${icon} **[${issue.category.toUpperCase()}]** ${issue.description} (confidence: ${issue.confidence})`);
      lines.push(`   📄 [${issue.file}:${issue.line}](https://github.com/SWP-Aivora/Frontend/blob/${prSha}/${issue.file}#L${issue.line-1}-L${issue.line+1})`);
      if (issue.suggestion) {
        lines.push(`   💡 **Suggestion:** ${issue.suggestion}`);
      }
      lines.push('');
    });
  }

  // Footer
  lines.push(
    '---',
    '<sub>🤖 Reviewed by Gemini AI | React with 👍 if helpful, 👎 if not</sub>'
  );

  return lines.join('\n');
}

function getIcon(category) {
  const icons = {
    bug: '🐛',
    security: '🔒',
    typescript: '📘',
    architecture: '🏗️',
    react: '⚛️',
    requirements: '📋',
    testing: '🧪'
  };
  return icons[category] || '⚠️';
}
export function generateReviewComment(scoredIssues, prTitle, prSha) {
  const { highConfidence, mediumConfidence, summary } = scoredIssues;

  const lines = [
    '## 🤖 Gemini AI Enhanced Code Review',
    '',
    `> **Summary**: ${summary}`,
    '',
  ];

  if (highConfidence.length > 0) {
    lines.push(`### 🚨 Critical Issues (Must Fix) (${highConfidence.length}):`, '');
    highConfidence.forEach((issue, index) => {
      lines.push(`${index + 1}. **[${issue.category.toUpperCase()}]** ${issue.description} (confidence: ${issue.confidence})`);
      lines.push(`   📄 [${issue.file}:${issue.line}](https://github.com/SWP-Aivora/Frontend/blob/${prSha}/${encodeURIComponent(issue.file)}#L${Math.max(1, issue.line-1)}-L${Math.max(1, issue.line+1)})`);
      lines.push('');
    });
  }

  if (mediumConfidence.length > 0) {
    lines.push(`### 💬 Important Issues (Should Fix) (${mediumConfidence.length}):`, '');
    mediumConfidence.forEach((issue, index) => {
      lines.push(`${index + 1}. **[${issue.category.toUpperCase()}]** ${issue.description} (confidence: ${issue.confidence})`);
      lines.push(`   📄 [${issue.file}:${issue.line}](https://github.com/SWP-Aivora/Frontend/blob/${prSha}/${encodeURIComponent(issue.file)}#L${Math.max(1, issue.line-1)}-L${Math.max(1, issue.line+1)})`);
      lines.push('');
    });
  }

  lines.push(
    '---',
    '<sub>🤖 Reviewed by 7 AI Experts | React with 👍 if helpful, 👎 if not</sub>'
  );

  return lines.join('\n');
}
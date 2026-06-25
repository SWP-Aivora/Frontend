export function scoreIssues(allIssues) {
  const highConfidence = [];
  const mediumConfidence = [];
  const lowConfidence = [];

  allIssues.forEach(issue => {
    if (issue.confidence >= 80) {
      highConfidence.push(issue);
    } else if (issue.confidence >= 50) {
      mediumConfidence.push(issue);
    } else {
      lowConfidence.push(issue);
    }
  });

  return {
    highConfidence,
    mediumConfidence,
    lowConfidence,
    summary: `Total: ${allIssues.length}, Critical: ${highConfidence.length}, Important: ${mediumConfidence.length}`
  };
}
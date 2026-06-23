#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Security patterns to scan for
const SECURITY_PATTERNS = {
  HARDCODED_SECRETS: {
    patterns: [
      /API_KEY\s*=\s*['"`][^'"`]{10,}/i,
      /GEMINI_AI_KEY\s*=\s*['"`][^'"`]{10,}/i,
      /SECRET\s*=\s*['"`][^"`]{10,}/i,
      /PASSWORD\s*=\s*['"`][^"`]{10,}/i,
      /TOKEN\s*=\s*['"`][^"`]{10,}/i,
      /PRIVATE_KEY\s*=\s*['"`][^"`]{10,}/i
    ],
    severity: 'critical',
    message: 'Hardcoded secret detected'
  },
  EVAL_USAGE: {
    patterns: [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\([^,]+,/,
      /setInterval\s*\([^,]+,/
    ],
    severity: 'major',
    message: 'Potentially dangerous dynamic code execution'
  },
  UNVALIDATED_INPUT: {
    patterns: [
      /innerHTML\s*=/,
      /outerHTML\s*=/,
      /document\.write/,
      /\.exec\s*\(/,
      /new\s+Function\s*\(/,
      /Function\s*\(/,
      /eval\s*\(/,
      /\.toString\s*\(/,
      /JSON\.parse\s*\([^,]+,/
    ],
    severity: 'major',
    message: 'Potential XSS or code injection'
  },
  INSECURE_PROTOCOLS: {
    patterns: [
      /http:\/\/localhost:\d+/,
      /http:\/\/127\.0\.0\.1:\d+/,
      /http:\/\/0\.0\.0\.0:\d+/
    ],
    severity: 'minor',
    message: 'Development URL hardcoded in code'
  }
};

// File patterns to scan
const SCAN_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx'
];

// Get changed files from environment
function getChangedFiles() {
  const filesEnv = process.env.FILES;
  if (!filesEnv) {
    console.log('No FILES environment variable found');
    return [];
  }

  return filesEnv.split(' ').filter(Boolean);
}

// Check if a file matches our scan patterns
function shouldScanFile(file) {
  const basename = path.basename(file);
  const ext = path.extname(file);

  // Skip certain directories and files
  if (file.includes('node_modules') ||
      file.includes('.git') ||
      file.includes('dist') ||
      file.includes('build') ||
      file.startsWith('test') ||
      file.startsWith('__tests__') ||
      basename.endsWith('.test.') ||
      basename.endsWith('.spec.') ||
      file.includes('mocks') ||
      file.includes('fixtures')) {
    return false;
  }

  // Check file extension
  const validExts = ['.ts', '.tsx', '.js', '.jsx'];
  return validExts.includes(ext);
}

// Scan a single file for security issues
function scanFile(filePath) {
  const issues = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    for (const [category, config] of Object.entries(SECURITY_PATTERNS)) {
      config.patterns.forEach((pattern, index) => {
        const matches = content.match(pattern);

        if (matches) {
          issues.push({
            file: filePath,
            category: category,
            severity: config.severity,
            message: config.message,
            matches: matches,
            pattern: pattern.source
          });
        }
      });
    }

  } catch (error) {
    console.warn(`Failed to read file ${filePath}:`, error.message);
  }

  return issues;
}

// Main function
function main() {
  const changedFiles = getChangedFiles();
  const allIssues = [];

  console.log(`Scanning ${changedFiles.length} files for security issues...`);

  for (const file of changedFiles) {
    if (shouldScanFile(file)) {
      const issues = scanFile(file);
      allIssues.push(...issues);
    }
  }

  // Group issues by severity
  const issuesBySeverity = {
    critical: [],
    major: [],
    minor: []
  };

  allIssues.forEach(issue => {
    issuesBySeverity[issue.severity].push(issue);
  });

  // Report results
  if (allIssues.length > 0) {
    console.log('\nSecurity Scan Results:');
    console.log('=====================');

    for (const severity of ['critical', 'major', 'minor']) {
      if (issuesBySeverity[severity].length > 0) {
        console.log(`\n🔴 ${severity.toUpperCase()} ISSUES (${issuesBySeverity[severity].length}):`);
        issuesBySeverity[severity].forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.file}`);
          console.log(`     ${issue.message}`);
          console.log(`     Matches: ${issue.matches.length}`);
          if (issue.matches.length > 0) {
            console.log(`     First match: "${issue.matches[0].substring(0, 50)}..."`);
          }
          console.log('');
        });
      }
    }

    // Exit with error code if critical issues found
    if (issuesBySeverity.critical.length > 0) {
      console.error('\n❌ CRITICAL security issues found. PR requires changes.');
      process.exit(1);
    }

    if (issuesBySeverity.major.length > 0) {
      console.warn('\n⚠️ MAJOR security issues found. Review required.');
    }

  } else {
    console.log('✅ No security issues detected.');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
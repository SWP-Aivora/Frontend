#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';

// Test function for the enhanced review harness
function testEnhancedReview() {
  console.log('🧪 Testing Enhanced Review System...\n');

  // Test 1: Check if all required files exist
  const requiredFiles = [
    '.github/scripts/agents/bug-hunter-agent.js',
    '.github/scripts/agents/typescript-agent.js',
    '.github/scripts/utils/agent-base.js',
    '.github/scripts/utils/gemini-context-reader.js',
    '.github/scripts/utils/confidence-scorer.js',
    '.github/scripts/utils/github-reviewer.js',
    '.github/scripts/enhanced-review-harness.js'
  ];

  console.log('📁 Checking required files...');
  let allFilesExist = true;

  requiredFiles.forEach(file => {
    try {
      readFileSync(join(process.cwd(), file), 'utf8');
      console.log(`  ✅ ${file}`);
    } catch (error) {
      console.log(`  ❌ ${file} - Missing!`);
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    console.log('\n❌ Missing required files. Please ensure all files are created.');
    process.exit(1);
  }

  // Test 2: Check if GEMINI.md exists and can be parsed
  console.log('\n📄 Testing GEMINI.md parsing...');
  try {
    const geminiPath = join(process.cwd(), 'GEMINI.md');
    const content = readFileSync(geminiPath, 'utf8');

    // Check for expected sections
    const requiredSections = [
      { name: 'Security & System Integrity', pattern: 'Security & System Integrity' },
      { name: 'Architecture (Feature-Sliced Design)', pattern: 'Architecture \\(Feature-Sliced Design' },
      { name: 'TypeScript Strictness', pattern: 'TypeScript Strictness' }
    ];

    requiredSections.forEach(section => {
      const regex = new RegExp(section.pattern);
      if (regex.test(content)) {
        console.log(`  ✅ Found section: ${section.name}`);
      } else {
        console.log(`  ⚠️  Missing section: ${section.name}`);
      }
    });
  } catch (error) {
    console.log(`  ❌ Cannot read GEMINI.md: ${error.message}`);
  }

  // Test 3: Check package.json for Gemini dependency
  console.log('\n📦 Checking package.json dependencies...');
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

    if (packageJson.dependencies && packageJson.dependencies['@google/generative-ai']) {
      console.log(`  ✅ @google/generative-ai v${packageJson.dependencies['@google/generative-ai']} (in dependencies)`);
    } else if (packageJson.devDependencies && packageJson.devDependencies['@google/generative-ai']) {
      console.log(`  ✅ @google/generative-ai v${packageJson.devDependencies['@google/generative-ai']} (in devDependencies)`);
    } else {
      console.log('  ❌ @google/generative-ai dependency not found');
    }
  } catch (error) {
    console.log(`  ❌ Cannot read package.json: ${error.message}`);
  }

  // Test 4: Validate workflow file
  console.log('\n🔄 Testing workflow configuration...');
  try {
    const workflowPath = join(process.cwd(), '.github/workflows/enhanced-review-small.yml');
    const workflow = readFileSync(workflowPath, 'utf8');

    const requiredElements = [
      'name: Gemini AI Enhanced Code Review (Small)',
      'GEMINI_AI_KEY',
      'enhanced-review-harness.js',
      'node-version: \'20.x\''
    ];

    requiredElements.forEach(element => {
      if (workflow.includes(element)) {
        console.log(`  ✅ Found: ${element}`);
      } else {
        console.log(`  ❌ Missing: ${element}`);
      }
    });
  } catch (error) {
    console.log(`  ❌ Cannot read workflow file: ${error.message}`);
  }

  console.log('\n🎉 Enhanced Review System Test Complete!');
  console.log('\nNext Steps:');
  console.log('1. Run npm install to install dependencies');
  console.log('2. Ensure GEMINI_AI_KEY secret is configured in repository settings');
  console.log('3. Create a test PR to verify the enhanced review works');
}

// Run tests
testEnhancedReview();
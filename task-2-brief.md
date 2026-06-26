# Task 2: Create Gemini Context Reader Utility

**Files:**
- Create: `.github/scripts/utils/gemini-context-reader.js`
- Test: Unit tests for context reading

**Interfaces:**
- Consumes: GEMINI.md file content
- Produces: Structured context object for all agents

- [ ] **Step 1: Write the failing test**

Create `tests/utils/gemini-context-reader.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { readGeminiContext } from '../../.github/scripts/utils/gemini-context-reader.js';

describe('Gemini Context Reader', () => {
  it('should read and parse GEMINI.md', async () => {
    const context = await readGeminiContext();
    expect(context).toHaveProperty('security');
    expect(context).toHaveProperty('architecture');
    expect(context).toHaveProperty('typescript');
  });

  it('should validate required sections', async () => {
    const context = await readGeminiContext();
    expect(context.security).toContain('credential protection');
    expect(context.architecture).toContain('Feature-Sliced Design');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/gemini-context-reader.test.js`
Expected: FAIL with module not found

- [ ] **Step 3: Create context reader implementation**

Write `.github/scripts/utils/gemini-context-reader.js`:
```javascript
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..', '..', '..');

export async function readGeminiContext() {
  try {
    const geminiPath = join(repoRoot, 'GEMINI.md');
    const content = readFileSync(geminiPath, 'utf8');
    
    // Parse structured sections
    const sections = {
      security: extractSection(content, 'Security & System Integrity'),
      architecture: extractSection(content, 'Architecture \\(Feature-Sliced Design'),
      typescript: extractSection(content, 'TypeScript Strictness'),
      styling: extractSection(content, 'Styling \\(Tailwind v4'),
      validation: extractSection(content, 'Data Validation & API'),
      routing: extractSection(content, 'Routing')
    };
    
    return sections;
  } catch (error) {
    throw new Error(`Failed to read GEMINI.md: ${error.message}`);
  }
}

function extractSection(content, headerPattern) {
  const regex = new RegExp(`###? ${headerPattern}[^\\n]*\\n([^#]+)`);
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/utils/gemini-context-reader.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .github/scripts/utils/gemini-context-reader.js tests/utils/gemini-context-reader.test.js
git commit -m "feat: add Gemini context reader utility"
```
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..', '..');

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
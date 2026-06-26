import { readFileSync, existsSync, mkdirSync, writeFileSync, promises as fs } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export class GeminiContextCache {
  constructor(cacheDir = '.github/cache/gemini-context', ttl = 300000) {
    this.cacheDir = cacheDir;
    this.ttl = ttl; // 5 minutes default
    this.cacheData = new Map();

    // Ensure cache directory exists
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }

    // Load cache from disk
    this.loadCache();
  }

  // Generate cache key based on file content hash
  generateCacheKey(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const hash = createHash('sha256').update(content).digest('hex');
      return `gemini-${hash.substring(0, 12)}`;
    } catch (error) {
      return `gemini-error-${Date.now()}`;
    }
  }

  // Check if cache is valid
  isCacheValid(cacheEntry) {
    return cacheEntry &&
           (Date.now() - cacheEntry.timestamp) < this.ttl &&
           existsSync(cacheEntry.filePath);
  }

  // Load cache from disk
  loadCache() {
    try {
      const cacheFile = join(this.cacheDir, 'cache.json');
      if (existsSync(cacheFile)) {
        const data = readFileSync(cacheFile, 'utf8');
        const cache = JSON.parse(data);

        // Only load valid cache entries
        Object.entries(cache).forEach(([key, entry]) => {
          if (this.isCacheValid(entry)) {
            this.cacheData.set(key, entry);
          }
        });

        console.log(`📂 Loaded ${this.cacheData.size} valid cache entries from disk`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load cache from disk:', error.message);
    }
  }

  // Save cache to disk
  saveCache() {
    try {
      const cacheFile = join(this.cacheDir, 'cache.json');
      const cacheObj = Object.fromEntries(this.cacheData);
      writeFileSync(cacheFile, JSON.stringify(cacheObj, null, 2));
    } catch (error) {
      console.warn('⚠️ Failed to save cache to disk:', error.message);
    }
  }

  // Get cached context
  getCachedContext(filePath) {
    const key = this.generateCacheKey(filePath);
    const cacheEntry = this.cacheData.get(key);

    if (cacheEntry && this.isCacheValid(cacheEntry)) {
      console.log('🎯 Using cached GEMINI.md context');
      return cacheEntry.data;
    }

    return null;
  }

  // Cache context data
  cacheContext(filePath, data) {
    const key = this.generateCacheKey(filePath);
    const cacheEntry = {
      data,
      filePath,
      timestamp: Date.now(),
      key
    };

    this.cacheData.set(key, cacheEntry);

    // Save to disk
    this.saveCache();

    console.log('💾 Cached GEMINI.md context');
  }

  // Get or read context with caching
  async getContextWithCache(filePath) {
    // Try cache first
    const cached = this.getCachedContext(filePath);
    if (cached) {
      return cached;
    }

    // Read fresh data
    try {
      const data = await readGeminiContext(filePath);

      // Cache the result
      this.cacheContext(filePath, data);

      return data;
    } catch (error) {
      console.error('❌ Failed to read GEMINI.md:', error.message);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cacheData.clear();
    this.saveCache();
    console.log('🗑️ Cleared all cache entries');
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    let errorCount = 0;

    this.cacheData.forEach((entry, key) => {
      if (entry.filePath && existsSync(entry.filePath)) {
        if ((now - entry.timestamp) < this.ttl) {
          validCount++;
        } else {
          expiredCount++;
        }
      } else {
        errorCount++;
      }
    });

    return {
      total: this.cacheData.size,
      valid: validCount,
      expired: expiredCount,
      errors: errorCount,
      ttl: this.ttl
    };
  }

  // Cleanup expired cache entries
  cleanup() {
    const entriesToDelete = [];

    this.cacheData.forEach((entry, key) => {
      if (!this.isCacheValid(entry)) {
        entriesToDelete.push(key);
      }
    });

    entriesToDelete.forEach(key => {
      this.cacheData.delete(key);
    });

    if (entriesToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${entriesToDelete.length} expired cache entries`);
      this.saveCache();
    }

    return entriesToDelete.length;
  }
}

// Cache instance (singleton)
let cacheInstance = null;

export function getGeminiContextCache() {
  if (!cacheInstance) {
    cacheInstance = new GeminiContextCache();
  }
  return cacheInstance;
}

// Export the original read function for direct use
export async function readGeminiContext(filePath = './GEMINI.md') {
  try {
    const content = readFileSync(filePath, 'utf8');

    // Parse YAML frontmatter
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (match) {
      const [, frontmatter, body] = match;

      // Parse frontmatter YAML
      const lines = frontmatter.split('\n');
      const metadata = {
        title: '',
        description: '',
        techStack: [],
        codingStandards: {},
        patterns: {}
      };

      let currentSection = null;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Section headers
        if (trimmedLine.startsWith('###')) {
          // Skip section headers
          continue;
        }

        // Field assignments
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmedLine.substring(0, colonIndex).trim();
          const value = trimmedLine.substring(colonIndex + 1).trim();

          switch (key.toLowerCase()) {
            case 'title':
              metadata.title = value;
              break;
            case 'description':
              metadata.description = value;
              break;
            case 'tech stack':
              metadata.techStack = value.split(',').map(s => s.trim());
              break;
            case 'coding standards':
              if (value.toLowerCase().startsWith('file:')) {
                const file = value.substring(5).trim();
                // Validate file path is within project directory
                if (file.startsWith('/') || file.startsWith('..') || file.includes('../') || file.includes('..\\')) {
                  console.warn(`Security: Invalid coding standards file path: ${file}`);
                } else {
                  try {
                    const normalizedPath = require('path').normalize(file);
                    if (normalizedPath.startsWith('/') || normalizedPath.includes('..\\')) {
                      console.warn(`Security: Invalid normalized path: ${normalizedPath}`);
                    } else {
                      const fileContent = await fs.readFile(normalizedPath, 'utf8');
                      metadata.codingStandards = JSON.parse(fileContent);
                    }
                  } catch (e) {
                    console.warn(`Failed to read coding standards from ${file}:`, e.message);
                  }
                }
              }
              break;
            case 'patterns':
              if (value.toLowerCase().startsWith('file:')) {
                const file = value.substring(5).trim();
                // Validate file path is within project directory
                if (file.startsWith('/') || file.startsWith('..') || file.includes('../') || file.includes('..\\')) {
                  console.warn(`Security: Invalid patterns file path: ${file}`);
                } else {
                  try {
                    const normalizedPath = require('path').normalize(file);
                    if (normalizedPath.startsWith('/') || normalizedPath.includes('..\\')) {
                      console.warn(`Security: Invalid normalized path: ${normalizedPath}`);
                    } else {
                      const fileContent = await fs.readFile(normalizedPath, 'utf8');
                      metadata.patterns = JSON.parse(fileContent);
                    }
                  } catch (e) {
                    console.warn(`Failed to read patterns from ${file}:`, e.message);
                  }
                }
              }
              break;
          }
        }
      }

      return {
        title: metadata.title || 'Default Project Title',
        description: metadata.description || 'Project description',
        techStack: metadata.techStack || ['JavaScript', 'React'],
        codingStandards: metadata.codingStandards || {},
        patterns: metadata.patterns || {},
        body: body.trim()
      };
    }

    // No frontmatter found
    return {
      title: 'Default Project Title',
      description: 'Project description',
      techStack: ['JavaScript', 'React'],
      codingStandards: {},
      patterns: {},
      body: content.trim()
    };
  } catch (error) {
    console.error(`❌ Failed to read GEMINI.md at ${filePath}:`, error.message);
    throw new Error(`Could not read GEMINI.md: ${error.message}`);
  }
}
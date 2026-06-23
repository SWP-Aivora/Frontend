// scripts/test-gemini-local.js
const { GoogleGenAI } = require('@google/genai');

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_AI_KEY;
  if (!apiKey) {
    console.error('GEMINI_AI_KEY environment variable required');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Test with a simple prompt
  const result = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: [{
      parts: [{
        text: 'Hello, this is a test message.'
      }]
    }]
  });

  const response = result.response?.text();
  console.log('API Test Result:', response);
}

testGeminiAPI().catch(console.error);
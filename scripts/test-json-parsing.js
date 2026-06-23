// Test script for JSON parsing

// Mock different response formats
const testResponses = [
  '{"summary": "Test", "comments": []}',  // Valid JSON
  'Some text before ```json\n{"summary": "Test"}\n``` after',  // JSON in markdown
  'Just plain text about an issue',  // Plain text
  'Invalid JSON { broken: "structure'  // Invalid JSON
];

testResponses.forEach((response, index) => {
  console.log(`Test ${index + 1}:`, response);

  // Test the parsing logic from our action
  let parsed = null;
  try {
    parsed = JSON.parse(response);
  } catch (e1) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e2) {
      console.log('  → Would create fallback review');
    }
  }

  console.log('  Parsed:', parsed ? JSON.stringify(parsed) : 'null');
  console.log('---');
});
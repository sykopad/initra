/**
 * Standalone verification for parseAIJSON logic
 */

function parseAIJSON(input) {
  let cleaned = input.trim();
  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  const match = markdownRegex.exec(cleaned);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

const cases = [
  { name: "Clean", input: '{"val": 1}' },
  { name: "Markdown", input: '```json\n{"val": 2}\n```' },
  { name: "Text", input: 'Filler {"val": 3} text' }
];

cases.forEach(c => {
  try {
    const res = parseAIJSON(c.input);
    console.log(`${c.name}: ${res.val === cases.indexOf(c) + 1 ? 'OK' : 'FAIL'}`);
  } catch (e) {
    console.log(`${c.name}: ERROR ${e.message}`);
  }
});

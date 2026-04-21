import { parseAIJSON } from "../src/lib/ai/json-extractor";

function testExtraction() {
  const cases = [
    {
      name: "Clean JSON",
      input: '{"title": "Test"}',
      expected: "Test"
    },
    {
      name: "Markdown Wrapped",
      input: '```json\n{"title": "Markdown"}\n```',
      expected: "Markdown"
    },
    {
      name: "Conversational Filler",
      input: 'Sure! Here is your JSON: {"title": "Filler"} Hope you like it!',
      expected: "Filler"
    },
    {
      name: "Backticks and Text",
      input: 'Some text ```\n{"title": "Complex"}\n``` more text',
      expected: "Complex"
    }
  ];

  console.log("🚀 Running JSON Extraction Tests...");
  
  for (const c of cases) {
    try {
      const result = parseAIJSON<{title: string}>(c.input);
      if (result.title === c.expected) {
        console.log(`✅ ${c.name}: Passed`);
      } else {
        console.log(`❌ ${c.name}: Failed (Expected ${c.expected}, got ${result.title})`);
      }
    } catch (err) {
      console.log(`❌ ${c.name}: Threw Error - ${err}`);
    }
  }
}

testExtraction();

/**
 * Initra — AI JSON Extractor
 * Robustly parses JSON from LLM responses even if wrapped in markdown or filler text.
 */

export function parseAIJSON<T>(input: string): T {
  let cleaned = input.trim();

  // 1. Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  const match = markdownRegex.exec(cleaned);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // 2. Identify the core JSON block by finding the first { and last }
  // This handles cases where the model adds conversational text before or after the JSON.
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("Failed to parse cleaned JSON:", cleaned);
    console.error("Original input:", input);
    throw new Error("AI generated invalid JSON format for the blueprint payload.");
  }
}

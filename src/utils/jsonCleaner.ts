export function cleanAndParseJSON(rawResponse: string): any {
  let clean = rawResponse.trim();
  
  // 0. Strip <think>...</think> blocks from DeepSeek R1 reasoning models
  clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 1. Strip Markdown code blocks if they exist (```json ... ``` or ``` ... ```)
  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = clean.match(markdownRegex);
  if (match && match[1]) {
    clean = match[1].trim();
  }
  
  // 2. Isolate the absolute outermost JSON boundaries (to strip trailing chatter)
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  const firstBracket = clean.indexOf('[');
  const lastBracket = clean.lastIndexOf(']');
  
  let startIndex = -1;
  let endIndex = -1;
  
  // Determine if output is an Object or an Array and isolate it
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    startIndex = firstBracket;
    endIndex = lastBracket;
  } else if (firstBrace !== -1) {
    startIndex = firstBrace;
    endIndex = lastBrace;
  }
  
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    clean = clean.substring(startIndex, endIndex + 1);
  }
  
  // 3. Remove trailing commas within JSON structures which break strict JSON.parse
  clean = clean.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(clean);
  } catch (parseError: any) {
    console.error("[JSON Cleansing Engine] Strict JSON parse failed. Raw content was:", rawResponse);
    throw new Error(`JSON parsing failed: ${parseError.message}`);
  }
}

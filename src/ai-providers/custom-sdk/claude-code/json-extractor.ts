/**
 * Extract JSON from Claude's response, handling markdown blocks and other formatting
 */

export function extractJson(text: string): string {
  let jsonText = text.trim()

  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/^```json\s*/gm, '')
  jsonText = jsonText.replace(/^```\s*/gm, '')
  jsonText = jsonText.replace(/```\s*$/gm, '')

  // Remove common TypeScript/JavaScript patterns
  jsonText = jsonText.replace(/^const\s+\w+\s*=\s*/, '') // Remove "const varName = "
  jsonText = jsonText.replace(/^let\s+\w+\s*=\s*/, '') // Remove "let varName = "
  jsonText = jsonText.replace(/^var\s+\w+\s*=\s*/, '') // Remove "var varName = "
  jsonText = jsonText.replace(/;?\s*$/, '') // Remove trailing semicolons

  // Try to extract JSON object or array
  const objectMatch = jsonText.match(/{[\s\S]*}/)
  const arrayMatch = jsonText.match(/\[[\s\S]*\]/)

  if (objectMatch) {
    jsonText = objectMatch[0]
  } else if (arrayMatch) {
    jsonText = arrayMatch[0]
  }

  // First try to parse as valid JSON
  try {
    JSON.parse(jsonText)
    return jsonText
  } catch {
    // If it's not valid JSON, try to fix common issues
    try {
      const converted = fixJsonFormatting(jsonText)
      JSON.parse(converted)
      return converted
    } catch {
      throw new Error(`Could not extract valid JSON from: ${text.substring(0, 200)}...`)
    }
  }
}

export function fixJsonFormatting(jsonString: string): string {
  let fixed = jsonString.trim()

  // Fix trailing commas
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  // Fix missing quotes around keys
  fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

  // Fix single quotes to double quotes
  fixed = fixed.replace(/'/g, '"')

  // Fix unquoted string values (basic case)
  fixed = fixed.replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$\s]*)\s*([,}])/g, (match, value, ending) => {
    // Don't quote if it looks like a number, boolean, or null
    if (/^(true|false|null|\d+(\.\d+)?)$/.test(value.trim())) {
      return `: ${value.trim()}${ending}`
    }
    return `: "${value.trim()}"${ending}`
  })

  return fixed
}
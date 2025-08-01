/**
 * Extract JSON from Claude's response, handling markdown blocks and other formatting
 */
export declare function extractJson(text: string): string;
export declare function fixJsonFormatting(jsonString: string): string;

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { PriorityLevel } from "@/lib/generated/prisma";

const responseSchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  urgencyScore: z.number().min(0).max(100),
  reasoning: z.string().optional(),
});

const modelName = "gemini-1.5-flash";

function hasGeminiKey() {
  return Boolean(process.env.GOOGLE_API_KEY);
}

async function fetchImageAsBase64(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  return buffer.toString("base64");
}

export async function classifyIssueFromImages(params: {
  description: string;
  imageUrls: string[];
}): Promise<{ priority: PriorityLevel; urgencyScore: number } | null> {
  if (!hasGeminiKey()) {
    console.log('[Gemini AI] No API key available');
    return null;
  }

  const { description, imageUrls } = params;
  
  try {
    const images = imageUrls.slice(0, 3);
    const imageParts = await Promise.all(
      images.map(async (url) => {
        try {
          const base64 = await fetchImageAsBase64(url);
          return {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64,
            },
          };
        } catch (error) {
          console.error('[Gemini AI] Failed to fetch image:', url, error);
          return null;
        }
      }),
    );

    const validImageParts = imageParts.filter(Boolean);
    
    if (validImageParts.length === 0) {
      console.warn('[Gemini AI] No valid images to analyze');
      return null;
    }

    const result = await assessIssueWithAI(description, validImageParts);
    return result;
  } catch (error) {
    console.error('[Gemini AI] Classification failed:', error);
    if (error instanceof z.ZodError) {
      console.error('[Gemini AI] Validation error details:', error.issues);
    }
    return null;
  }
}

/**
 * Internal function to send assessment to Gemini
 */
async function assessIssueWithAI(
  description: string,
  imageParts: unknown[]
): Promise<{ priority: PriorityLevel; urgencyScore: number } | null> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `You are a campus maintenance priority and urgency assessment expert. Analyze the campus cleanliness issue image(s) provided and provide BOTH priority level AND an urgency score.

TASK: Return ONLY a JSON assessment. Nothing else. No explanation, no markdown, no code blocks.

USER DESCRIPTION: "${description}"

PRIORITY LEVELS:
1. CRITICAL - Immediate health/safety hazard: sewage backup, biohazards, blood, major structural damage, flooding, broken glass creating injury risk
2. HIGH - Significant hygiene problem affecting campus operations: overflowing toilets, strong foul odors, visible pest damage, large spills not cleaned, trash explosion
3. MEDIUM - Noticeable cleanliness issue needing attention: moderate dirt, scattered trash, dust buildup, mild stains, minor spills
4. LOW - Minor cosmetic issue: small dust spot, light stain, minimal litter, aesthetic only - no health risk

URGENCY SCORE (0-100):
- 90-100: Critical immediate hazard requiring action within 2 hours
- 70-89: High priority requiring action within 12 hours
- 40-69: Medium priority requiring action within 24-48 hours
- 0-39: Low priority, aesthetic issue that can wait 3+ days

ASSESSMENT RULES:
- Look at the actual image content, not just the description
- If images show water damage, sewage, biohazards → CRITICAL (score 90+)
- If images show overflowing bins, strong visible odors, pests → HIGH (score 70-85)
- If images show moderate dirt, dust, scattered trash → MEDIUM (score 40-65)
- If images show only minor stains/dust → LOW (score 0-35)
- Be conservative: minor issues are LOW/MEDIUM, not HIGH
- Vary the score within each priority band based on severity
- Use the full range of scores

Return ONLY this JSON format (valid JSON, parseable):
{"priority": "CRITICAL", "urgencyScore": 95}

Replace CRITICAL with the correct priority level and set urgencyScore to an appropriate value between 0-100.`;

  console.log('[Gemini AI] Sending request with', imageParts.length, 'images');
  console.log('[Gemini AI] Description:', description);

  const result = await model.generateContent([prompt, ...imageParts]);
  const responseText = result.response.text();

  console.log('[Gemini AI] Raw response:', responseText.substring(0, 250));

  // Parse response more carefully
  let cleanedText = responseText.trim();
  
  // Remove markdown code blocks
  cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/i, '');
  cleanedText = cleanedText.replace(/\n?```\s*$/i, '');
  
  // Look for JSON object pattern - match both priority and urgencyScore in any order
  const jsonMatch = cleanedText.match(/\{[^{}]*"priority"[^{}]*"urgencyScore"[^{}]*\}|\{[^{}]*"urgencyScore"[^{}]*"priority"[^{}]*\}/);
  if (!jsonMatch) {
    console.error('[Gemini AI] Could not find JSON object with both priority and urgencyScore in response:', cleanedText);
    return null;
  }

  const jsonStr = jsonMatch[0];
  console.log('[Gemini AI] Extracted JSON:', jsonStr);

  const parsed = JSON.parse(jsonStr);
  const validated = responseSchema.parse(parsed);
  
  console.log('[Gemini AI] Successfully classified:', { 
    priority: validated.priority,
    urgencyScore: validated.urgencyScore 
  });
  return { 
    priority: validated.priority as PriorityLevel,
    urgencyScore: validated.urgencyScore
  };
}

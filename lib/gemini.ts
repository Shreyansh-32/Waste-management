import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { PriorityLevel } from "@/lib/generated/prisma";

const responseSchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
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
}): Promise<{ priority: PriorityLevel } | null> {
  if (!hasGeminiKey()) {
    return null;
  }

  const { description, imageUrls } = params;
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: modelName });

  const images = imageUrls.slice(0, 3);
  const imageParts = await Promise.all(
    images.map(async (url) => ({
      inlineData: {
        mimeType: "image/jpeg",
        data: await fetchImageAsBase64(url),
      },
    })),
  );

  const prompt = `Analyze the provided images and description of a campus cleanliness issue. Determine the appropriate priority level based on severity.

Priority Levels (be specific and vary based on actual severity):
- LOW: Minor aesthetic issues like small spots, light dust, minor clutter. No impact on health or usability.
- MEDIUM: Noticeable cleanliness issues like moderate dirt, trash accumulation, minor spills. Should be cleaned but not urgent.
- HIGH: Significant hygiene problems like large spills, overflowing bins, foul odors, pest presence. Affects usability and comfort.
- CRITICAL: Severe health/safety hazards like sewage, biohazards, major leaks, broken glass, structural damage. Requires immediate attention.

Be realistic - not everything is HIGH or CRITICAL. Use LOW and MEDIUM frequently for minor issues.

Description: ${description}

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{"priority": "LOW"}

Replace LOW with the appropriate level: LOW, MEDIUM, HIGH, or CRITICAL.`;

  const result = await model.generateContent([prompt, ...imageParts]);
  let text = result.response.text().trim();

  // Remove markdown code blocks if present
  text = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

  try {
    const parsed = responseSchema.parse(JSON.parse(text));
    console.log('[Gemini AI] Successfully classified issue:', parsed);
    return parsed;
  } catch (error) {
    console.error('[Gemini AI] Failed to parse response:', text, error);
    return null;
  }
}

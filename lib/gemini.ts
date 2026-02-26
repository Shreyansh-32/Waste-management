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

  const prompt = `You are analyzing campus cleanliness issues to determine their priority level.\n\nReturn ONLY valid JSON with key: priority.\n\nAllowed priority values:\n- LOW: Minor cosmetic issues, no health/safety concerns\n- MEDIUM: Noticeable cleanliness issues, should be addressed soon\n- HIGH: Significant cleanliness/hygiene issues, affects usability\n- CRITICAL: Severe health/safety hazards, requires immediate attention\n\nDescription: ${description}`;

  const result = await model.generateContent([prompt, ...imageParts]);
  const text = result.response.text().trim();

  try {
    const parsed = responseSchema.parse(JSON.parse(text));
    return parsed;
  } catch {
    return null;
  }
}

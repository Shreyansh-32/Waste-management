import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { IssueCategory, PriorityLevel } from "@/lib/generated/prisma";

const responseSchema = z.object({
  category: z.enum([
    "WASHROOM",
    "CLASSROOM",
    "HOSTEL",
    "CANTEEN",
    "CORRIDOR",
    "LAB",
    "OUTDOOR",
    "OTHER",
  ]),
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
}): Promise<{ category: IssueCategory; priority: PriorityLevel } | null> {
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

  const prompt = `You are classifying campus cleanliness issues.\n\nReturn ONLY valid JSON with keys: category, priority.\n\nAllowed category values: WASHROOM, CLASSROOM, HOSTEL, CANTEEN, CORRIDOR, LAB, OUTDOOR, OTHER\nAllowed priority values: LOW, MEDIUM, HIGH, CRITICAL\n\nDescription: ${description}`;

  const result = await model.generateContent([prompt, ...imageParts]);
  const text = result.response.text().trim();

  try {
    const parsed = responseSchema.parse(JSON.parse(text));
    return parsed;
  } catch {
    return null;
  }
}

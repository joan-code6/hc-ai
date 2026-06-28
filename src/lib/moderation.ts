import { env } from "../env";

export type ModerationCategory =
  | "sexual"
  | "sexual/minors"
  | "violence"
  | "violence/graphic"
  | "harassment"
  | "harassment/threatening"
  | "hate"
  | "hate/threatening"
  | "self-harm"
  | "self-harm/intent"
  | "self-harm/instructions"
  | "illegal"
  | "drugs"
  | "illicit_drugs";

export interface ModerationResult {
  flagged: boolean;
  categories: Record<ModerationCategory, boolean>;
  categoryScores?: Record<ModerationCategory, number>;
  skipped?: boolean;
}

interface ModerationResponse {
  results: {
    flagged: boolean;
    categories: Record<ModerationCategory, boolean>;
    category_scores: Record<ModerationCategory, number>;
  }[];
}

export async function trigger_review(
  content: string[],
  options?: { allowSkip?: boolean },
): Promise<ModerationResult> {
  // Prefer a moderation-specific API key/url when provided, fallback to
  // the general OpenAI API key. If neither is set, skip moderation.
  const modKey = env.OPENAI_MODERATION_API_KEY || env.OPENAI_API_KEY;
  const modUrl =
    env.OPENAI_MODERATION_API_URL || "https://api.openai.com/v1/moderations";
  const allowSkip = options?.allowSkip ?? true;

  if (!modKey) {
    if (allowSkip) {
      console.warn(
        "Moderation API key is not set. Skipping content moderation.",
      );
      return {
        flagged: false,
        categories: {} as Record<ModerationCategory, boolean>,
        skipped: true,
      };
    }
    throw new Error("Moderation API key is not configured");
  }

  const request = await fetch(modUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${modKey}`,
    },
    body: JSON.stringify({ input: content }),
  });

  if (!request.ok) {
    const text = await request.text().catch(() => "");
    throw new Error(
      `Moderation API error: ${request.status} ${request.statusText} ${text}`,
    );
  }

  try {
    const result = (await request.json()) as ModerationResponse;

    let flagged = false;
    const categories: Record<ModerationCategory, boolean> = {} as Record<
      ModerationCategory,
      boolean
    >;
    const categoryScores: Record<ModerationCategory, number> = {} as Record<
      ModerationCategory,
      number
    >;

    for (const item of result.results) {
      if (item.flagged) {
        flagged = true;
      }

      // Dynamically collect all categories from API response
      for (const cat of Object.keys(item.categories) as ModerationCategory[]) {
        categories[cat] = categories[cat] || false || item.categories[cat];
        categoryScores[cat] = Math.max(
          categoryScores[cat] || 0,
          item.category_scores[cat] || 0,
        );
      }
    }

    if (flagged) {
      console.warn("Content flagged:", categories);
    }

    return { flagged, categories, categoryScores };
  } catch (error) {
    console.error("Error occurred while parsing moderation results:", error);
    throw error;
  }
}

export function getFlaggedCategories(
  result: ModerationResult,
): ModerationCategory[] {
  return Object.keys(result.categories).filter(
    (cat) => result.categories[cat as ModerationCategory],
  ) as ModerationCategory[];
}

import type { ModerationCategory, ModerationResult } from "./moderation";

// Simple keyword-based pre-filter for common categories.
// This is NOT a substitute for a proper moderation API, but catches
// obvious violations instantly without network latency.

const keywordMap: Record<ModerationCategory, RegExp[]> = {
  sexual: [
    /\b(porn|pornography|nude|naked|sexual|explicit|nsfw|xxx|onlyfans)\b/i,
  ],
  "sexual/minors": [
    /\b(child porn|csam|pedo|pedophile|underage nude|minor nude)\b/i,
  ],
  violence: [
    /\b(kill|murder|assassinate|bomb|terrorist|massacre|genocide)\b/i,
  ],
  "violence/graphic": [
    /\b(gore|dismember|torture|mutilate|behead|execution video)\b/i,
  ],
  harassment: [
    /\b(dox|doxx|swatting|stalk|harass|cyberbully|revenge porn)\b/i,
  ],
  "harassment/threatening": [
    /\b(kill yourself|kys|swat|i will kill|death threat|rape threat)\b/i,
  ],
  hate: [
    /\b(nazi|hitler|holocaust|kkk|white supremacist|ethnic cleansing)\b/i,
  ],
  "hate/threatening": [
    /\b(lynch|gas the|race war|kill all .* jews|kill all .* muslims)\b/i,
  ],
  "self-harm": [
    /\b(suicide|self.?harm|cutting|overdose| hanging myself|jump off)\b/i,
  ],
  "self-harm/intent": [
    /\b(i want to die|i will kill myself|planning suicide|goodbye world)\b/i,
  ],
  "self-harm/instructions": [
    /\b(how to (kill myself|commit suicide|overdose|tie a noose))\b/i,
  ],
  illegal: [
    /\b(buy drugs online|hire a hitman|counterfeit money|stolen credit card)\b/i,
  ],
  drugs: [
    /\b(cocaine|heroin|meth|fentanyl|buy weed|drug dealer)\b/i,
  ],
  illicit_drugs: [
    /\b(methamphetamine|synthetic opioids|drug manufacturing)\b/i,
  ],
};

export function localModerationCheck(content: string[]): ModerationResult {
  const categories: Record<ModerationCategory, boolean> = {} as Record<
    ModerationCategory,
    boolean
  >;
  let flagged = false;

  for (const cat of Object.keys(keywordMap) as ModerationCategory[]) {
    const patterns = keywordMap[cat];
    const matched = patterns.some((re) =>
      content.some((text) => re.test(text)),
    );
    categories[cat] = matched;
    if (matched) flagged = true;
  }

  return { flagged, categories };
}

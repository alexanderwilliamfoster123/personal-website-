import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { TradeIdea } from "./types.js";

// IMPORTANT (compliance): ideas are generated once per cycle and served
// identically to every user. Nothing here may take user-specific input —
// that is what keeps the feed "non-personalized publishing" rather than
// personal investment advice. Do not add per-user parameters to this module.

const client = new Anthropic();

const IdeaSchema = z.object({
  ideas: z
    .array(
      z.object({
        pair: z.string(),
        direction: z.enum(["long", "short"]),
        timeframe: z.string(),
        thesis: z.string(),
        entryZone: z.string(),
        invalidation: z.string(),
        target: z.string(),
        riskNote: z.string(),
      }),
    )
    .min(1),
});

const IDEA_MODELS: { name: string; prompt: string }[] = [
  {
    name: "technical-ai",
    prompt:
      "You are a technical analyst writing market commentary on major FX pairs. " +
      "Focus on price structure: support/resistance, trend, momentum divergence, breakouts.",
  },
  {
    name: "macro-ai",
    prompt:
      "You are a macro strategist writing market commentary on major FX pairs. " +
      "Focus on central bank policy divergence, rate expectations, and risk sentiment.",
  },
];

const OUTPUT_INSTRUCTIONS = `Generate 5 trade ideas as market commentary. Rules:
- Write analysis, not instructions: "EUR/USD is testing resistance at 1.0920; a rejection would open 1.0840" — never "you should buy/sell" and never position sizing.
- Every idea must include the level at which the thesis is invalidated.
- riskNote must be a genuine one-sentence caution specific to the idea (upcoming data, thin liquidity, etc.).
- These ideas are published identically to all readers; do not reference any individual reader.
Respond with JSON only, matching: {"ideas":[{"pair","direction","timeframe","thesis","entryZone","invalidation","target","riskNote"}]}`;

let cache: { ideas: TradeIdea[]; expiresAt: number } = { ideas: [], expiresAt: 0 };
const CACHE_MS = 60 * 60 * 1000; // regenerate hourly; everyone sees the same feed

async function generateForModel(model: { name: string; prompt: string }): Promise<TradeIdea[]> {
  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: model.prompt,
    messages: [{ role: "user", content: OUTPUT_INSTRUCTIONS }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const jsonStart = text.indexOf("{");
  const parsed = IdeaSchema.parse(JSON.parse(text.slice(jsonStart)));

  const now = new Date().toISOString();
  return parsed.ideas.map((i) => ({
    id: randomUUID(),
    model: model.name,
    pair: i.pair,
    direction: i.direction,
    timeframe: i.timeframe,
    thesis: i.thesis,
    keyLevels: { entryZone: i.entryZone, invalidation: i.invalidation, target: i.target },
    riskNote: i.riskNote,
    generatedAt: now,
  }));
}

export async function getIdeas(): Promise<TradeIdea[]> {
  if (Date.now() < cache.expiresAt && cache.ideas.length > 0) return cache.ideas;
  const results = await Promise.all(IDEA_MODELS.map(generateForModel));
  cache = { ideas: results.flat(), expiresAt: Date.now() + CACHE_MS };
  return cache.ideas;
}

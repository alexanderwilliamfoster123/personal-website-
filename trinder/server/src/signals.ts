import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { TradeIdea } from "./types.js";

// IMPORTANT (compliance): ideas are generated once per cycle and served
// identically to every user. Nothing here may take user-specific input —
// that is what keeps the feed "non-personalized publishing" rather than
// personal investment advice. Do not add per-user parameters to this module.

let client: Anthropic | null = null;
function getClient(): Anthropic {
  return (client ??= new Anthropic());
}

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

// Demo feed used when no ANTHROPIC_API_KEY is configured, so the app can be
// run and reviewed end-to-end without live generation.
const DEMO_IDEAS: Omit<TradeIdea, "id" | "generatedAt">[] = [
  {
    model: "technical-ai",
    pair: "EUR/USD",
    direction: "long",
    timeframe: "4H",
    thesis:
      "Price is retesting the broken descending trendline from the March high as support, with bullish RSI divergence on the 4H. Holding above 1.0840 keeps the recovery structure intact and opens the 1.0920 supply zone.",
    keyLevels: { entryZone: "1.0840–1.0860", invalidation: "Below 1.0800", target: "1.0920" },
    riskNote: "US CPI prints tomorrow — expect volatility around the release.",
  },
  {
    model: "macro-ai",
    pair: "GBP/JPY",
    direction: "short",
    timeframe: "1D",
    thesis:
      "Widening expectations of a BoJ hike against a dovish repricing of the BoE puts rate differentials behind the yen. The pair is stalling at multi-month resistance while risk sentiment softens.",
    keyLevels: { entryZone: "192.50–193.20", invalidation: "Daily close above 194.00", target: "189.80" },
    riskNote: "Carry unwind moves in JPY crosses can be violent in both directions.",
  },
  {
    model: "technical-ai",
    pair: "USD/CAD",
    direction: "short",
    timeframe: "4H",
    thesis:
      "A double top has formed at 1.3780 with a neckline at 1.3690. Momentum has rolled over and oil strength supports CAD; a neckline break would confirm the pattern and target the measured move.",
    keyLevels: { entryZone: "1.3690 break", invalidation: "Above 1.3785", target: "1.3600" },
    riskNote: "Pattern is unconfirmed until the neckline breaks — watch for a fakeout.",
  },
  {
    model: "macro-ai",
    pair: "AUD/USD",
    direction: "long",
    timeframe: "1D",
    thesis:
      "Hot Australian inflation keeps the RBA hawkish while Chinese stimulus headlines support commodity currencies. The pair is basing above 0.6550 after a three-week decline.",
    keyLevels: { entryZone: "0.6550–0.6580", invalidation: "Below 0.6500", target: "0.6700" },
    riskNote: "Sensitive to China data — weak numbers this week would undercut the thesis.",
  },
];

function demoFeed(): TradeIdea[] {
  const now = new Date().toISOString();
  return DEMO_IDEAS.map((i) => ({ ...i, id: randomUUID(), generatedAt: now }));
}

async function generateForModel(model: { name: string; prompt: string }): Promise<TradeIdea[]> {
  const response = await getClient().messages.create({
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
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
    const results = await Promise.all(IDEA_MODELS.map(generateForModel));
    cache = { ideas: results.flat(), expiresAt: Date.now() + CACHE_MS };
  } catch (err) {
    console.warn("live generation unavailable — serving demo feed:", (err as Error).message);
    cache = { ideas: demoFeed(), expiresAt: Date.now() + CACHE_MS };
  }
  return cache.ideas;
}

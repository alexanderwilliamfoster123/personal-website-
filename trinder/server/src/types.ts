export type Direction = "long" | "short";

export interface TradeIdea {
  id: string;
  model: string; // which idea engine produced it, e.g. "macro-ai", "technical-ai"
  pair: string; // e.g. "EUR/USD"
  direction: Direction;
  timeframe: string; // e.g. "4H"
  thesis: string; // the analysis, written as commentary, not an instruction
  keyLevels: {
    entryZone: string;
    invalidation: string; // where the idea is wrong (framed as analysis, not a stop order)
    target: string;
  };
  riskNote: string;
  generatedAt: string; // ISO timestamp
}

export interface Broker {
  id: string;
  name: string;
  affiliateUrl: string; // your CPA/IB tracking link
  regulator: string;
  cpaNote: string;
}

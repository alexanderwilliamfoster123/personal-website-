export const API_BASE = "http://localhost:4000"; // point at your deployed server

export type Direction = "long" | "short";

export interface TradeIdea {
  id: string;
  model: string;
  pair: string;
  direction: Direction;
  timeframe: string;
  thesis: string;
  keyLevels: { entryZone: string; invalidation: string; target: string };
  riskNote: string;
  generatedAt: string;
}

export interface IdeasResponse {
  disclaimer: string;
  ideas: TradeIdea[];
}

export interface Broker {
  id: string;
  name: string;
  regulator: string;
  cpaNote: string;
}

export async function fetchIdeas(): Promise<IdeasResponse> {
  const res = await fetch(`${API_BASE}/ideas`);
  if (!res.ok) throw new Error(`ideas request failed: ${res.status}`);
  return res.json();
}

export async function fetchBrokers(): Promise<Broker[]> {
  const res = await fetch(`${API_BASE}/brokers`);
  if (!res.ok) throw new Error(`brokers request failed: ${res.status}`);
  const body = (await res.json()) as { brokers: Broker[] };
  return body.brokers;
}

// The affiliate link for "Trade this idea with a broker" — opens in the
// browser so the signup and any trading happen entirely on the broker's side.
export function brokerLink(brokerId: string, ideaId: string): string {
  return `${API_BASE}/go/${brokerId}?idea=${encodeURIComponent(ideaId)}`;
}

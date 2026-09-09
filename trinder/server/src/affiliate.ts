import { appendFile } from "node:fs/promises";
import type { Broker } from "./types.js";

// Replace affiliateUrl values with your real CPA/IB tracking links once your
// partner accounts are approved. The click log is what you reconcile against
// the broker's reported signups.
export const BROKERS: Broker[] = [
  {
    id: "icmarkets",
    name: "IC Markets",
    affiliateUrl: "https://www.icmarkets.com/?camp=REPLACE_WITH_YOUR_ID",
    regulator: "ASIC/CySEC",
    cpaNote: "CPA + rev-share via IB program",
  },
  {
    id: "pepperstone",
    name: "Pepperstone",
    affiliateUrl: "https://pepperstone.com/?a_aid=REPLACE_WITH_YOUR_ID",
    regulator: "FCA/ASIC",
    cpaNote: "CPA via partner program",
  },
];

const CLICK_LOG = new URL("../clicks.log.jsonl", import.meta.url);

export function getBroker(id: string): Broker | undefined {
  return BROKERS.find((b) => b.id === id);
}

// Append-only click log: swap for a database table before real traffic.
export async function logClick(brokerId: string, ideaId: string | undefined) {
  const entry = { brokerId, ideaId: ideaId ?? null, at: new Date().toISOString() };
  await appendFile(CLICK_LOG, JSON.stringify(entry) + "\n");
}

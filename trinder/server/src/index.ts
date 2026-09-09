import express from "express";
import { getIdeas } from "./signals.js";
import { BROKERS, getBroker, logClick } from "./affiliate.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

export const RISK_DISCLAIMER =
  "Trade ideas are AI-generated market commentary for educational purposes only and are not investment advice. " +
  "They are published identically to all users and are not personalized. " +
  "CFDs and FX are high-risk leveraged products; the majority of retail accounts lose money. " +
  "You alone decide whether to place any trade. Past ideas are not indicative of future results.";

// GET /ideas — the same generic feed for every user (never personalize this).
app.get("/ideas", async (_req, res) => {
  try {
    const ideas = await getIdeas();
    res.json({ disclaimer: RISK_DISCLAIMER, ideas });
  } catch (err) {
    console.error("idea generation failed", err);
    res.status(503).json({ error: "ideas temporarily unavailable" });
  }
});

// GET /brokers — list of partner brokers shown in the app.
app.get("/brokers", (_req, res) => {
  res.json({ brokers: BROKERS.map(({ affiliateUrl, ...rest }) => rest) });
});

// GET /go/:brokerId?idea=<ideaId> — logs the click, then 302s to the CPA link.
app.get("/go/:brokerId", async (req, res) => {
  const broker = getBroker(req.params.brokerId);
  if (!broker) return res.status(404).json({ error: "unknown broker" });
  const idea = typeof req.query.idea === "string" ? req.query.idea : undefined;
  await logClick(broker.id, idea).catch((e) => console.error("click log failed", e));
  res.redirect(302, broker.affiliateUrl);
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`trinder server listening on :${PORT}`));

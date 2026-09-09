# Trinder — swipe on trade ideas

Tinder-style feed of AI-generated FX trade ideas. Swipe right to open a partner
broker (CPA affiliate link); swipe left to pass. The user takes every trade
themselves on the broker's platform — the app never executes orders.

## Structure

- `server/` — Express API. Generates a **non-personalized** idea feed via the
  Claude API (two "models": `technical-ai` and `macro-ai`), cached hourly so
  every user sees the identical feed. Also serves broker affiliate redirects
  with click logging (`clicks.log.jsonl`) for CPA reconciliation.
- `app/` — Expo (React Native) app. Swipe deck built with core `PanResponder` /
  `Animated` only — no extra native modules.

## Run

```bash
# server (needs ANTHROPIC_API_KEY in the environment)
cd server && npm install && npm run dev

# app (in another terminal; iOS simulator or Expo Go)
cd app && npm install && npm start
```

The app points at `http://localhost:4000` (`app/src/api.ts` → `API_BASE`).

Without `ANTHROPIC_API_KEY` (or if generation fails) the server serves a static
demo feed, so the full swipe → save → broker flow can be tried end-to-end with
no credentials.

## App flow

1. Disclaimer gate on every launch — user must acknowledge before seeing ideas.
2. Swipe deck: left = pass, right = save the idea and open the broker sheet.
3. Broker sheet: pick a partner broker (opens the tracked affiliate link in the
   browser — signup and all trading happen on the broker's platform) or just
   save the idea.
4. Saved tab: list of right-swiped ideas.

## Before launch — do these

1. Replace the placeholder affiliate URLs in `server/src/affiliate.ts` with your
   real partner-program tracking links.
2. Swap the JSONL click log for a database table.
3. Get a regulatory opinion for your target markets. The compliance posture this
   codebase is built around:
   - the feed is **identical for every user** (no personalization — keep it
     that way; see the warning in `server/src/signals.ts`),
   - ideas are written as market commentary with invalidation levels, never as
     instructions or with position sizing,
   - the risk disclaimer is served with every feed response and shown in-app,
   - the user makes an affirmative decision on every trade, on the broker's own
     platform.
4. Geo-block the US (and any market you don't have coverage for) before
   marketing.
5. App Store: expect Apple to ask for your business entity + broker partnership
   documentation under guideline 3.1.5.

## Later versions

- v2: read-only MT4/MT5 account linking via MetaApi (show P&L on swiped ideas).
- v3: model marketplace, premium tier (Apple IAP), rev-share broker deals.
- Do **not** add auto-execution without legal sign-off — that crosses into
  regulated portfolio-management territory.

# Personal site: working preview

This branch contains the current working-preview source, including the updated mobile scrolling and smaller layout. The repository's `main` branch contains the older Next.js site. Review the runtime differences before merging this branch into a domain-connected deployment.

Working site: https://alexander-foster-workshop.alexwfoster.chatgpt.site

## Run locally

- Use Node 22.13 or newer and the package-manager version specified in `package.json`.
- Install with `pnpm install --frozen-lockfile`, then run `pnpm dev` (port 5173).
- `pnpm exec tsc --noEmit --incremental false` checks types; `pnpm build` builds the site.
- This preview uses Vinext for the React / Next.js App Router source and Cloudflare D1 for email capture. The build scripts select the portable runtime outside the managed Sites workspace. Keep the pnpm lockfile.
- The project's existing `.openai/hosting.json` identifies the working Site. It is not a GitHub deployment configuration. Pushing to this GitHub branch does not update the Site or alexanderfoster.com.

## Mobile scroll implementation

- `components/circular-company-scroll.tsx`: the original full circular wheel on every screen size, original entrance and scrub easing, native CSS sticky positioning, no JavaScript pin spacers or synthetic touch scrolling. The briefly introduced tight arc was reverted.
- `app/globals.css`: original desktop geometry, proportional mobile scaling, stable viewport height, safe-area spacing, and `overflow-x: clip` so an ancestor does not break sticky positioning.
- `components/panels/companies-panel.tsx`: switches to the native carousel only when the visitor requests reduced motion. Preserves company article navigation and the saved scroll position.
- Founded order: 01 Vertus, 02 Vanquish, 03 Alexander William. Invested: 01 Omera, stationary.

## Verification still needed on devices

TypeScript and production builds are checked before publication. Browser QA was unavailable in the editing session, so the change is not certified as visually identical on physical phones. Check Safari and Chrome in portrait and landscape: scroll forward/back through all three cards, fling/reverse, collapse browser chrome, open an article and return, change tabs, toggle light/dark, and enable reduced motion. Confirm there is no horizontal page scrolling and the dock remains reachable.

## Existing integration gaps

- `CONTACT_TO_EMAIL` is configured on the working Site as `contact@alexanderfoster.com`.
- Email capture and email sending are separate. Actual sending still requires a server-only `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`. Neither sending value was configured in this session. Do not report delivery as active until a real test arrives.
- Resend acknowledgement is only reported when the provider returns a message ID. Failed sends retain the draft and reuse an idempotency key for unchanged retries.
- The requested company hero videos / 3D media have not been supplied. Existing article covers remain in place.
- No credentials, captured email records, local preferences, dependency folders, or generated build output belong in the repository.

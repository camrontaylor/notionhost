---
name: notionhost-build-planning
overview: Plan for building NotionHost inside Cursor, filling PRD gaps, aligning stack choices with generous free tiers, and structuring work into Cursor-friendly phases and prompts.
todos:
  - id: clarify-service-providers
    content: Confirm initial choices for Postgres provider (Supabase or Neon), plus whether to target Cloudflare R2 immediately or start with a simpler S3-compatible option.
    status: pending
  - id: finalize-fetcher-architecture
    content: Lock in the initial production approach for Notion fetching (direct Playwright in Vercel vs. queued worker) while keeping the fetcher interface abstract.
    status: pending
  - id: execute-phase-0
    content: Set up the Next.js 15 project, TypeScript, Tailwind, Drizzle, Cursor rules, and environment templates as described, until pnpm dev runs cleanly.
    status: pending
  - id: implement-auth-and-dashboard-shell
    content: Complete Phases 1 and 2 so authenticated users reach a stable dashboard layout.
    status: pending
  - id: build-notion-parser-and-renderers
    content: Implement and thoroughly test the Notion HTML fetcher, parser, and block rendering components (Phases 4 and 5).
    status: pending
  - id: wire-caching-and-public-site-routing
    content: Implement caching layers, site/page management, and public username-based routing, hitting performance and SEO targets.
    status: pending
  - id: add-billing-refresh-analytics-domains
    content: Layer in Stripe billing, scheduled refresh, analytics, and custom domains once the core product works on free tiers.
    status: pending
isProject: false
---

# NotionHost Build Plan

## Scope and constraints

- **Scope**: Follow PRD Phases 0–14, but prioritize anything required before paid tiers. Delay or guard high-volume features that risk exceeding free limits (heavy analytics, very frequent refresh) until usage data exists.
- **Budget constraint**: Prefer generous free tiers for hosting and third-party services. Design abstractions so a future paid upgrade does not require deep refactors.
- **Runtime constraint**: Treat "Playwright-like" fetching as an abstraction. For development and tests use Cursor-friendly tools (Playwright MCP). For production build a fetcher interface that supports a headless browser worker behind a queue.

## Service choices (free-tier friendly)

- **Hosting**: Vercel Hobby for the Next.js app. Accept personal/non-commercial constraints during early development and pre-revenue launch.
- **Database**: Start with a single hosted Postgres instance (Supabase or Neon) on free tier. Keep Drizzle schema portable to either. Use environment variable to switch provider.
- **Cache**: Upstash Redis free tier for low-volume production and staging. Design cache keys and eviction so degradation falls back to Postgres cleanly.
- **Email**: Resend free tier for low-volume transactional email (login links, billing notices). Add hard guardrails on email frequency and background retries.
- **Payments**: Stripe standard SaaS usage with no platform monthly fee. Use test mode until you are ready for live payments.
- **Object storage and CDN**: Cloudflare R2 + Cloudflare CDN free tiers for images. Start with one bucket and a single public image domain.
- **Monitoring**: Sentry and Vercel Analytics free tiers for basic error and performance visibility.

## Architectural clarifications and decisions

- **Playwright / fetcher architecture**:
  - Define an interface in `src/lib/notion/fetcher.ts` that hides the concrete runtime (Node Playwright, remote worker, or alternative).
  - For early development run real Playwright in a local dev command and behind a simple serverless function for low-volume use.
  - Plan a second step where Notion fetch requests enqueue jobs into a queue (QStash or simple Postgres-based queue) that a long-lived worker drains.
- **Background work strategy**:
  - Use Vercel Cron for low-frequency periodic work (refresh pages, prune analytics) while volumes remain small.
  - Model heavy work as discrete jobs that the API inserts into a queue table. Workers pop jobs with row-level locks to avoid concurrency bugs.
- **Multi-tenant routing**:
  - Enforce `user_id` and `site_id` scoping in every query. Add indexes for `(user_id, slug)` and `(site_id, page_slug)`.
  - Middleware decides between `dashboard`, public `username` routes, and custom domains. Route custom domains via a lookup table and cache results in Redis.
- **Notion HTML fragility**:
  - Snapshot several real Notion pages and store sanitized HTML fixtures in tests.
  - Build the parser around structural selectors (`data-block-id`, stable container roles) and keep all CSS class heuristics local to a single module.

## Gaps and decisions to resolve during implementation

- **User and site UX**:
  - Decide copy, tone, and minimal visual identity for landing page and dashboard (colors, logo, spacing scale beyond the typography already defined).
  - Specify exact empty states and error messages for each dashboard surface (no sites, no pages, failed parse, broken custom domain).
  - Define how strict username changes should be (one time only vs. multiple times with cooldown).
- **Security and privacy**:
  - Decide whether email addresses require explicit verification before dashboard access when using magic links.
  - Decide retention rules beyond analytics (for example, log retention, soft delete vs. hard delete of sites and pages).
  - Pick rate-limiting thresholds for login, signups, and Notion refresh endpoints.
- **SEO and content rules**:
  - Finalize rules for canonical URLs when a page has both a username route and a custom domain.
  - Decide how much of the SEO meta data is auto-generated vs. editable per page and per site in the UI.
- **Analytics detail**:
  - Decide whether to store per-page unique visitor counts or derive them at query time from hashed IP + user agent.
  - Agree on minimum granularity (daily only vs. hourly for Business tier) while staying inside free tier database and compute limits.

## Cursor-optimized development workflow

- **Repository setup**:
  - Use the PRD file as the single source of truth and keep it updated with any deviations.
  - Keep `.cursor/rules` exactly as specified and extend only when patterns stabilize.
  - Add MCP servers for Playwright and Context7 so tests and documentation fetches stay inside Cursor.
- **Phase prompts**:
  - Use the provided per-phase prompts in Section 15 as the primary driver for Cursor Agent work.
  - For large phases, split into sub-prompts that focus on a directory or feature slice and always attach the most relevant rule file.
- **Review cadence**:
  - After each phase, run linting, type-checking, and at least a smoke test in the browser.
  - Keep test fixtures and Storybook-style playgrounds close to complex components like the Notion parser and block renderers.

## Implementation sequencing (high level)

- **Phase A – Foundations**
  - Execute PRD Phase 0 with strict adherence to TypeScript, ESLint, Tailwind, Drizzle, and Cursor rules.
  - Confirm `pnpm dev` works locally and that database migrations succeed against the chosen free-tier Postgres.
- **Phase B – Auth and dashboard shell**
  - Implement Phases 1 and 2 for authentication and dashboard layout.
  - Add basic unit tests around auth flows and middleware redirection.
- **Phase C – Sites and pages baseline**
  - Implement Phase 3 (Site CRUD) with tier-based limits wired to a temporary feature flag (`free` only at first).
  - Stub Page model CRUD without full Notion parsing so navigation and layouts already work.
- **Phase D – Notion ingestion core**
  - Implement Phase 4 with a strong focus on parser reliability and tests.
  - Build a simple internal admin page for viewing raw parsed block trees for debugging.
- **Phase E – Rendering and public sites**
  - Implement Phases 5 through 7, focusing on visual quality, accessibility, and SEO outputs.
  - Run Lighthouse locally on several sample pages and archive reports in the repo.
- **Phase F – Images, billing, refresh, analytics, domains**
  - Implement Phases 8 through 13 in order, but hide some features behind runtime flags until external accounts and DNS are ready.
- **Phase G – Hardening and launch prep**
  - Finish Phase 14 with test suites, Sentry wiring, and production environment setup.
  - Document runbooks for common failures such as failed Notion fetches or Stripe webhook errors.

## Delivery and verification

- **Definition of done per phase**:
  - Code compiles and passes lint and tests.
  - Core flows for that phase work in local dev and on a staging deployment.
  - Any new external dependency has its environment variables documented in `.env.example`.
- **End-to-end readiness**:
  - Full happy path: signup, create site, add Notion page, view public site, upgrade to paid tier, add custom domain, view analytics.
  - Error paths validated: invalid Notion URL, parser failure, expired Stripe subscription, unverified domain.


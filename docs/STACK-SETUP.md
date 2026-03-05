# NotionHost stack setup

Use this checklist to connect every service. Create the account (or open the dashboard) for each, then we configure and wire it in the repo.

---

## Plan and stack summary

**Product:** NotionHost turns public Notion page URLs into fast, SEO-friendly docs sites. No per-user Notion API.

**Build order (from PRD + plan):**  
Phase 0 (scaffold) → Auth + dashboard shell → Site CRUD → Notion fetch/parse → Block renderers → Page management + caching → Public site + SEO → Images → Stripe → Scheduled refresh → Analytics → Custom domains → Landing → Polish.

**Stack (free-tier first):**

| Layer        | Service           | Role                          |
|-------------|-------------------|-------------------------------|
| Hosting     | Vercel            | Next.js app + ISR + cron     |
| Database    | Supabase or Neon  | PostgreSQL (Drizzle)         |
| Cache       | Upstash           | Redis (serverless)            |
| Auth        | Auth.js v5        | Google, GitHub, Resend email  |
| Email       | Resend            | Magic links, transactional   |
| Payments    | Stripe            | Subscriptions, portal         |
| Images      | Cloudflare R2     | Optimized image storage       |
| DNS/domains | Cloudflare        | Custom domains, SSL            |
| Monitoring  | Sentry + Vercel   | Errors + analytics            |
| OAuth       | Google + GitHub  | Sign-in providers             |

---

## 1. PostgreSQL (Supabase or Neon)

**You:** Sign up at [supabase.com](https://supabase.com) or [neon.tech](https://neon.tech). Create a project, get the **connection string** (e.g. `postgresql://...?sslmode=require`).

**We do:** Put `DATABASE_URL` into `.env.local` and Vercel env; run `pnpm db:generate` and `pnpm db:migrate` so the app uses the hosted DB.

---

## 2. Upstash Redis

**You:** Sign up at [upstash.com](https://upstash.com). Create a Redis database (free tier), copy **REST URL** and **REST Token**.

**We do:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example` and your env; wire cache layer in code to use Upstash.

---

## 3. Resend (email)

**You:** Sign up at [resend.com](https://resend.com). Create an API key, add and verify a domain (or use their test domain for dev). Set **From** address (e.g. `noreply@yourdomain.com` or Resend’s test sender).

**We do:** Add `RESEND_API_KEY` and `EMAIL_FROM` to env; Auth.js Resend provider is already configured.

---

## 4. Google OAuth (optional but recommended)

**You:** [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web). Set redirect URI: `https://your-vercel-url.vercel.app/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for local). Copy **Client ID** and **Client Secret**.

**We do:** Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to env; Auth.js already has Google provider.

---

## 5. GitHub OAuth (optional)

**You:** GitHub → Settings → Developer settings → OAuth Apps → New. Homepage URL and callback: `https://your-vercel-url.vercel.app/api/auth/callback/github` (and localhost for dev). Copy **Client ID** and **Client Secret**.

**We do:** Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to env; Auth.js already has GitHub provider.

---

## 6. Vercel (hosting)

**You:** Sign up at [vercel.com](https://vercel.com). Import the GitHub repo `camrontaylor/notionhost`. Add all env vars from this doc in Project Settings → Environment Variables.

**We do:** Ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` point to the Vercel URL; add `vercel.json` or config for cron if needed.

---

## 7. Stripe (payments)

**You:** Sign up at [stripe.com](https://stripe.com). Use Test mode first. Create products/prices: Pro Monthly, Pro Annual, Business Monthly, Business Annual. Copy **Price IDs**. Create a webhook endpoint for your Vercel URL: `https://your-app.vercel.app/api/webhooks/stripe`, events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Copy **Webhook signing secret**. Copy **Publishable key** and **Secret key** (test).

**We do:** Add all Stripe env vars; implement webhook handler and checkout/portal routes if not already present.

---

## 8. Cloudflare R2 (images)

**You:** Sign up at [cloudflare.com](https://cloudflare.com). R2 → Create bucket (e.g. `notionhost-images`). Create R2 API token with read/write. Note **Account ID**, **Access Key**, **Secret Key**. Attach a public custom domain or use R2’s dev URL for the bucket.

**We do:** Add `R2_*` env vars; wire image processor to upload to R2 and serve from the public URL.

---

## 9. Cloudflare (DNS / custom domains)

**You:** Add your production domain to Cloudflare (e.g. `notionhost.com`). We’ll use it for app DNS and, later, custom domains per user (CNAME to our app).

**We do:** Document the CNAME target (e.g. `cname.notionhost.com` → Vercel); configure middleware or Vercel domain for custom-domain routing.

---

## 10. Sentry (errors)

**You:** Sign up at [sentry.io](https://sentry.io). Create a Next.js project, copy **DSN**.

**We do:** Add `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` if needed; add Sentry SDK and config in the app.

---

## 11. Auth secret and app URL

**You:** Generate a secret, e.g. `openssl rand -base64 32`. Set production URL when deploying.

**We do:** Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` are set for local and production in `.env.example` and Vercel.

---

## Order to do them

1. **Postgres (Supabase or Neon)** – needed for auth and all features.  
2. **Resend** – needed for email magic-link sign-in.  
3. **Vercel** – deploy the app and add env vars.  
4. **Upstash Redis** – for caching (can add after first deploy).  
5. **Google + GitHub OAuth** – better sign-in UX.  
6. **Stripe** – when you’re ready to charge.  
7. **R2 + Cloudflare** – when you implement image upload.  
8. **Sentry** – when you want error tracking.  
9. **Cloudflare DNS** – when you have a production domain.

Once you open/create an account and have the relevant dashboard or keys on screen, we can go through configuration and connection step by step (browser + repo).

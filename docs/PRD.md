# Product Requirements Document: NotionHost

## Product Name: NotionHost (Working Title)

**Version:** 1.0  
**Author:** Camron  
**Date:** February 2026  
**Status:** Pre-Development

---

## 1. Product Summary

NotionHost converts published Notion pages into fast, SEO-optimized, beautifully designed documentation-style websites. Users publish their Notion pages natively (generating a public notion.site URL), paste those URLs into NotionHost, and get an instantly styled, cached, production-grade website at `notionhost.com/username` or a custom domain.

The product does NOT require per-user Notion API integrations, OAuth flows, or token management. All content ingestion happens through publicly available Notion page URLs.

---

## 2. Problem Statement

Notion's native published pages have three core failures:

1. **SEO invisibility.** Published Notion pages rarely appear in Google search results. Indexing takes weeks. Many pages never rank at all.
2. **Poor performance.** Notion loads unnecessary JavaScript bundles, collaboration scripts, analytics tracking, and vendor code. Page weights reach 2-5MB. First Contentful Paint sits at 2-4 seconds. Core Web Vitals scores land between 40-60.
3. **No design control.** Users get Notion's default styling with minimal customization. No custom meta tags, no structured data, no clean URLs, no branding control on free plans.

Existing competitors (Super.so at $16/month, Feather.so at $39/month, Potion, Notaku, HelpKit) solve parts of this problem but at premium price points and with varying levels of complexity.

---

## 3. Target Users

**Primary:** Solopreneurs, indie makers, and small teams who use Notion as their content workspace and need a professional web presence for documentation, knowledge bases, portfolios, or blogs.

**Secondary:** Agencies and consultants managing client documentation. Developers wanting lightweight project docs without maintaining a separate docs platform.

**User Profile:**
- Comfortable with Notion
- Wants speed over customization
- Values clean design and SEO performance
- Budget-conscious (price-sensitive to $15-30/month tools)
- Non-technical or semi-technical

---

## 4. Competitive Landscape

| Competitor | Starting Price | Approach | Weakness |
|---|---|---|---|
| Super.so | $16/month | Notion API integration, custom themes | Requires Notion API setup per user |
| Feather.so | $39/month | Blog/newsletter focused | Expensive, blog-only focus |
| Potion.so | $8/month | Notion page rendering | Limited template options |
| Simple.ink | Free/paid | Basic Notion page hosting | Minimal customization, basic SEO |
| Notaku | $7/month | Docs/blog/changelog | Limited design control |
| HelpKit | $19/month | Knowledge base focused | Niche use case, article-count pricing |
| Bullet.so | $9/month | General website builder | Still developing feature set |

**NotionHost differentiator:** No Notion API configuration required per user. Users paste a public URL. The product handles everything else. Pre-designed documentation aesthetic out of the box. Aggressive caching delivers PageSpeed scores of 90-100.

---

## 5. Core Architecture

### 5.1 Content Ingestion Flow

```
User publishes Notion page natively
    → Copies public notion.site URL
    → Pastes URL into NotionHost dashboard
    → NotionHost server fetches public HTML from notion.site
    → Parser extracts Notion block structure from HTML
    → Renderer converts blocks to custom React components
    → Final HTML cached in PostgreSQL + Redis
    → Served at notionhost.com/username/page-slug
```

### 5.2 Rendering Strategy: Server-Side Rendering with Incremental Static Regeneration (ISR)

**Framework:** Next.js 15 (App Router)  
**Rendering:** ISR with configurable revalidation intervals per user tier  
**Caching layers:**
1. Redis (hot cache, sub-10ms response for frequently accessed pages)
2. PostgreSQL (persistent cache, parsed block data + rendered HTML)
3. HTTP Cache-Control headers for browser and CDN edge caching

### 5.3 No Per-User Notion API Integration

The entire architecture avoids per-user Notion API tokens. Content ingestion works through fetching publicly published notion.site pages. This eliminates:
- OAuth authorization flows
- Encrypted token storage per user
- Rate limit management across users
- Notion API webhook configuration
- Workspace permission handling

### 5.4 Content Update Mechanism

**Free tier:** Manual refresh (user clicks "Refresh Content" button)  
**Pro tier:** Scheduled refresh every 60 minutes  
**Business tier:** Scheduled refresh every 15 minutes + on-demand refresh via API webhook

When a refresh triggers:
1. Server fetches the latest HTML from the user's notion.site URL
2. Compares content hash with stored hash
3. If changed: re-parses blocks, re-renders with custom components, updates cache
4. If unchanged: no action, cache stays warm

---

## 6. Tech Stack

### 6.1 Frontend
- **Framework:** Next.js 15 (App Router with Server Components)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Component Library:** shadcn/ui (headless, customizable)
- **State Management:** Zustand (minimal client state)
- **Forms:** React Hook Form + Zod validation

### 6.2 Backend
- **Runtime:** Node.js 22 LTS
- **API:** Next.js Route Handlers (app/api/)
- **Authentication:** NextAuth.js v5 (Auth.js) with Google, GitHub, Email Magic Link providers
- **Payments:** Stripe (Checkout, Customer Portal, Webhooks)
- **Email:** Resend (transactional emails)

### 6.3 Database
- **Primary:** PostgreSQL 16 (via Supabase or Neon)
- **ORM:** Drizzle ORM (type-safe, lightweight)
- **Cache:** Redis (via Upstash, serverless-compatible)
- **Migrations:** Drizzle Kit

### 6.4 Content Processing
- **HTML Fetching:** Playwright (headless browser for JavaScript-rendered Notion pages)
- **HTML Parsing:** Cheerio (lightweight DOM parser for post-render HTML)
- **Image Optimization:** Sharp (server-side compression, WebP conversion)
- **Image Storage:** Cloudflare R2 or AWS S3 (CDN-backed)

### 6.5 Infrastructure
- **Hosting:** Vercel (optimal for Next.js ISR)
- **DNS/CDN:** Cloudflare (free tier covers initial needs, upgrade for custom domains per user)
- **Monitoring:** Vercel Analytics + Sentry (error tracking)
- **CI/CD:** GitHub Actions

### 6.6 Development Tools
- **IDE:** Cursor
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Type Checking:** TypeScript strict mode

---

## 7. Database Schema

### 7.1 Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  username VARCHAR(63) UNIQUE NOT NULL,
  avatar_url TEXT,
  stripe_customer_id VARCHAR(255),
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_status VARCHAR(20) DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7.2 Sites Table

```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  custom_domain VARCHAR(255),
  custom_domain_verified BOOLEAN DEFAULT false,
  theme VARCHAR(50) DEFAULT 'minimal',
  custom_css TEXT,
  favicon_url TEXT,
  og_image_url TEXT,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  navbar_links JSONB DEFAULT '[]',
  footer_text TEXT,
  google_analytics_id VARCHAR(50),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, slug)
);
```

### 7.3 Pages Table

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  notion_url TEXT NOT NULL,
  page_slug VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  description VARCHAR(1000),
  og_image_url TEXT,
  parsed_blocks JSONB,
  rendered_html TEXT,
  content_hash VARCHAR(64),
  is_homepage BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  last_fetched_at TIMESTAMP,
  last_changed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, page_slug)
);
```

### 7.4 Cached Images Table

```sql
CREATE TABLE cached_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  cached_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  format VARCHAR(10) DEFAULT 'webp',
  size_bytes INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.5 Analytics Events Table (Basic)

```sql
CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  visitor_ip_hash VARCHAR(64),
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(2),
  viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_page_views_site_date ON page_views(site_id, viewed_at);
CREATE INDEX idx_page_views_page_date ON page_views(page_id, viewed_at);
```

---

## 8. Notion Block Type Mapping

The parser must handle the following Notion block types and map each to a custom React component:

### 8.1 Text Blocks (Priority 1 - MVP)

| Notion Block Type | React Component | Notes |
|---|---|---|
| paragraph | `<Paragraph>` | Supports rich text annotations (bold, italic, underline, strikethrough, code, color) |
| heading_1 | `<Heading level={1}>` | Single H1 per page for SEO |
| heading_2 | `<Heading level={2}>` | |
| heading_3 | `<Heading level={3}>` | |
| bulleted_list_item | `<BulletList>` | Group consecutive items into a single `<ul>` wrapper |
| numbered_list_item | `<NumberedList>` | Group consecutive items into a single `<ol>` wrapper |
| to_do | `<TodoItem>` | Render checkbox state (read-only display) |
| toggle | `<Toggle>` | Collapsible accordion with smooth animation |
| quote | `<BlockQuote>` | |
| callout | `<Callout>` | Support emoji icon and background color |
| divider | `<Divider>` | Minimal horizontal rule |
| code | `<CodeBlock>` | Syntax highlighting via Prism.js, copy button, language label |

### 8.2 Rich Text Annotations

| Annotation | Implementation |
|---|---|
| bold | `<strong>` |
| italic | `<em>` |
| underline | `<u>` |
| strikethrough | `<s>` |
| code | `<code>` with monospace styling |
| color | CSS class mapping for Notion's color palette (10 text colors + 10 background colors) |
| link | `<a>` with `target="_blank"` for external, relative for internal |

### 8.3 Media Blocks (Priority 2 - Post-MVP)

| Notion Block Type | React Component | Notes |
|---|---|---|
| image | `<OptimizedImage>` | Fetch, compress via Sharp, serve WebP with JPEG fallback, lazy loading |
| video | `<VideoEmbed>` | Support YouTube, Vimeo, Loom embeds. Direct video files via HTML5 video element |
| embed | `<Embed>` | iframe with responsive wrapper |
| bookmark | `<BookmarkCard>` | Display URL with fetched OG data (title, description, favicon) |
| file | `<FileDownload>` | Download link with file icon |
| pdf | `<PDFViewer>` | Embedded PDF viewer or download fallback |
| audio | `<AudioPlayer>` | HTML5 audio element with custom styling |

### 8.4 Layout Blocks (Priority 2 - Post-MVP)

| Notion Block Type | React Component | Notes |
|---|---|---|
| column_list | `<ColumnLayout>` | CSS Grid with responsive stacking on mobile |
| column | `<Column>` | Child of ColumnLayout |
| table | `<DataTable>` | Responsive table with horizontal scroll on mobile |
| table_row | `<TableRow>` | Child of DataTable |
| table_of_contents | `<TableOfContents>` | Auto-generated from heading hierarchy |

### 8.5 Advanced Blocks (Priority 3 - Future)

| Notion Block Type | React Component | Notes |
|---|---|---|
| equation | `<Equation>` | KaTeX rendering |
| synced_block | Parse as regular blocks | Treat content normally |
| link_to_page | `<InternalLink>` | Map to NotionHost internal routing if target page exists |
| child_page | `<ChildPageLink>` | Link card to sub-page |
| child_database | `<DatabaseView>` | Render basic table view of database contents |
| breadcrumb | `<Breadcrumb>` | Navigation breadcrumb based on site structure |

### 8.6 Unsupported Blocks (Graceful Fallback)

Any block type not listed above should render a subtle message: "This content type is not yet supported. View the original page on Notion." with a link to the source notion.site URL.

---

## 9. Page Routing Structure

### 9.1 Public-Facing Routes (User Sites)

```
/[username]                    → User's site homepage
/[username]/[page-slug]        → Individual page
/[username]/sitemap.xml        → Auto-generated sitemap
/[username]/robots.txt         → Auto-generated robots.txt
```

### 9.2 Dashboard Routes (Authenticated)

```
/dashboard                     → Overview (sites list, quick stats)
/dashboard/sites/new           → Create new site
/dashboard/sites/[siteId]      → Site settings (theme, SEO, domain)
/dashboard/sites/[siteId]/pages → Manage pages (add, remove, reorder)
/dashboard/sites/[siteId]/pages/[pageId] → Individual page settings
/dashboard/sites/[siteId]/analytics → Traffic overview
/dashboard/account             → Profile, email, password
/dashboard/billing             → Subscription management (Stripe portal)
```

### 9.3 API Routes

```
POST   /api/auth/[...nextauth]    → NextAuth handlers
POST   /api/sites                  → Create site
PATCH  /api/sites/[siteId]         → Update site settings
DELETE /api/sites/[siteId]         → Delete site
POST   /api/sites/[siteId]/pages   → Add page (submit Notion URL)
PATCH  /api/sites/[siteId]/pages/[pageId] → Update page settings
DELETE /api/sites/[siteId]/pages/[pageId] → Remove page
POST   /api/sites/[siteId]/pages/[pageId]/refresh → Trigger content refresh
POST   /api/webhooks/stripe        → Stripe webhook handler
GET    /api/og/[siteId]/[pageId]   → Dynamic OG image generation
```

### 9.4 Cron / Background Jobs

```
/api/cron/refresh-pages         → Scheduled content refresh (Vercel Cron)
/api/cron/cleanup-analytics     → Prune old analytics data (30 days retention on free)
```

---

## 10. Feature Specifications

### 10.1 User Authentication

**Providers:** Google OAuth, GitHub OAuth, Email Magic Link (via Resend)  
**Implementation:** NextAuth.js v5 (Auth.js) with Drizzle adapter  
**Session:** JWT-based (stateless, works with edge runtime)  
**Username:** Auto-generated from email prefix on signup, editable once. Must be alphanumeric + hyphens, 3-63 characters. Validated against reserved words list (api, dashboard, admin, www, app, etc.)

### 10.2 Site Creation

**Flow:**
1. User clicks "New Site" on dashboard
2. Enters site name (auto-generates slug from name)
3. Submits first Notion page URL (validated as a public notion.site URL)
4. System fetches page, parses content, renders preview
5. User confirms, site goes live at notionhost.com/username

**Validation on Notion URL submission:**
- Must be a valid URL matching pattern: `https://*.notion.site/*` or `https://www.notion.so/*`
- Must be publicly accessible (server-side HEAD request returns 200)
- Must not already be claimed by another user's site
- Response must contain recognizable Notion page structure

### 10.3 Notion Page Fetching and Parsing

**Fetching strategy:**  
Because Notion public pages render content via JavaScript (client-side rendering), a simple HTTP GET will not return the full page content. The system must use a headless browser to fetch and render the page.

**Implementation:**
1. Playwright launches a headless Chromium instance
2. Navigates to the notion.site URL
3. Waits for Notion's client-side rendering to complete (wait for `[data-block-id]` elements)
4. Extracts the rendered HTML from the page body
5. Passes HTML to the Cheerio parser

**Parsing pipeline:**
1. Cheerio loads the rendered HTML
2. Parser identifies Notion block containers by their `data-block-id` attributes and class patterns
3. Each block is classified by type (paragraph, heading, list item, image, etc.)
4. Rich text annotations (bold, italic, color, links) are extracted from nested spans
5. Blocks are organized into a structured JSON tree (preserving parent-child relationships for nested content like toggle lists and columns)
6. JSON tree is stored in the `parsed_blocks` column of the pages table
7. Renderer converts JSON tree to HTML using custom React components
8. Final HTML is stored in the `rendered_html` column

**Image handling during parse:**
1. Identify all image URLs in the parsed content
2. Download each image to temporary storage
3. Process through Sharp: resize to max 1200px width, compress, convert to WebP
4. Upload processed image to R2/S3
5. Replace original Notion image URL with CDN URL in parsed blocks
6. Store mapping in cached_images table

**Content hash:**  
After parsing, generate SHA-256 hash of the parsed_blocks JSON. Store as content_hash. On subsequent refreshes, compare new hash with stored hash to determine if content changed.

### 10.4 Custom Rendering Components

Each Notion block type maps to a React Server Component with the site's theme applied. All components must:

- Render valid, semantic HTML
- Include appropriate ARIA attributes for accessibility
- Support dark mode (via CSS custom properties)
- Be responsive (mobile-first design)
- Include zero client-side JavaScript unless required for interactivity (toggles, code copy button)

**Typography specifications for the "minimal" default theme:**

```
Font Stack: Inter (primary), system-ui (fallback)
Body: 16px / 1.75 line-height / #1a1a1a text / 680px max-width
H1: 36px / 1.2 line-height / 700 weight / 48px margin-top / 24px margin-bottom
H2: 28px / 1.3 line-height / 600 weight / 40px margin-top / 16px margin-bottom
H3: 22px / 1.4 line-height / 600 weight / 32px margin-top / 12px margin-bottom
Code blocks: JetBrains Mono / 14px / 1.6 line-height / #f5f5f5 background / 8px border-radius
Callouts: 16px / #f8f9fa background / 1px solid #e2e8f0 border / 16px padding / 8px border-radius
Block quotes: 16px / italic / #6b7280 color / 3px solid #e5e7eb left border / 16px left padding
```

### 10.5 SEO Implementation

**Per-page meta tags (auto-generated, user-overridable):**
- `<title>` from Notion page title + site name
- `<meta name="description">` from first 155 characters of page content
- `<meta property="og:title">` matching title
- `<meta property="og:description">` matching description
- `<meta property="og:image">` from first image in content or site-level default
- `<meta property="og:url">` canonical URL
- `<meta name="twitter:card">` set to "summary_large_image"
- `<link rel="canonical">` pointing to the NotionHost URL

**Structured data (JSON-LD):**
- Article schema for blog-style pages
- BreadcrumbList schema for navigation hierarchy
- WebSite schema at site root
- Organization schema if user provides logo

**Technical SEO:**
- Auto-generated `sitemap.xml` per user site listing all published pages with lastmod timestamps
- Auto-generated `robots.txt` allowing all crawlers
- Clean URL structure: `/username/page-title-slug` (no random IDs)
- Single H1 per page (first heading_1 block becomes H1, subsequent heading_1 blocks downgrade to H2)
- Proper heading hierarchy enforcement
- Image alt text preserved from Notion captions
- Internal links between pages within the same site resolve to relative URLs

### 10.6 Performance Requirements

**Target metrics (measured via Lighthouse on a page with 2000 words, 3 images, 1 code block):**

| Metric | Target | How |
|---|---|---|
| Lighthouse Performance Score | 95+ | ISR + Redis caching + minimal JS bundle |
| First Contentful Paint | < 0.8s | Pre-rendered HTML served from edge cache |
| Largest Contentful Paint | < 1.5s | Optimized images with proper sizing and lazy loading |
| Cumulative Layout Shift | < 0.05 | Fixed dimensions on images, no late-loading elements |
| Time to Interactive | < 1.5s | Minimal client-side JS (only toggles and code copy) |
| Total Page Weight | < 300KB | No Notion bloat, compressed assets, WebP images |
| Server Response Time (TTFB) | < 200ms | Redis hot cache + Vercel edge network |

**Caching strategy (three layers):**

1. **Redis (hot cache):** Store rendered HTML keyed by `site_slug:page_slug`. TTL matches user tier refresh interval. Sub-10ms reads.
2. **PostgreSQL (persistent cache):** Full parsed blocks + rendered HTML. Source of truth. Survives Redis eviction.
3. **HTTP headers:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` on all published pages. Browsers and CDN edges cache aggressively.

### 10.7 Subscription Tiers and Pricing

| Feature | Free | Pro ($12/month) | Business ($29/month) |
|---|---|---|---|
| Sites | 1 | 3 | 10 |
| Pages per site | 5 | 25 | Unlimited |
| Content refresh | Manual only | Every 60 minutes | Every 15 minutes + API webhook |
| Custom domain | No | Yes (1 per site) | Yes (1 per site) |
| Remove NotionHost branding | No | Yes | Yes |
| Custom CSS injection | No | Yes | Yes |
| Custom fonts | No | Yes | Yes |
| Analytics | Page views (7 days) | Full analytics (90 days) | Full analytics (365 days) |
| OG image customization | No | Yes | Yes |
| Priority support | No | Email | Email + priority queue |
| Dark mode toggle | Yes | Yes | Yes |
| SEO meta overrides | No | Yes | Yes |

### 10.8 Stripe Integration

**Products/Prices:**
- Pro Monthly: $12/month
- Pro Annual: $108/year ($9/month effective)
- Business Monthly: $29/month
- Business Annual: $261/year ($21.75/month effective)

**Webhook events to handle:**
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Handle plan changes, renewals
- `customer.subscription.deleted` - Downgrade to free tier
- `invoice.payment_failed` - Grace period notification

**Subscription enforcement:**
- Middleware checks `subscription_tier` on every dashboard request
- Feature flags object derived from tier, passed to components
- Soft enforcement: show upgrade prompts when hitting limits
- Hard enforcement: prevent creating sites/pages beyond tier limits via API validation

### 10.9 Custom Domain Support (Pro + Business)

**Setup flow:**
1. User enters desired domain in site settings
2. System generates DNS records the user must add:
   - CNAME record: `docs.theircompany.com` → `cname.notionhost.com`
   - TXT record: `_notionhost-verification.docs.theircompany.com` → verification token
3. User adds records at their DNS provider
4. System polls for DNS propagation (background job, check every 5 minutes for 48 hours)
5. Once verified, SSL certificate provisioned via Cloudflare
6. Domain marked as verified, traffic routed to user's site

---

## 11. File Structure

```
notionhost/
├── .cursor/
│   └── rules/
│       ├── index.mdc                # Global project rules (always active)
│       ├── nextjs.mdc               # Next.js patterns and conventions
│       ├── database.mdc             # Drizzle ORM and database patterns
│       ├── notion-parser.mdc        # Notion HTML parsing rules
│       └── components.mdc           # Component creation rules
├── .env.local                       # Local environment variables
├── .env.example                     # Template for environment variables
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Lint + type check + test on PR
│       └── deploy.yml               # Deploy to Vercel on merge to main
├── drizzle/
│   └── migrations/                  # Auto-generated migration files
├── public/
│   ├── fonts/                       # Self-hosted Inter + JetBrains Mono
│   └── images/                      # Static assets (logo, default OG image)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx                    # Dashboard home
│   │   │   │   ├── sites/
│   │   │   │   │   ├── new/page.tsx            # Create site flow
│   │   │   │   │   └── [siteId]/
│   │   │   │   │       ├── page.tsx            # Site settings
│   │   │   │   │       ├── pages/page.tsx      # Page management
│   │   │   │   │       └── analytics/page.tsx  # Traffic stats
│   │   │   │   ├── account/page.tsx
│   │   │   │   └── billing/page.tsx
│   │   │   └── layout.tsx                      # Dashboard shell with sidebar
│   │   ├── (site)/
│   │   │   └── [username]/
│   │   │       ├── page.tsx                    # Site homepage
│   │   │       ├── [pageSlug]/page.tsx         # Individual page
│   │   │       ├── sitemap.xml/route.ts
│   │   │       └── robots.txt/route.ts
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── sites/
│   │   │   │   ├── route.ts                    # POST create site
│   │   │   │   └── [siteId]/
│   │   │   │       ├── route.ts                # PATCH, DELETE site
│   │   │   │       └── pages/
│   │   │   │           ├── route.ts            # POST add page
│   │   │   │           └── [pageId]/
│   │   │   │               ├── route.ts        # PATCH, DELETE page
│   │   │   │               └── refresh/route.ts
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/route.ts
│   │   │   ├── og/[siteId]/[pageId]/route.tsx  # Dynamic OG images
│   │   │   └── cron/
│   │   │       ├── refresh-pages/route.ts
│   │   │       └── cleanup-analytics/route.ts
│   │   ├── layout.tsx                          # Root layout
│   │   ├── page.tsx                            # Landing page / marketing
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                                 # shadcn/ui primitives
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   ├── site-card.tsx
│   │   │   ├── page-list.tsx
│   │   │   ├── notion-url-input.tsx
│   │   │   ├── theme-selector.tsx
│   │   │   ├── seo-settings-form.tsx
│   │   │   ├── domain-setup.tsx
│   │   │   └── analytics-chart.tsx
│   │   ├── site/                               # Public-facing site components
│   │   │   ├── site-layout.tsx
│   │   │   ├── site-header.tsx
│   │   │   ├── site-footer.tsx
│   │   │   ├── site-navigation.tsx
│   │   │   ├── search.tsx                      # Client-side page search
│   │   │   └── dark-mode-toggle.tsx
│   │   ├── notion-blocks/                      # Notion block renderers
│   │   │   ├── block-renderer.tsx              # Root dispatcher
│   │   │   ├── paragraph.tsx
│   │   │   ├── heading.tsx
│   │   │   ├── bullet-list.tsx
│   │   │   ├── numbered-list.tsx
│   │   │   ├── todo-item.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── block-quote.tsx
│   │   │   ├── callout.tsx
│   │   │   ├── code-block.tsx
│   │   │   ├── divider.tsx
│   │   │   ├── optimized-image.tsx
│   │   │   ├── video-embed.tsx
│   │   │   ├── bookmark-card.tsx
│   │   │   ├── embed.tsx
│   │   │   ├── column-layout.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── table-of-contents.tsx
│   │   │   ├── equation.tsx
│   │   │   ├── rich-text.tsx                   # Rich text annotation renderer
│   │   │   ├── unsupported-block.tsx
│   │   │   └── index.ts                        # Barrel export
│   │   ├── marketing/                          # Landing page components
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   ├── pricing-table.tsx
│   │   │   ├── testimonials.tsx
│   │   │   └── cta.tsx
│   │   └── shared/
│   │       ├── logo.tsx
│   │       ├── loading-spinner.tsx
│   │       └── error-boundary.tsx
│   ├── lib/
│   │   ├── auth.ts                             # NextAuth configuration
│   │   ├── db/
│   │   │   ├── index.ts                        # Drizzle client
│   │   │   ├── schema.ts                       # All table definitions
│   │   │   └── queries/
│   │   │       ├── users.ts
│   │   │       ├── sites.ts
│   │   │       ├── pages.ts
│   │   │       └── analytics.ts
│   │   ├── stripe/
│   │   │   ├── client.ts                       # Stripe SDK initialization
│   │   │   ├── plans.ts                        # Plan definitions and feature flags
│   │   │   └── webhooks.ts                     # Webhook event handlers
│   │   ├── notion/
│   │   │   ├── fetcher.ts                      # Playwright-based page fetcher
│   │   │   ├── parser.ts                       # HTML to structured blocks parser
│   │   │   ├── renderer.ts                     # Blocks to HTML renderer
│   │   │   ├── image-processor.ts              # Download, optimize, upload images
│   │   │   ├── block-types.ts                  # TypeScript types for all block types
│   │   │   └── color-map.ts                    # Notion color names to CSS values
│   │   ├── cache/
│   │   │   ├── redis.ts                        # Upstash Redis client
│   │   │   └── strategies.ts                   # Cache get/set/invalidate helpers
│   │   ├── seo/
│   │   │   ├── metadata.ts                     # Generate Next.js metadata objects
│   │   │   ├── structured-data.ts              # JSON-LD generators
│   │   │   └── sitemap.ts                      # Sitemap XML generator
│   │   ├── utils/
│   │   │   ├── slugify.ts                      # URL-safe slug generation
│   │   │   ├── hash.ts                         # SHA-256 content hashing
│   │   │   ├── rate-limit.ts                   # API rate limiting
│   │   │   └── validation.ts                   # Shared Zod schemas
│   │   └── constants.ts                        # App-wide constants
│   ├── middleware.ts                            # Auth + custom domain routing
│   └── types/
│       ├── notion.ts                           # Notion block type definitions
│       ├── site.ts                             # Site and page types
│       └── index.ts
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── vitest.config.ts
├── playwright.config.ts
└── PRD.md                                      # This document
```

---

## 12. Chronological Build Phases (Cursor-Optimized)

Each phase is designed to be a self-contained block of work. Complete each phase fully before moving to the next. Test each phase independently.

### Phase 0: Project Scaffolding (Day 1)

**Objective:** Empty project with all tooling configured and running.

**Steps:**
1. Initialize Next.js 15 project with TypeScript, Tailwind CSS, App Router, src/ directory
2. Install and configure: drizzle-orm, @auth/core, @auth/drizzle-adapter, stripe, zod, zustand, react-hook-form, @hookform/resolvers, sharp, cheerio, upstash/redis, resend
3. Install dev dependencies: vitest, @playwright/test, eslint, prettier
4. Set up .env.example with all required variables documented
5. Create the .cursor/rules/ directory with all rule files (provided in Section 14)
6. Configure tailwind.config.ts with custom theme tokens
7. Set up Drizzle config pointing to PostgreSQL
8. Create initial database schema and run first migration
9. Verify: `pnpm dev` starts without errors, database connects, all config files valid

### Phase 1: Authentication (Days 2-3)

**Objective:** Users can sign up, log in, and have persistent sessions.

**Steps:**
1. Configure NextAuth.js v5 with Drizzle adapter
2. Set up Google OAuth provider (credentials via .env)
3. Set up GitHub OAuth provider
4. Set up Email Magic Link provider via Resend
5. Create auth middleware (src/middleware.ts) protecting /dashboard routes
6. Build login page with provider buttons and email input
7. Build signup page with username selection
8. Add username uniqueness validation (API route + client-side debounce check)
9. Create user session provider wrapping the app
10. Test: full signup flow with each provider, protected route redirect, session persistence

### Phase 2: Dashboard Shell (Days 3-4)

**Objective:** Authenticated users see a functional dashboard layout.

**Steps:**
1. Build dashboard layout with responsive sidebar navigation
2. Create dashboard home page showing empty state ("Create your first site")
3. Build account settings page (name, username, avatar)
4. Add site card component (placeholder for later)
5. Implement dashboard navigation: Sites, Account, Billing
6. Test: navigation between all dashboard pages, responsive layout on mobile

### Phase 3: Site CRUD (Days 4-6)

**Objective:** Users can create, configure, and delete sites.

**Steps:**
1. Build "Create Site" page with form: site name, first Notion URL
2. Implement Notion URL validation (regex pattern + server-side accessibility check)
3. Create API route: POST /api/sites (creates site record, slug from name)
4. Build site settings page: name, slug, meta title, meta description, theme selection
5. Create API route: PATCH /api/sites/[siteId]
6. Create API route: DELETE /api/sites/[siteId] with confirmation
7. Update dashboard home to list user's sites as cards
8. Enforce free tier limit (1 site) with upgrade prompt
9. Test: full CRUD lifecycle, slug uniqueness, tier enforcement

### Phase 4: Notion Page Fetching and Parsing (Days 6-10)

**Objective:** System can fetch a public Notion page and convert it to structured JSON blocks.

**This is the most complex phase. Take it step by step.**

**Steps:**
1. Install Playwright and configure for headless Chromium
2. Build fetcher.ts: accepts notion.site URL, launches headless browser, waits for content render, returns full HTML string
3. Build parser.ts: accepts HTML string, uses Cheerio to identify Notion block containers
4. Implement block type detection for all Priority 1 blocks (paragraph, headings, lists, toggle, quote, callout, divider, code)
5. Implement rich text annotation extraction (bold, italic, color, links)
6. Build recursive block tree construction (for nested content: toggles containing other blocks, nested lists)
7. Build content hash generation (SHA-256 of parsed blocks JSON)
8. Create TypeScript types for all block structures (src/types/notion.ts)
9. Build comprehensive test suite: create sample Notion pages with every block type, snapshot test the parser output
10. Test: fetch 5 different real Notion pages, verify parser output matches expected structure

### Phase 5: Block Rendering Components (Days 10-14)

**Objective:** All Priority 1 block types render as styled React components.

**Steps:**
1. Build rich-text.tsx: renders inline annotations (bold, italic, links, colors, code)
2. Build block-renderer.tsx: dispatcher component that maps block type to correct renderer
3. Build paragraph.tsx
4. Build heading.tsx (handles levels 1-3, enforces single H1)
5. Build bullet-list.tsx (groups consecutive bulleted_list_item blocks into ul)
6. Build numbered-list.tsx (groups consecutive numbered_list_item blocks into ol)
7. Build todo-item.tsx (read-only checkbox display)
8. Build toggle.tsx (collapsible with animation, renders child blocks recursively)
9. Build block-quote.tsx
10. Build callout.tsx (emoji icon + background color support)
11. Build code-block.tsx (syntax highlighting with Prism.js, copy button, language label)
12. Build divider.tsx
13. Build unsupported-block.tsx (graceful fallback)
14. Apply the "minimal" theme typography specifications from Section 10.4
15. Test: render a page containing every block type, verify visual output matches design specs

### Phase 6: Page Management and Caching (Days 14-17)

**Objective:** Users can add Notion pages to their sites, and pages are cached for fast delivery.

**Steps:**
1. Build page management UI: list of pages per site, add page form (Notion URL + page slug), reorder, delete
2. Create API route: POST /api/sites/[siteId]/pages (validates URL, triggers fetch+parse+render, stores result)
3. Create API route: PATCH /api/sites/[siteId]/pages/[pageId] (update slug, SEO overrides)
4. Create API route: DELETE /api/sites/[siteId]/pages/[pageId]
5. Create API route: POST /api/sites/[siteId]/pages/[pageId]/refresh (re-fetch, re-parse, update cache)
6. Set up Redis client (Upstash)
7. Build cache layer: on page request, check Redis first, then PostgreSQL, then re-fetch from Notion
8. Implement cache invalidation on manual refresh
9. Enforce per-tier page limits with upgrade prompts
10. Test: add 5 pages to a site, verify cache hit/miss behavior, verify refresh updates content

### Phase 7: Public Site Rendering (Days 17-20)

**Objective:** Published sites are accessible at notionhost.com/username with full SEO.

**Steps:**
1. Build [username]/page.tsx: loads site + homepage data, renders with site layout
2. Build [username]/[pageSlug]/page.tsx: loads individual page, renders with site layout
3. Build site-layout.tsx: header with site name + navigation, content area, footer
4. Build site-header.tsx: site name (links to homepage), navigation links from site's page list
5. Build site-footer.tsx: "Powered by NotionHost" branding (removed on Pro+), optional custom footer text
6. Build site-navigation.tsx: sidebar or top navigation listing all published pages
7. Implement Next.js metadata generation per page (title, description, OG tags)
8. Add JSON-LD structured data (Article, BreadcrumbList, WebSite schemas)
9. Build sitemap.xml route for each user site
10. Build robots.txt route
11. Set HTTP Cache-Control headers on all public pages
12. Implement dark mode toggle (CSS custom properties, localStorage preference)
13. Test: access published site, verify SEO tags in HTML source, run Lighthouse audit, target 95+ score

### Phase 8: Image Optimization Pipeline (Days 20-22)

**Objective:** Images from Notion pages are optimized, cached, and served from CDN.

**Steps:**
1. Set up Cloudflare R2 bucket (or AWS S3) for image storage
2. Build image-processor.ts: download image from Notion URL, process with Sharp (resize to max 1200px width, compress quality 80, convert to WebP with JPEG fallback)
3. Upload processed image to R2, store CDN URL in cached_images table
4. Update parser to replace Notion image URLs with CDN URLs in parsed blocks
5. Build optimized-image.tsx: renders `<picture>` element with WebP source and JPEG fallback, proper width/height attributes, lazy loading, blur placeholder
6. Handle Notion's image URL expiration (Notion-hosted images expire after ~1 hour, so images MUST be downloaded and cached during parse)
7. Test: page with 5 images loads with all images from CDN, Lighthouse image audit passes

### Phase 9: Stripe Integration (Days 22-25)

**Objective:** Users can subscribe to Pro and Business plans, manage billing.

**Steps:**
1. Create Stripe products and prices (Pro Monthly, Pro Annual, Business Monthly, Business Annual)
2. Build pricing table component for landing page and dashboard upgrade prompt
3. Create checkout session API route (redirects to Stripe Checkout)
4. Build Stripe webhook handler processing: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
5. Update user record with stripe_customer_id, subscription_tier, subscription_status on webhook events
6. Build billing page in dashboard: current plan, next billing date, "Manage Subscription" button (Stripe Customer Portal)
7. Implement feature flag system derived from subscription_tier
8. Apply feature gates across all dashboard pages (site limits, page limits, custom CSS, SEO overrides)
9. Test: full checkout flow in Stripe test mode, webhook delivery, plan changes, cancellation

### Phase 10: Scheduled Content Refresh (Days 25-27)

**Objective:** Pages auto-refresh based on subscription tier.

**Steps:**
1. Create Vercel Cron job at /api/cron/refresh-pages
2. Cron runs every 15 minutes
3. Query all pages where: user has Pro tier AND last_fetched_at > 60 minutes ago, OR user has Business tier AND last_fetched_at > 15 minutes ago
4. For each qualifying page: re-fetch, re-parse, compare content hash, update cache if changed
5. Rate limit: process max 50 pages per cron run to stay within Vercel function timeout
6. Implement queue-based processing for large batches (use Vercel KV or QStash for job queuing)
7. Test: set refresh interval to 1 minute in test, verify content updates propagate

### Phase 11: Analytics (Days 27-29)

**Objective:** Users see basic traffic data for their sites.

**Steps:**
1. Create lightweight analytics middleware: on every public page request, fire-and-forget insert to page_views table
2. Hash visitor IP (SHA-256 with daily salt) for unique visitor counting without storing PII
3. Build analytics API routes: page views by day, top pages, referrers, countries
4. Build analytics dashboard page with charts (Recharts)
5. Implement retention limits: free tier sees 7 days, Pro sees 90 days, Business sees 365 days
6. Create cleanup cron job to prune old analytics data
7. Test: visit published pages, verify analytics appear in dashboard

### Phase 12: Custom Domain Support (Days 29-32)

**Objective:** Pro and Business users can connect custom domains.

**Steps:**
1. Build domain setup UI in site settings: domain input, DNS instructions display, verification status
2. Generate unique verification token per domain attempt
3. Display required DNS records: CNAME and TXT
4. Create background verification job: check DNS records every 5 minutes for 48 hours
5. On verification success: mark domain as verified, update Cloudflare DNS mapping
6. Configure Next.js middleware to route custom domain requests to the correct user site
7. SSL provisioned automatically through Cloudflare
8. Test: full domain verification flow (use a test domain)

### Phase 13: Landing Page and Marketing (Days 32-34)

**Objective:** Public-facing landing page converts visitors to signups.

**Steps:**
1. Build hero section: headline, subheadline, CTA button, demo screenshot/animation
2. Build features section: key differentiators (speed, SEO, no Notion API setup)
3. Build pricing section using the pricing table component
4. Build social proof section (placeholder for testimonials)
5. Build footer with links, legal pages
6. Optimize landing page for Core Web Vitals
7. Test: Lighthouse audit on landing page, target 95+ score

### Phase 14: Polish, Testing, and Launch Prep (Days 34-38)

**Objective:** Production-ready application.

**Steps:**
1. End-to-end test suite: signup, create site, add pages, refresh, view published site, subscribe, custom domain
2. Error handling audit: every API route has proper error responses, every UI has error states
3. Loading state audit: every async operation shows a loading indicator
4. Empty state audit: every list shows a helpful empty state with CTA
5. Mobile responsiveness audit: every page tested at 375px, 768px, 1024px, 1440px widths
6. Accessibility audit: keyboard navigation, screen reader testing, color contrast
7. Security review: input sanitization, CSRF protection, rate limiting on all API routes
8. Environment variable validation at startup (fail fast if missing required vars)
9. Set up Sentry for error tracking
10. Set up Vercel Analytics
11. Configure production environment variables in Vercel
12. DNS and domain configuration for notionhost.com
13. Final Lighthouse audit on 3 sample published sites

---

## 13. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL=postgresql://user:pass@host:5432/notionhost

# Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (Resend)
RESEND_API_KEY=re_your-api-key
EMAIL_FROM=noreply@notionhost.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_xxx
STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_xxx

# Image Storage (Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=notionhost-images
R2_PUBLIC_URL=https://images.notionhost.com

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=generate-a-secure-random-string
```

---

## 14. Cursor Configuration Files

### 14.1 .cursor/rules/index.mdc (Global Rules - Always Active)

```markdown
---
description: Global project rules for NotionHost
rule_type: always
---

# NotionHost Project Rules

## Tech Stack
- Next.js 15 with App Router and Server Components
- TypeScript in strict mode
- Tailwind CSS 4 for styling
- shadcn/ui for component primitives
- Drizzle ORM with PostgreSQL
- NextAuth.js v5 for authentication
- Stripe for payments
- Upstash Redis for caching
- Zod for runtime validation

## Code Conventions
- All files use TypeScript (.ts or .tsx)
- Use named exports, not default exports (exception: Next.js page/layout components)
- Use "function" keyword for components, not arrow functions
- Prefix server-only files with "use server" directive
- Prefix client components with "use client" directive
- All API routes return typed JSON responses
- All database queries go in src/lib/db/queries/ files
- All Zod schemas go in src/lib/utils/validation.ts or co-located with their API route
- Never use "any" type. Use "unknown" and narrow with type guards.
- Error messages should be user-friendly strings, not raw error objects

## File Naming
- Components: PascalCase (SiteCard.tsx)
- Utilities and lib files: kebab-case (rate-limit.ts)
- Types: PascalCase in files, files are kebab-case (src/types/notion.ts)

## Import Order
1. React/Next.js imports
2. Third-party library imports
3. Internal lib imports (@/lib/...)
4. Internal component imports (@/components/...)
5. Type imports (import type { ... })

## Response Patterns
- API routes: return NextResponse.json({ data }) or NextResponse.json({ error: "message" }, { status: 4xx })
- Server actions: return { success: true, data } or { success: false, error: "message" }
- Never expose database IDs in error messages
- Never expose stack traces in production responses

## Testing
- Unit tests: Vitest, co-located as [file].test.ts
- E2E tests: Playwright, in tests/ directory
- Test file naming: [feature].test.ts or [feature].spec.ts

## Git
- Commit messages: conventional commits (feat:, fix:, chore:, docs:, refactor:)
- Branch naming: feature/[name], fix/[name], chore/[name]
- Always commit working state before starting new features
```

### 14.2 .cursor/rules/nextjs.mdc

```markdown
---
description: Next.js App Router patterns
rule_type: auto_attached
globs: ["src/app/**/*.tsx", "src/app/**/*.ts"]
---

# Next.js Conventions

## Server Components (default)
- Pages and layouts are Server Components by default
- Fetch data directly in the component using async/await
- Use generateMetadata() for page-level SEO meta tags
- Use generateStaticParams() for static path generation

## Client Components
- Add "use client" directive only when needed (useState, useEffect, onClick handlers, browser APIs)
- Keep client components as small as possible
- Lift data fetching to parent Server Components, pass as props

## Route Handlers
- Located in src/app/api/[route]/route.ts
- Export named functions: GET, POST, PATCH, DELETE
- Always validate request body with Zod
- Always check authentication with getServerSession()
- Return typed NextResponse.json()

## Layouts
- Layouts do not re-render on navigation
- Use layouts for persistent UI (sidebars, headers)
- Dashboard layout handles auth redirect

## Loading and Error States
- loading.tsx for Suspense fallbacks
- error.tsx for error boundaries (must be client component)
- not-found.tsx for 404 pages

## Middleware
- src/middleware.ts handles: auth redirects, custom domain routing
- Keep middleware light (runs on every request)
```

### 14.3 .cursor/rules/database.mdc

```markdown
---
description: Database and Drizzle ORM patterns
rule_type: auto_attached
globs: ["src/lib/db/**/*.ts", "drizzle/**/*"]
---

# Database Conventions

## Schema
- All table definitions in src/lib/db/schema.ts
- Use pgTable from drizzle-orm/pg-core
- All tables include id (UUID), created_at, updated_at columns
- Foreign keys use ON DELETE CASCADE
- Add indexes for frequently queried columns

## Queries
- All query functions in src/lib/db/queries/[table].ts
- Export named async functions (getUserByEmail, createSite, etc.)
- Always return typed results
- Use prepared statements for frequent queries
- Use transactions for multi-table operations

## Migrations
- Generate with: pnpm drizzle-kit generate
- Apply with: pnpm drizzle-kit migrate
- Never modify generated migration files manually
- Always verify migration SQL before applying to production
```

### 14.4 .cursor/rules/notion-parser.mdc

```markdown
---
description: Notion HTML parsing and rendering rules
rule_type: auto_attached
globs: ["src/lib/notion/**/*.ts", "src/components/notion-blocks/**/*.tsx"]
---

# Notion Parser Rules

## Fetching
- Always use Playwright headless browser (not HTTP GET) for notion.site URLs
- Wait for [data-block-id] elements to confirm content rendered
- Set 30-second timeout on page load
- Close browser instance after extraction

## Parsing
- Use Cheerio for HTML parsing (not regex)
- Identify blocks by data-block-id attribute and Notion CSS class patterns
- Build a tree structure preserving parent-child relationships
- Store parsed blocks as JSONB in PostgreSQL
- Generate SHA-256 content hash for change detection

## Block Types
- Each block type has a corresponding TypeScript interface in src/types/notion.ts
- All block interfaces extend a base NotionBlock interface with: id, type, has_children, children
- Rich text stored as array of RichTextSegment objects with text + annotations

## Rendering
- Each block type has one React component in src/components/notion-blocks/
- block-renderer.tsx dispatches to correct component based on block.type
- Renderers are Server Components (no client JS) unless interactivity required
- Consecutive list items must be grouped into wrapper elements (ul, ol)
- Nested blocks render recursively through block-renderer
- Unknown block types render unsupported-block.tsx with link to original Notion page
```

### 14.5 .cursor/rules/components.mdc

```markdown
---
description: Component creation patterns
rule_type: auto_attached
globs: ["src/components/**/*.tsx"]
---

# Component Rules

## Structure
- One component per file
- Props interface defined above the component
- Destructure props in function signature
- Use cn() from @/lib/utils for conditional class merging

## Styling
- Use Tailwind CSS classes exclusively (no inline styles, no CSS modules)
- Follow mobile-first responsive design
- Use CSS custom properties for theme values (colors, spacing) that change between themes
- Dark mode: use Tailwind dark: variant

## Accessibility
- All interactive elements must have appropriate ARIA attributes
- Images must have alt text
- Form inputs must have associated labels
- Focus states must be visible
- Color contrast must meet WCAG AA (4.5:1 for text, 3:1 for large text)

## Performance
- Prefer Server Components (no "use client" unless needed)
- Lazy load below-fold content
- Use next/image for all images
- Minimize JavaScript bundle: no unnecessary client-side libraries
```

---

## 15. Cursor Prompts for Each Build Phase

Use these prompts sequentially in Cursor's Composer/Agent mode. Each prompt corresponds to a build phase. Reference this PRD file in your prompt with @PRD.md.

### Phase 0: Scaffolding Prompt

```
@PRD.md Read the entire PRD. Initialize the project following Phase 0: Project Scaffolding.

Create a Next.js 15 project with TypeScript, Tailwind CSS 4, App Router, src/ directory.
Use pnpm as the package manager.

Install all dependencies listed in Section 6 of the PRD.
Set up the file structure from Section 11.
Create .env.example with all variables from Section 13.
Create all Cursor rule files from Section 14.
Configure Drizzle ORM with the database schema from Section 7.
Set up tailwind.config.ts with the typography specifications from Section 10.4.
Create a basic root layout and landing page placeholder.

Do not build any features yet. Focus only on tooling and configuration.
Verify the project starts with pnpm dev without errors.
```

### Phase 1: Authentication Prompt

```
@PRD.md Implement Phase 1: Authentication as described in Section 12.

Set up NextAuth.js v5 with the Drizzle adapter using the users table schema.
Configure Google OAuth, GitHub OAuth, and Email Magic Link (Resend) providers.
Build the login page at /login with provider buttons and email input.
Build the signup page at /signup with username selection.
Add username uniqueness validation with API check.
Create auth middleware protecting all /dashboard routes.
Create a session provider wrapper.

Follow the code conventions in .cursor/rules/index.mdc.
All forms must use React Hook Form with Zod validation.
```

### Phase 2: Dashboard Prompt

```
@PRD.md Implement Phase 2: Dashboard Shell as described in Section 12.

Build the dashboard layout at (dashboard)/layout.tsx with a responsive sidebar.
Sidebar navigation items: Sites, Account, Billing.
Create the dashboard home page showing an empty state.
Build the account settings page (edit name, username, avatar URL).
Use shadcn/ui components for all UI elements.
The sidebar should collapse to a hamburger menu on mobile.

Follow the component rules in .cursor/rules/components.mdc.
```

### Phase 3: Site CRUD Prompt

```
@PRD.md Implement Phase 3: Site CRUD as described in Section 12.

Build the "Create Site" form: site name input and first Notion URL input.
Auto-generate slug from site name using the slugify utility.
Validate Notion URLs match the pattern from Section 10.2.
Create all Site API routes: POST, PATCH, DELETE.
Build the site settings page with: name, slug, meta title, meta description.
Show site cards on the dashboard home page.
Enforce free tier limit of 1 site.

All API routes must validate with Zod schemas.
All API routes must check authentication.
Follow database query patterns in .cursor/rules/database.mdc.
```

### Phase 4: Notion Parser Prompt

```
@PRD.md Implement Phase 4: Notion Page Fetching and Parsing as described in Section 12.

This is the most complex phase. Build it file by file.

1. Build src/lib/notion/fetcher.ts:
   - Uses Playwright headless Chromium
   - Navigates to notion.site URL
   - Waits for [data-block-id] elements (30s timeout)
   - Returns full rendered HTML string
   - Closes browser after extraction

2. Build src/types/notion.ts:
   - Define interfaces for every block type listed in Section 8
   - Base NotionBlock interface with: id, type, has_children, children
   - RichTextSegment with: text, annotations (bold, italic, underline, strikethrough, code, color), href

3. Build src/lib/notion/parser.ts:
   - Uses Cheerio to parse HTML
   - Identifies Notion blocks by data-block-id attributes
   - Detects block types from CSS class patterns
   - Extracts rich text with annotations
   - Builds recursive block tree
   - Returns typed NotionBlock array

4. Build src/lib/notion/color-map.ts:
   - Maps Notion color names to CSS values for all 10 text and 10 background colors

5. Build src/lib/utils/hash.ts:
   - SHA-256 hash generation for content change detection

Follow the rules in .cursor/rules/notion-parser.mdc.
Write unit tests for the parser with sample HTML fixtures.
```

### Phase 5: Block Components Prompt

```
@PRD.md Implement Phase 5: Block Rendering Components as described in Section 12.

Build every component listed in Section 8.1 (Priority 1 blocks).
Start with rich-text.tsx and block-renderer.tsx first.
Then build each block component one at a time.

Apply the "minimal" theme typography from Section 10.4:
- Font: Inter, system-ui fallback
- Body: 16px, 1.75 line-height, #1a1a1a, 680px max-width
- H1: 36px, 1.2 line-height, 700 weight
- H2: 28px, 1.3 line-height, 600 weight
- H3: 22px, 1.4 line-height, 600 weight
- Code blocks: JetBrains Mono, 14px, #f5f5f5 bg, 8px border-radius
- Callouts: #f8f9fa bg, 1px solid #e2e8f0, 16px padding

Use Prism.js for code syntax highlighting with a copy button.
Toggle blocks need a client component for expand/collapse animation.
Group consecutive list items into ul/ol wrapper elements.

Follow the rules in .cursor/rules/components.mdc.
All components must support dark mode via Tailwind dark: variant.
```

### Phase 6: Page Management Prompt

```
@PRD.md Implement Phase 6: Page Management and Caching as described in Section 12.

Build the page management UI at /dashboard/sites/[siteId]/pages.
Create all Page API routes from Section 9.3.
Set up Redis caching with Upstash.
Implement the three-layer cache strategy from Section 10.6.

When a user adds a page:
1. Validate the Notion URL
2. Call fetcher.ts to get HTML
3. Call parser.ts to get blocks
4. Process images through image-processor.ts (Phase 8, stub for now)
5. Call renderer.ts to generate final HTML
6. Store in PostgreSQL and Redis

The refresh endpoint re-runs steps 2-6 and compares content hash.
Enforce per-tier page limits from Section 10.7.
```

### Phase 7: Public Site Prompt

```
@PRD.md Implement Phase 7: Public Site Rendering as described in Section 12.

Build the [username] route group rendering published sites.
Build site-layout, site-header, site-footer, site-navigation components.
Implement Next.js generateMetadata for SEO tags from Section 10.5.
Add JSON-LD structured data.
Build sitemap.xml and robots.txt route handlers.
Set Cache-Control headers from Section 10.6.
Add dark mode toggle using CSS custom properties.

The public site must:
- Load from Redis cache first, PostgreSQL second
- Render with zero client JS except toggle blocks and dark mode
- Score 95+ on Lighthouse Performance
- Have proper heading hierarchy (single H1)
- Include OG meta tags for social sharing
```

### Phases 8-14: Continue Pattern

Follow the same prompt structure for remaining phases. Reference the specific Section numbers in the PRD for each phase's requirements.

---

## 16. Required Setup Before Development

### 16.1 External Service Accounts

Create accounts and obtain API keys for:

1. **Vercel** (hosting) - vercel.com
2. **Supabase or Neon** (PostgreSQL) - supabase.com or neon.tech
3. **Upstash** (Redis) - upstash.com
4. **Stripe** (payments) - stripe.com
5. **Resend** (email) - resend.dev
6. **Cloudflare** (CDN + custom domains) - cloudflare.com
7. **Cloudflare R2 or AWS S3** (image storage) - cloudflare.com or aws.amazon.com
8. **Google Cloud Console** (OAuth credentials) - console.cloud.google.com
9. **GitHub** (OAuth app) - github.com/settings/developers
10. **Sentry** (error tracking) - sentry.io

### 16.2 Cursor Extensions and MCP Servers

**Required Cursor extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma / Drizzle (for schema highlighting)

**Recommended MCP servers to connect in Cursor:**
- **Playwright MCP** for automated browser testing (add to .cursor/mcp.json):
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```
- **Context7 MCP** for documentation fetching (keeps library docs in context):
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp@latest"]
    }
  }
}
```

### 16.3 Cursor Settings

Configure in Cursor settings:
- **Model:** Use Claude Sonnet 4.5 for implementation tasks, Claude Opus 4.6 for complex architecture decisions
- **Agent mode:** Enable for multi-file changes
- **Auto-apply:** Disable (review all changes before applying)
- **Privacy mode:** Enable if working with sensitive credentials

### 16.4 Local Development Prerequisites

- Node.js 22 LTS
- pnpm (latest)
- Docker (for local PostgreSQL if not using hosted)
- Git

---

## 17. Key Technical Decisions and Rationale

### 17.1 Why Playwright for Fetching (Not HTTP GET)

Notion's public pages render content via client-side JavaScript. A standard HTTP GET returns a shell HTML document with loading spinners. The actual content loads asynchronously through Notion's React application. Playwright's headless browser executes this JavaScript and returns the fully rendered DOM.

**Trade-off:** Playwright is heavier than a simple HTTP client. Each fetch takes 5-15 seconds instead of <1 second. This is acceptable because fetches happen infrequently (on page add and scheduled refresh), not on every visitor request. The cached result serves all subsequent visitors instantly.

### 17.2 Why Cheerio for Parsing (Not Notion API)

The product architecture avoids per-user Notion API integrations. Cheerio parses the publicly rendered HTML without any API tokens. This approach:
- Requires zero setup from users (no integration creation, no OAuth)
- Works with any published Notion page regardless of the publisher's Notion plan
- Has no per-user rate limits to manage
- Simplifies the entire authentication and authorization layer

**Trade-off:** HTML parsing is more fragile than API-based data retrieval. Notion could change their HTML structure at any time. Mitigation: parser tests against real Notion pages run in CI. When structure changes, tests fail immediately, triggering a parser update.

### 17.3 Why ISR Over Full SSG

Full static site generation would require rebuilding all pages whenever any single page changes. With hundreds of users and thousands of pages, rebuild times become prohibitive. ISR regenerates individual pages on-demand or at configured intervals, keeping the performance benefits of static HTML without the full-rebuild bottleneck.

### 17.4 Why Drizzle Over Prisma

Drizzle generates SQL that maps directly to TypeScript types with zero runtime overhead. Prisma's query engine adds ~2MB to the bundle and introduces a JavaScript-to-Rust bridge. For a Vercel-deployed Next.js app where cold start times matter, Drizzle's lighter footprint is preferable. Drizzle also provides better control over generated SQL for complex queries.

### 17.5 Why Separate Image Storage (R2/S3)

Notion-hosted images use temporary signed URLs that expire after approximately 1 hour. If the parser stores these URLs directly, images break for all visitors after expiration. Downloading images during the parse step and storing them permanently on CDN-backed object storage (R2 or S3) guarantees images remain available indefinitely regardless of Notion's URL policies.

---

## 18. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Notion changes HTML structure | Parser breaks for all users | Medium | Automated parser tests against real pages in CI. Alert on failure. Maintain parser versioning for quick rollback. |
| Notion blocks fetching from headless browsers | Content ingestion stops | Low | Implement user-agent rotation. Add fetch retry with exponential backoff. Fall back to Notion API as secondary ingestion path. |
| Playwright cold starts slow on Vercel | Page add/refresh takes 30+ seconds | Medium | Move Playwright to dedicated background worker (separate from Vercel functions). Consider Modal or Railway for browser workloads. |
| Image storage costs scale unexpectedly | Monthly costs exceed revenue | Low | Implement per-user image storage limits. Compress aggressively. Monitor R2 usage with alerts. |
| User publishes copyrighted content | Legal liability | Medium | Terms of service shift liability to users. Add reporting mechanism. Implement DMCA takedown process. |
| Redis cache eviction under load | Increased database queries | Low | PostgreSQL serves as persistent fallback. Monitor cache hit rates. Scale Redis tier if needed. |

---

## 19. Success Metrics (First 90 Days Post-Launch)

| Metric | Target |
|---|---|
| User signups | 500 |
| Sites created | 300 |
| Pages published | 1,500 |
| Paid conversions (free to Pro/Business) | 5% (25 paid users) |
| Monthly Recurring Revenue | $300-500 |
| Average Lighthouse Performance Score | 95+ across all published sites |
| Uptime | 99.9% |
| Average page load time (published sites) | < 1 second |
| Support tickets per week | < 10 |

---

## 20. Legal Requirements

- Terms of Service
- Privacy Policy
- Cookie Policy (if using analytics cookies)
- DMCA takedown procedure
- Data Processing Agreement (for GDPR compliance if serving EU users)
- Stripe terms acceptance in checkout flow

---

*End of PRD. This document serves as the single source of truth for the NotionHost product. Reference specific sections when prompting Cursor for implementation work.*


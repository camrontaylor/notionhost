import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  bigserial,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 63 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: false }),
  image: text("avatar_url"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("active"),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: false }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: false }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { withTimezone: false }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const sites = pgTable("sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  customDomain: varchar("custom_domain", { length: 255 }),
  customDomainVerified: boolean("custom_domain_verified").default(false),
  theme: varchar("theme", { length: 50 }).default("minimal"),
  customCss: text("custom_css"),
  faviconUrl: text("favicon_url"),
  ogImageUrl: text("og_image_url"),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  navbarLinks: jsonb("navbar_links").notNull().default(sql`'[]'::jsonb`).$type<unknown>(),
  footerText: text("footer_text"),
  googleAnalyticsId: varchar("google_analytics_id", { length: 50 }),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
});

export const pages = pgTable("pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  notionUrl: text("notion_url").notNull(),
  pageSlug: varchar("page_slug", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }),
  description: varchar("description", { length: 1000 }),
  ogImageUrl: text("og_image_url"),
  parsedBlocks: jsonb("parsed_blocks").$type<unknown>(),
  renderedHtml: text("rendered_html"),
  contentHash: varchar("content_hash", { length: 64 }),
  isHomepage: boolean("is_homepage").default(false),
  isPublished: boolean("is_published").default(true),
  sortOrder: integer("sort_order").default(0),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: false }),
  lastChangedAt: timestamp("last_changed_at", { withTimezone: false }),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
});

export const cachedImages = pgTable("cached_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  originalUrl: text("original_url").notNull(),
  cachedUrl: text("cached_url").notNull(),
  width: integer("width"),
  height: integer("height"),
  format: varchar("format", { length: 10 }).default("webp"),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  pageId: uuid("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  visitorIpHash: varchar("visitor_ip_hash", { length: 64 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: varchar("country", { length: 2 }),
  viewedAt: timestamp("viewed_at", { withTimezone: false }).defaultNow(),
});


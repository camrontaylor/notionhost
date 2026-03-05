import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            NotionHost
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Sign in
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="px-6 py-24 text-center sm:py-32">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Notion pages, production docs
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-600">
              Paste a public Notion URL. Get a fast, SEO-optimized documentation
              site. No API keys, no OAuth, no setup.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">Start free</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-white px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-semibold text-zinc-900">
              Built for speed and search
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 p-6">
                <div className="text-sm font-semibold text-zinc-900">
                  No API setup
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Paste a public notion.site URL. We fetch and render. No
                  integrations to configure.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-6">
                <div className="text-sm font-semibold text-zinc-900">
                  SEO that works
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Clean URLs, meta tags, sitemaps, and structured data. Pages
                  that actually show up in search.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-6">
                <div className="text-sm font-semibold text-zinc-900">
                  Fast by default
                </div>
                <p className="mt-2 text-sm text-zinc-600">
                  Cached HTML, optimized images, minimal JS. Lighthouse scores
                  95+ out of the box.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200 px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-zinc-900">
              Ready to ship your docs?
            </h2>
            <p className="mt-4 text-zinc-600">
              Free tier: 1 site, 5 pages. Upgrade when you need more.
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg">Create your first site</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-zinc-500">
          NotionHost. Turn Notion into docs.
        </div>
      </footer>
    </div>
  );
}

export default async function UserSitePage({
  params,
}: {
  params: Promise<{ username: string; pageSlug: string }>;
}) {
  const { username, pageSlug } = await params;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <a href={`/${username}`} className="font-semibold text-zinc-900">
            {username}
          </a>
          <nav className="flex gap-6 text-sm text-zinc-600">
            <a href={`/${username}`} className="hover:text-zinc-900">
              Home
            </a>
            <a
              href={`/${username}/${pageSlug}`}
              className="font-medium text-zinc-900"
            >
              {pageSlug}
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-prose-docs px-6 py-12">
        <h1 className="text-docs-h1 font-bold text-zinc-900">
          {pageSlug.replace(/-/g, " ")}
        </h1>
        <p className="mt-4 text-body text-zinc-600">
          Individual page content will render here. The layout includes a
          header, sidebar navigation (when you have multiple pages), and
          typography tuned for documentation.
        </p>
      </main>

      <footer className="mt-24 border-t border-zinc-200 py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-zinc-500">
          Powered by NotionHost
        </div>
      </footer>
    </div>
  );
}

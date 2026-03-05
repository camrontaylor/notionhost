export default async function UserSiteHomePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
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
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-prose-docs px-6 py-12">
        <h1 className="text-docs-h1 font-bold text-zinc-900">
          Welcome to {username}&apos;s docs
        </h1>
        <p className="mt-4 text-body text-zinc-600">
          This is the public docs layout. Once you connect a Notion page, your
          content will render here with proper typography, code blocks, and
          navigation.
        </p>
        <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm text-zinc-700">
          <code>{"// Example code block styling"}</code>
        </div>
      </main>

      <footer className="mt-24 border-t border-zinc-200 py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-zinc-500">
          Powered by NotionHost
        </div>
      </footer>
    </div>
  );
}

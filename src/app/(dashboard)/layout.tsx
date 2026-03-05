import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-6 py-10">
        <aside className="w-56 shrink-0">
          <div className="sticky top-10 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <Link
              href="/"
              className="block text-sm font-semibold text-zinc-900 hover:text-zinc-600"
            >
              NotionHost
            </Link>
            <nav className="mt-6 space-y-0.5 text-sm">
              <Link
                href="/dashboard"
                className="block rounded-lg px-3 py-2 font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/sites/new"
                className="block rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                New site
              </Link>
              <Link
                href="/dashboard/account"
                className="block rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                Account
              </Link>
              <Link
                href="/dashboard/billing"
                className="block rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                Billing
              </Link>
            </nav>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardHomePage() {
  const sites: { id: string; name: string; slug: string }[] = [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Manage your documentation sites
        </p>
      </div>

      {sites.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl">📄</div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900">
            No sites yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-600">
            Create your first site by pasting a public Notion page URL. We’ll
            fetch the content and turn it into a fast, SEO-friendly docs site.
          </p>
          <Link href="/dashboard/sites/new" className="mt-6">
            <Button size="lg">Create your first site</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sites.map((site) => (
            <Link key={site.id} href={`/dashboard/sites/${site.id}`}>
              <Card className="p-6 transition-colors hover:border-zinc-300">
                <div className="font-semibold text-zinc-900">{site.name}</div>
                <div className="mt-1 text-sm text-zinc-500">
                  notionhost.com/{site.slug}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function NewSitePage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Create a new site
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Add your first Notion page to get started
        </p>
      </div>

      <Card className="p-8">
        <form className="space-y-6">
          <Input
            label="Site name"
            name="name"
            placeholder="My Documentation"
            required
          />
          <Input
            label="Notion page URL"
            name="notionUrl"
            type="url"
            placeholder="https://yoursite.notion.site/..."
            required
          />
          <p className="text-sm text-zinc-500">
            Paste a public Notion page URL. The page must be published to the
            web (Share → Publish).
          </p>
          <div className="flex gap-3">
            <Button type="submit">Create site</Button>
            <Link href="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

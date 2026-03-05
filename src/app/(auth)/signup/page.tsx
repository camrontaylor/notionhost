import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Enter your email and we’ll send you a magic link to get started.
      </p>

      {!hasDatabase ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-medium">Database not configured</div>
          <p className="mt-1 text-amber-800">
            Set{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5">
              DATABASE_URL
            </code>{" "}
            before testing sign-up.
          </p>
        </div>
      ) : null}

      <form
        action="/api/auth/signin/email"
        method="post"
        className="mt-6 space-y-4"
      >
        <Input
          label="Email"
          name="email"
          type="email"
          required
          disabled={!hasDatabase}
          placeholder="you@domain.com"
        />
        <Button type="submit" className="w-full" disabled={!hasDatabase}>
          Email me a sign-up link
        </Button>
      </form>

      <p className="mt-6 text-sm text-zinc-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-zinc-950 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}

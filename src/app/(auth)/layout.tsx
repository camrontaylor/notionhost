import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← NotionHost
        </Link>
        {children}
      </div>
    </div>
  );
}

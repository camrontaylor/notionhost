import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  if (!db) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL is not configured" },
      { status: 500 },
    );
  }

  try {
    // Simple sanity query to verify connectivity
    await db.execute("select 1");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Database connection failed" },
      { status: 500 },
    );
  }
}


import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  if (!process.env.DATABASE_URL) {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/dashboard") && !req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};


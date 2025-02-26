import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/utils";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Ensure token is a string
  const userId = token ? await verifyToken(token) : null;
  const { pathname } = req.nextUrl;

  if (
    pathname.includes("/api/login") ||
    userId ||
    pathname.includes("/static")
  ) {
    return NextResponse.next();
  }

  if (!token || !userId) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

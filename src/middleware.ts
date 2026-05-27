import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (request.method !== "GET") {
    return NextResponse.next();
  }

  const accessCookie = request.cookies.get("strength_crm_access")?.value;
  const accessPassword = process.env.CRM_ACCESS_PASSWORD;

  if (!accessPassword) {
    return NextResponse.next();
  }

  if (accessCookie === accessPassword) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

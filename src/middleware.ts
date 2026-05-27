import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/login", "/setup"];

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.includes(".")
  );
}

function isPageNavigation(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  if (request.headers.get("next-action")) return false;
  if (request.headers.get("rsc")) return false;
  if (request.nextUrl.searchParams.has("_rsc")) return false;

  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    isPublicAsset(pathname)
  ) {
    return NextResponse.next();
  }

  // Server Actions, form submits, RSC fetches, and client transitions must not be redirected here.
  // The page loaders and server actions enforce the real role/ownership checks.
  if (!isPageNavigation(request)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

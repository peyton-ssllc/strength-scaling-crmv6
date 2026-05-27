import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function env(value: string | undefined) {
  return String(value || "").trim();
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const publicPath =
    pathname === "/login" ||
    pathname === "/setup" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/health");

  const supabaseUrl = env(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = env(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !anonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, anonKey, {
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
      }
    }
  });

  const { data } = await supabase.auth.getUser();

  if (data.user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/queue";
    return NextResponse.redirect(url);
  }

  // Protect page visits, but do not hijack POST/PUT/etc. server actions.
  // Server action redirects to /login were causing CRM buttons to feel broken.
  if (!data.user && !publicPath && request.method === "GET") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

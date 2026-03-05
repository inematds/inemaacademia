import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/sobre",
  "/explorar",
  "/auth/callback",
];

const authPaths = ["/login", "/register", "/forgot-password"];

const isPublicPath = (pathname: string) =>
  publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

const isAuthPath = (pathname: string) =>
  authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

function getRoleRedirect(role: string): string {
  switch (role) {
    case "professor":
      return "/professor";
    case "admin":
      return "/admin";
    default:
      return "/aluno";
  }
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated user trying to access protected route
  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to access auth pages -> redirect by role
  if (user && isAuthPath(request.nextUrl.pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "aluno";
    const url = request.nextUrl.clone();
    url.pathname = getRoleRedirect(role);
    return NextResponse.redirect(url);
  }

  return response;
}

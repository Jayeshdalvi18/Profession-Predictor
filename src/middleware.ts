import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // If user is logged in as a guest, redirect to homepage
  if (token && token.isGuest) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If user is logged in (including via Google or GitHub), redirect to homepage
  if (token) {
    if (pathname === "/signIn" || pathname === "/signUp" || pathname.startsWith("/verify")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    // Additional check for Google or GitHub login
    if (token.provider === "google" || token.provider === "github") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // If user is not logged in, protect the home route
  if (!token && pathname === "/") {
    return NextResponse.redirect(new URL("/signIn", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/signIn", "/signUp", "/verify/:path*"],
}
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Check if user is already logged in
  if (token) {
    const isGuest = token.isGuest
    const isOAuthUser = token.provider === "google" || token.provider === "github"
    const isNormalUser = !isGuest && !isOAuthUser

    // Prevent multiple logins
    if (pathname === "/signIn" || pathname === "/signUp") {
      if (isGuest || isOAuthUser || isNormalUser) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Ensure guests cannot log in again
    if (isGuest && (pathname === "/signIn" || pathname === "/signUp")) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Ensure authenticated users (OAuth/Normal) cannot use Guest Login
    if (!isGuest && pathname === "/guest") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next() // Allow request if none of the conditions matched
}

export const config = {
  matcher: ["/", "/signIn", "/signUp", "/verify/:path*", "/guest"]
}

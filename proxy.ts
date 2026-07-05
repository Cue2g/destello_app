import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl

  const publicPaths = ["/login", "/api/auth"]
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

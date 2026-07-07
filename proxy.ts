import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const publicPaths = ["/", "/login", "/api/auth"]
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return Response.redirect(loginUrl)
  }

  // Redirect ADMIN away from /panel, CLIENT away from /admin
  if (session.user.role === "ADMIN" && pathname.startsWith("/panel")) {
    const adminUrl = new URL("/admin", req.url)
    return Response.redirect(adminUrl)
  }

  if (session.user.role === "CLIENT" && pathname.startsWith("/admin")) {
    const panelUrl = new URL("/panel", req.url)
    return Response.redirect(panelUrl)
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

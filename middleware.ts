import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
        const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')
        const isPublicRoute = !isAdminRoute && !isAuthRoute

        // Allow public routes
        if (isPublicRoute) {
          return true
        }

        // Admin routes require authentication
        if (isAdminRoute) {
          return !!token && token.role === 'ADMIN'
        }

        // Auth routes are public
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}


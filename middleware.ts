import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const path = request.nextUrl.pathname

  // Ana sayfa kontrolü - token varsa dashboard'a yönlendir
  if (token && path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Dashboard kontrolü - token yoksa ana sayfaya yönlendir
  if (!token && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Admin sayfaları kontrolü
  if (token && (path === '/dashboard/user' || path === '/dashboard/profile')) {
    try {
      const decoded = jwtDecode(token.value) as { role?: string }
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Hem ana sayfa hem de dashboard için middleware'i çalıştır
export const config = {
  matcher: ['/', '/dashboard/:path*']
}

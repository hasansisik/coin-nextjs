import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  return NextResponse.next()
}

// Hem ana sayfa hem de dashboard için middleware'i çalıştır
export const config = {
  matcher: ['/', '/dashboard/:path*']
}

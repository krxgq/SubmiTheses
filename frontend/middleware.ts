import { NextRequest, NextResponse } from 'next/server'
import { i18n } from './src/lib/i18n-config'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip for static files and API routes
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale
  const hasLocale = i18n.locales.some(locale =>
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If no locale, redirect to default locale
  if (!hasLocale) {
    return NextResponse.redirect(new URL(`/${i18n.defaultLocale}${pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
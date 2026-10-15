import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  /**
   * 301s from the old Laravel site. The core routes (/about, /contact, /login,
   * /register, /forgot-password) keep the same paths, so they need no redirect.
   * These catch legacy paths and image URLs that may be indexed or bookmarked.
   */
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/index.php/:path*', destination: '/:path*', permanent: true },
      { source: '/dashboard', destination: '/account', permanent: true },
      { source: '/profile', destination: '/account', permanent: true },
      { source: '/user/profile', destination: '/account', permanent: true },
      { source: '/password/reset', destination: '/forgot-password', permanent: true },
      {
        source: '/reset-password/:token',
        destination: '/reset-password?token=:token',
        permanent: true,
      },
      { source: '/service', destination: '/services', permanent: true },
      { source: '/product', destination: '/products', permanent: true },
      { source: '/shop', destination: '/products', permanent: true },
      {
        source: '/images/19-litter.jpg',
        destination: '/images/products/19-litre.jpg',
        permanent: true,
      },
      {
        source: '/images/logo-1.png',
        destination: '/images/brand/logo-light.png',
        permanent: true,
      },
    ]
  },
}

export default withNextIntl(nextConfig)

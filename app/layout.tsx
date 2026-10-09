import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { AppShell } from '@/components/layout/app-shell'
import { Providers } from '@/components/providers'
import { APP_NAME, APP_SHORT_NAME } from '@/lib/branding'

const manrope = localFont({
  src: '../public/fonts/manrope-latin.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '400 800',
})

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_SHORT_NAME}` },
  description: 'Kelola nomor WhatsApp, percakapan, kontak, dan otomasi dari satu ruang kerja mandiri.',
  keywords: ['panel whatsapp', 'multi nomor', 'percakapan', 'otomasi', 'MultiWA'],
  manifest: '/manifest.webmanifest',
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_SHORT_NAME, statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/icon.svg'],
  },
}

export const viewport: Viewport = { themeColor: '#17261f', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={manrope.variable}>
      <body className="min-h-dvh"><Providers><AppShell>{children}</AppShell></Providers></body>
    </html>
  )
}

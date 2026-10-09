import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { safeNextPath } from '../lib/navigation'
import { formatErrorMessage } from '../lib/error-messages'

const root = fileURLToPath(new URL('../', import.meta.url))
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8')

test('local destinations after login retain the path, query, and hash', () => {
  for (const value of ['/', '/docs#keamanan', '/chat/device?chat=message&focus=one', '/pair?session=number']) assert.equal(safeNextPath(value), value)
})
test('external URLs, scripts, escaped redirects, and login loops are rejected', () => {
  for (const value of [null, '', 'javascript:alert(1)', 'https://example.com', '//example.com', '/\\example.com', '/%2f%2fexample.com', '/%5cexample.com', '/login', '/login?next=/', '/login/again', '/%00invalid', '/%invalid']) assert.equal(safeNextPath(value), '/', String(value))
})
test('common errors are localized while details and identifiers are preserved', () => {
  assert.equal(formatErrorMessage('Chat not found'), 'Percakapan tidak ditemukan.')
  assert.match(formatErrorMessage('Session for +6281234567890 already exists'), /6281234567890.*sudah ditambahkan/)
  assert.equal(formatErrorMessage('Failed to get pairing code: Connection Closed'), 'Kode penautan belum tersedia: Koneksi WhatsApp terputus. Coba sambungkan ulang.')
  assert.match(formatErrorMessage('phoneNumber: Phone number is too short'), /Nomor WhatsApp: Nomor WhatsApp terlalu pendek/)
  assert.match(formatErrorMessage('File too large. Maximum 64 MB.'), /64 MB/)
  assert.equal(formatErrorMessage('Pola regex tidak valid'), 'Pola regex tidak valid')
})
test('PWA identity and icon references are complete', () => {
  const manifest = JSON.parse(read('public/manifest.webmanifest'))
  assert.equal(manifest.name, 'MultiWA Workspace')
  assert.equal(manifest.short_name, 'MultiWA')
  assert.equal(manifest.lang, 'id')
  for (const icon of manifest.icons) assert.ok(fs.existsSync(path.join(root, 'public', icon.src)))
  assert.ok(manifest.shortcuts.some((item: { url: string }) => item.url === '/percakapan'))
  assert.ok(read('public/icon.svg').includes('fill="#c9edaa"'))
})
test('the font is self-hosted, valid WOFF2, and shipped with its license', () => {
  const font = fs.readFileSync(path.join(root, 'public/fonts/manrope-latin.woff2'))
  assert.equal(font.subarray(0, 4).toString(), 'wOF2')
  assert.ok(read('public/fonts/OFL-Manrope.txt').includes('SIL OPEN FONT LICENSE'))
  assert.ok(read('app/layout.tsx').includes("from 'next/font/local'"))
  assert.ok(!read('app/layout.tsx').includes('maximumScale'))
})
test('visible product surfaces have no legacy personal credit', () => {
  for (const file of ['app/page.tsx', 'app/login/page.tsx', 'app/layout.tsx', 'app/(pages)/docs/page.tsx', 'components/layout/app-shell.tsx', 'lib/branding.ts', 'next.config.mjs', 'public/manifest.webmanifest', '.env.example']) {
    assert.ok(!/Rifk[yi]|DEVELOPER_CREDIT|Dibuat oleh/i.test(read(file)), file)
  }
})
test('service worker excludes private API traffic and precaches actual files', () => {
  const worker = read('public/sw.js')
  assert.ok(worker.includes("url.pathname.startsWith('/api/')"))
  assert.ok(worker.includes("cache.addAll(['/icon.svg', '/manifest.webmanifest', '/fonts/manrope-latin.woff2', '/brand/mark.svg'])"))
  assert.ok(worker.includes('multiwa-workspace-v4'))
})

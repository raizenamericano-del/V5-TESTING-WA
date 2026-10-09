/**
 * Service worker MultiWA Workspace.
 *
 * 1. Web Push  → notifikasi pesan baru walau panel/browser ditutup.
 * 2. Offline   → aset statis di-cache agar panel tetap terbuka saat sinyal buruk.
 *
 * Tidak pernah meng-cache respons API (data chat selalu segar dari server).
 */

const CACHE = 'multiwa-workspace-v4'
const STATIC_PREFIXES = ['/_next/static/', '/icon', '/apple-touch-icon', '/manifest.webmanifest', '/fonts/', '/brand/']
const OFFLINE_HTML = `<!doctype html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#17261f">
<title>Koneksi terputus · MultiWA</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f6f8f5;color:#26372a;font-family:system-ui,sans-serif;text-align:center;padding:24px}
main{max-width:390px;padding:40px 30px;background:white;border:1px solid #e1e8dc;border-radius:20px}svg{width:48px;height:48px;margin-bottom:20px}h1{font-size:22px;letter-spacing:-.5px}p{color:#77806f;font-size:13px;line-height:1.8}button{margin-top:16px;border:0;border-radius:8px;padding:12px 20px;background:#2a704b;color:white;font-weight:600;cursor:pointer}
</style></head><body><main><svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#c9edaa"/><path d="M12 31V17a3 3 0 0 1 5.25-1.98L24 22.5l6.75-7.48A3 3 0 0 1 36 17v14h-6V23l-6 6.6-6-6.6v8h-6Z" fill="#173426"/></svg><h1>Koneksi sedang terputus</h1><p>MultiWA memerlukan koneksi ke server untuk menampilkan percakapan terbaru. Periksa jaringan Anda, lalu coba kembali.</p><button type="button" onclick="location.reload()">Muat ulang</button></main></body></html>`

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['/icon.svg', '/manifest.webmanifest', '/fonts/manrope-latin.woff2', '/brand/mark.svg']).catch(() => undefined))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Jangan pernah cache API (data chat harus selalu segar).
  if (url.pathname.startsWith('/api/') || url.pathname === '/healthz') return

  // Aset statis Next + ikon: cache-first (immutable).
  if (STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              void caches.open(CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
    return
  }

  // Navigasi halaman: network-first, fallback halaman offline sederhana.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_HTML, {
            status: 200,
            headers: { 'content-type': 'text/html; charset=utf-8' },
          }),
      ),
    )
  }
})

/* --------------------------------- Web Push -------------------------------- */

self.addEventListener('push', (event) => {
  let data = {
    title: 'MultiWA Workspace',
    body: 'Ada pesan baru',
    url: '/',
    tag: 'wa-controller',
    viewOnce: false,
  }

  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    if (event.data) data.body = event.data.text()
  }

  const target = data.url || '/'
  const options = {
    body: data.body,
    tag: data.tag || 'wa-controller',
    renotify: false,
    badge: '/icon-192.png',
    icon: '/icon-192.png',
    data: { url: target, chatId: data.chatId, sessionId: data.sessionId },
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Pesan baru', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url)
          if (clientUrl.origin === self.location.origin) {
            client.postMessage({ type: 'notify-click', url })
            return client.focus()
          }
        } catch {
          /* lanjut ke klien berikutnya */
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

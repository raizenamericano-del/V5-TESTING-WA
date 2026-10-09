/** Batasi tujuan setelah login ke path lokal; tolak skema URL dan redirect eksternal. */
export function safeNextPath(value?: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u001f]/.test(value)) return '/'
  try {
    const decoded = decodeURIComponent(value)
    if (decoded.startsWith('//') || /[\\\u0000-\u001f]/.test(decoded)) return '/'
    const url = new URL(value, 'https://workspace.invalid')
    if (url.origin !== 'https://workspace.invalid' || url.pathname === '/login' || url.pathname.startsWith('/login/')) return '/'
    return `${url.pathname}${url.search}${url.hash}`
  } catch { return '/' }
}

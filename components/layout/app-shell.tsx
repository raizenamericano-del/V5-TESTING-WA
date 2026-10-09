'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useSWR, { useSWRConfig } from 'swr'
import {
  ArrowRight, BarChart3, Bell, BookOpen, ChevronRight, ContactRound,
  HelpCircle, LayoutDashboard, LogOut, Menu, MessagesSquare, Search,
  Send, ShieldAlert, Smartphone, Volume2, Workflow, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { APP_SHORT_NAME, APP_VERSION } from '@/lib/branding'
import { api } from '@/lib/fetcher'
import { cn } from '@/lib/utils'
import { useSessions } from '@/hooks/use-api'
import { useNotifications } from '@/hooks/use-notifications'
import { usePush } from '@/hooks/use-push'
import { useSocket } from '@/hooks/use-socket'

const WORKSPACE_NAV = [
  { href: '/', label: 'Ikhtisar', icon: LayoutDashboard },
  { href: '/percakapan', label: 'Percakapan', icon: MessagesSquare },
  { href: '/#sessions', label: 'Perangkat', icon: Smartphone },
  { href: '/kontak', label: 'Kontak', icon: ContactRound },
  { href: '/otomatis', label: 'Otomasi', icon: Workflow },
  { href: '/analitik', label: 'Analitik', icon: BarChart3 },
]
const SUPPORT_NAV = [
  { href: '/notifikasi', label: 'Notifikasi', icon: Bell },
  { href: '/docs', label: 'Panduan', icon: BookOpen },
]
const ALL_NAV = [...WORKSPACE_NAV, ...SUPPORT_NAV, { href: '/pair', label: 'Hubungkan nomor', icon: Smartphone }]

interface AuthStatus { authEnabled: boolean; authenticated: boolean; username: string | null }

function ConnectionIndicator({ compact = false }: { compact?: boolean }) {
  const { connected } = useSocket()
  return (
    <div className={cn('flex items-center gap-2 text-[10px]', compact ? 'text-muted-foreground' : 'text-[#a2b1a6]')}
      title={connected ? 'Pembaruan waktu nyata aktif' : 'Koneksi waktu nyata terputus; data disinkronkan secara berkala'} role="status">
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', connected ? 'bg-[#a9d780]' : 'bg-amber-500')} />
      <span>{connected ? 'Sinkronisasi aktif' : 'Menyambungkan ulang'}</span>
    </div>
  )
}

function AccountBox() {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { data } = useSWR<AuthStatus>('/api/auth/status')
  const [loading, setLoading] = React.useState(false)
  const username = data?.username || 'Administrator'
  return (
    <div className="mt-4 flex items-center gap-2.5 border-t border-white/10 pt-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-[12px] font-bold text-[#cad9c6]">
        {data?.authEnabled ? username.slice(0, 2).toUpperCase() : 'MW'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold">{data?.authEnabled ? username : APP_SHORT_NAME}</p>
        <p className="mt-0.5 text-[9px] text-[#91a197]">{data?.authEnabled ? 'Pengelola ruang kerja' : 'Autentikasi belum aktif'}</p>
      </div>
      {data?.authEnabled ? (
        <button type="button" disabled={loading} aria-label="Keluar dari akun" title="Keluar dari akun"
          className="rounded-lg p-2 text-[#9aaa9e] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
          onClick={async () => {
            setLoading(true)
            try {
              await api.post('/api/auth/logout')
              await mutate((key) => typeof key === 'string' && key.startsWith('/api/') && key !== '/api/auth/status', undefined, { revalidate: false })
              await mutate('/api/auth/status')
              router.replace('/login')
              router.refresh()
              toast.success('Anda telah keluar dari ruang kerja')
            } catch { toast.error('Tidak dapat keluar. Silakan coba lagi.') }
            finally { setLoading(false) }
          }}><LogOut className="h-4 w-4" /></button>
      ) : <Link href="/docs#keamanan" className="rounded-lg p-2 text-[#9aaa9e] hover:text-white" aria-label="Aktifkan keamanan panel"><ShieldAlert className="h-4 w-4" /></Link>}
    </div>
  )
}

function OpenPanelWarning() {
  const { data } = useSWR<AuthStatus>('/api/auth/status')
  const [dismissed, setDismissed] = React.useState(false)
  if (!data || data.authEnabled || dismissed) return null
  return (
    <div className="flex shrink-0 items-start gap-2.5 border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-[11px] text-amber-900 lg:px-9" role="alert">
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p className="flex-1 leading-relaxed"><strong>Akses panel belum dilindungi.</strong> Atur <code>AUTH_PASSWORD</code> untuk mengamankan percakapan. <Link href="/docs#keamanan" className="font-semibold underline underline-offset-2">Lihat panduan</Link></p>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Tutup peringatan keamanan" className="rounded p-0.5 hover:bg-amber-100"><X className="h-3.5 w-3.5" /></button>
    </div>
  )
}

function NotificationPreferences({ unread }: { unread: number }) {
  const { settings, permission, toggleSound, toggleDesktop } = useNotifications()
  const { status, busy, message, subscriptions, enable, disable, sendTest } = usePush()
  const active = status === 'on'
  const pushLabels: Record<string, string> = { loading: 'Memeriksa perangkat', on: 'Aktif', off: 'Nonaktif', denied: 'Izin diblokir', unsupported: 'Tidak didukung', 'ios-install': 'Perlu dipasang ke layar utama', error: 'Gagal diaktifkan' }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="topbar-icon" aria-label="Preferensi notifikasi" title="Preferensi notifikasi">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.7} />
          {unread > 0 && <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-white" />}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Preferensi notifikasi</DialogTitle><DialogDescription>Pengaturan ini hanya berlaku pada perangkat yang sedang Anda gunakan.</DialogDescription></DialogHeader>
        <div className="divide-y divide-border">
          <div className="flex items-center gap-3 py-4">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1"><p className="text-[13px] font-semibold">Suara pesan masuk</p><p className="mt-0.5 text-[11px] text-muted-foreground">Putar suara saat pesan baru diterima.</p></div>
            <button type="button" className="notification-switch" role="switch" aria-checked={settings.sound} aria-label="Suara pesan masuk" onClick={() => { const on = toggleSound(); toast.success(on ? 'Suara notifikasi diaktifkan' : 'Suara notifikasi dinonaktifkan') }} />
          </div>
          <div className="flex items-center gap-3 py-4">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1"><p className="text-[13px] font-semibold">Notifikasi desktop</p><p className="mt-0.5 text-[11px] text-muted-foreground">Tampilkan pemberitahuan saat panel terbuka.</p></div>
            <button type="button" className="notification-switch" role="switch" aria-checked={settings.desktop} aria-label="Notifikasi desktop" onClick={async () => {
              if (permission === 'unsupported') { toast.error('Browser ini tidak mendukung notifikasi desktop'); return }
              const on = await toggleDesktop()
              toast.info(on ? 'Notifikasi desktop diaktifkan' : 'Notifikasi desktop nonaktif', { description: !on && Notification.permission === 'denied' ? 'Izinkan notifikasi melalui pengaturan situs di browser.' : undefined })
            }} />
          </div>
          <div className="flex items-center gap-3 py-4">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1"><p className="text-[13px] font-semibold">Notifikasi push</p><p className="mt-0.5 text-[11px] text-muted-foreground">Tetap terima pemberitahuan setelah panel ditutup.</p><p className="mt-1 text-[10px] font-medium text-primary">{pushLabels[status]}</p></div>
            <button type="button" className="notification-switch" role="switch" aria-checked={active} aria-label="Notifikasi push" disabled={busy || ['loading', 'unsupported', 'ios-install'].includes(status)}
              onClick={async () => {
                const ok = active ? await disable() : await enable()
                if (ok) toast.success(active ? 'Notifikasi push dinonaktifkan' : 'Notifikasi push diaktifkan')
                else toast.error(message || 'Tidak dapat mengubah notifikasi push')
              }} />
          </div>
        </div>
        {message && <p className="rounded-lg bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">{message}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <Button variant="ghost" size="sm" asChild><Link href="/notifikasi">Pengaturan lengkap <ArrowRight /></Link></Button>
          {active && <Button variant="secondary" size="sm" disabled={busy} onClick={async () => {
            try { const result = await sendTest(); if (result.sent) toast.success(`Notifikasi percobaan terkirim ke ${result.sent} perangkat`); else toast.error('Tidak ada perangkat yang menerima. Periksa diagnostik notifikasi.') }
            catch (error) { toast.error(error instanceof Error ? error.message : 'Gagal mengirim percobaan') }
          }}><Send /> Uji {subscriptions > 0 ? `(${subscriptions})` : ''}</Button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function QuickSearch({ isChatRoute }: { isChatRoute: boolean }) {
  const router = useRouter()
  const { sessions } = useSessions()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  React.useEffect(() => {
    if (isChatRoute) return
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen((value) => !value) }
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [isChatRoute])
  const needle = query.toLowerCase().trim()
  const menus = ALL_NAV.filter((item) => !needle || item.label.toLowerCase().includes(needle))
  const devices = sessions.filter((item) => !needle || `${item.name} ${item.phoneNumber} ${item.pushName || ''}`.toLowerCase().includes(needle))
  const go = (href: string) => { setOpen(false); setQuery(''); router.push(href) }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><button type="button" className="topbar-search" aria-label="Cari menu atau perangkat"><Search className="h-3.5 w-3.5" /><span>Cari menu atau perangkat</span>{!isChatRoute && <kbd className="topbar-key">Ctrl K</kbd>}</button></DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Pencarian ruang kerja</DialogTitle><DialogDescription>Buka menu atau percakapan dari perangkat yang tersimpan.</DialogDescription></DialogHeader>
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Nama menu, perangkat, atau nomor…" aria-label="Kata kunci pencarian ruang kerja" /></div>
        <div className="scrollbar-thin max-h-[50dvh] overflow-y-auto">
          {menus.length > 0 && <><p className="eyebrow mb-2 mt-2">Navigasi</p>{menus.map((item) => <button type="button" key={item.href} onClick={() => go(item.href)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] hover:bg-muted"><item.icon className="h-4 w-4 text-muted-foreground" />{item.label}<ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" /></button>)}</>}
          {devices.length > 0 && <><p className="eyebrow mb-2 mt-5">Perangkat WhatsApp</p>{devices.map((item) => <button type="button" key={item.id} onClick={() => go(`/chat/${item.id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted"><Smartphone className="h-4 w-4 text-primary" /><span className="min-w-0"><span className="block truncate text-[13px] font-medium">{item.name}</span><span className="text-[11px] text-muted-foreground">+{item.phoneNumber}</span></span><ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" /></button>)}</>}
          {menus.length === 0 && devices.length === 0 && <p className="py-10 text-center text-[13px] text-muted-foreground">Tidak ada hasil untuk “{query}”.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WorkspaceShell({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [hash, setHash] = React.useState('')
  const { sessions } = useSessions()
  const unread = sessions.reduce((sum, item) => sum + item.stats.unread, 0)
  const isChatRoute = pathname.startsWith('/chat/')
  React.useEffect(() => {
    setMenuOpen(false)
    setHash(window.location.hash)
    const changed = () => setHash(window.location.hash)
    window.addEventListener('hashchange', changed)
    return () => window.removeEventListener('hashchange', changed)
  }, [pathname])
  const isActive = (href: string) => {
    if (href === '/#sessions') return pathname === '/pair' || (pathname === '/' && hash === '#sessions')
    if (href === '/') return pathname === '/' && hash !== '#sessions'
    if (href === '/percakapan') return pathname === href || isChatRoute
    return pathname.startsWith(href)
  }
  const currentLabel = pathname === '/pair' ? 'Hubungkan nomor' : isChatRoute ? 'Percakapan' : [...WORKSPACE_NAV, ...SUPPORT_NAV].find((item) => isActive(item.href))?.label || 'Ruang kerja'
  const navigation = (items: typeof WORKSPACE_NAV) => items.map((item) => (
    <Link key={item.href} href={item.href} className="sidebar-link" data-active={isActive(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}
      onClick={() => { setMenuOpen(false); setHash(item.href === '/#sessions' ? '#sessions' : '') }}>
      <item.icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.65} />{item.label}
      {item.href === '/#sessions' && sessions.length > 0 && <span className="sidebar-count">{sessions.length}</span>}
      {item.href === '/percakapan' && unread > 0 && <span className="sidebar-count">{unread > 99 ? '99+' : unread}</span>}
    </Link>
  ))
  const sidebar = (
    <div className="sidebar-inner">
      <Link href="/" aria-label={`${APP_SHORT_NAME} — Ikhtisar`} onClick={() => setMenuOpen(false)} className="px-2"><Brand /></Link>
      <div className="workspace-label">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#c9edaa]/10 text-[10px] font-bold text-[#b3d395]">MW</span>
        <div><p className="text-[11px] font-semibold text-[#e1e9dd]">Ruang kerja utama</p><p className="mt-0.5 text-[9px] text-[#86998d]">Panel mandiri</p></div>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <p className="sidebar-label">Ruang kerja</p>
        <nav aria-label="Navigasi utama" className="space-y-1">{navigation(WORKSPACE_NAV)}</nav>
        <p className="sidebar-label mt-7">Preferensi & bantuan</p>
        <nav aria-label="Preferensi dan bantuan" className="space-y-1">{navigation(SUPPORT_NAV)}</nav>
        <div className="sidebar-help">
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-[#c9edaa]/10 text-[#c9edaa]"><Smartphone className="h-4 w-4" strokeWidth={1.5} /></div>
          <p className="text-[11px] font-semibold">Satu tempat, semua nomor.</p>
          <p className="mt-1 text-[10px] leading-[1.7] text-[#97a69b]">Tautkan perangkat untuk mulai mengelola percakapan.</p>
          <Link href="/pair" onClick={() => setMenuOpen(false)} className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-[#c9edaa] hover:text-white">Hubungkan nomor <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between px-1"><ConnectionIndicator /><span className="text-[9px] text-[#6c8373]">v{APP_VERSION}</span></div>
      <AccountBox />
    </div>
  )
  return (
    <div className={cn('flex min-h-dvh w-full', isChatRoute && 'h-dvh overflow-hidden')}>
      <a className="skip-link" href="#main-content">Lewati ke konten</a>
      <aside className="workspace-sidebar" aria-label="Menu ruang kerja">{sidebar}</aside>
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="sidebar-drawer inset-y-0 left-0 top-0 h-dvh w-[296px] max-w-[85vw] translate-x-0 translate-y-0 gap-0 rounded-none border-none p-0 sm:rounded-none">
          <DialogHeader className="sr-only"><DialogTitle>Menu ruang kerja</DialogTitle><DialogDescription>Navigasi dan akun MultiWA.</DialogDescription></DialogHeader>{sidebar}
        </DialogContent>
      </Dialog>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className={cn('workspace-topbar', isChatRoute && 'hidden lg:flex')}>
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" className="topbar-icon -ml-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Buka menu navigasi"><Menu className="h-5 w-5" /></button>
            <span className="hidden text-[11px] font-medium text-muted-foreground md:inline">Ruang kerja</span><ChevronRight className="hidden h-3.5 w-3.5 text-muted-foreground/60 md:block" />
            <span className="truncate text-[12px] font-semibold">{currentLabel}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3"><QuickSearch isChatRoute={isChatRoute} /><span className="mx-1 hidden h-5 w-px bg-border sm:block" /><NotificationPreferences unread={unread} /><Link className="topbar-icon hidden sm:flex" href="/docs" aria-label="Buka panduan" title="Panduan"><HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.7} /></Link><span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#d2dec9] bg-[#e7efdf] text-[10px] font-bold text-[#547342]" aria-label="Ruang kerja utama">MW</span></div>
        </header>
        <OpenPanelWarning />
        <main id="main-content" tabIndex={-1} className={cn('min-w-0 flex-1 outline-none', isChatRoute && 'min-h-0 overflow-hidden')}>{children}</main>
        {!isChatRoute && <nav className="mobile-nav" aria-label="Navigasi seluler">
          {[WORKSPACE_NAV[0], WORKSPACE_NAV[1], WORKSPACE_NAV[3], WORKSPACE_NAV[5]].map((item) => <Link key={item.href} href={item.href} className="mobile-nav-link" data-active={isActive(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}><item.icon className="h-[18px] w-[18px]" strokeWidth={1.7} /><span>{item.label}</span></Link>)}
          <button type="button" className="mobile-nav-link" onClick={() => setMenuOpen(true)} aria-label="Buka seluruh menu"><Menu className="h-[18px] w-[18px]" /><span>Menu</span></button>
        </nav>}
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  if (pathname.startsWith('/login')) return <>{children}</>
  return <WorkspaceShell pathname={pathname}>{children}</WorkspaceShell>
}

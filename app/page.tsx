'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, ContactRound, MessagesSquare, Plus, RefreshCw, Search, Smartphone, TriangleAlert, Workflow, X } from 'lucide-react'
import { toast } from 'sonner'
import { AddSessionDialog } from '@/components/dashboard/add-session-dialog'
import { ConnectionArt, EmptyDeviceArt } from '@/components/dashboard/connection-art'
import { SessionCard } from '@/components/dashboard/session-card'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessions, useStats } from '@/hooks/use-api'
import { useSocketEvent } from '@/hooks/use-socket'
import { APP_SHORT_NAME, APP_VERSION } from '@/lib/branding'

type Filter = 'all' | 'connected' | 'attention'

export default function DashboardPage() {
  const { sessions, isLoading, error, mutate } = useSessions()
  const { stats, error: statsError, mutate: mutateStats } = useStats()
  const [filter, setFilter] = React.useState<Filter>('all')
  const [query, setQuery] = React.useState('')
  const [refreshing, setRefreshing] = React.useState(false)
  const [date, setDate] = React.useState('')
  React.useEffect(() => { setDate(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) }, [])
  const refresh = React.useCallback(() => { void mutate(); void mutateStats() }, [mutate, mutateStats])
  useSocketEvent('session:status', (payload) => {
    refresh()
    if (payload.status === 'connected') toast.success('Nomor WhatsApp berhasil terhubung', { description: payload.phoneNumber || undefined })
  })
  useSocketEvent('sessions:changed', refresh)
  useSocketEvent('session:deleted', refresh)
  useSocketEvent('session:created', refresh)
  const connected = sessions.filter((session) => session.status === 'connected').length
  const unread = sessions.reduce((sum, session) => sum + session.stats.unread, 0)
  const ratio = sessions.length ? connected / sessions.length : 0
  const visibleSessions = sessions.filter((session) => {
    const matchesFilter = filter === 'all' || (filter === 'connected' ? session.status === 'connected' : session.status !== 'connected')
    const matchesQuery = `${session.name} ${session.phoneNumber} ${session.pushName || ''}`.toLowerCase().includes(query.toLowerCase().trim())
    return matchesFilter && matchesQuery
  })
  async function refreshAll() {
    setRefreshing(true)
    try {
      await Promise.all([mutate(), mutateStats()])
      toast.success('Data ruang kerja diperbarui')
    } catch { toast.error('Tidak dapat memuat data terbaru. Silakan coba lagi.') }
    finally { setRefreshing(false) }
  }
  return (
    <div className="page-container">
      <PageHeader title="Ikhtisar" description="Pantau nomor, percakapan, dan aktivitas WhatsApp Anda.">
        <div className="mr-1 hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-[10px] font-medium text-muted-foreground sm:flex"><CalendarDays className="h-3.5 w-3.5" />{date || <Skeleton className="h-3 w-36" />}</div>
        <Button variant="secondary" size="icon" onClick={() => void refreshAll()} disabled={refreshing} aria-label="Perbarui data ruang kerja" title="Perbarui data"><RefreshCw className={refreshing ? 'animate-spin' : ''} /></Button>
      </PageHeader>

      <section className="dashboard-banner" aria-label="Kelola nomor WhatsApp">
        <div className="relative z-10 max-w-[600px] md:pr-[230px] xl:max-w-[740px] xl:pr-[270px]">
          <span className="mb-3 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#698056]"><span className="h-1 w-1 rounded-full bg-[#698056]" /> Komunikasi, lebih terorganisasi</span>
          <h2 className="text-[24px] font-extrabold leading-[1.32] tracking-[-0.8px] text-[#273e25] sm:text-[27px]">Semua nomor.<br />Satu ruang kerja.</h2>
          <p className="mt-2.5 max-w-[380px] text-[12px] leading-[1.7] text-[#718067]">Kelola percakapan tanpa berpindah perangkat. Hubungkan nomor Anda untuk memulai.</p>
          <div className="mt-5 flex flex-wrap gap-3"><AddSessionDialog trigger={<Button size="sm" className="h-9 px-4"><Plus /> Hubungkan nomor</Button>} /><Button variant="ghost" size="sm" asChild className="h-9 text-[#537143]"><Link href="/docs#mulai">Lihat panduan <ArrowUpRight /></Link></Button></div>
        </div>
        <ConnectionArt className="dashboard-banner-art" />
      </section>

      <section className="mt-5" aria-label="Statistik ruang kerja"><StatsCards stats={stats} failed={Boolean(statsError)} /></section>
      <div className="dashboard-grid">
        <section id="sessions" className="min-w-0 scroll-mt-24">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-5"><div><h2 className="section-title">Perangkat WhatsApp</h2><p className="mt-1 text-[11px] text-muted-foreground">Kelola koneksi setiap nomor di ruang kerja Anda.</p></div><AddSessionDialog trigger={<Button variant="secondary" size="iconSm" aria-label="Tambah perangkat WhatsApp"><Plus /></Button>} /></div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-[#fcfdfb] px-5 py-3">
              <div role="tablist" aria-label="Filter perangkat" className="flex max-w-full items-center overflow-x-auto rounded-lg bg-muted/80 p-1">
                {([{ id: 'all', label: 'Semua', count: sessions.length }, { id: 'connected', label: 'Terhubung', count: connected }, { id: 'attention', label: 'Lainnya', count: sessions.length - connected }] as const).map((tab) => <button type="button" key={tab.id} id={`device-tab-${tab.id}`} role="tab" aria-selected={filter === tab.id} aria-controls="device-results" className="filter-tab" onClick={() => setFilter(tab.id)}>{tab.label}<span className="filter-count">{tab.count}</span></button>)}
              </div>
              <div className="relative w-full sm:w-[170px]"><Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 bg-card pl-8 pr-7 text-[11px]" placeholder="Cari perangkat…" aria-label="Cari perangkat" />{query && <button type="button" className="absolute right-2 top-2.5 text-muted-foreground" onClick={() => setQuery('')} aria-label="Hapus pencarian perangkat"><X className="h-3.5 w-3.5" /></button>}</div>
            </div>
            <div id="device-results" role="tabpanel" aria-labelledby={`device-tab-${filter}`}>
              {error ? <EmptyState icon={TriangleAlert} title="Data perangkat belum tersedia" description="Tidak dapat terhubung ke server. Periksa koneksi lalu muat ulang."><Button variant="secondary" onClick={() => void refreshAll()} loading={refreshing}><RefreshCw /> Coba lagi</Button></EmptyState>
                : isLoading && sessions.length === 0 ? <div className="grid gap-3 p-5 sm:grid-cols-2"><Skeleton className="h-52" /><Skeleton className="h-52" /></div>
                : sessions.length === 0 ? <div className="flex min-h-[330px] flex-col items-center justify-center px-6 py-10 text-center"><EmptyDeviceArt /><h3 className="text-[15px] font-bold">Ruang untuk nomor pertama Anda</h3><p className="mt-2 max-w-[330px] text-[12px] leading-[1.7] text-muted-foreground">Belum ada perangkat yang ditambahkan. Tautkan nomor WhatsApp untuk mulai menerima dan membalas pesan.</p><div className="mt-5"><AddSessionDialog trigger={<Button><Plus /> Hubungkan nomor pertama</Button>} /></div><Link href="/pair" className="mt-3 text-[10px] text-muted-foreground underline-offset-4 hover:text-primary hover:underline">Bagaimana cara menautkan perangkat?</Link></div>
                : visibleSessions.length === 0 ? <EmptyState icon={Search} title="Tidak ada perangkat yang cocok" description="Gunakan kata kunci lain atau tampilkan seluruh perangkat."><Button variant="secondary" size="sm" onClick={() => { setQuery(''); setFilter('all') }}>Tampilkan semua</Button></EmptyState>
                : <div className="session-grid p-4">{visibleSessions.map((session) => <SessionCard key={session.id} session={session} onChanged={refresh} onDeleted={refresh} />)}</div>}
            </div>
            {sessions.length > 0 && !error && <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3 text-[10px] text-muted-foreground"><span>{visibleSessions.length} dari {sessions.length} perangkat ditampilkan</span><span className="flex items-center gap-1.5"><MessagesSquare className="h-3 w-3" />{unread.toLocaleString('id-ID')} pesan belum dibaca</span></div>}
          </Card>
        </section>
        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1" aria-label="Ringkasan koneksi dan akses cepat">
          <Card className="p-5">
            <h2 className="section-title">Status koneksi</h2>
            {isLoading && sessions.length === 0 ? <Skeleton className="my-5 h-32 w-full" /> : error ? <p className="py-7 text-[12px] text-muted-foreground">Status perangkat belum dapat dimuat.</p> : <>
              <div className="mt-5 flex items-center gap-5"><div className="relative h-[84px] w-[84px] shrink-0"><svg viewBox="0 0 84 84" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="42" cy="42" r="35" fill="none" stroke="#eef2e9" strokeWidth="7" /><circle cx="42" cy="42" r="35" fill="none" stroke="#6a924d" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${ratio * 219.91} 219.91`} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><strong className="text-xl font-extrabold tracking-tight tabular-nums">{connected}<span className="text-[12px] font-medium text-muted-foreground">/{sessions.length}</span></strong><span className="mt-0.5 text-[8px] font-medium text-muted-foreground">terhubung</span></div></div><div className="space-y-3 text-[11px]"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#6a924d]" /><span className="text-muted-foreground">Terhubung</span><strong className="ml-auto pl-2 tabular-nums">{connected}</strong></div><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#d6dfcf]" /><span className="text-muted-foreground">Belum terhubung</span><strong className="ml-auto pl-2 tabular-nums">{sessions.length - connected}</strong></div></div></div>
              <p className="mt-5 border-t pt-3 text-[10px] leading-relaxed text-muted-foreground">{sessions.length === 0 ? 'Status setiap nomor akan ditampilkan setelah perangkat ditambahkan.' : connected === sessions.length ? 'Seluruh sesi tercatat terhubung. Lihat detail setiap perangkat untuk memeriksa koneksi server.' : 'Buka perangkat yang belum terhubung untuk melanjutkan penautan.'}</p>
            </>}
          </Card>
          <Card className="p-4"><h2 className="section-title px-1 pb-3 pt-1">Akses cepat</h2>{[
            { href: '/percakapan', icon: MessagesSquare, title: 'Buka percakapan', text: 'Pesan dari setiap nomor' },
            { href: '/kontak', icon: ContactRound, title: 'Buku kontak', text: 'Cari dan kelola kontak' },
            { href: '/otomatis', icon: Workflow, title: 'Atur otomasi', text: 'Balasan otomatis & webhook' },
          ].map((item) => <Link key={item.href} href={item.href} className="quick-link"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-[#73826a]"><item.icon className="h-4 w-4" strokeWidth={1.6} /></span><span className="min-w-0 flex-1"><span className="block text-[11px] font-semibold">{item.title}</span><span className="mt-0.5 block text-[9px] text-muted-foreground">{item.text}</span></span><ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/60" /></Link>)}</Card>
          <Card className="hidden border-[#dfe6d8] bg-[#f5f8f1] p-5 xl:block"><div className="flex items-center gap-2 text-[11px] font-bold text-[#536d45]"><BookOpen className="h-4 w-4" strokeWidth={1.6} /> Pertama kali menggunakan MultiWA?</div><p className="mt-2 text-[11px] leading-[1.8] text-[#7b8773]">Tambahkan nomor, minta kode penautan, lalu masukkan kode di menu Perangkat Tertaut pada WhatsApp.</p><Link href="/docs#mulai" className="mt-3 flex items-center gap-2 text-[10px] font-bold text-primary">Panduan penautan <ArrowRight className="h-3 w-3" /></Link></Card>
        </aside>
      </div>
      <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-border/70 pt-4 text-[9px] leading-relaxed text-muted-foreground/80 sm:flex-row"><p>Independen dari WhatsApp dan Meta. Gunakan hanya untuk nomor yang Anda kelola atau yang telah mendapat izin.</p><span className="shrink-0">{APP_SHORT_NAME} · v{APP_VERSION}</span></footer>
    </div>
  )
}

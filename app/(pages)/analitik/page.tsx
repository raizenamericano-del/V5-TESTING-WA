'use client'

import * as React from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Activity, ArrowDownLeft, ArrowUpRight, Database, Download, ImageIcon, MessagesSquare, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react'
import { ActivityChart, type ActivityDay } from '@/components/dashboard/activity-chart'
import { PageHeader } from '@/components/layout/page-header'
import { SessionStatusBadge } from '@/components/session-status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBytes, formatDateTime } from '@/lib/utils'
import type { SessionStatus } from '@/lib/types'

interface Analytics {
  range: { days: number; from: string; to: string }
  totals: { messagesInRange: number; messagesAllTime: number; incoming: number; outgoing: number; chats: number; sessions: number; mediaFiles: number; mediaBytes: number; viewOnce: number; edited: number; deleted: number; rules: number; subscriptions: number }
  perDay: ActivityDay[]
  topChats: { chatId: string; name: string; count: number; isGroup: boolean; sessionName: string }[]
  perSession: { sessionId: string; name: string; phoneNumber: string; status: string; count: number }[]
}
const RANGES = [7, 14, 30, 90]

export default function AnalyticsPage() {
  const [days, setDays] = React.useState(14)
  const { data, isLoading, isValidating, error, mutate } = useSWR<{ data?: Analytics } & Analytics>(`/api/analytics?days=${days}`, { refreshInterval: 60000, keepPreviousData: false })
  const stats = (data?.totals ? data : data?.data) as Analytics | undefined
  const totals = stats?.totals
  return <div className="page-container">
    <PageHeader title="Analitik" description="Tinjau aktivitas pesan, percakapan, dan penyimpanan ruang kerja.">
      <div className="flex rounded-lg border bg-card p-1" aria-label="Periode analitik">{RANGES.map((range) => <Button key={range} size="sm" variant={days === range ? 'subtle' : 'ghost'} className="h-8 border-transparent" aria-pressed={days === range} onClick={() => setDays(range)}>{range} hari</Button>)}</div>
      <Button variant="secondary" size="icon" aria-label="Perbarui analitik" onClick={() => void mutate()} disabled={isValidating}><RefreshCw className={isValidating ? 'animate-spin' : ''} /></Button>
    </PageHeader>
    {error ? <Card><EmptyState icon={TriangleAlert} title="Analitik belum dapat dimuat" description="Periksa koneksi ke server lalu coba kembali."><Button variant="secondary" onClick={() => void mutate()}><RefreshCw /> Coba lagi</Button></EmptyState></Card> : <>
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan pesan">{[
        { label: 'Total pesan', help: `${days} hari terakhir`, value: totals?.messagesInRange, icon: Activity },
        { label: 'Pesan masuk', help: 'Diterima dari kontak', value: totals?.incoming, icon: ArrowDownLeft },
        { label: 'Pesan keluar', help: 'Dikirim dari nomor tertaut', value: totals?.outgoing, icon: ArrowUpRight },
        { label: 'Percakapan', help: 'Seluruh percakapan tersimpan', value: totals?.chats, icon: MessagesSquare },
      ].map((item) => <Card key={item.label} className="stat-card"><div className="flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-muted-foreground">{item.label}</span><span className="stat-icon"><item.icon className="h-4 w-4" strokeWidth={1.6} /></span></div><div className="mt-2 text-[30px] font-bold leading-tight tracking-[-1px] tabular-nums">{item.value === undefined ? <Skeleton className="h-9 w-16" /> : item.value.toLocaleString('id-ID')}</div><p className="mt-2 text-[9px] text-muted-foreground/80">{item.help}</p></Card>)}</section>
      <section className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="min-w-0 p-5 sm:p-6"><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h2 className="section-title">Aktivitas pesan</h2><p className="mt-1 text-[10px] text-muted-foreground">Pesan masuk dan keluar setiap hari.</p></div><div className="flex items-center gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#568246]" />Masuk</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#bed4a4]" />Keluar</span></div></div>{!stats ? <Skeleton className="h-[240px] w-full" /> : <ActivityChart days={stats.perDay} />}<p className="mt-5 border-t pt-3 text-[9px] leading-relaxed text-muted-foreground/80">{stats ? `${formatDateTime(stats.range.from)} — ${formatDateTime(stats.range.to)}` : 'Memuat rentang aktivitas…'}</p></Card>
        <Card className="p-5"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-[#7c946c]" strokeWidth={1.6} /><h2 className="section-title">Penyimpanan & sistem</h2></div><dl className="mt-5 space-y-3.5 text-[11px]">{[
          ['Berkas media', totals?.mediaFiles.toLocaleString('id-ID')], ['Ukuran media', totals ? formatBytes(totals.mediaBytes) : undefined], ['Pesan seluruh waktu', totals?.messagesAllTime.toLocaleString('id-ID')], ['Pesan sekali lihat', totals?.viewOnce.toLocaleString('id-ID')], ['Diedit / dihapus', totals ? `${totals.edited} / ${totals.deleted}` : undefined], ['Aturan otomasi', totals?.rules.toLocaleString('id-ID')], ['Perangkat push', totals?.subscriptions.toLocaleString('id-ID')],
        ].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-2"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold tabular-nums">{value === undefined ? <Skeleton className="h-3 w-10" /> : value}</dd></div>)}</dl><div className="mt-5 border-t pt-5"><Button variant="secondary" size="sm" className="w-full" asChild><a href="/api/backup?download=1" download><Download /> Unduh cadangan JSON</a></Button><p className="mt-3 text-[9px] leading-[1.8] text-muted-foreground">Cadangan berisi data panel, bukan berkas media atau kredensial WhatsApp. Simpan di tempat privat.</p><Link href="/docs#keamanan" className="mt-2 inline-block text-[9px] font-semibold text-primary hover:underline">Panduan penyimpanan aman</Link></div></Card>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="overflow-hidden"><div className="border-b px-5 py-5"><h2 className="section-title">Percakapan teraktif</h2><p className="mt-1 text-[10px] text-muted-foreground">Berdasarkan jumlah pesan selama {days} hari terakhir.</p></div>{!stats ? <div className="space-y-3 p-5"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : !stats.topChats.length ? <EmptyState icon={MessagesSquare} title="Belum ada aktivitas" description="Percakapan aktif akan muncul setelah pesan diterima atau dikirim pada periode ini." className="py-12" /> : <div className="divide-y">{stats.topChats.map((chat, index) => <div key={chat.chatId} className="flex items-center gap-3 px-5 py-4"><span className="w-3 shrink-0 text-[10px] tabular-nums text-muted-foreground/70">{index + 1}</span><Avatar name={chat.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold">{chat.name}</p><p className="mt-1 truncate text-[9px] text-muted-foreground">{chat.sessionName}{chat.isGroup ? ' · Grup' : ''}</p></div><span className="text-right"><strong className="block text-[13px] font-bold tabular-nums">{chat.count.toLocaleString('id-ID')}</strong><span className="text-[9px] text-muted-foreground">pesan</span></span></div>)}</div>}</Card>
        <Card className="overflow-hidden"><div className="border-b px-5 py-5"><h2 className="section-title">Aktivitas per perangkat</h2><p className="mt-1 text-[10px] text-muted-foreground">Jumlah pesan dan status setiap nomor WhatsApp.</p></div>{!stats ? <div className="space-y-3 p-5"><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : !stats.perSession.length ? <EmptyState icon={ImageIcon} title="Belum ada perangkat" description="Hubungkan nomor untuk melihat rincian aktivitas perangkat." className="py-12"><Button variant="secondary" size="sm" asChild><Link href="/pair">Hubungkan nomor</Link></Button></EmptyState> : <div className="divide-y">{stats.perSession.map((session) => <div key={session.sessionId} className="flex flex-wrap items-center gap-3 px-5 py-4"><Avatar name={session.name} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-semibold">{session.name}</p><p className="mt-1 text-[9px] text-muted-foreground">+{session.phoneNumber}</p></div><SessionStatusBadge status={session.status as SessionStatus} pulse={false} /><span className="text-right"><strong className="block text-[13px] font-bold tabular-nums">{session.count.toLocaleString('id-ID')}</strong><span className="text-[9px] text-muted-foreground">pesan</span></span><Button variant="ghost" size="iconSm" asChild><Link href={`/chat/${session.sessionId}`} aria-label={`Buka percakapan ${session.name}`}><ArrowUpRight /></Link></Button></div>)}</div>}</Card>
      </section>
      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground/80"><ShieldCheck className="h-3.5 w-3.5" /> Statistik dihitung dari data yang tersimpan pada server Anda.{isLoading ? ' Memuat data terbaru…' : ''}</p>
    </>}
  </div>
}

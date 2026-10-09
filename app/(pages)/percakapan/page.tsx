'use client'
import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, MessagesSquare, Plus, Search, Smartphone, TriangleAlert } from 'lucide-react'
import { AddSessionDialog } from '@/components/dashboard/add-session-dialog'
import { PageHeader } from '@/components/layout/page-header'
import { SessionStatusBadge } from '@/components/session-status-badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessions } from '@/hooks/use-api'
import { useSocketEvent } from '@/hooks/use-socket'

export default function ConversationsPage() {
  const { sessions, isLoading, error, mutate } = useSessions()
  const [query, setQuery] = React.useState('')
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  useSocketEvent('sessions:changed', () => { void mutate() })
  useSocketEvent('session:status', () => { void mutate() })
  const visible = sessions.filter((session) => (!unreadOnly || session.stats.unread > 0) && `${session.name} ${session.phoneNumber} ${session.pushName || ''}`.toLowerCase().includes(query.toLowerCase().trim()))
  const unread = sessions.reduce((total, session) => total + session.stats.unread, 0)
  return <div className="page-container">
    <PageHeader title="Percakapan" description="Pilih nomor untuk membuka pesan. Riwayat tersimpan tetap tersedia saat perangkat tidak terhubung."><AddSessionDialog trigger={<Button variant="secondary"><Plus /> Hubungkan nomor</Button>} /></PageHeader>
    {error ? <Card><EmptyState icon={TriangleAlert} title="Percakapan belum dapat dimuat" description="Periksa koneksi ke server lalu coba kembali."><Button variant="secondary" onClick={() => void mutate()}>Coba lagi</Button></EmptyState></Card> : <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"><div className="relative w-full max-w-[320px]"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama perangkat atau nomor…" className="h-10 pl-10" aria-label="Cari perangkat untuk percakapan" /></div><div className="flex items-center gap-2"><Button variant={unreadOnly ? 'subtle' : 'ghost'} size="sm" aria-pressed={unreadOnly} onClick={() => setUnreadOnly((value) => !value)}><MessagesSquare /> Belum dibaca <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] tabular-nums">{unread.toLocaleString('id-ID')}</span></Button></div></div>
      {isLoading && sessions.length === 0 ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((key) => <Skeleton key={key} className="h-56" />)}</div> : !sessions.length ? <Card><EmptyState icon={MessagesSquare} title="Percakapan Anda dimulai di sini" description="Hubungkan nomor WhatsApp untuk menerima pesan dan melanjutkan komunikasi dari satu ruang kerja."><AddSessionDialog /></EmptyState></Card> : !visible.length ? <Card><EmptyState icon={Search} title="Tidak ada perangkat yang cocok" description={unreadOnly ? 'Tidak ada perangkat dengan pesan belum dibaca yang sesuai dengan pencarian.' : 'Coba nama perangkat atau nomor yang berbeda.'}><Button variant="secondary" size="sm" onClick={() => { setQuery(''); setUnreadOnly(false) }}>Tampilkan semua nomor</Button></EmptyState></Card> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((session) => <Card key={session.id} className="flex flex-col p-5"><div className="flex items-center gap-3"><Avatar name={session.pushName || session.name} size="md" /><div className="min-w-0 flex-1"><h2 className="truncate text-[13px] font-bold">{session.name}</h2><p className="mt-1 text-[10px] text-muted-foreground">+{session.phoneNumber}</p></div><Smartphone className="h-4 w-4 text-muted-foreground/60" strokeWidth={1.6} /></div><div className="mt-4"><SessionStatusBadge status={session.status} pulse={false} /></div><div className="my-5 grid grid-cols-3 gap-2 border-y py-4">{[{ label: 'Percakapan', value: session.stats.chats }, { label: 'Pesan', value: session.stats.messages }, { label: 'Belum dibaca', value: session.stats.unread }].map((item) => <div key={item.label}><strong className="text-[17px] font-bold tabular-nums">{item.value.toLocaleString('id-ID')}</strong><p className="mt-1 text-[9px] text-muted-foreground">{item.label}</p></div>)}</div><Button asChild className="mt-auto" variant={session.status === 'connected' ? 'default' : 'secondary'}><Link href={`/chat/${session.id}`}><MessagesSquare />{session.status === 'connected' ? 'Buka percakapan' : 'Lihat percakapan'}<ArrowRight className="ml-auto" /></Link></Button></Card>)}</div>}
      <p className="mt-5 text-[10px] text-muted-foreground">{!isLoading && `${visible.length} dari ${sessions.length} perangkat ditampilkan.`}</p>
    </>}
  </div>
}

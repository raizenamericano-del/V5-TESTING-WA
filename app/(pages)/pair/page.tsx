'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, Copy, KeyRound, Loader2, MessagesSquare, RefreshCw, ShieldCheck, Smartphone, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { AddSessionDialog } from '@/components/dashboard/add-session-dialog'
import { EmptyDeviceArt } from '@/components/dashboard/connection-art'
import { PageHeader } from '@/components/layout/page-header'
import { QrCodeImage } from '@/components/qr-code'
import { SessionStatusBadge } from '@/components/session-status-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/fetcher'
import { formatErrorMessage } from '@/lib/error-messages'
import { cn } from '@/lib/utils'
import { useSession, useSessions } from '@/hooks/use-api'
import { useSessionRoom, useSocketEvent } from '@/hooks/use-socket'

export default function PairPage() {
  return <React.Suspense fallback={<div className="page-container"><Skeleton className="h-96 w-full" /></div>}><PairContent /></React.Suspense>
}

function PairContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || undefined
  const { session, mutate, isLoading, error: sessionError } = useSession(sessionId)
  const { sessions } = useSessions()
  const [code, setCode] = React.useState<string | null>(null)
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null)
  const [qr, setQr] = React.useState<string | null>(null)
  const [generating, setGenerating] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [now, setNow] = React.useState(() => Date.now())
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  useSessionRoom(sessionId)
  React.useEffect(() => { setCode(null); setQr(null); setExpiresAt(null); setError(null); setCopied(false); setPhoneNumber('') }, [sessionId])
  React.useEffect(() => { if (session?.phoneNumber) setPhoneNumber(session.phoneNumber) }, [session?.phoneNumber])
  React.useEffect(() => {
    setCode(session?.pairingCode || null)
    setExpiresAt(session?.pairingCodeExpiresAt || null)
  }, [session?.pairingCode, session?.pairingCodeExpiresAt])
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => { clearInterval(timer); if (copyTimer.current) clearTimeout(copyTimer.current) }
  }, [])
  useSocketEvent('session:pairing-code', (payload) => { if (payload.sessionId !== sessionId) return; setCode(payload.code); setExpiresAt(payload.expiresAt); void mutate() })
  useSocketEvent('session:qr', (payload) => { if (payload.sessionId === sessionId) setQr(payload.qr) })
  useSocketEvent('session:status', (payload) => {
    if (payload.sessionId !== sessionId) return
    void mutate()
    if (payload.status === 'connected') { toast.success('Perangkat berhasil ditautkan'); setCode(null); setQr(null); setError(null) }
  })
  async function generateCode() {
    if (!sessionId) return
    setGenerating(true); setError(null)
    try {
      const result = await api.post<{ pairingCode: string; expiresAt: string }>(`/api/sessions/${sessionId}/pairing-code`, phoneNumber ? { phoneNumber } : {})
      setCode(result.pairingCode); setExpiresAt(result.expiresAt); void mutate()
      toast.success('Kode penautan tersedia', { description: 'Masukkan kode pada ponsel utama sebelum waktu berlaku berakhir.' })
    } catch (err) { setError(err instanceof Error ? err.message : 'Tidak dapat meminta kode penautan') }
    finally { setGenerating(false) }
  }
  async function copyCode() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code); setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 1800)
      toast.success('Kode penautan disalin')
    } catch { toast.error('Tidak dapat menyalin otomatis. Pilih dan salin kode secara manual.') }
  }
  const secondsLeft = expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000)) : 0
  const expired = Boolean(code) && secondsLeft === 0
  const connected = session?.status === 'connected'
  if (!sessionId) return (
    <div className="page-container max-w-[1120px]">
      <PageHeader eyebrow="Perangkat" title="Hubungkan nomor" description="Tautkan WhatsApp menggunakan kode penautan atau QR." />
      <div className="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center"><EmptyDeviceArt /><span className="eyebrow mb-3 mt-2">01 / Tambahkan nomor</span><h2 className="text-xl font-extrabold tracking-[-0.5px]">Mulai dengan nomor WhatsApp Anda</h2><p className="mt-3 max-w-[350px] text-[12px] leading-[1.8] text-muted-foreground">Masukkan nomor dalam format internasional. Pada langkah berikutnya, Anda dapat meminta kode untuk menautkan perangkat.</p><div className="mt-6"><AddSessionDialog /></div><p className="mt-5 flex items-center gap-1.5 text-[10px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" />Nomor harus milik Anda atau telah mendapatkan izin.</p></Card>
        <PairingSteps />
      </div>
      {sessions.length > 0 && <section className="mt-7"><h2 className="section-title">Atau lanjutkan perangkat yang sudah ditambahkan</h2><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">{sessions.map((item) => <Link key={item.id} href={`/pair?session=${item.id}`} className="grid min-w-0 grid-cols-[20px_minmax(0,1fr)_14px] items-center gap-x-3 gap-y-2 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"><Smartphone className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.6} /><span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold">{item.name}</span><span className="mt-1 block text-[10px] text-muted-foreground">+{item.phoneNumber}</span></span><SessionStatusBadge status={item.status} className="col-start-2 row-start-2 justify-self-start" /><ArrowRight className="col-start-3 row-start-1 h-3.5 w-3.5 text-muted-foreground" /></Link>)}</div></section>}
    </div>
  )
  if (sessionError || (!isLoading && !session)) return <div className="page-container"><Card><EmptyState icon={TriangleAlert} title="Perangkat tidak tersedia" description="Perangkat mungkin telah dihapus atau server belum dapat dijangkau."><Button variant="secondary" onClick={() => void mutate()}><RefreshCw /> Coba lagi</Button><Button asChild><Link href="/">Kembali ke ikhtisar</Link></Button></EmptyState></Card></div>
  if (isLoading || !session) return <div className="page-container"><Skeleton className="mb-6 h-16 w-64" /><Skeleton className="h-96 w-full" /></div>
  return (
    <div className="page-container max-w-[1120px]">
      <Link href="/#sessions" className="mb-5 inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-primary"><ArrowLeft className="h-3 w-3" /> Kembali ke perangkat</Link>
      <PageHeader eyebrow="Penautan perangkat" title={session.name} description={`+${session.phoneNumber}${session.pushName ? ` · ${session.pushName}` : ''}`}>
        <SessionStatusBadge status={session.status} /><Button variant="secondary" size="iconSm" onClick={() => void mutate()} aria-label="Perbarui status perangkat"><RefreshCw /></Button>{connected && <Button asChild size="sm"><Link href={`/chat/${session.id}`}><MessagesSquare /> Percakapan</Link></Button>}
      </PageHeader>
      {connected ? <Card className="p-8 sm:p-12"><div className="mx-auto flex max-w-lg flex-col items-center text-center"><span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.06]"><BadgeCheck className="h-8 w-8 text-primary" strokeWidth={1.5} /></span><p className="eyebrow mt-6">Penautan selesai</p><h2 className="mt-3 text-2xl font-extrabold tracking-[-0.7px]">Nomor ini telah terhubung</h2><p className="mt-3 text-[13px] leading-[1.8] text-muted-foreground">Buka percakapan untuk membaca pesan, mengirim media, dan melanjutkan komunikasi dari ruang kerja Anda.</p>{!session.isLive && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">Status tersimpan sebagai terhubung, namun koneksi server belum aktif. Gunakan Sambungkan ulang pada menu perangkat di Ikhtisar.</p>}<div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild><Link href={`/chat/${session.id}`}><MessagesSquare /> Buka percakapan</Link></Button><Button variant="secondary" asChild><Link href="/#sessions">Kelola perangkat</Link></Button></div></div></Card>
        : <div className="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-[11px] font-bold text-[#6c875b]">01</span><div><h2 className="section-title">Minta kode penautan</h2><p className="mt-1 text-[10px] text-muted-foreground">Konfirmasikan nomor yang akan ditautkan.</p></div></div>
            <label className="mb-2 block text-[11px] font-semibold" htmlFor="pairing-phone">Nomor WhatsApp</label>
            <div className="flex flex-col gap-2 sm:flex-row"><Input id="pairing-phone" value={phoneNumber} inputMode="tel" placeholder="6281234567890" onChange={(event) => setPhoneNumber(event.target.value.replace(/[^\d+]/g, ''))} disabled={generating} /><Button onClick={() => void generateCode()} loading={generating} disabled={phoneNumber.replace(/\D/g, '').length < 8}><KeyRound />{code ? 'Buat ulang kode' : 'Minta kode'}</Button></div>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Format internasional, misalnya 6281234567890. Awalan 0 akan dikonversi otomatis.</p>
            <div className="mt-6 rounded-xl border border-[#dfe7d7] bg-[#f7faf3] p-5 text-center sm:p-6"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#819274]">Kode penautan</p><div className="mt-5 flex min-h-14 flex-col items-center justify-center gap-2 sm:flex-row">{generating && !code ? <span className="flex items-center gap-2 text-[12px] text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Meminta kode ke WhatsApp…</span> : code ? <><code className={cn('select-all text-[22px] font-bold tracking-[0.08em] text-primary min-[380px]:text-[27px] sm:text-[34px]', expired && 'opacity-40 line-through')}>{code}</code><Button variant="ghost" size="iconSm" onClick={() => void copyCode()} aria-label="Salin kode penautan">{copied ? <Check /> : <Copy />}</Button></> : <span className="text-[28px] tracking-[0.2em] text-[#c5d3bb]" aria-hidden="true">•••• ••••</span>}</div><p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">{code ? expired ? <span className="text-amber-800">Kode sudah kedaluwarsa. Minta kode baru untuk melanjutkan.</span> : <>Berlaku selama <strong className="font-mono text-foreground">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</strong></> : 'Kode akan ditampilkan setelah Anda menekan Minta kode.'}</p></div>
            {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] leading-relaxed text-red-700" role="alert">{error}</p>}
            {session.lastError && !error && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">{formatErrorMessage(session.lastError)}</p>}
            {qr && (!code || expired) && <div className="mt-5 flex flex-col items-center gap-4 rounded-xl border p-5"><p className="text-[11px] font-medium text-muted-foreground">Alternatif: pindai QR melalui WhatsApp</p><QrCodeImage value={qr} size={190} /></div>}
            <p className="mt-5 flex items-start gap-2 text-[10px] leading-[1.8] text-muted-foreground"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7e966b]" />Jangan membagikan kode ini kepada siapa pun. Kode hanya digunakan pada ponsel utama Anda.</p>
          </Card>
          <PairingSteps />
        </div>}
    </div>
  )
}

function PairingSteps() {
  const steps = [
    { title: 'Buka WhatsApp', text: 'Gunakan ponsel utama dari nomor yang akan dihubungkan.' },
    { title: 'Buka Perangkat Tertaut', text: 'Pilih Pengaturan (atau menu ⋮ di Android), lalu Perangkat Tertaut → Tautkan perangkat.' },
    { title: 'Masukkan kode', text: 'Pilih Tautkan dengan nomor telepon, lalu masukkan kode yang ditampilkan pada ruang kerja.' },
    { title: 'Tunggu koneksi selesai', text: 'Status perangkat akan diperbarui otomatis ketika penautan berhasil.' },
  ]
  return <Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-[11px] font-bold text-[#6c875b]">02</span><div><h2 className="section-title">Lanjutkan pada ponsel</h2><p className="mt-1 text-[10px] text-muted-foreground">Empat langkah untuk menautkan perangkat.</p></div></div><ol className="my-6 space-y-5">{steps.map((step, index) => <li key={step.title} className="relative flex gap-3.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#d7e2cd] bg-[#f2f6ee] text-[10px] font-bold text-[#70875e]">{index + 1}</span><div><p className="pt-0.5 text-[12px] font-semibold">{step.title}</p><p className="mt-1 text-[11px] leading-[1.8] text-muted-foreground">{step.text}</p></div></li>)}</ol><div className="rounded-lg bg-muted/60 px-4 py-3 text-[10px] leading-[1.8] text-muted-foreground">Ponsel harus terhubung ke internet. Kode biasanya berlaku sekitar 3 menit; gunakan penghitung waktu untuk mengetahui sisa masa berlaku.</div><Link href="/docs#mulai" className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold text-primary"><BookOpen className="h-3.5 w-3.5" /> Panduan penautan perangkat <ArrowRight className="h-3.5 w-3.5" /></Link></Card>
}

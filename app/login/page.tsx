'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR, { useSWRConfig } from 'swr'
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, MessagesSquare, ShieldCheck, Smartphone, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { APP_SHORT_NAME, APP_VERSION } from '@/lib/branding'
import { api } from '@/lib/fetcher'
import { safeNextPath } from '@/lib/navigation'

interface AuthStatus { authEnabled: boolean; authenticated: boolean; username: string | null }

export default function LoginPage() {
  return <React.Suspense fallback={<div className="flex min-h-dvh items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Memuat halaman masuk" /></div>}><LoginContent /></React.Suspense>
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get('next'))
  const { mutate: updateCache } = useSWRConfig()
  const { data: status, isLoading, error: statusError, mutate } = useSWR<AuthStatus>('/api/auth/status')
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [remember, setRemember] = React.useState(true)
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => { if (status?.username) setUsername(status.username) }, [status?.username])
  React.useEffect(() => { if (status?.authenticated && status.authEnabled) router.replace(nextPath) }, [status, router, nextPath])
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/api/auth/login', { username, password, remember })
      await updateCache((key) => typeof key === 'string' && key.startsWith('/api/') && key !== '/api/auth/status', undefined, { revalidate: false })
      await updateCache('/api/auth/status')
      toast.success('Berhasil masuk ke ruang kerja')
      router.replace(nextPath)
      router.refresh()
    } catch (err) { const message = err instanceof Error ? err.message : 'Tidak dapat masuk. Silakan coba lagi.'; setError(message) }
    finally { setLoading(false) }
  }
  return (
    <div className="login-page">
      <section className="login-brand-panel" aria-label="MultiWA Workspace">
        <div className="login-grid" aria-hidden="true" />
        <div className="relative"><Brand /></div>
        <div className="relative my-10 max-w-[480px]">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a9c18f]">Ruang kerja komunikasi</p>
          <h1 className="text-[39px] font-bold leading-[1.2] tracking-[-1.7px] xl:text-[46px]">Lebih dekat dengan<br />setiap <span className="text-[#c9edaa]">percakapan.</span></h1>
          <p className="mt-5 max-w-[330px] text-[13px] leading-[1.9] text-[#9db09e]">Satukan nomor, kelola pesan, dan jaga alur komunikasi. Semuanya dalam satu ruang kerja yang Anda kendalikan.</p>
          <svg viewBox="0 0 430 200" fill="none" className="my-9 w-full max-w-[420px]" aria-hidden="true">
            <path d="M80 100h95m80 0h95M215 55V25m0 120v30" stroke="#46613e" strokeDasharray="4 5" />
            <circle cx="215" cy="100" r="70" stroke="#d0e9b817" />
            <circle cx="215" cy="100" r="49" fill="#ffffff04" stroke="#d0e9b825" />
            <rect x="193" y="78" width="44" height="44" rx="12" fill="#c9edaa" />
            <path d="M204 110V90l11 12 11-12v20" stroke="#193526" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <g><rect x="20" y="68" width="97" height="62" rx="12" fill="#263f2c" stroke="#3d5538" /><rect x="34" y="83" width="24" height="27" rx="5" fill="#365732" /><path d="M42 92h8m-8 6h5" stroke="#b5d398" strokeWidth="2" strokeLinecap="round" /><path d="M68 88h34m-34 9h24m-24 9h30" stroke="#5b7651" strokeWidth="3" strokeLinecap="round" /></g>
            <g><rect x="313" y="68" width="97" height="62" rx="12" fill="#263f2c" stroke="#3d5538" /><path d="m329 94 5 5 8-10" stroke="#b5d398" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M353 94h38m-38 10h24" stroke="#5b7651" strokeWidth="3" strokeLinecap="round" /><path d="M330 115h60" stroke="#365732" strokeWidth="3" strokeLinecap="round" /></g>
            <circle cx="215" cy="25" r="4" fill="#759f59" /><circle cx="215" cy="175" r="4" fill="#759f59" />
          </svg>
          <div className="flex flex-wrap gap-5 text-[10px] font-medium text-[#b6c9ad]">{[{ icon: Smartphone, text: 'Multi-perangkat' }, { icon: MessagesSquare, text: 'Waktu nyata' }, { icon: ShieldCheck, text: 'Kendali mandiri' }].map((item) => <span key={item.text} className="flex items-center gap-1.5"><item.icon className="h-3.5 w-3.5" strokeWidth={1.5} />{item.text}</span>)}</div>
        </div>
        <div className="relative flex items-center justify-between border-t border-white/10 pt-5 text-[9px] text-[#7f9684]"><span>Independen dari WhatsApp dan Meta.</span><span>v{APP_VERSION}</span></div>
      </section>
      <section className="login-form-panel">
        <div className="flex items-center justify-between"><div className="lg:invisible"><Brand className="text-foreground" /></div><span className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex"><LockKeyhole className="h-3 w-3" /> Akses ruang kerja</span></div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[370px]">
            <div className="mb-8"><p className="eyebrow mb-3">Selamat datang di {APP_SHORT_NAME}</p><h2 className="text-[30px] font-extrabold leading-tight tracking-[-1.1px]">Masuk ke ruang kerja</h2><p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">Gunakan kredensial Anda untuk melanjutkan.</p></div>
            {isLoading ? <div className="flex h-48 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Memeriksa akses" /></div>
              : statusError ? <div className="rounded-xl border border-border bg-muted/40 p-5"><p className="text-[13px] font-semibold">Server belum dapat dijangkau</p><p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">Periksa koneksi lalu coba kembali.</p><Button className="mt-4" variant="secondary" onClick={() => void mutate()}>Coba lagi</Button></div>
              : status && !status.authEnabled ? <div className="space-y-5"><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[12px] leading-[1.8] text-amber-900"><strong className="block">Autentikasi belum diaktifkan</strong>Panel masih dapat diakses tanpa kredensial. Atur <code>AUTH_PASSWORD</code> pada server sebelum digunakan di jaringan publik.</div><Button className="w-full" onClick={() => router.replace(nextPath)}>Buka ruang kerja <ArrowRight /></Button></div>
              : <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2"><label htmlFor="username" className="text-[12px] font-semibold">Nama pengguna</label><div className="relative"><UserRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" strokeWidth={1.6} /><Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Masukkan nama pengguna" autoComplete="username" className="h-12 pl-11" required disabled={loading} /></div></div>
                <div className="space-y-2"><label htmlFor="password" className="text-[12px] font-semibold">Kata sandi</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" strokeWidth={1.6} /><Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" autoComplete="current-password" className="h-12 pl-11 pr-11" autoFocus required disabled={loading} aria-invalid={Boolean(error)} aria-describedby={error ? 'login-error' : undefined} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2.5 top-3 rounded-md p-1.5 text-muted-foreground/70 hover:bg-muted hover:text-foreground" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-input" disabled={loading} />Tetap masuk selama 30 hari</label>
                {error && <div id="login-error" role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] leading-relaxed text-red-700">{error}</div>}
                <Button type="submit" className="h-12 w-full" loading={loading}>Masuk ke ruang kerja {!loading && <ArrowRight />}</Button>
              </form>}
            <div className="mt-7 border-t border-border pt-5"><p className="text-[11px] leading-[1.8] text-muted-foreground">Belum memiliki akses? Hubungi pengelola ruang kerja untuk mendapatkan nama pengguna dan kata sandi.</p></div>
          </div>
        </div>
        <footer className="flex flex-wrap justify-between gap-2 text-[9px] text-muted-foreground/70"><span>{APP_SHORT_NAME} Workspace · v{APP_VERSION}</span><span>Gunakan perangkat yang Anda percayai.</span></footer>
      </section>
    </div>
  )
}

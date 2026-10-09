'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plus, ShieldCheck, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { refreshLists } from '@/hooks/use-api'
import { api } from '@/lib/fetcher'
import type { SessionDTO } from '@/lib/types'

export function AddSessionDialog({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [name, setName] = React.useState('')
  const [phoneNumber, setPhoneNumber] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { session } = await api.post<{ session: SessionDTO }>('/api/sessions', { name: name.trim() || undefined, phoneNumber })
      refreshLists()
      toast.success('Nomor ditambahkan. Lanjutkan penautan perangkat.')
      setOpen(false)
      setName('')
      setPhoneNumber('')
      router.push(`/pair?session=${session.id}`)
    } catch (err) { setError(err instanceof Error ? err.message : 'Tidak dapat menambahkan nomor. Silakan coba lagi.') }
    finally { setLoading(false) }
  }
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!loading) { setOpen(value); setError(null) } }}>
      <DialogTrigger asChild>{trigger || <Button><Plus /> Hubungkan nomor</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.06]"><Smartphone className="h-5 w-5 text-primary" strokeWidth={1.6} /></div>
        <DialogHeader><p className="eyebrow mb-1">Langkah 01 / 02</p><DialogTitle>Hubungkan nomor WhatsApp</DialogTitle><DialogDescription>Tambahkan nomor, lalu tautkan perangkat menggunakan kode yang ditampilkan pada langkah berikutnya.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="mt-1 space-y-5">
          <div className="space-y-2"><label htmlFor="phone" className="text-[12px] font-semibold">Nomor WhatsApp</label><Input id="phone" autoFocus inputMode="tel" placeholder="6281234567890" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value.replace(/[^\d+]/g, ''))} required minLength={8} maxLength={20} disabled={loading} aria-describedby="phone-format" /><p id="phone-format" className="text-[10px] leading-relaxed text-muted-foreground">Gunakan kode negara, misalnya <strong className="font-medium">62</strong> untuk Indonesia. Awalan 0 akan dikonversi otomatis.</p></div>
          <div className="space-y-2"><label htmlFor="name" className="text-[12px] font-semibold">Nama perangkat <span className="font-normal text-muted-foreground">(opsional)</span></label><Input id="name" placeholder="Contoh: Layanan pelanggan" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} disabled={loading} /><p className="text-[10px] text-muted-foreground">Label ini membantu Anda mengenali nomor di ruang kerja.</p></div>
          <div className="flex items-start gap-2 rounded-lg bg-muted/70 px-3 py-3 text-[10px] leading-[1.7] text-muted-foreground"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7c956b]" />Gunakan nomor milik Anda atau nomor yang telah mendapatkan izin dari pemiliknya.</div>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">{error}</p>}
          <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Batal</Button><Button type="submit" loading={loading}>Lanjutkan {!loading && <ArrowRight />}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.1]">
        <Compass className="h-7 w-7 text-primary" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Halaman yang Anda cari tidak ada. Kembali ke ikhtisar untuk mengelola sesi WhatsApp Anda.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Kembali ke ikhtisar
      </Link>
    </div>
  )
}

import { APP_SHORT_NAME, APP_TAGLINE } from '@/lib/branding'
import { cn } from '@/lib/utils'

/** Monogram M berbentuk dua percakapan. Tidak menggunakan logo WhatsApp. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={cn('h-10 w-10 shrink-0', className)}>
      <rect width="48" height="48" rx="14" fill="currentColor" />
      <path d="M12 31V17a3 3 0 0 1 5.25-1.98L24 22.5l6.75-7.48A3 3 0 0 1 36 17v14h-6V23l-6 6.6-6-6.6v8h-6Z" fill="var(--brand-mark-ink, #173426)" />
      <path d="M30 32h6v4l-6-4Z" fill="var(--brand-mark-ink, #173426)" />
    </svg>
  )
}

export function Brand({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn('brand-lockup flex items-center gap-3', className)}>
      <BrandMark className="text-[#c9edaa]" />
      {!compact && (
        <div className="min-w-0">
          <div className="brand-wordmark truncate text-[23px] font-extrabold leading-tight tracking-[-1px]">{APP_SHORT_NAME}<span className="text-[#a9cf8a]">.</span></div>
          <div className="mt-0.5 text-[10px] font-medium tracking-[0.035em] opacity-55">{APP_TAGLINE}</div>
        </div>
      )}
    </div>
  )
}

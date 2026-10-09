import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SessionStatus } from '@/lib/types'
const config: Record<SessionStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' | 'info'; dot: string }> = {
  connected: { label: 'Terhubung', variant: 'success', dot: 'bg-primary' },
  connecting: { label: 'Menghubungkan', variant: 'warning', dot: 'bg-amber-500' },
  pairing: { label: 'Penautan', variant: 'info', dot: 'bg-sky-500' },
  disconnected: { label: 'Tidak terhubung', variant: 'secondary', dot: 'bg-zinc-400' },
  error: { label: 'Perlu perhatian', variant: 'danger', dot: 'bg-red-500' },
}
export function SessionStatusBadge({ status, className, pulse = true }: { status: SessionStatus; className?: string; pulse?: boolean }) {
  const item = config[status] || config.disconnected
  const animated = pulse && (status === 'connecting' || status === 'pairing')
  return <Badge variant={item.variant} className={className}><span className={cn('h-1.5 w-1.5 rounded-full', item.dot, animated && 'animate-pulse')} />{item.label}</Badge>
}

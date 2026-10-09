'use client'
import * as React from 'react'
import { cn, getInitials } from '@/lib/utils'
interface AvatarProps { name?: string | null; src?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; ring?: boolean }
const sizes = { sm: 'h-9 w-9 text-[11px]', md: 'h-11 w-11 text-[13px]', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' }
export function Avatar({ name, src, size = 'md', className, ring = false }: AvatarProps) {
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => { setFailed(false) }, [src])
  const hue = React.useMemo(() => {
    let hash = 0
    for (const character of name || 'MultiWA') hash = (hash * 31 + character.charCodeAt(0)) % 360
    return [90, 145, 190, 30, 215, 290][hash % 6]
  }, [name])
  const showImage = Boolean(src) && !failed
  return (
    <div className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/[0.04] font-bold uppercase', sizes[size], ring && 'ring-2 ring-primary/15 ring-offset-2 ring-offset-card', className)}
      style={showImage ? undefined : { backgroundColor: `hsl(${hue} 26% 92%)`, color: `hsl(${hue} 25% 36%)` }}>
      {showImage ? <img src={src as string} alt={name || 'Foto profil'} className="h-full w-full object-cover" onError={() => setFailed(true)} loading="lazy" /> : <span>{getInitials(name, 'WA')}</span>}
    </div>
  )
}

import { cn } from '@/lib/utils'
export interface ActivityDay { date: string; incoming: number; outgoing: number }
function dateLabel(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) }
export function ActivityChart({ days, className }: { days: ActivityDay[]; className?: string }) {
  const maximum = Math.max(0, ...days.map((day) => day.incoming + day.outgoing))
  const step = Math.max(1, Math.ceil(maximum / 4))
  const axisMax = step * 4
  const labelEvery = Math.max(1, Math.ceil(days.length / 7))
  return <div className={cn('relative', className)}>
    <div className="flex gap-3">
      <div className="flex h-[210px] w-7 shrink-0 flex-col justify-between pt-[20px] text-right text-[9px] tabular-nums text-muted-foreground/65">{[4, 3, 2, 1, 0].map((level) => <span key={level}>{(level * step).toLocaleString('id-ID', { notation: axisMax >= 10000 ? 'compact' : 'standard' })}</span>)}</div>
      <div className="scrollbar-thin min-w-0 flex-1 overflow-x-auto pb-2">
        <div style={{ minWidth: Math.max(250, days.length * 15) }}>
          <div className="chart-grid relative flex h-[210px] items-end gap-1.5 border-b border-border pt-[20px]">
            {days.map((day) => {
              const total = day.incoming + day.outgoing
              return <div key={day.date} tabIndex={0} className="chart-bar group h-[190px] items-center" role="img" aria-label={`${dateLabel(day.date)}: ${day.incoming} pesan masuk, ${day.outgoing} pesan keluar`}>
                <span className="chart-tooltip"><strong>{dateLabel(day.date)}</strong><br />{day.incoming.toLocaleString('id-ID')} masuk · {day.outgoing.toLocaleString('id-ID')} keluar</span>
                <div className="flex w-full max-w-9 flex-col overflow-hidden rounded-t-[4px]" style={{ height: `${total / axisMax * 100}%` }}><div className="w-full bg-[#bed4a4]" style={{ height: `${total ? day.outgoing / total * 100 : 0}%` }} /><div className="w-full flex-1 bg-[#568246]" /></div>
              </div>
            })}
            {maximum === 0 && <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-5"><span className="rounded-lg border border-border/70 bg-card/95 px-4 py-3 text-center text-[11px] text-muted-foreground">Belum ada pesan pada periode ini.</span></div>}
          </div>
          <div className="mt-3 flex gap-1.5">{days.map((day, index) => <div className="flex-1 text-center text-[8px] text-muted-foreground/80" key={day.date}>{index % labelEvery === 0 || index === days.length - 1 ? dateLabel(day.date) : '\u00a0'}</div>)}</div>
        </div>
      </div>
    </div>
  </div>
}

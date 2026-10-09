import * as React from 'react'
import { cn } from '@/lib/utils'
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(
    'flex w-full min-w-0 resize-none rounded-lg border border-input bg-card px-3.5 py-2.5 text-[13px] text-foreground transition-[border-color,box-shadow]',
    'placeholder:text-muted-foreground/65 focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.09]',
    'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60', className,
  )} {...props} />
))
Textarea.displayName = 'Textarea'
export { Textarea }

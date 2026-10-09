import * as React from 'react'
import { cn } from '@/lib/utils'
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input type={type} ref={ref} className={cn(
    'flex h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3.5 py-2 text-[13px] text-foreground transition-[border-color,box-shadow] shadow-[0_1px_2px_rgba(24,55,36,0.02)]',
    'placeholder:text-muted-foreground/65 focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/[0.09]',
    'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60', className,
  )} {...props} />
))
Input.displayName = 'Input'
export { Input }

import * as React from 'react'
import { cn } from '@/lib/utils'

export const fieldClass =
  'w-full min-w-0 rounded-xl border border-input bg-background px-3.5 text-base text-foreground shadow-xs transition-colors placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-muted/40'

export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return <input type={type} className={cn(fieldClass, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldClass, 'min-h-28 py-2.5', className)} {...props} />
}

export function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return <select className={cn(fieldClass, 'h-11 cursor-pointer pe-9', className)} {...props} />
}

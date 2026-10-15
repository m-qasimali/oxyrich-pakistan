'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetTitle = DialogPrimitive.Title
export const SheetDescription = DialogPrimitive.Description

export function SheetContent({
  className,
  children,
  closeLabel,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { closeLabel: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm" />
      <DialogPrimitive.Content
        className={cn(
          'bg-background data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-y-0 end-0 z-50 flex w-[88%] max-w-sm flex-col gap-4 overflow-y-auto border-s p-6 shadow-2xl data-[state=closed]:duration-200 data-[state=open]:duration-300',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="hover:bg-muted focus-visible:ring-ring/30 absolute end-4 top-4 inline-flex size-10 items-center justify-center rounded-lg focus-visible:ring-4 focus-visible:outline-none"
          aria-label={closeLabel}
        >
          <X className="size-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

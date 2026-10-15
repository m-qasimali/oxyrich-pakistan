'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const KEY = 'oxyrich-theme'

/**
 * Inline script that runs before first paint so the page never flashes the
 * wrong theme. Follows the OS preference until the user picks one.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${KEY}');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`

export function ThemeToggle({ className, label }: { className?: string; label: string }) {
  const [dark, setDark] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    // Read the class the inline script applied before hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(KEY, next ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
    setDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={dark ?? undefined}
      className={cn(
        'text-foreground/80 hover:bg-muted hover:text-foreground inline-flex size-10 items-center justify-center rounded-xl transition-colors',
        className,
      )}
    >
      <Sun className="size-5 dark:hidden" aria-hidden />
      <Moon className="hidden size-5 dark:block" aria-hidden />
    </button>
  )
}

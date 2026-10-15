import Image from 'next/image'
import { cn } from '@/lib/utils'
import logoDark from '../../../public/images/brand/logo-dark.png'
import logoLight from '../../../public/images/brand/logo-light.png'

/**
 * Brand logo. TODO: replace the PNGs with the official SVG once the client provides it.
 * `tone="light"` is for dark backgrounds (white "Oxyrich" wordmark).
 */
export function Logo({
  className,
  tone = 'auto',
  priority,
}: {
  className?: string
  tone?: 'auto' | 'light'
  priority?: boolean
}) {
  if (tone === 'light') {
    return (
      <Image
        src={logoLight}
        alt="Oxyrich Pakistan"
        priority={priority}
        sizes="140px"
        className={cn('h-10 w-auto', className)}
      />
    )
  }
  return (
    <>
      <Image
        src={logoDark}
        alt="Oxyrich Pakistan"
        priority={priority}
        sizes="140px"
        className={cn('h-10 w-auto dark:hidden', className)}
      />
      <Image
        src={logoLight}
        alt=""
        aria-hidden
        priority={priority}
        sizes="140px"
        className={cn('hidden h-10 w-auto dark:block', className)}
      />
    </>
  )
}

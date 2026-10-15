import Image from 'next/image'
import { cn } from '@/lib/utils'

/** next/image wrapper: SVG illustrations are served as-is (unoptimized), photos are optimised. */
export function ProductImage({
  src,
  alt,
  className,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  priority,
}: {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.endsWith('.svg')}
      className={cn('object-contain', className)}
    />
  )
}

'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function PasswordInput(props: React.ComponentProps<'input'>) {
  const t = useTranslations('auth')
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Input {...props} type={show ? 'text' : 'password'} className="pe-12" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t('hidePassword') : t('showPassword')}
        aria-pressed={show}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-xl"
      >
        {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  )
}

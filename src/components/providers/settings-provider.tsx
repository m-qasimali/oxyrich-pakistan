'use client'

import * as React from 'react'
import type { SiteSettings } from '@/config/site'

const SettingsContext = React.createContext<SiteSettings | null>(null)

export function SettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings
  children: React.ReactNode
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

/** Business details (phone, WhatsApp, email…) for client components. */
export function useSiteSettings(): SiteSettings {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used inside <SettingsProvider>')
  return ctx
}

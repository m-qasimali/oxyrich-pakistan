import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { DEFAULT_SETTINGS, SETTING_KEYS, type SiteSettings } from '@/config/site'
import { db } from './db'

export const SETTINGS_TAG = 'site-settings'

const loadSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const rows = await db.siteSetting.findMany()
      const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS }
      for (const row of rows) {
        if ((SETTING_KEYS as string[]).includes(row.key)) merged[row.key] = row.value
      }
      return merged as SiteSettings
    } catch (error) {
      console.error('[settings] database unavailable, using defaults:', error)
      return DEFAULT_SETTINGS
    }
  },
  ['site-settings'],
  { tags: [SETTINGS_TAG], revalidate: 3600 },
)

/** Business details: config defaults overridden by SiteSetting rows. */
export const getSiteSettings = cache(loadSettings)

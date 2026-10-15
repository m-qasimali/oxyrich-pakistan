import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oxyrich Pakistan',
    short_name: 'Oxyrich',
    description: 'Pure mineral water delivery in Islamabad — order online, 24/7.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2a2465',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}

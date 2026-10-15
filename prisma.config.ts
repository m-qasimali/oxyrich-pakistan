import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection. On Neon/Supabase set DIRECT_URL to
    // the direct connection string; the app itself uses the pooled DATABASE_URL at runtime.
    url: process.env.DIRECT_URL || env('DATABASE_URL'),
  },
})

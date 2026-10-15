import NextAuth, { CredentialsSignin, type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { loginSchema } from './validation'
import { rateLimit } from './rate-limit'

type AppRole = 'CUSTOMER' | 'ADMIN'

declare module 'next-auth' {
  interface User {
    role?: AppRole
    phone?: string
    remember?: boolean
  }
  interface Session {
    user: { id: string; role: AppRole; phone: string } & DefaultSession['user']
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: AppRole
    phone?: string
    expiresAt?: number
  }
}

class RateLimited extends CredentialsSignin {
  code = 'rate_limited'
}

let dummyHashPromise: Promise<string> | undefined
const dummyHash = () => (dummyHashPromise ??= bcrypt.hash('timing-equaliser', 12))

const DAY = 24 * 60 * 60
/** "Remember me" keeps the session for 30 days; otherwise it lasts 1 day. */
const REMEMBER_SECONDS = 30 * DAY
const SHORT_SECONDS = 1 * DAY

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: REMEMBER_SECONDS },
  pages: { signIn: '/login', error: '/login' },
  trustHost: true,
  logger: {
    // Wrong passwords are expected user errors, not server errors — keep logs clean.
    error(error) {
      if (error.name === 'CredentialsSignin' || error.name === 'RateLimited') return
      console.error('[auth]', error)
    },
  },
  providers: [
    Credentials({
      credentials: { phone: {}, password: {}, remember: {} },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse({
          phone: raw.phone,
          password: raw.password,
          remember: raw.remember === 'true' || raw.remember === true,
        })
        if (!parsed.success) return null
        const { phone, password, remember } = parsed.data

        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          request.headers.get('x-real-ip') ??
          'unknown'
        const allowed =
          (await rateLimit('login', `ip:${ip}`)) && (await rateLimit('login', `phone:${phone}`))
        if (!allowed) throw new RateLimited()

        const user = await db.user.findUnique({ where: { phone } })
        // Always run a bcrypt compare so response time doesn't reveal whether the phone exists.
        const hash = user?.passwordHash ?? (await dummyHash())
        const ok = await bcrypt.compare(password, hash)
        if (!user || !ok) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          remember: remember ?? false,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? 'CUSTOMER'
        token.phone = user.phone
        token.expiresAt =
          Math.floor(Date.now() / 1000) + (user.remember ? REMEMBER_SECONDS : SHORT_SECONDS)
      }
      if (token.expiresAt && Date.now() / 1000 > token.expiresAt) return null
      return token
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id
        session.user.role = token.role ?? 'CUSTOMER'
        session.user.phone = token.phone ?? ''
      }
      return session
    },
  },
})

/** Returns the signed-in user's session or null. */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user?.id ? session.user : null
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

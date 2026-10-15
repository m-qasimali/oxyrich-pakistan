import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

/**
 * Guard for every admin page. Layouts don't re-run on client navigation, so each
 * page checks the role itself (server actions check again independently).
 */
export async function requireAdminPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?next=/admin')
  if (session.user.role !== 'ADMIN') redirect('/account')
  return session.user
}

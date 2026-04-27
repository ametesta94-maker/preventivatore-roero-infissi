import { cookies } from 'next/headers'
import { readSessionCookie, COOKIE_NAME, SessionUser } from '@/lib/auth/session'

export async function requireSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies()
    const cookieValue = cookieStore.get(COOKIE_NAME)?.value
    return cookieValue ? readSessionCookie(cookieValue) : null
}

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { readSessionCookie, COOKIE_NAME } from '@/lib/auth/session'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import styles from './layout.module.css'

type UserRole = 'admin' | 'operatore'

export const dynamic = 'force-dynamic'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Auth: legge il cookie di sessione firmato (non più Supabase Auth)
    const cookieStore = await cookies()
    const cookieValue = cookieStore.get(COOKIE_NAME)?.value
    const sessionUser = cookieValue ? readSessionCookie(cookieValue) : null

    if (!sessionUser) {
        redirect('/login')
    }

    const userRole: UserRole = sessionUser.role

    // Recupera il logo dalle impostazioni tramite admin client (bypassa RLS)
    let logoUrl: string | null = null
    try {
        const supabase = await createAdminClient()
        const { data: settings } = await supabase
            .from('impostazioni')
            .select('logo_url')
            .limit(1)
            .single()

        if (settings) {
            logoUrl = settings.logo_url
        }
    } catch {
        // Continua senza logo se la query fallisce
    }

    return (
        <div className={styles.layout}>
            <Sidebar userRole={userRole} logoUrl={logoUrl} />
            <div className={styles.main}>
                <Header
                    userName={sessionUser.display_name}
                    userEmail={sessionUser.username}
                />
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    )
}

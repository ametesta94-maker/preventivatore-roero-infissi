import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, readSessionCookie } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

    if (error) {
        return NextResponse.json(
            { error: `Errore caricamento servizi: ${error.message}` },
            { status: 500 }
        )
    }

    return NextResponse.json({ services: data ?? [] })
}

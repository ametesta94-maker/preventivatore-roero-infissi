import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, readSessionCookie } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'

interface RouteContext {
    params: Promise<{ clienteId: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { clienteId } = await context.params
    if (!clienteId) {
        return NextResponse.json({ error: 'Cliente mancante' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
        .from('sedi')
        .select('id, nome_sede, cliente_id')
        .eq('cliente_id', clienteId)
        .eq('attiva', true)
        .order('nome_sede')

    if (error) {
        return NextResponse.json(
            { error: `Errore caricamento sedi: ${error.message}` },
            { status: 500 }
        )
    }

    return NextResponse.json({ sedi: data ?? [] })
}

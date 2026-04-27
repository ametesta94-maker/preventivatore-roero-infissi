/**
 * GET /api/auth/me
 *
 * Legge il cookie di sessione e restituisce l'utente corrente.
 * Usato dal client per verificare lo stato di autenticazione.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readSessionCookie, COOKIE_NAME } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    if (!cookieValue) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const user = readSessionCookie(cookieValue)
    if (!user) {
        return NextResponse.json({ error: 'Sessione non valida o scaduta' }, { status: 401 })
    }

    return NextResponse.json({ ok: true, user })
}

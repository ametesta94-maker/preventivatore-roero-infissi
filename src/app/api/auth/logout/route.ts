/**
 * POST /api/auth/logout
 *
 * Cancella il cookie di sessione locale. Tenta anche di notificare il CRM
 * del logout (best-effort, non bloccante).
 */

import { NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth/session'

const CRM_URL = process.env.CRM_URL || 'http://localhost:5000'

export async function POST() {
    // Best-effort: notifica il CRM del logout
    fetch(`${CRM_URL}/api/logout`, { method: 'POST' }).catch(() => {
        // Ignora errori di connessione al CRM — la sessione locale viene cancellata comunque
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    })
    response.cookies.set('crm_session', '', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    })
    return response
}

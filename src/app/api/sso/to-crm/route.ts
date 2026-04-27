/**
 * GET /api/sso/to-crm
 *
 * Avvia il flusso SSO verso il CRM:
 * 1. Verifica che l'utente sia autenticato nel preventivatore
 * 2. Richiede un token SSO al CRM (POST /api/sso_generate)
 * 3. Redireziona a http://localhost:5000/sso?token=<t>
 *
 * Il CRM consuma il token, crea la propria sessione e redireziona a /.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readSessionCookie, COOKIE_NAME } from '@/lib/auth/session'

const CRM_URL = process.env.CRM_URL || 'http://localhost:5000'

export async function GET(req: NextRequest) {
    // Verifica autenticazione preventivatore
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Inoltra sia la sessione CRM salvata al login sia il cookie firmato del preventivatore.
    // Il CRM accetta il secondo come fallback, cosi' il passaggio funziona anche se crm_session manca.
    const crmSid = req.cookies.get('crm_session')?.value
    const crmCookies = [
        crmSid ? `crm_sid=${crmSid}` : null,
        cookieValue ? `${COOKIE_NAME}=${cookieValue}` : null,
    ].filter(Boolean).join('; ')

    let tokenData: { token?: string; error?: string }
    try {
        const res = await fetch(`${CRM_URL}/api/sso_generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': crmCookies,
            },
        })
        if (res.status === 401) {
            // Sessione CRM scaduta — rimanda al login del preventivatore
            return NextResponse.redirect(new URL('/login?error=sessione_scaduta', req.url))
        }
        tokenData = await res.json()
    } catch {
        // CRM non raggiungibile — apri direttamente senza SSO
        const after = req.nextUrl.searchParams.get('after') || '/'
        return NextResponse.redirect(`${CRM_URL}${after}`)
    }

    if (!tokenData.token) {
        return NextResponse.redirect(new URL('/login?error=sessione_scaduta', req.url))
    }

    // Redireziona al CRM con il token (e opzionalmente la destinazione finale)
    const after = req.nextUrl.searchParams.get('after') || '/'
    const dest = `${CRM_URL}/sso?token=${tokenData.token}&after=${encodeURIComponent(after)}`
    return NextResponse.redirect(dest)
}

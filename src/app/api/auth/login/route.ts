/**
 * POST /api/auth/login
 *
 * Proxy del login al CRM. Riceve { username, password }, le inoltra al CRM
 * su POST /api/login, e in caso di successo crea la sessione locale firmata
 * con un cookie httpOnly.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth/session'

const CRM_URL = process.env.CRM_URL || 'http://localhost:5000'

export async function POST(req: NextRequest) {
    let body: { username?: string; password?: string }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Body non valido' }, { status: 400 })
    }

    const { username, password } = body
    if (!username || !password) {
        return NextResponse.json({ error: 'Username e password obbligatori' }, { status: 400 })
    }

    // Forward credentials to the CRM
    let crmRes: Response
    try {
        crmRes = await fetch(`${CRM_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
    } catch {
        return NextResponse.json({ error: 'CRM non raggiungibile. Assicurarsi che sia in esecuzione su ' + CRM_URL }, { status: 503 })
    }

    const crmData = await crmRes.json()

    if (!crmRes.ok || !crmData.ok) {
        return NextResponse.json(
            { error: crmData.error || 'Credenziali non valide' },
            { status: 401 }
        )
    }

    // Map CRM role to preventivatore role
    const role: 'admin' | 'operatore' = crmData.role === 'admin' ? 'admin' : 'operatore'

    const cookie = createSessionCookie({
        username: username as string,
        display_name: crmData.display || username,
        role,
    })

    const response = NextResponse.json({
        ok: true,
        user: {
            username,
            display_name: crmData.display || username,
            role,
        },
    })

    const isProduction = process.env.NODE_ENV === 'production'

    response.cookies.set(COOKIE_NAME, cookie, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        secure: isProduction,
    })

    // Store the CRM session ID so server-side routes can make authenticated calls to the CRM
    const crmSid = crmData.sid
    if (crmSid) {
        response.cookies.set('crm_session', crmSid, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE,
            secure: isProduction,
        })
    }

    return response
}

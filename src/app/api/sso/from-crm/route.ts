/**
 * GET /api/sso/from-crm?token=<t>
 *
 * Entry point SSO quando l'utente arriva dal CRM.
 * 1. Valida il token con il CRM (GET /api/sso_validate?token=<t>)
 * 2. Crea la sessione locale del preventivatore
 * 3. Redireziona a /dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth/session'

const CRM_URL = process.env.CRM_URL || 'http://localhost:5000'

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
        return NextResponse.redirect(new URL('/login?error=token_mancante', req.url))
    }

    // Valida il token con il CRM (consumo one-time)
    let crmData: { ok?: boolean; user?: { username: string; display: string; role: string }; error?: string }
    try {
        const res = await fetch(`${CRM_URL}/api/sso_validate?token=${encodeURIComponent(token)}`)
        crmData = await res.json()
    } catch {
        return NextResponse.redirect(new URL('/login?error=crm_non_raggiungibile', req.url))
    }

    if (!crmData.ok || !crmData.user) {
        return NextResponse.redirect(new URL('/login?error=token_non_valido', req.url))
    }

    const { username, display, role } = crmData.user
    const mappedRole: 'admin' | 'operatore' = role === 'admin' ? 'admin' : 'operatore'

    const cookie = createSessionCookie({
        username,
        display_name: display || username,
        role: mappedRole,
    })

    const response = NextResponse.redirect(new URL('/dashboard', req.url))
    response.cookies.set(COOKIE_NAME, cookie, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === 'production',
    })

    return response
}

/**
 * GET  /api/utenti/crm        — lista utenti dal CRM
 * POST /api/utenti/crm        — crea nuovo utente nel CRM (admin only)
 * PATCH /api/utenti/crm       — modifica utente nel CRM (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { readSessionCookie, COOKIE_NAME } from '@/lib/auth/session'

const CRM_URL = process.env.CRM_URL || 'http://localhost:5000'

function crmHeaders(crmSid: string | undefined) {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(crmSid ? { 'Cookie': `crm_sid=${crmSid}` } : {}),
    }
}

export async function GET(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

    const crmSid = req.cookies.get('crm_session')?.value
    try {
        const res = await fetch(`${CRM_URL}/api/utenti`, { headers: crmHeaders(crmSid) })
        if (res.status === 401) return NextResponse.json({ error: 'Sessione CRM scaduta' }, { status: 401 })
        const data = await res.json()
        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'CRM non raggiungibile' }, { status: 503 })
    }
}

export async function POST(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Solo gli admin possono creare utenti' }, { status: 403 })

    const crmSid = req.cookies.get('crm_session')?.value
    const body = await req.json()
    try {
        const res = await fetch(`${CRM_URL}/api/utenti`, {
            method: 'POST',
            headers: crmHeaders(crmSid),
            body: JSON.stringify(body),
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.ok ? 200 : res.status })
    } catch {
        return NextResponse.json({ error: 'CRM non raggiungibile' }, { status: 503 })
    }
}

export async function PATCH(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Solo gli admin possono modificare utenti' }, { status: 403 })

    const crmSid = req.cookies.get('crm_session')?.value
    const body = await req.json()
    try {
        const res = await fetch(`${CRM_URL}/api/utenti`, {
            method: 'POST', // CRM usa POST anche per aggiornamento (con id nel body)
            headers: crmHeaders(crmSid),
            body: JSON.stringify(body),
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.ok ? 200 : res.status })
    } catch {
        return NextResponse.json({ error: 'CRM non raggiungibile' }, { status: 503 })
    }
}

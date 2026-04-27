/**
 * GET /api/clienti/from-crm?q=<search>
 *
 * Proxy autenticato verso il CRM per ricercare contatti in tempo reale.
 * Usa il cookie crm_session (acquisito al login) per autenticarsi col CRM.
 * Senza parametro q restituisce i primi 50 contatti (lista iniziale).
 */

import { NextRequest, NextResponse } from 'next/server'
import { readSessionCookie, COOKIE_NAME } from '@/lib/auth/session'

const CRM_URL = process.env.CRM_URL || 'http://localhost:5000'

export interface ClienteCRM {
    crm_id: number
    ragione_sociale: string
    email: string | null
    telefono_principale: string | null
    citta: string | null
    provincia: string | null
    indirizzo: string | null
    from_crm: true
}

function mapContatto(c: Record<string, unknown>): ClienteCRM {
    const nome = [c.nome, c.cognome].filter(Boolean).join(' ').trim()
    const ragSoc = (c.ragione_sociale as string)?.trim()
    return {
        crm_id: c.id as number,
        ragione_sociale: ragSoc || nome || 'Sconosciuto',
        email: (c.email as string) || null,
        telefono_principale: (c.telefono as string) || null,
        citta: (c.citta as string) || null,
        provincia: (c.provincia as string) || null,
        indirizzo: (c.indirizzo as string) || null,
        from_crm: true,
    }
}

export async function GET(req: NextRequest) {
    // Verifica autenticazione preventivatore
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const q = req.nextUrl.searchParams.get('q') || ''
    const crmSid = req.cookies.get('crm_session')?.value

    const params = new URLSearchParams()
    if (q.length >= 2) params.set('search', q)
    // Ordina per nome; limita a 50 risultati per la lista iniziale
    params.set('sort', 'nome')

    let rows: Array<Record<string, unknown>>
    try {
        const res = await fetch(`${CRM_URL}/api/contatti?${params.toString()}`, {
            headers: {
                'Accept': 'application/json',
                ...(crmSid ? { 'Cookie': `crm_sid=${crmSid}` } : {}),
            },
        })

        if (res.status === 401) {
            return NextResponse.json(
                { error: 'Sessione CRM scaduta. Esci e rientra nel preventivatore.', results: [] }
            )
        }

        const data = await res.json()
        // Il CRM restituisce direttamente un array
        rows = Array.isArray(data) ? data : (data.contatti ?? data.results ?? [])
    } catch {
        return NextResponse.json({ error: 'CRM non raggiungibile', results: [] })
    }

    // Limita a 50 per non sovraccaricare il dropdown
    const results: ClienteCRM[] = rows.slice(0, 50).map(mapContatto)
    return NextResponse.json({ results })
}

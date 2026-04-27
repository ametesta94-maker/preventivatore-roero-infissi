/**
 * POST /api/clienti/crm-resolve
 *
 * Dato un contatto CRM, restituisce l'UUID Supabase del cliente corrispondente.
 * Se non esiste in Supabase, lo crea silenziosamente (auto-import).
 * Questo permette al QuoteEditor di usare clienti CRM senza gestire due DB.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readSessionCookie, COOKIE_NAME } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'

interface ResolveBody {
    crm_id: number
    ragione_sociale: string
    email?: string | null
    telefono_principale?: string | null
    citta?: string | null
    provincia?: string | null
    indirizzo?: string | null
}

export async function POST(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    let body: ResolveBody
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Body non valido' }, { status: 400 })
    }

    const { crm_id, ragione_sociale, email, telefono_principale, citta, provincia, indirizzo } = body
    if (!crm_id || !ragione_sociale) {
        return NextResponse.json({ error: 'crm_id e ragione_sociale obbligatori' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Cerca prima per ragione_sociale esatta (match diretto nome CRM)
    const { data: existing } = await supabase
        .from('clienti')
        .select('id')
        .eq('ragione_sociale', ragione_sociale)
        .eq('attivo', true)
        .limit(1)
        .maybeSingle()

    if (existing) {
        return NextResponse.json({ id: existing.id })
    }

    // Non esiste: crea automaticamente il cliente in Supabase
    const { data: created, error } = await supabase
        .from('clienti')
        .insert({
            ragione_sociale,
            tipo_cliente: 'privato',
            email: email || null,
            telefono_principale: telefono_principale || null,
            citta: citta || null,
            provincia: provincia || null,
            indirizzo: indirizzo || null,
            attivo: true,
        })
        .select('id')
        .single()

    if (error || !created) {
        return NextResponse.json({ error: 'Errore creazione cliente: ' + (error?.message ?? 'sconosciuto') }, { status: 500 })
    }

    return NextResponse.json({ id: created.id })
}

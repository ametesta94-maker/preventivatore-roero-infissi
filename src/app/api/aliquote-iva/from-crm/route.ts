/**
 * GET /api/aliquote-iva/from-crm
 *
 * Reads the VAT catalogue from the CRM and mirrors it into Supabase so quotes
 * can keep using preventivi.aliquota_iva_id as a foreign key.
 */

import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, readSessionCookie } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

const CRM_URL = process.env.CRM_URL || 'http://localhost:5000'
const CRM_IVA_NAMESPACE = 'roero-infissi-crm-catalogo-iva'

type AliquotaIvaInsert = Database['public']['Tables']['aliquote_iva']['Insert']

interface CrmIvaRow {
    id: number
    aliquota: string
    descrizione: string
    ordine?: number
    attivo?: number | boolean
}

function isCrmIvaRow(row: unknown): row is CrmIvaRow {
    if (!row || typeof row !== 'object') return false
    const candidate = row as Record<string, unknown>
    return (
        typeof candidate.id === 'number' &&
        typeof candidate.aliquota === 'string' &&
        typeof candidate.descrizione === 'string'
    )
}

function deterministicUuid(value: string): string {
    const bytes = createHash('sha1').update(value).digest().subarray(0, 16)
    bytes[6] = (bytes[6] & 0x0f) | 0x50
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = bytes.toString('hex')
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ].join('-')
}

function parsePercentages(aliquota: string): number[] {
    return [...aliquota.matchAll(/(\d+(?:[,.]\d+)?)\s*%/g)]
        .map(match => Number(match[1].replace(',', '.')))
        .filter(value => Number.isFinite(value))
}

function formatCrmAliquotaName(aliquota: string): string {
    const clean = aliquota.trim().replace(/\s*\+\s*/g, ' + ')
    if (!clean) return 'IVA'
    if (/^\d/.test(clean)) return `IVA ${clean}`
    return clean
}

function mapCrmIvaToSupabase(row: CrmIvaRow, index: number, updatedAt: string): AliquotaIvaInsert {
    const percentages = parsePercentages(row.aliquota)
    const percentuale = percentages[0] ?? 0
    const rateSecondary = percentages[1] ?? null

    return {
        id: deterministicUuid(`${CRM_IVA_NAMESPACE}:${row.id}`),
        nome: formatCrmAliquotaName(row.aliquota),
        percentuale,
        descrizione: row.descrizione.trim() || null,
        ordine: row.ordine ?? index + 1,
        attiva: row.attivo !== false && row.attivo !== 0,
        richiede_dichiarazione: percentuale > 0 && percentuale < 22,
        is_combined: rateSecondary !== null,
        rate_secondary: rateSecondary,
        updated_at: updatedAt,
    }
}

function extractCrmRows(data: unknown): CrmIvaRow[] {
    if (Array.isArray(data)) return data.filter(isCrmIvaRow)
    if (!data || typeof data !== 'object') return []

    const candidate = data as Record<string, unknown>
    const rows = candidate.results ?? candidate.aliquote ?? candidate.items
    return Array.isArray(rows) ? rows.filter(isCrmIvaRow) : []
}

export async function GET(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const crmSid = req.cookies.get('crm_session')?.value
    const forwardedCookies = [
        crmSid ? `crm_sid=${crmSid}` : null,
        cookieValue ? `${COOKIE_NAME}=${cookieValue}` : null,
    ].filter(Boolean).join('; ')

    let crmData: unknown
    try {
        const res = await fetch(`${CRM_URL}/api/catalogo/iva`, {
            headers: {
                Accept: 'application/json',
                ...(forwardedCookies ? { Cookie: forwardedCookies } : {}),
            },
            cache: 'no-store',
        })

        if (res.status === 401) {
            return NextResponse.json(
                { error: 'Sessione CRM scaduta. Esci e rientra nel preventivatore.', aliquote: [] },
                { status: 401 }
            )
        }

        if (!res.ok) {
            return NextResponse.json(
                { error: `Errore CRM durante il caricamento aliquote IVA (${res.status})`, aliquote: [] },
                { status: 502 }
            )
        }

        crmData = await res.json()
    } catch {
        return NextResponse.json({ error: 'CRM non raggiungibile', aliquote: [] }, { status: 503 })
    }

    const crmRows = extractCrmRows(crmData)
    const mappedRows = crmRows.map((row, index) => mapCrmIvaToSupabase(row, index, new Date().toISOString()))

    if (mappedRows.length === 0) {
        return NextResponse.json({ aliquote: [] })
    }

    const supabase = await createAdminClient()
    const { error: upsertError } = await supabase
        .from('aliquote_iva')
        .upsert(mappedRows, { onConflict: 'id' })

    if (upsertError) {
        return NextResponse.json(
            { error: `Errore sincronizzazione aliquote IVA: ${upsertError.message}`, aliquote: [] },
            { status: 500 }
        )
    }

    const ids = mappedRows.map(row => row.id as string)
    const { data: aliquote, error: readError } = await supabase
        .from('aliquote_iva')
        .select('*')
        .in('id', ids)
        .eq('attiva', true)
        .order('ordine')
        .order('nome')

    if (readError) {
        return NextResponse.json(
            { error: `Errore lettura aliquote IVA sincronizzate: ${readError.message}`, aliquote: [] },
            { status: 500 }
        )
    }

    return NextResponse.json({ aliquote: aliquote ?? [] })
}

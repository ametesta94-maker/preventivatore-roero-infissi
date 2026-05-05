import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, readSessionCookie } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'
import type { InsertTables } from '@/types/database'

const categoryFields = [
    'nome',
    'slug',
    'descrizione',
    'icona',
    'ordine',
    'attiva',
    'image_url',
    'description_template',
] as const

type CategoryPayload = InsertTables<'categories'>

function readUser(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    return cookieValue ? readSessionCookie(cookieValue) : null
}

function buildPayload(body: Record<string, unknown>): Partial<CategoryPayload> {
    return categoryFields.reduce<Partial<CategoryPayload>>((payload, field) => {
        if (field in body) {
            payload[field] = body[field] as never
        }
        return payload
    }, {})
}

export async function POST(req: NextRequest) {
    if (!readUser(req)) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = await req.json()
    const payload = buildPayload(body)

    if (!payload.nome || !payload.slug) {
        return NextResponse.json({ error: 'Nome e slug sono obbligatori' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
        .from('categories')
        .insert(payload as CategoryPayload)
        .select('*')
        .single()

    if (error) {
        return NextResponse.json(
            { error: `Errore creazione prodotto: ${error.message}`, code: error.code },
            { status: 500 }
        )
    }

    return NextResponse.json({ category: data }, { status: 201 })
}

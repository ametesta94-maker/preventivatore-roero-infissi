import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, readSessionCookie } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'
import type { UpdateTables } from '@/types/database'

interface RouteContext {
    params: Promise<{ categoryId: string }>
}

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

type CategoryUpdatePayload = UpdateTables<'categories'>

function readUser(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    return cookieValue ? readSessionCookie(cookieValue) : null
}

function buildPayload(body: Record<string, unknown>): CategoryUpdatePayload {
    return categoryFields.reduce<CategoryUpdatePayload>((payload, field) => {
        if (field in body) {
            payload[field] = body[field] as never
        }
        return payload
    }, {})
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    if (!readUser(req)) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { categoryId } = await context.params
    if (!categoryId) {
        return NextResponse.json({ error: 'Prodotto mancante' }, { status: 400 })
    }

    const body = await req.json()
    const payload = buildPayload(body)

    if (Object.keys(payload).length === 0) {
        return NextResponse.json({ error: 'Nessun dato da aggiornare' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', categoryId)
        .select('*')
        .single()

    if (error) {
        return NextResponse.json(
            { error: `Errore aggiornamento prodotto: ${error.message}`, code: error.code },
            { status: 500 }
        )
    }

    return NextResponse.json({ category: data })
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    if (!readUser(req)) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { categoryId } = await context.params
    if (!categoryId) {
        return NextResponse.json({ error: 'Prodotto mancante' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

    if (error) {
        return NextResponse.json(
            { error: `Errore eliminazione prodotto: ${error.message}`, code: error.code },
            { status: 500 }
        )
    }

    return NextResponse.json({ ok: true })
}

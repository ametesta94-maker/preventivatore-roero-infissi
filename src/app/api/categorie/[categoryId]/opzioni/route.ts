import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, readSessionCookie } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'
import type { CategoryOptionValue } from '@/types/database'

interface RouteContext {
    params: Promise<{ categoryId: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { categoryId } = await context.params
    if (!categoryId) {
        return NextResponse.json({ error: 'Categoria mancante' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const [optionsRes, valuesRes] = await Promise.all([
        supabase
            .from('category_options')
            .select('*')
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .order('sort_order'),
        supabase
            .from('category_option_values')
            .select('*, category_options!inner(category_id)')
            .eq('category_options.category_id', categoryId)
            .eq('is_active', true)
            .order('sort_order'),
    ])

    if (optionsRes.error) {
        return NextResponse.json(
            { error: `Errore caricamento opzioni: ${optionsRes.error.message}` },
            { status: 500 }
        )
    }

    if (valuesRes.error) {
        return NextResponse.json(
            { error: `Errore caricamento valori opzioni: ${valuesRes.error.message}` },
            { status: 500 }
        )
    }

    const values = ((valuesRes.data || []) as (CategoryOptionValue & { category_options: unknown })[])
        .map((valueWithJoin) => {
            const { category_options: joinedCategoryOption, ...value } = valueWithJoin
            void joinedCategoryOption
            return value as CategoryOptionValue
        })

    return NextResponse.json({
        options: optionsRes.data ?? [],
        values,
    })
}

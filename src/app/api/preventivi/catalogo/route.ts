import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, readSessionCookie } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const [categoriesRes, prodottiRes] = await Promise.all([
        supabase.from('categories').select('*').eq('attiva', true).order('ordine'),
        supabase
            .from('prodotti')
            .select('id, nome, prezzo_listino, category_id, unita_misura')
            .eq('attivo', true)
            .order('nome'),
    ])

    if (categoriesRes.error) {
        return NextResponse.json(
            { error: `Errore caricamento categorie: ${categoriesRes.error.message}` },
            { status: 500 }
        )
    }

    if (prodottiRes.error) {
        return NextResponse.json(
            { error: `Errore caricamento prodotti: ${prodottiRes.error.message}` },
            { status: 500 }
        )
    }

    return NextResponse.json({
        categories: categoriesRes.data ?? [],
        prodotti: prodottiRes.data ?? [],
    })
}

import { requireSession } from '@/lib/auth/require-session'
import { createAdminClient as createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    // Auth check
    const _sessionUser = await requireSession()
    if (!_sessionUser) {
        return NextResponse.json({
            error: 'Unauthorized',
            details: authError?.message || 'No user found'
        }, { status: 401 })
    }

    // Fetch preventivo with relations
    const { data: preventivo, error } = await supabase
        .from('preventivi')
        .select(`*, clienti (*), sedi (*), aliquote_iva (*)`)
        .eq('id', id)
        .single()

    if (error || !preventivo) {
        return NextResponse.json({ error: 'Preventivo not found', details: error }, { status: 404 })
    }

    // Fetch company info
    const { data: azienda } = await supabase.from('impostazioni').select('*').single()

    // Fetch line items
    const { data: righe } = await supabase
        .from('righe_preventivo')
        .select('*, prodotti (*)')
        .eq('preventivo_id', id)
        .order('numero_riga')

    return NextResponse.json({
        preventivo,
        azienda,
        righe,
        righeCount: righe?.length || 0
    })
}

import { requireSession } from '@/lib/auth/require-session'
import { createAdminClient as createClient } from '@/lib/supabase/server'
import { renderToStream } from '@react-pdf/renderer'
import { PreventivoDocument } from '@/components/pdf/PreventivoDocument'
import { NextResponse } from 'next/server'
import React from 'react'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Auth check
    const _sessionUser = await requireSession()
    if (!_sessionUser) {
        return NextResponse.json({
            error: 'Unauthorized',
            details: authError?.message || 'No user found'
        }, { status: 401 })
    }

    // 2. Fetch data (same logic as preventivi/[id]/page.tsx)

    // Fetch preventivo with relations
    const { data: preventivo, error } = await supabase
        .from('preventivi')
        .select(
            `*, clienti (*), sedi (*), aliquote_iva (*), payment_methods (*)`
        )
        .eq('id', id)
        .single()

    if (error || !preventivo) {
        return NextResponse.json({ error: 'Preventivo not found' }, { status: 404 })
    }

    // Fetch company info
    const { data: azienda } = await supabase.from('impostazioni').select('*').single()

    // Fetch sections with category info
    const { data: sections } = await supabase
        .from('quote_sections')
        .select('*, categories (*)')
        .eq('preventivo_id', id)
        .order('ordine')

    // Fetch section options
    const sectionIds = (sections || []).map((s: any) => s.id)
    const { data: rawSectionOptions } =
        sectionIds.length > 0
            ? await supabase
                .from('quote_section_options')
                .select('*, category_options (*)')
                .in('quote_section_id', sectionIds)
            : { data: [] }

    // Manually fetch section option values
    const sectionValueIds = (rawSectionOptions || [])
        .map((o: any) => o.selected_value_id)
        .filter((vid: string | null): vid is string => vid !== null)

    const { data: sectionOptionValues } =
        sectionValueIds.length > 0
            ? await supabase.from('category_option_values').select('*').in('id', sectionValueIds)
            : { data: [] }

    const sectionOptions = (rawSectionOptions || []).map((opt: any) => ({
        ...opt,
        category_option_values:
            sectionOptionValues?.find((v: any) => v.id === opt.selected_value_id) || null,
    }))

    // Fetch line items
    const { data: righe } = await supabase
        .from('righe_preventivo')
        .select('*, prodotti (*)')
        .eq('preventivo_id', id)
        .order('numero_riga')

    // Fetch item options
    const rigaIds = (righe || []).map((r: any) => r.id)
    const { data: rawItemOptions } =
        rigaIds.length > 0
            ? await supabase
                .from('quote_item_options')
                .select('*, category_options (*)')
                .in('riga_preventivo_id', rigaIds)
            : { data: [] }

    // Manually fetch item option values
    const itemValueIds = (rawItemOptions || [])
        .map((o: any) => o.selected_value_id)
        .filter((vid: string | null): vid is string => vid !== null)

    const { data: itemOptionValues } =
        itemValueIds.length > 0
            ? await supabase.from('category_option_values').select('*').in('id', itemValueIds)
            : { data: [] }

    const itemOptions = (rawItemOptions || []).map((opt: any) => ({
        ...opt,
        category_option_values:
            itemOptionValues?.find((v: any) => v.id === opt.selected_value_id) || null,
    }))

    // Fetch quote services
    const { data: quoteServices } = await supabase
        .from('quote_services')
        .select('*, services(name)')
        .eq('quote_id', id)
        .order('sort_order')

    // 3. Render PDF
    try {
        const stream = await renderToStream(
            React.createElement(PreventivoDocument, {
                preventivo,
                azienda,
                sections: sections || [],
                sectionOptions: sectionOptions || [],
                righe: righe || [],
                itemOptions: itemOptions || [],
                quoteServices: quoteServices || [],
            }) as any
        )

        // 4. Return stream
        return new NextResponse(stream as unknown as ReadableStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Preventivo_${preventivo.numero || id}.pdf"`,
            },
        })
    } catch (err) {
        console.error('PDF Generation Error:', err)
        return NextResponse.json({
            error: 'Failed to generate PDF',
            details: err instanceof Error ? err.message : String(err)
        }, { status: 500 })
    }
}

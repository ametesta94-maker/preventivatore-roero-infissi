import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateAndStoreOrderDocuments } from '@/lib/pdf/generateOrderDocuments'
import { requireSession } from '@/lib/auth/require-session'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { quote_id, deduction_type, notes } = body

        if (!quote_id) {
            return NextResponse.json({ error: 'quote_id è obbligatorio' }, { status: 400 })
        }

        const supabase = await createAdminClient()
        const supabaseAdmin = await createAdminClient()

        // Check auth
        const _sessionUser = await requireSession()
        if (!_sessionUser) {
            return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
        }

        // Verify quote exists and is not already converted
        const { data: quote, error: quoteError } = await supabase
            .from('preventivi')
            .select('id, numero, stato')
            .eq('id', quote_id)
            .single()

        if (quoteError || !quote) {
            return NextResponse.json({ error: 'Preventivo non trovato' }, { status: 404 })
        }

        if (quote.stato === 'convertito_ordine') {
            return NextResponse.json({ error: 'Preventivo già convertito in ordine' }, { status: 400 })
        }

        // Generate order number via RPC
        const { data: orderNumber, error: rpcError } = await supabase
            .rpc('genera_numero_ordine')

        if (rpcError || !orderNumber) {
            console.error('RPC Error genera_numero_ordine:', rpcError);
            return NextResponse.json(
                { error: `Errore nella generazione del numero ordine: ${rpcError?.message || JSON.stringify(rpcError)}` },
                { status: 500 }
            )
        }

        // Create order with Admin client to bypass RLS
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                quote_id,
                order_number: orderNumber,
                status: 'confermato',
                deduction_type: deduction_type || 'nessuna',
                notes: notes || null,
            })
            .select()
            .single()

        if (orderError || !order) {
            return NextResponse.json(
                { error: orderError?.message || 'Errore nella creazione dell\'ordine' },
                { status: 500 }
            )
        }

        // Update quote status to convertito_ordine
        await supabase
            .from('preventivi')
            .update({ stato: 'convertito_ordine' })
            .eq('id', quote_id)

        // Generate PDF documents (awaited so they're ready when user lands on order page)
        try {
            await generateAndStoreOrderDocuments(order.id, quote_id)
        } catch (err) {
            console.error('[ordini/route] Document generation failed:', err)
            // Order created successfully; docs will just be missing
        }

        return NextResponse.json({ order }, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Errore interno' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { order_id, action } = body

        if (!order_id || action !== 'revert_to_quote') {
            return NextResponse.json({ error: 'order_id e action=revert_to_quote sono obbligatori' }, { status: 400 })
        }

        const supabase = await createAdminClient()
        const supabaseAdmin = await createAdminClient()

        // Check auth
        const _sessionUser = await requireSession()
        if (!_sessionUser) {
            return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
        }

        // Fetch the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, quote_id, status')
            .eq('id', order_id)
            .single()

        if (orderError || !order) {
            return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })
        }

        if (order.status === 'annullato') {
            return NextResponse.json({ error: 'Ordine già annullato' }, { status: 400 })
        }

        // Set order status to annullato
        const { error: updateOrderErr } = await supabaseAdmin
            .from('orders')
            .update({ status: 'annullato' })
            .eq('id', order_id)

        if (updateOrderErr) {
            return NextResponse.json({ error: updateOrderErr.message }, { status: 500 })
        }

        // Restore preventivo to accettato
        const { error: updateQuoteErr } = await supabaseAdmin
            .from('preventivi')
            .update({ stato: 'accettato' })
            .eq('id', order.quote_id)

        if (updateQuoteErr) {
            console.error('[ordini/PATCH] Failed to restore quote status:', updateQuoteErr)
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Errore interno' }, { status: 500 })
    }
}

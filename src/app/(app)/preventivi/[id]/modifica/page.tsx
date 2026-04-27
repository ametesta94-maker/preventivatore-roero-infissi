import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuoteEditor from '@/components/preventivi/QuoteEditor'
import type { QuoteFormState, QuoteSectionState, QuotePositionState, QuoteServiceState } from '@/lib/hooks/useQuoteForm'

export default async function ModificaPreventivoPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createAdminClient()
    const { id } = await params

    // 1. Fetch preventivo
    const { data: preventivo } = await supabase.from('preventivi').select('*').eq('id', id).single()

    if (!preventivo) {
        notFound()
    }

    // 2. Fetch sections
    const { data: sections } = await supabase
        .from('quote_sections')
        .select('*, categories(*)')
        .eq('preventivo_id', id)
        .order('ordine')

    if (!sections) return <div>Errore caricamento sezioni</div>

    // 3. Fetch all related data
    // Section Options
    const sectionIds = sections.map((s) => s.id)
    const { data: sectionOptions } = sectionIds.length > 0
        ? await supabase
            .from('quote_section_options')
            .select('*, category_options(option_key), category_option_values(value_key)')
            .in('quote_section_id', sectionIds)
        : { data: [] }

    // Righe
    const { data: righe } = await supabase
        .from('righe_preventivo')
        .select('*, prodotti(nome)')
        .eq('preventivo_id', id)
        .order('numero_riga')

    const righeIds = (righe || []).map((r) => r.id)

    // Item Options
    const { data: itemOptions } = righeIds.length > 0
        ? await supabase
            .from('quote_item_options')
            .select('*, category_options(option_key), category_option_values(value_key)')
            .in('riga_preventivo_id', righeIds)
        : { data: [] }

    // Services
    const { data: quoteServices } = await supabase
        .from('quote_services')
        .select('*, services(name)')
        .eq('quote_id', id)
        .order('sort_order')


    // 4. Transform to QuoteFormState
    const mappedSections: QuoteSectionState[] = sections.map((section) => {
        // Map section options
        const sOpts = (sectionOptions || []).filter((o) => o.quote_section_id === section.id)
        const globalOptions: Record<string, string | string[] | boolean | null> = {}

        const optsByKey = new Map<string, any[]>()
        for (const opt of sOpts) {

            if (!opt.category_options?.option_key) continue

            const key = opt.category_options.option_key
            const existing = optsByKey.get(key) || []
            existing.push(opt)
            optsByKey.set(key, existing)
        }

        for (const [key, opts] of optsByKey.entries()) {
            const values = opts.map(o => {
                if (o.selected_boolean !== null) return o.selected_boolean
                if (o.selected_text !== null) return o.selected_text

                return o.category_option_values?.value_key
            }).filter(v => v !== undefined && v !== null)

            if (values.length === 1) {
                globalOptions[key] = values[0]
            } else if (values.length > 1) {
                globalOptions[key] = values
            }
        }


        // Map righe
        const sectionRighe = (righe || []).filter((r) => r.quote_section_id === section.id)

        const mappedPositions: QuotePositionState[] = sectionRighe.map((r) => {
            const rOpts = (itemOptions || []).filter((o) => o.riga_preventivo_id === r.id)
            const positionOptions: Record<string, string | string[] | boolean | null> = {}

            const rOptsByKey = new Map<string, any[]>()
            for (const opt of rOpts) {

                if (!opt.category_options?.option_key) continue

                const key = opt.category_options.option_key
                const existing = rOptsByKey.get(key) || []
                existing.push(opt)
                rOptsByKey.set(key, existing)
            }

            for (const [key, opts] of rOptsByKey.entries()) {
                const values = opts.map(o => {
                    if (o.selected_boolean !== null) return o.selected_boolean
                    if (o.selected_text !== null) return o.selected_text

                    return o.category_option_values?.value_key
                }).filter(v => v !== undefined && v !== null)

                if (values.length === 1) {
                    positionOptions[key] = values[0]
                } else if (values.length > 1) {
                    positionOptions[key] = values
                }
            }

            return {
                tempId: r.id,
                prodotto_id: r.prodotto_id,

                prodotto_nome: r.prodotti?.nome || '',
                quantita: r.quantita,
                larghezza_mm: r.larghezza_mm || 0,
                altezza_mm: r.altezza_mm || 0,
                posizione_locale: r.posizione_locale || '',
                descrizione: r.descrizione_personalizzata || '',
                positionOptions,
                prezzo_unitario: r.prezzo_unitario_effettivo,
                subtotale_calcolato: r.subtotale_riga,
                manual_price_override: r.manual_price_override !== null ? r.manual_price_override : null
            } as QuotePositionState & { descrizione: string }
        })

        return {
            tempId: section.id,
            category_id: section.category_id,

            category: section.categories,
            globalOptions,
            positions: mappedPositions,
            trasporto: section.trasporto,
            posa: section.posa,
            sconto_percentuale: section.sconto_percentuale,
            subtotale_sezione: section.subtotale_sezione,
            show_line_prices: section.show_line_prices ?? true,
            manual_total_override: section.manual_total_override !== null ? section.manual_total_override : null,
            notes: section.notes || '',
            free_description: section.free_description || ''
        }
    })

    const mappedServices: QuoteServiceState[] = (quoteServices || []).map((s: any) => ({
        tempId: s.id,
        service_id: s.service_id,
        service_name: s.services?.name || 'Servizio Sconosciuto',
        quantity: s.quantity,
        unit_price: s.unit_price,
        notes: s.notes || ''
    }))

    // Calculate validity days
    const diffTime = new Date(preventivo.data_validita).getTime() - new Date(preventivo.data_preventivo).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const initialData: QuoteFormState = {
        cliente_id: preventivo.cliente_id,
        sede_id: preventivo.sede_id || '',
        aliquota_iva_id: preventivo.aliquota_iva_id,
        data_preventivo: preventivo.data_preventivo,
        validita_giorni: diffDays > 0 ? diffDays : 30,
        note: preventivo.note_preventivo || '',
        note_interne: preventivo.note_interne || '',
        show_grand_total: preventivo.show_grand_total ?? true,
        show_iva: preventivo.show_iva ?? true,
        payment_method_id: preventivo.payment_method_id || '',
        payment_notes: preventivo.payment_notes || '',
        sections: mappedSections,
        services: mappedServices,
        sconto_globale_1: preventivo.sconto_globale_1 || 0,
        sconto_globale_2: preventivo.sconto_globale_2 || 0,
        stato: preventivo.stato || 'bozza',
        importo_beni_significativi: preventivo.importo_beni_significativi || 0,
        emesso_da: (preventivo as any).emesso_da || '',
    }

    return <QuoteEditor mode="edit" preventivoId={id} initialData={initialData} />
}

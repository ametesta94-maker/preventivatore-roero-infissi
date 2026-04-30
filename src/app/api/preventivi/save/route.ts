import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, readSessionCookie } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/server'
import type { CategoryOption, CategoryOptionValue } from '@/types/database'

type SelectionValue = string | string[] | boolean | null

interface QuotePositionPayload {
    prodotto_id: string
    quantita: number
    larghezza_mm: number
    altezza_mm: number
    posizione_locale: string
    descrizione: string
    positionOptions: Record<string, SelectionValue>
    prezzo_unitario: number
    subtotale_calcolato: number
    manual_price_override: number | null
}

interface QuoteSectionPayload {
    category_id: string
    globalOptions: Record<string, SelectionValue>
    positions: QuotePositionPayload[]
    trasporto: number
    posa: number
    sconto_percentuale: number
    subtotale_sezione: number
    show_line_prices: boolean
    manual_total_override: number | null
    notes: string
    free_description: string
}

interface QuoteServicePayload {
    service_id: string
    quantity: number
    unit_price: number
    notes: string
}

interface SaveQuoteBody {
    mode?: 'create' | 'edit'
    preventivoId?: string
    preventivo?: Record<string, unknown>
    sections?: QuoteSectionPayload[]
    services?: QuoteServicePayload[]
}

function buildOptionRows(
    selections: Record<string, SelectionValue>,
    options: CategoryOption[],
    values: CategoryOptionValue[]
): Array<{
    category_option_id: string
    selected_value_id?: string
    selected_text?: string
    selected_boolean?: boolean
    price_adjustment: number
}> {
    const rows = []
    const optionByKey = new Map(options.map((option) => [option.option_key, option]))
    const valuesByOptionId = new Map<string, CategoryOptionValue[]>()

    for (const value of values) {
        const optionValues = valuesByOptionId.get(value.category_option_id) || []
        optionValues.push(value)
        valuesByOptionId.set(value.category_option_id, optionValues)
    }

    for (const [key, selection] of Object.entries(selections)) {
        if (selection == null || selection === '' || selection === false) continue
        const option = optionByKey.get(key)
        if (!option) continue

        if (typeof selection === 'boolean') {
            rows.push({
                category_option_id: option.id,
                selected_boolean: selection,
                price_adjustment: option.price_adjustment_default,
            })
        } else if (typeof selection === 'string') {
            if (option.option_type === 'text' || option.option_type === 'number') {
                rows.push({
                    category_option_id: option.id,
                    selected_text: selection,
                    price_adjustment: 0,
                })
            } else {
                const selectedValue = (valuesByOptionId.get(option.id) || [])
                    .find((value) => value.value_key === selection)
                if (selectedValue) {
                    rows.push({
                        category_option_id: option.id,
                        selected_value_id: selectedValue.id,
                        price_adjustment: selectedValue.price_adjustment,
                    })
                }
            }
        } else if (Array.isArray(selection)) {
            const optionValues = valuesByOptionId.get(option.id) || []
            for (const selectedKey of selection) {
                const selectedValue = optionValues.find((value) => value.value_key === selectedKey)
                if (selectedValue) {
                    rows.push({
                        category_option_id: option.id,
                        selected_value_id: selectedValue.id,
                        price_adjustment: selectedValue.price_adjustment,
                    })
                }
            }
        }
    }

    return rows
}

export async function POST(req: NextRequest) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value
    const user = cookieValue ? readSessionCookie(cookieValue) : null
    if (!user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    let body: SaveQuoteBody
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Body non valido' }, { status: 400 })
    }

    const { mode, preventivoId, preventivo, sections = [], services = [] } = body
    if (mode !== 'create' && mode !== 'edit') {
        return NextResponse.json({ error: 'Modalita salvataggio non valida' }, { status: 400 })
    }
    if (mode === 'edit' && !preventivoId) {
        return NextResponse.json({ error: 'ID preventivo mancante' }, { status: 400 })
    }
    if (!preventivo) {
        return NextResponse.json({ error: 'Dati preventivo mancanti' }, { status: 400 })
    }
    if (sections.length === 0) {
        return NextResponse.json({ error: 'Aggiungi almeno un prodotto/sezione al preventivo prima di salvare' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    let currentPreventivoId = preventivoId

    try {
        if (mode === 'create') {
            const { data: numero, error: numeroError } = await supabase.rpc('genera_numero_preventivo')
            if (numeroError || !numero) {
                throw new Error(numeroError?.message || 'Impossibile generare il numero preventivo')
            }

            const { data: created, error } = await supabase
                .from('preventivi')
                .insert({
                    ...preventivo,
                    numero,
                })
                .select('id')
                .single()

            if (error || !created) throw new Error(error?.message || 'Errore creazione preventivo')
            currentPreventivoId = created.id
        } else {
            const { error } = await supabase
                .from('preventivi')
                .update(preventivo)
                .eq('id', preventivoId)
            if (error) throw new Error(error.message)

            const { error: sectionsDeleteError } = await supabase
                .from('quote_sections')
                .delete()
                .eq('preventivo_id', preventivoId)
            if (sectionsDeleteError) throw new Error(sectionsDeleteError.message)

            const { error: servicesDeleteError } = await supabase
                .from('quote_services')
                .delete()
                .eq('quote_id', preventivoId)
            if (servicesDeleteError) throw new Error(servicesDeleteError.message)
        }

        if (!currentPreventivoId) throw new Error('ID preventivo non disponibile')

        const categoryIds = [...new Set(sections.map((section) => section.category_id).filter(Boolean))]
        const categoryOptionsMap = new Map<string, { options: CategoryOption[]; values: CategoryOptionValue[] }>()

        for (const categoryId of categoryIds) {
            const [optionsRes, valuesRes] = await Promise.all([
                supabase
                    .from('category_options')
                    .select('*')
                    .eq('category_id', categoryId)
                    .eq('is_active', true),
                supabase
                    .from('category_option_values')
                    .select('*, category_options!inner(category_id)')
                    .eq('category_options.category_id', categoryId)
                    .eq('is_active', true),
            ])

            if (optionsRes.error) throw new Error(optionsRes.error.message)
            if (valuesRes.error) throw new Error(valuesRes.error.message)

            const values = ((valuesRes.data || []) as (CategoryOptionValue & { category_options: unknown })[])
                .map((valueWithJoin) => {
                    const { category_options: joinedCategoryOption, ...value } = valueWithJoin
                    void joinedCategoryOption
                    return value as CategoryOptionValue
                })

            categoryOptionsMap.set(categoryId, {
                options: (optionsRes.data || []) as CategoryOption[],
                values,
            })
        }

        for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
            const section = sections[sectionIndex]
            const categoryData = categoryOptionsMap.get(section.category_id) || { options: [], values: [] }
            const globalOptions = categoryData.options.filter((option) => !option.applies_to_position)
            const globalOptionIds = new Set(globalOptions.map((option) => option.id))
            const globalValues = categoryData.values.filter((value) => globalOptionIds.has(value.category_option_id))
            const positionOptions = categoryData.options.filter((option) => option.applies_to_position)
            const positionOptionIds = new Set(positionOptions.map((option) => option.id))
            const positionValues = categoryData.values.filter((value) => positionOptionIds.has(value.category_option_id))

            const { data: dbSection, error: sectionError } = await supabase
                .from('quote_sections')
                .insert({
                    preventivo_id: currentPreventivoId,
                    category_id: section.category_id,
                    ordine: sectionIndex + 1,
                    trasporto: section.trasporto,
                    posa: section.posa,
                    sconto_percentuale: section.sconto_percentuale,
                    subtotale_sezione: section.subtotale_sezione,
                    show_line_prices: section.show_line_prices ?? true,
                    manual_total_override: section.manual_total_override ?? null,
                    notes: section.notes || null,
                    free_description: section.free_description || null,
                })
                .select('id')
                .single()

            if (sectionError || !dbSection) throw new Error(sectionError?.message || 'Errore creazione sezione')

            const sectionOptionRows = buildOptionRows(section.globalOptions || {}, globalOptions, globalValues)
            if (sectionOptionRows.length > 0) {
                const { error } = await supabase
                    .from('quote_section_options')
                    .insert(sectionOptionRows.map((row) => ({
                        quote_section_id: dbSection.id,
                        category_option_id: row.category_option_id,
                        selected_value_id: row.selected_value_id,
                        selected_text: row.selected_text,
                        selected_boolean: row.selected_boolean,
                        price_adjustment: row.price_adjustment,
                    })))
                if (error) throw new Error(error.message)
            }

            for (let positionIndex = 0; positionIndex < section.positions.length; positionIndex++) {
                const position = section.positions[positionIndex]
                if (!position.prodotto_id) continue

                const { data: dbRow, error: rowError } = await supabase
                    .from('righe_preventivo')
                    .insert({
                        preventivo_id: currentPreventivoId,
                        quote_section_id: dbSection.id,
                        prodotto_id: position.prodotto_id,
                        numero_riga: positionIndex + 1,
                        quantita: position.quantita,
                        larghezza_mm: position.larghezza_mm || null,
                        altezza_mm: position.altezza_mm || null,
                        posizione_locale: position.posizione_locale || null,
                        descrizione_personalizzata: position.descrizione || null,
                        prezzo_unitario_effettivo: position.prezzo_unitario,
                        subtotale_riga: position.subtotale_calcolato,
                        manual_price_override: position.manual_price_override ?? null,
                    })
                    .select('id')
                    .single()

                if (rowError || !dbRow) throw new Error(rowError?.message || 'Errore creazione riga')

                const itemOptionRows = buildOptionRows(position.positionOptions || {}, positionOptions, positionValues)
                if (itemOptionRows.length > 0) {
                    const { error } = await supabase
                        .from('quote_item_options')
                        .insert(itemOptionRows.map((row) => ({
                            riga_preventivo_id: dbRow.id,
                            category_option_id: row.category_option_id,
                            selected_value_id: row.selected_value_id,
                            selected_text: row.selected_text,
                            selected_boolean: row.selected_boolean,
                            price_adjustment: row.price_adjustment,
                        })))
                    if (error) throw new Error(error.message)
                }
            }
        }

        const validServices = services.filter((service) => service.service_id)
        if (validServices.length > 0) {
            const { error } = await supabase
                .from('quote_services')
                .insert(validServices.map((service, serviceIndex) => ({
                    quote_id: currentPreventivoId,
                    service_id: service.service_id,
                    quantity: service.quantity,
                    unit_price: service.unit_price,
                    notes: service.notes || null,
                    sort_order: serviceIndex + 1,
                })))
            if (error) throw new Error(error.message)
        }

        return NextResponse.json({ id: currentPreventivoId })
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Errore durante il salvataggio del preventivo' },
            { status: 500 }
        )
    }
}

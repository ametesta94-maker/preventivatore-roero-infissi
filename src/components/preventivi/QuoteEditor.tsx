'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Category, AliquotaIva, CategoryOption, CategoryOptionValue } from '@/types/database'
import { useQuoteForm, QuoteFormState } from '@/lib/hooks/useQuoteForm'
import { calculateQuoteTotal, calculateLineItemPrice, calculateSectionPrice, OptionAdjustment } from '@/lib/utils/calculations'
import { useCategoryOptions } from '@/lib/hooks/useCategoryOptions'
import QuoteSection from '@/components/preventivi/QuoteSection'
import QuoteTotals from '@/components/preventivi/QuoteTotals'
import QuoteServices from './QuoteServices'
import styles from '@/app/(app)/preventivi/nuovo/page.module.css' // Reusing styles

interface QuoteEditorProps {
    initialData?: QuoteFormState
    preventivoId?: string
    mode: 'create' | 'edit'
}

interface ClienteOption {
    id: string       // 'crm_<n>' per contatti CRM, UUID per clienti Supabase già esistenti
    ragione_sociale: string
    crm_id?: number  // presente solo per contatti CRM
    email?: string | null
    telefono_principale?: string | null
    citta?: string | null
    provincia?: string | null
    indirizzo?: string | null
}

interface SedeOption {
    id: string
    nome_sede: string
    cliente_id: string
}

interface ProdottoOption {
    id: string
    nome: string
    prezzo_listino: number
    category_id: string | null
    unita_misura: string
}

// ... Helper functions ...
function resolvePositionAdjustments(
    positionOptions: Record<string, string | string[] | boolean | null>,
    optionDefs: CategoryOption[],
    optionValues: CategoryOptionValue[]
): OptionAdjustment[] {
    const adjustments: OptionAdjustment[] = []
    const optionByKey = new Map(optionDefs.map(o => [o.option_key, o]))
    const valuesByOptionId = new Map<string, CategoryOptionValue[]>()
    for (const v of optionValues) {
        const arr = valuesByOptionId.get(v.category_option_id) || []
        arr.push(v)
        valuesByOptionId.set(v.category_option_id, arr)
    }

    for (const [optionKey, selection] of Object.entries(positionOptions)) {
        if (selection == null || selection === '' || selection === false) continue
        const optDef = optionByKey.get(optionKey)
        if (!optDef) continue

        if (typeof selection === 'boolean' && selection) {
            adjustments.push({
                price_adjustment: optDef.price_adjustment_default,
                price_mode: 'fixed' as const,
            })
        } else if (typeof selection === 'string') {
            if (optDef.option_type === 'text' || optDef.option_type === 'number') continue
            const vals = valuesByOptionId.get(optDef.id) || []
            const selectedVal = vals.find(v => v.value_key === selection)
            if (selectedVal && selectedVal.price_adjustment !== 0) {
                adjustments.push({
                    price_adjustment: selectedVal.price_adjustment,
                    price_mode: (selectedVal.price_mode || 'fixed') as OptionAdjustment['price_mode'],
                })
            }
        } else if (Array.isArray(selection)) {
            const vals = valuesByOptionId.get(optDef.id) || []
            for (const sel of selection) {
                const selectedVal = vals.find(v => v.value_key === sel)
                if (selectedVal && selectedVal.price_adjustment !== 0) {
                    adjustments.push({
                        price_adjustment: selectedVal.price_adjustment,
                        price_mode: (selectedVal.price_mode || 'fixed') as OptionAdjustment['price_mode'],
                    })
                }
            }
        }
    }
    return adjustments
}

function resolveGlobalAdjustments(
    globalSelections: Record<string, string | string[] | boolean | null>,
    optionDefs: CategoryOption[],
    optionValues: CategoryOptionValue[]
): OptionAdjustment[] {
    return resolvePositionAdjustments(globalSelections, optionDefs, optionValues)
}

function SectionWithOptions({
    section,
    prodotti,
    onRemove,
    onSetGlobalOption,
    onSetSectionField,
    onAddPosition,
    onRemovePosition,
    onUpdatePosition,
    onSetPositionOption,
    onUpdatePositionPrice,
    onUpdateSectionSubtotal,
}: {
    section: ReturnType<typeof useQuoteForm>['state']['sections'][0]
    prodotti: ProdottoOption[]
    onRemove: () => void
    onSetGlobalOption: (optionKey: string, value: string | string[] | boolean | null) => void
    onSetSectionField: (field: 'trasporto' | 'posa' | 'sconto_percentuale' | 'note_sezione' | 'show_line_prices' | 'manual_total_override' | 'notes' | 'free_description', value: number | string | boolean | null) => void
    onAddPosition: () => void
    onRemovePosition: (positionTempId: string) => void
    onUpdatePosition: (positionTempId: string, field: string, value: string | number | boolean | null) => void
    onSetPositionOption: (positionTempId: string, optionKey: string, value: string | string[] | boolean | null) => void
    onUpdatePositionPrice: (positionTempId: string, subtotale: number) => void
    onUpdateSectionSubtotal: (subtotale: number) => void
}) {
    const { globalOptions, globalValues, positionOptions, positionValues, isLoading } = useCategoryOptions(section.category_id)

    const categoryProdotti = useMemo(
        () => prodotti.filter(p => p.category_id === section.category_id),
        [prodotti, section.category_id]
    )

    const onUpdatePositionPriceRef = useRef(onUpdatePositionPrice)
    onUpdatePositionPriceRef.current = onUpdatePositionPrice
    const onUpdateSectionSubtotalRef = useRef(onUpdateSectionSubtotal)
    onUpdateSectionSubtotalRef.current = onUpdateSectionSubtotal

    const prevPositionSubtotals = useRef<Record<string, number>>({})
    const prevSectionSubtotal = useRef<number>(0)

    useEffect(() => {
        if (isLoading) return

        for (const position of section.positions) {
            if (!position.prodotto_id) {
                if (prevPositionSubtotals.current[position.tempId] !== 0) {
                    prevPositionSubtotals.current[position.tempId] = 0
                    onUpdatePositionPriceRef.current(position.tempId, 0)
                }
                continue
            }

            const prodotto = categoryProdotti.find(p => p.id === position.prodotto_id)
            const unita_misura = (prodotto as ProdottoOption | undefined)?.unita_misura || 'pezzo'

            const optAdj = resolvePositionAdjustments(
                position.positionOptions,
                positionOptions,
                positionValues
            )

            const subtotale = calculateLineItemPrice({
                prezzo_base: position.prezzo_unitario,
                quantita: position.quantita,
                larghezza_mm: position.larghezza_mm,
                altezza_mm: position.altezza_mm,
                unita_misura: unita_misura as 'pezzo' | 'mq' | 'ml',
                option_adjustments: optAdj,
            })

            if (prevPositionSubtotals.current[position.tempId] !== subtotale) {
                prevPositionSubtotals.current[position.tempId] = subtotale
                onUpdatePositionPriceRef.current(position.tempId, subtotale)
            }
        }
    }, [section.positions, positionOptions, positionValues, categoryProdotti, isLoading])

    useEffect(() => {
        if (isLoading) return

        const righe = section.positions.map(p => ({ subtotale: p.subtotale_calcolato }))
        const globalAdj = resolveGlobalAdjustments(
            section.globalOptions,
            globalOptions,
            globalValues
        )

        const sectionSubtotal = calculateSectionPrice({
            righe,
            global_option_adjustments: globalAdj,
            trasporto: section.trasporto,
            posa: section.posa,
            sconto_percentuale: section.sconto_percentuale,
            manual_total_override: section.manual_total_override,
        })

        if (prevSectionSubtotal.current !== sectionSubtotal) {
            prevSectionSubtotal.current = sectionSubtotal
            onUpdateSectionSubtotalRef.current(sectionSubtotal)
        }
    }, [
        section.positions, section.globalOptions, section.trasporto, section.posa,
        section.sconto_percentuale, section.manual_total_override, globalOptions, globalValues, isLoading
    ])

    if (isLoading) {
        return (
            <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Caricamento opzioni {section.category.nome}...
            </div>
        )
    }

    return (
        <QuoteSection
            section={section}
            globalOptions={globalOptions}
            globalValues={globalValues}
            positionOptions={positionOptions}
            positionValues={positionValues}
            prodotti={categoryProdotti}
            onRemove={onRemove}
            onSetGlobalOption={onSetGlobalOption}
            onSetSectionField={onSetSectionField}
            onAddPosition={onAddPosition}
            onRemovePosition={onRemovePosition}
            onUpdatePosition={onUpdatePosition}
            onSetPositionOption={onSetPositionOption}
        />
    )
}

function buildOptionRows(
    selections: Record<string, string | string[] | boolean | null>,
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
    const optionByKey = new Map(options.map(o => [o.option_key, o]))
    const valuesByOptionId = new Map<string, CategoryOptionValue[]>()
    for (const v of values) {
        const arr = valuesByOptionId.get(v.category_option_id) || []
        arr.push(v)
        valuesByOptionId.set(v.category_option_id, arr)
    }

    for (const [key, val] of Object.entries(selections)) {
        if (val == null || val === '' || val === false) continue
        const optDef = optionByKey.get(key)
        if (!optDef) continue

        if (typeof val === 'boolean') {
            rows.push({
                category_option_id: optDef.id,
                selected_boolean: val,
                price_adjustment: optDef.price_adjustment_default
            })
        } else if (typeof val === 'string') {
            if (optDef.option_type === 'text' || optDef.option_type === 'number') {
                rows.push({
                    category_option_id: optDef.id,
                    selected_text: val,
                    price_adjustment: 0
                })
            } else {
                const vals = valuesByOptionId.get(optDef.id) || []
                const selectedVal = vals.find(v => v.value_key === val)
                if (selectedVal) {
                    rows.push({
                        category_option_id: optDef.id,
                        selected_value_id: selectedVal.id,
                        price_adjustment: selectedVal.price_adjustment
                    })
                }
            }
        } else if (Array.isArray(val)) {
            const vals = valuesByOptionId.get(optDef.id) || []
            for (const vKey of val) {
                const selectedVal = vals.find(v => v.value_key === vKey)
                if (selectedVal) {
                    rows.push({
                        category_option_id: optDef.id,
                        selected_value_id: selectedVal.id,
                        price_adjustment: selectedVal.price_adjustment
                    })
                }
            }
        }
    }
    return rows
}

export default function QuoteEditor({ initialData, preventivoId, mode }: QuoteEditorProps) {
    const [clienti, setClienti] = useState<ClienteOption[]>([])   // lista risultati ricerca CRM
    const [crmSearch, setCrmSearch] = useState('')
    const [crmSearchLoading, setCrmSearchLoading] = useState(false)
    const [crmError, setCrmError] = useState<string | null>(null)
    const [selectedClienteName, setSelectedClienteName] = useState(
        initialData?.cliente_id ? '(cliente esistente)' : ''
    )
    const [sedi, setSedi] = useState<SedeOption[]>([])
    const [aliquote, setAliquote] = useState<AliquotaIva[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [prodotti, setProdotti] = useState<ProdottoOption[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)
    const router = useRouter()
    const crmSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const {
        state,
        setField,
        addSection,
        removeSection,
        setSectionGlobalOption,
        setSectionField,
        addPosition,
        removePosition,
        updatePosition,
        setPositionOption,
        updatePositionPrice,
        updateSectionSubtotal,
        addService,
        removeService,
        updateService,
    } = useQuoteForm(initialData)

    // Ricerca clienti CRM con debounce
    const searchCRM = useCallback(async (q: string) => {
        setCrmSearchLoading(true)
        setCrmError(null)
        try {
            const res = await fetch(`/api/clienti/from-crm?q=${encodeURIComponent(q)}`)
            const data = await res.json()
            if (data.error) {
                setCrmError(data.error)
                setClienti([])
            } else {
                setClienti((data.results || []).map((c: { crm_id: number; ragione_sociale: string; email: string | null; telefono_principale: string | null; citta: string | null; provincia: string | null; indirizzo: string | null }) => ({
                    id: `crm_${c.crm_id}`,
                    ragione_sociale: c.ragione_sociale,
                    crm_id: c.crm_id,
                    email: c.email,
                    telefono_principale: c.telefono_principale,
                    citta: c.citta,
                    provincia: c.provincia,
                    indirizzo: c.indirizzo,
                })))
            }
        } catch {
            setCrmError('Errore connessione CRM')
        } finally {
            setCrmSearchLoading(false)
        }
    }, [])

    const handleCrmSearchChange = (value: string) => {
        setCrmSearch(value)
        if (crmSearchRef.current) clearTimeout(crmSearchRef.current)
        if (value.length >= 2) {
            crmSearchRef.current = setTimeout(() => searchCRM(value), 350)
        } else {
            setClienti([])
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            const supabase = createClient()

            const [aliquoteRes, categoriesRes, prodottiRes] = await Promise.all([
                supabase.from('aliquote_iva').select('*').eq('attiva', true).order('ordine'),
                supabase.from('categories').select('*').eq('attiva', true).order('ordine'),
                supabase.from('prodotti').select('id, nome, prezzo_listino, category_id, unita_misura').eq('attivo', true).order('nome'),
            ])

            if (aliquoteRes.data) {
                setAliquote(aliquoteRes.data as AliquotaIva[])
                if (aliquoteRes.data.length > 0 && !state.aliquota_iva_id && mode === 'create') {
                    setField('aliquota_iva_id', aliquoteRes.data[0].id)
                }
            }
            if (categoriesRes.data) setCategories(categoriesRes.data as Category[])
            if (prodottiRes.data) setProdotti(prodottiRes.data as ProdottoOption[])

            // Auto-fill emesso_da dalla sessione CRM (non più da Supabase Auth)
            if (!state.emesso_da) {
                try {
                    const meRes = await fetch('/api/auth/me')
                    if (meRes.ok) {
                        const meData = await meRes.json()
                        if (meData.user?.display_name) setField('emesso_da', meData.user.display_name)
                    }
                } catch {
                    // Non blocca il caricamento
                }
            }

            setLoading(false)
        }
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Keep deps empty to run once on mount

    useEffect(() => {
        if (!state.cliente_id) {
            setSedi([])
            if (mode === 'create') setField('sede_id', '')
            return
        }
        const loadSedi = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('sedi')
                .select('id, nome_sede, cliente_id')
                .eq('cliente_id', state.cliente_id)
                .eq('attiva', true)
                .order('nome_sede')
            setSedi(data || [])
        }
        loadSedi()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.cliente_id]) // Re-run when client changes

    const selectedAliquota = useMemo(
        () => aliquote.find(a => a.id === state.aliquota_iva_id),
        [aliquote, state.aliquota_iva_id]
    )

    const availableCategories = useMemo(
        () => categories.filter(c => c.attiva),
        [categories]
    )

    const quoteTotals = useMemo(() => {
        return calculateQuoteTotal({
            sezioni: state.sections.map(s => ({ subtotale_sezione: s.subtotale_sezione })),
            servizi: state.services.map(s => ({ quantity: s.quantity, unit_price: s.unit_price })),
            aliquota_iva_percentuale: selectedAliquota?.percentuale || 22,
            sconto_globale_1: state.sconto_globale_1,
            sconto_globale_2: state.sconto_globale_2,
            is_combined: selectedAliquota?.is_combined ?? false,
            rate_secondary: selectedAliquota?.rate_secondary ?? null,
            importo_beni_significativi: state.importo_beni_significativi,
        })
    }, [state.sections, state.services, selectedAliquota, state.sconto_globale_1, state.sconto_globale_2, state.importo_beni_significativi])

    const handleAddSection = useCallback((category: Category) => {
        addSection(category)
        setShowCategoryPicker(false)
    }, [addSection])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!state.cliente_id) {
            setError('Seleziona un cliente')
            return
        }
        if (!state.aliquota_iva_id) {
            setError('Seleziona un\'aliquota IVA')
            return
        }
        if (state.sections.length === 0) {
            setError('Aggiungi almeno una sezione al preventivo')
            return
        }

        for (const section of state.sections) {
            const hasProduct = section.positions.some(p => p.prodotto_id && p.prodotto_id !== '')
            const hasManualTotal = section.manual_total_override != null
            const hasFreeDescription = section.free_description && section.free_description.trim() !== ''
            if (!hasProduct && !hasManualTotal && !hasFreeDescription) {
                setError(`La sezione "${section.category.nome}" deve avere almeno una posizione con un prodotto`)
                return
            }
        }

        setSaving(true)

        try {
            const supabase = createClient()
            let currentPreventivoId = preventivoId

            // Risolvi il contatto CRM in un UUID Supabase se necessario
            let resolvedClienteId = state.cliente_id
            if (state.cliente_id.startsWith('crm_')) {
                const crmContact = clienti.find(c => c.id === state.cliente_id)
                if (!crmContact?.crm_id) {
                    setError('Contatto CRM non trovato. Riseleziona il cliente.')
                    setSaving(false)
                    return
                }
                const resolveRes = await fetch('/api/clienti/crm-resolve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        crm_id: crmContact.crm_id,
                        ragione_sociale: crmContact.ragione_sociale,
                        email: crmContact.email,
                        telefono_principale: crmContact.telefono_principale,
                        citta: crmContact.citta,
                        provincia: crmContact.provincia,
                        indirizzo: crmContact.indirizzo,
                    }),
                })
                const resolveData = await resolveRes.json()
                if (resolveData.error || !resolveData.id) {
                    throw new Error(resolveData.error || 'Errore risoluzione cliente CRM')
                }
                resolvedClienteId = resolveData.id
            }

            const commonData = {
                cliente_id: resolvedClienteId,
                sede_id: state.sede_id || null,
                aliquota_iva_id: state.aliquota_iva_id,
                data_preventivo: state.data_preventivo,
                data_validita: new Date(new Date(state.data_preventivo).setDate(new Date(state.data_preventivo).getDate() + state.validita_giorni)).toISOString().split('T')[0],
                note_preventivo: state.note || null,
                note_interne: state.note_interne || null,
                show_grand_total: state.show_grand_total ?? true,
                show_iva: state.show_iva ?? true,
                payment_method_id: state.payment_method_id || null,
                payment_notes: state.payment_notes || null,
                sconto_globale_1: state.sconto_globale_1,
                sconto_globale_2: state.sconto_globale_2,
                importo_beni_significativi: state.importo_beni_significativi,
                totale_imponibile: quoteTotals.totale_imponibile,
                totale_imponibile_scontato: quoteTotals.totale_imponibile_scontato,
                totale_iva: quoteTotals.totale_iva,
                totale_preventivo: quoteTotals.totale_preventivo,
                stato: state.stato,
                emesso_da: state.emesso_da || null,
            }

            if (mode === 'create') {
                const { data: numero } = await supabase.rpc('genera_numero_preventivo')
                if (!numero) throw new Error('Impossibile generare il numero preventivo')

                const { data: preventivo, error: prevError } = await supabase
                    .from('preventivi')
                    .insert({
                        ...commonData,
                        numero,
                    })
                    .select()
                    .single()
                if (prevError) throw prevError
                currentPreventivoId = preventivo.id
            } else {
                if (!currentPreventivoId) throw new Error('ID Preventivo mancante in modifica')
                // Update request
                const { error: prevError } = await supabase
                    .from('preventivi')
                    .update(commonData)
                    .eq('id', currentPreventivoId)
                if (prevError) throw prevError

                // Delete existing sections (cascades to items and options)
                const { error: delError } = await supabase
                    .from('quote_sections')
                    .delete()
                    .eq('preventivo_id', currentPreventivoId)
                if (delError) throw delError

                // Delete existing services
                const { error: delServicesError } = await supabase
                    .from('quote_services')
                    .delete()
                    .eq('quote_id', currentPreventivoId)
                if (delServicesError) throw delServicesError
            }

            if (!currentPreventivoId) throw new Error('Failed to get preventivo ID')

            // Fetch options metadata (same as before)
            const categoryIds = [...new Set(state.sections.map(s => s.category_id))]
            const categoryOptionsMap = new Map<string, { options: CategoryOption[]; values: CategoryOptionValue[] }>()

            for (const catId of categoryIds) {
                const [optRes, valRes] = await Promise.all([
                    supabase.from('category_options').select('*').eq('category_id', catId).eq('is_active', true),
                    supabase.from('category_option_values').select('*, category_options!inner(category_id)')
                        .eq('category_options.category_id', catId).eq('is_active', true),
                ])
                categoryOptionsMap.set(catId, {
                    options: (optRes.data || []) as CategoryOption[],
                    values: ((valRes.data || []) as (CategoryOptionValue & { category_options: unknown })[]).map(
                        ({ category_options: _, ...v }) => v as CategoryOptionValue
                    ),
                })
            }

            // Insert all sections and items
            for (let sIdx = 0; sIdx < state.sections.length; sIdx++) {
                const section = state.sections[sIdx]
                const catData = categoryOptionsMap.get(section.category_id) || { options: [], values: [] }
                const globalOpts = catData.options.filter(o => !o.applies_to_position)
                const globalVals = catData.values.filter(v => {
                    const optIds = new Set(globalOpts.map(o => o.id))
                    return optIds.has(v.category_option_id)
                })
                const posOpts = catData.options.filter(o => o.applies_to_position)
                const posVals = catData.values.filter(v => {
                    const optIds = new Set(posOpts.map(o => o.id))
                    return optIds.has(v.category_option_id)
                })

                const { data: dbSection, error: sectionError } = await supabase
                    .from('quote_sections')
                    .insert({
                        preventivo_id: currentPreventivoId,
                        category_id: section.category_id,
                        ordine: sIdx + 1,
                        trasporto: section.trasporto,
                        posa: section.posa,
                        sconto_percentuale: section.sconto_percentuale,
                        subtotale_sezione: section.subtotale_sezione,
                        show_line_prices: section.show_line_prices ?? true,
                        manual_total_override: section.manual_total_override ?? null,
                        notes: section.notes || null,
                        free_description: section.free_description || null,
                    })
                    .select()
                    .single()

                if (sectionError) throw sectionError

                const sectionOptionRows = buildOptionRows(section.globalOptions, globalOpts, globalVals)
                if (sectionOptionRows.length > 0) {
                    const { error: soError } = await supabase
                        .from('quote_section_options')
                        .insert(sectionOptionRows.map(row => ({
                            quote_section_id: dbSection.id,
                            category_option_id: row.category_option_id,
                            selected_value_id: row.selected_value_id,
                            selected_text: row.selected_text,
                            selected_boolean: row.selected_boolean,
                            price_adjustment: row.price_adjustment,
                        })))
                    if (soError) throw soError
                }

                for (let pIdx = 0; pIdx < section.positions.length; pIdx++) {
                    const position = section.positions[pIdx]
                    if (!position.prodotto_id) continue

                    const { data: dbRiga, error: rigaError } = await supabase
                        .from('righe_preventivo')
                        .insert({
                            preventivo_id: currentPreventivoId,
                            quote_section_id: dbSection.id,
                            prodotto_id: position.prodotto_id,
                            numero_riga: pIdx + 1,
                            quantita: position.quantita,
                            larghezza_mm: position.larghezza_mm || null,
                            altezza_mm: position.altezza_mm || null,
                            posizione_locale: position.posizione_locale || null,
                            descrizione_personalizzata: position.descrizione || null,
                            prezzo_unitario_effettivo: position.prezzo_unitario,
                            subtotale_riga: position.subtotale_calcolato,
                            manual_price_override: position.manual_price_override ?? null,
                        })
                        .select()
                        .single()

                    if (rigaError) throw rigaError

                    const itemOptionRows = buildOptionRows(position.positionOptions, posOpts, posVals)
                    if (itemOptionRows.length > 0) {
                        const { error: ioError } = await supabase
                            .from('quote_item_options')
                            .insert(itemOptionRows.map(row => ({
                                riga_preventivo_id: dbRiga.id,
                                category_option_id: row.category_option_id,
                                selected_value_id: row.selected_value_id,
                                selected_text: row.selected_text,
                                selected_boolean: row.selected_boolean,
                                price_adjustment: row.price_adjustment,
                            })))
                        if (ioError) throw ioError
                    }
                }
            }

            // Insert services
            if (state.services.length > 0) {
                const { error: servicesError } = await supabase
                    .from('quote_services')
                    .insert(state.services.map((s, sIdx) => ({
                        quote_id: currentPreventivoId,
                        service_id: s.service_id,
                        quantity: s.quantity,
                        unit_price: s.unit_price,
                        notes: s.notes || null,
                        sort_order: sIdx + 1,
                    })))
                if (servicesError) throw servicesError
            }

            router.push(`/preventivi/${currentPreventivoId}`)
            router.refresh()
        } catch (err: unknown) {
            console.error(err)
            if (err instanceof Error) {
                setError(`Errore: ${err.message}`)
            } else {
                setError('Errore durante il salvataggio del preventivo')
            }
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <p style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
                    Caricamento dati...
                </p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>{mode === 'create' ? 'Nuovo Preventivo' : 'Modifica Preventivo'}</h1>
                    <p className={styles.subtitle}>{mode === 'create' ? 'Crea un nuovo preventivo' : 'Modifica il preventivo esistente'}</p>
                </div>
                <Link href={mode === 'create' ? "/preventivi" : `/preventivi/${preventivoId}`} className="btn btn-outline">
                    ← Annulla
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                {error && <div className={styles.error}>{error}</div>}

                {/* Dati Generali */}
                <div className="card">
                    <div className="card-header">
                        <h3>Dati Generali</h3>
                    </div>
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label required">Cliente (dal CRM)</label>

                                {/* Cliente già selezionato */}
                                {state.cliente_id && !state.cliente_id.startsWith('crm_') && (
                                    <div style={{ padding: '0.5rem 0.75rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 600 }}>{selectedClienteName || '(cliente preventivo esistente)'}</span>
                                        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.1rem' }} onClick={() => { setField('cliente_id', ''); setSelectedClienteName('') }}>×</button>
                                    </div>
                                )}

                                {/* Ricerca CRM */}
                                {(!state.cliente_id || state.cliente_id.startsWith('crm_')) && (
                                    <>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Digita nome, cognome o azienda per cercare nel CRM..."
                                            value={state.cliente_id.startsWith('crm_') ? selectedClienteName : crmSearch}
                                            onChange={(e) => {
                                                if (state.cliente_id.startsWith('crm_')) {
                                                    // Reset selezione se si modifica il testo
                                                    setField('cliente_id', '')
                                                    setSelectedClienteName('')
                                                }
                                                handleCrmSearchChange(e.target.value)
                                            }}
                                            readOnly={state.cliente_id.startsWith('crm_')}
                                        />
                                        {state.cliente_id.startsWith('crm_') && (
                                            <button type="button" style={{ marginTop: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.8rem', padding: 0 }} onClick={() => { setField('cliente_id', ''); setSelectedClienteName(''); setCrmSearch(''); }}>
                                                Cambia cliente
                                            </button>
                                        )}
                                        {crmSearchLoading && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>Ricerca in corso...</p>}
                                        {crmError && <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.25rem 0 0' }}>{crmError}</p>}

                                        {clienti.length > 0 && !state.cliente_id && (
                                            <select
                                                className="form-input"
                                                style={{ marginTop: '0.5rem' }}
                                                value=""
                                                onChange={(e) => {
                                                    const c = clienti.find(x => x.id === e.target.value)
                                                    if (c) {
                                                        setField('cliente_id', c.id)
                                                        setSelectedClienteName(c.ragione_sociale)
                                                    }
                                                }}
                                                size={Math.min(clienti.length + 1, 7)}
                                            >
                                                <option value="">-- Seleziona tra i risultati ({clienti.length}) --</option>
                                                {clienti.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.ragione_sociale}{c.citta ? ` — ${c.citta}` : ''}{c.telefono_principale ? ` · ${c.telefono_principale}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </>
                                )}
                            </div>

                            {sedi.length > 0 && (
                                <div className="form-group">
                                    <label htmlFor="sede" className="form-label">Sede</label>
                                    <select
                                        id="sede"
                                        className="form-input"
                                        value={state.sede_id}
                                        onChange={(e) => setField('sede_id', e.target.value)}
                                    >
                                        <option value="">Nessuna sede specifica</option>
                                        {sedi.map(s => (
                                            <option key={s.id} value={s.id}>{s.nome_sede}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="aliquota" className="form-label required">Aliquota IVA</label>
                                <select
                                    id="aliquota"
                                    className="form-input"
                                    value={state.aliquota_iva_id}
                                    onChange={(e) => setField('aliquota_iva_id', e.target.value)}
                                    required
                                >
                                    <option value="">Seleziona aliquota...</option>
                                    {aliquote.map(a => (
                                        <option key={a.id} value={a.id}>{a.nome} ({a.percentuale}%)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="data" className="form-label required">Data Preventivo</label>
                                <input
                                    type="date"
                                    id="data"
                                    className="form-input"
                                    value={state.data_preventivo}
                                    onChange={(e) => setField('data_preventivo', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="validita" className="form-label">Validita (giorni)</label>
                                <input
                                    type="number"
                                    id="validita"
                                    className="form-input"
                                    value={state.validita_giorni}
                                    onChange={(e) => setField('validita_giorni', parseInt(e.target.value) || 30)}
                                    min={1}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="stato" className="form-label required">Stato Preventivo</label>
                                <select
                                    id="stato"
                                    className="form-input"
                                    value={state.stato}
                                    onChange={(e) => setField('stato', e.target.value)}
                                    required
                                >
                                    <option value="bozza">Bozza</option>
                                    <option value="inviato">Inviato</option>
                                    <option value="accettato">Accettato</option>
                                    <option value="rifiutato">Rifiutato</option>
                                    <option value="scaduto">Scaduto</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="emesso_da" className="form-label">Emesso da</label>
                                <input
                                    type="text"
                                    id="emesso_da"
                                    className="form-input"
                                    value={state.emesso_da}
                                    readOnly
                                    style={{ backgroundColor: '#f5f5f5', cursor: 'default' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sezioni */}
                <div className={styles.sectionsContainer}>
                    {state.sections.map((section) => (
                        <SectionWithOptions
                            key={section.tempId}
                            section={section}
                            prodotti={prodotti}
                            onRemove={() => removeSection(section.tempId)}
                            onSetGlobalOption={(optionKey, value) => setSectionGlobalOption(section.tempId, optionKey, value)}
                            onSetSectionField={(field, value) => setSectionField(section.tempId, field, value)}
                            onAddPosition={() => addPosition(section.tempId)}
                            onRemovePosition={(positionTempId) => removePosition(section.tempId, positionTempId)}
                            onUpdatePosition={(positionTempId, field, value) => updatePosition(section.tempId, positionTempId, field, value)}
                            onSetPositionOption={(positionTempId, optionKey, value) => setPositionOption(section.tempId, positionTempId, optionKey, value)}
                            onUpdatePositionPrice={(positionTempId, subtotale) => updatePositionPrice(section.tempId, positionTempId, subtotale)}
                            onUpdateSectionSubtotal={(subtotale) => updateSectionSubtotal(section.tempId, subtotale)}
                        />
                    ))}

                    {/* Add section button */}
                    {availableCategories.length > 0 && (
                        <div className={styles.addSectionArea}>
                            {showCategoryPicker ? (
                                <div className={styles.categoryPicker}>
                                    <p className={styles.pickerLabel}>Seleziona categoria:</p>
                                    <div className={styles.categoryGrid}>
                                        {availableCategories.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                className={styles.categoryBtn}
                                                onClick={() => handleAddSection(cat)}
                                            >
                                                <span className={styles.categoryIcon}>{cat.icona}</span>
                                                <span>{cat.nome}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setShowCategoryPicker(false)}
                                        style={{ marginTop: 'var(--space-3)' }}
                                    >
                                        Annulla
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCategoryPicker(true)}
                                >
                                    + Aggiungi Sezione
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Servizi */}
                {state.sections.length > 0 && (
                    <QuoteServices
                        services={state.services}
                        onAddService={addService}
                        onRemoveService={removeService}
                        onUpdateService={updateService}
                    />
                )}

                {/* Totali */}
                {state.sections.length > 0 && (
                    <QuoteTotals
                        totale_imponibile={quoteTotals.totale_imponibile}
                        totale_imponibile_scontato={quoteTotals.totale_imponibile_scontato}
                        totale_iva={quoteTotals.totale_iva}
                        totale_preventivo={quoteTotals.totale_preventivo}
                        sconto_globale_1={state.sconto_globale_1}
                        sconto_globale_2={state.sconto_globale_2}
                        onScontoChange={(field, value) => setField(field, value)}
                        aliquota_label={selectedAliquota ? `IVA ${selectedAliquota.percentuale}%` : 'IVA'}
                        show_iva={state.show_iva}
                        show_grand_total={state.show_grand_total}
                        payment_method_id={state.payment_method_id}
                        payment_notes={state.payment_notes}
                        onToggleIVA={(value) => setField('show_iva', value)}
                        onToggleGrandTotal={(value) => setField('show_grand_total', value)}
                        onPaymentMethodChange={(value) => setField('payment_method_id', value)}
                        onPaymentNotesChange={(value) => setField('payment_notes', value)}
                        is_combined={selectedAliquota?.is_combined ?? false}
                        rate_secondary={selectedAliquota?.rate_secondary ?? null}
                        importo_beni_significativi={state.importo_beni_significativi}
                        onImportoBeniChange={(value) => setField('importo_beni_significativi', value)}
                        iva_ridotta={quoteTotals.iva_ridotta}
                        iva_piena={quoteTotals.iva_piena}
                        base_ridotta={quoteTotals.base_ridotta}
                        base_piena={quoteTotals.base_piena}
                    />
                )}

                {/* Note */}
                <div className="card">
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="note" className="form-label">Note Preventivo</label>
                                <textarea
                                    id="note"
                                    className="form-input"
                                    value={state.note}
                                    onChange={(e) => setField('note', e.target.value)}
                                    rows={3}
                                    placeholder="Note visibili nel preventivo..."
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="note_interne" className="form-label">Note Interne</label>
                                <textarea
                                    id="note_interne"
                                    className="form-input"
                                    value={state.note_interne}
                                    onChange={(e) => setField('note_interne', e.target.value)}
                                    rows={3}
                                    placeholder="Note interne (non visibili al cliente)..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Link href={mode === 'create' ? "/preventivi" : `/preventivi/${preventivoId}`} className="btn btn-outline">
                        Annulla
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Salvataggio...' : 'Salva Preventivo'}
                    </button>
                </div>
            </form>
        </div>
    )
}

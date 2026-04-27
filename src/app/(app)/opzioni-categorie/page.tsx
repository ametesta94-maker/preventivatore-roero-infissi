'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CategoryAccordion from '@/components/admin-options/CategoryAccordion'
import OptionFormModal from '@/components/admin-options/OptionFormModal'
import ValueFormModal from '@/components/admin-options/ValueFormModal'
import styles from './page.module.css'

interface Category {
    id: string
    slug: string
    nome: string
    icona: string | null
    ordine: number
    attiva: boolean
}

interface CategoryOption {
    id: string
    category_id: string
    option_key: string
    option_label: string
    option_type: string
    is_required: boolean
    sort_order: number
    applies_to_position: boolean
    price_adjustment_default: number | null
    depends_on_option_id: string | null
    depends_on_values_json: string[] | null
    is_active: boolean
}

interface CategoryOptionValue {
    id: string
    category_option_id: string
    value_key: string
    value_label: string
    price_adjustment: number | null
    price_mode: string
    sort_order: number
    depends_on_value_id: string | null
    is_default: boolean
    is_active: boolean
    metadata_json: unknown
}

type OptionModalState =
    | { mode: 'closed' }
    | { mode: 'create'; categoryId: string; appliesToPosition: boolean }
    | { mode: 'edit'; option: CategoryOption }

type ValueModalState =
    | { mode: 'closed' }
    | { mode: 'create'; optionId: string; option: CategoryOption }
    | { mode: 'edit'; value: CategoryOptionValue; option: CategoryOption }

export default function OpzioniCategoriePage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [options, setOptions] = useState<CategoryOption[]>([])
    const [values, setValues] = useState<CategoryOptionValue[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
    const [optionModal, setOptionModal] = useState<OptionModalState>({ mode: 'closed' })
    const [valueModal, setValueModal] = useState<ValueModalState>({ mode: 'closed' })

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        const supabase = createClient()

        const [catRes, optRes, valRes] = await Promise.all([
            supabase.from('categories').select('*').order('ordine'),
            supabase.from('category_options').select('*').order('sort_order'),
            supabase.from('category_option_values').select('*').order('sort_order'),
        ])

        if (catRes.error || optRes.error || valRes.error) {
            setError(catRes.error?.message || optRes.error?.message || valRes.error?.message || 'Errore sconosciuto')
            setLoading(false)
            return
        }

        setCategories(catRes.data || [])
        setOptions((optRes.data || []) as any)
        setValues((valRes.data || []) as any)
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const getOptionsForCategory = (categoryId: string) =>
        options.filter(o => o.category_id === categoryId)

    const getValuesForCategory = (categoryId: string) => {
        const catOptionIds = new Set(options.filter(o => o.category_id === categoryId).map(o => o.id))
        return values.filter(v => catOptionIds.has(v.category_option_id))
    }

    // --- CRUD Opzioni ---

    const handleAddOption = (categoryId: string, appliesToPosition: boolean) => {
        setOptionModal({ mode: 'create', categoryId, appliesToPosition })
    }

    const handleEditOption = (option: CategoryOption) => {
        setOptionModal({ mode: 'edit', option })
    }

    const handleDeleteOption = async (optionId: string, optionLabel: string) => {
        if (!confirm(`Eliminare l'opzione "${optionLabel}" e tutti i suoi valori?`)) return

        const supabase = createClient()
        const { error: delErr } = await supabase
            .from('category_options')
            .delete()
            .eq('id', optionId)

        if (delErr) {
            if (delErr.message.includes('violates foreign key') || delErr.code === '23503') {
                if (confirm(`L'opzione "${optionLabel}" è usata in preventivi esistenti. Vuoi disattivarla invece?`)) {
                    await supabase
                        .from('category_options')
                        .update({ is_active: false })
                        .eq('id', optionId)
                    await fetchData()
                }
            } else {
                alert('Errore: ' + delErr.message)
            }
            return
        }
        await fetchData()
    }

    const handleSaveOption = async (data: Partial<CategoryOption> & { category_id: string }) => {
        const supabase = createClient()

        if (optionModal.mode === 'create') {
            const { error: insErr } = await supabase
                .from('category_options')
                .insert(data as any)

            if (insErr) {
                alert('Errore creazione: ' + insErr.message)
                return
            }
        } else if (optionModal.mode === 'edit') {
            const { id, ...updateData } = data as CategoryOption
            const { error: updErr } = await supabase
                .from('category_options')
                .update(updateData as any)
                .eq('id', id)

            if (updErr) {
                alert('Errore aggiornamento: ' + updErr.message)
                return
            }
        }

        setOptionModal({ mode: 'closed' })
        await fetchData()
    }

    // --- CRUD Valori ---

    const handleAddValue = (optionId: string, option: CategoryOption) => {
        setValueModal({ mode: 'create', optionId, option })
    }

    const handleEditValue = (value: CategoryOptionValue, option: CategoryOption) => {
        setValueModal({ mode: 'edit', value, option })
    }

    const handleDeleteValue = async (valueId: string, valueLabel: string) => {
        if (!confirm(`Eliminare il valore "${valueLabel}"?`)) return

        const supabase = createClient()
        const { error: delErr } = await supabase
            .from('category_option_values')
            .delete()
            .eq('id', valueId)

        if (delErr) {
            if (delErr.message.includes('violates foreign key') || delErr.code === '23503') {
                if (confirm(`Il valore "${valueLabel}" è usato in preventivi esistenti. Vuoi disattivarlo invece?`)) {
                    await supabase
                        .from('category_option_values')
                        .update({ is_active: false })
                        .eq('id', valueId)
                    await fetchData()
                }
            } else {
                alert('Errore: ' + delErr.message)
            }
            return
        }
        await fetchData()
    }

    const handleSaveValue = async (data: Partial<CategoryOptionValue> & { category_option_id: string }) => {
        const supabase = createClient()

        if (valueModal.mode === 'create') {
            const { error: insErr } = await supabase
                .from('category_option_values')
                .insert(data as any)

            if (insErr) {
                alert('Errore creazione: ' + insErr.message)
                return
            }
        } else if (valueModal.mode === 'edit') {
            const { id, ...updateData } = data as CategoryOptionValue
            const { error: updErr } = await supabase
                .from('category_option_values')
                .update(updateData as any)
                .eq('id', id)

            if (updErr) {
                alert('Errore aggiornamento: ' + updErr.message)
                return
            }
        }

        setValueModal({ mode: 'closed' })
        await fetchData()
    }

    // --- Render ---

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Caricamento opzioni categorie...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <p>Errore: {error}</p>
                    <button className="btn btn-primary retryBtn" onClick={fetchData}>
                        Riprova
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Opzioni Categorie</h1>
                    <p className={styles.subtitle}>
                        Gestisci opzioni, valori e maggiorazioni per ogni categoria di prodotto
                    </p>
                </div>
            </div>

            <div className={styles.categoriesList}>
                {categories.map(cat => (
                    <CategoryAccordion
                        key={cat.id}
                        category={cat}
                        options={getOptionsForCategory(cat.id)}
                        values={getValuesForCategory(cat.id)}
                        allOptions={options}
                        allValues={values}
                        isExpanded={expandedCategoryId === cat.id}
                        onToggle={() =>
                            setExpandedCategoryId(prev => (prev === cat.id ? null : cat.id))
                        }
                        onEditOption={handleEditOption}
                        onDeleteOption={handleDeleteOption}
                        onAddOption={handleAddOption}
                        onAddValue={handleAddValue}
                        onEditValue={handleEditValue}
                        onDeleteValue={handleDeleteValue}
                    />
                ))}
            </div>

            {optionModal.mode !== 'closed' && (
                <OptionFormModal
                    mode={optionModal.mode}
                    option={optionModal.mode === 'edit' ? optionModal.option : undefined}
                    categoryId={optionModal.mode === 'create' ? optionModal.categoryId : optionModal.option.category_id}
                    appliesToPosition={optionModal.mode === 'create' ? optionModal.appliesToPosition : optionModal.option.applies_to_position}
                    categoryOptions={options.filter(o =>
                        o.category_id === (optionModal.mode === 'create' ? optionModal.categoryId : optionModal.option.category_id)
                    )}
                    categoryValues={values}
                    existingKeys={options
                        .filter(o => o.category_id === (optionModal.mode === 'create' ? optionModal.categoryId : optionModal.option.category_id))
                        .map(o => o.option_key)
                    }
                    onSave={handleSaveOption}
                    onClose={() => setOptionModal({ mode: 'closed' })}
                />
            )}

            {valueModal.mode !== 'closed' && (
                <ValueFormModal
                    mode={valueModal.mode}
                    value={valueModal.mode === 'edit' ? valueModal.value : undefined}
                    optionId={valueModal.mode === 'create' ? valueModal.optionId : valueModal.value.category_option_id}
                    option={valueModal.mode === 'create' ? valueModal.option : valueModal.option}
                    existingValues={values.filter(v =>
                        v.category_option_id === (valueModal.mode === 'create' ? valueModal.optionId : valueModal.value.category_option_id)
                    )}
                    allValues={values}
                    onSave={handleSaveValue}
                    onClose={() => setValueModal({ mode: 'closed' })}
                />
            )}
        </div>
    )
}

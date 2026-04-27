'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

/* ---------- Types ---------- */

interface Category {
    id: string
    slug: string
    nome: string
    icona: string | null
    ordine: number
    attiva: boolean
}

interface Product {
    id: string
    codice: string
    nome: string
    category_id: string | null
    attivo: boolean
}

interface ProductOption {
    id: string
    product_id: string
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

interface ProductOptionValue {
    id: string
    product_option_id: string
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
    | { mode: 'create'; productId: string; appliesToPosition: boolean }
    | { mode: 'edit'; option: ProductOption }

type ValueModalState =
    | { mode: 'closed' }
    | { mode: 'create'; optionId: string; option: ProductOption }
    | { mode: 'edit'; value: ProductOptionValue; option: ProductOption }

/* ---------- Helpers ---------- */

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
}

/* ========== Main Page ========== */

export default function OpzioniProdottiPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [options, setOptions] = useState<ProductOption[]>([])
    const [values, setValues] = useState<ProductOptionValue[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
    const [optionModal, setOptionModal] = useState<OptionModalState>({ mode: 'closed' })
    const [valueModal, setValueModal] = useState<ValueModalState>({ mode: 'closed' })

    /* ---------- Fetch ---------- */

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        const supabase = createClient()

        const [catRes, prodRes, optRes, valRes] = await Promise.all([
            supabase.from('categories').select('*').order('ordine'),
            supabase.from('prodotti').select('id, codice, nome, category_id, attivo').eq('attivo', true).order('nome'),
            supabase.from('product_options').select('*').order('sort_order'),
            supabase.from('product_option_values').select('*').order('sort_order'),
        ])

        if (catRes.error || prodRes.error || optRes.error || valRes.error) {
            setError(
                catRes.error?.message || prodRes.error?.message || optRes.error?.message || valRes.error?.message || 'Errore sconosciuto'
            )
            setLoading(false)
            return
        }

        setCategories(catRes.data || [])
        setProducts(prodRes.data || [])
        setOptions((optRes.data as unknown as ProductOption[]) || [])
        setValues((valRes.data as unknown as ProductOptionValue[]) || [])
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    /* ---------- Derived data ---------- */

    const getProductsForCategory = (categoryId: string) =>
        products.filter(p => p.category_id === categoryId)

    const uncategorizedProducts = products.filter(p => !p.category_id)

    const getOptionsForProduct = (productId: string) =>
        options.filter(o => o.product_id === productId)

    const getValuesForOption = (optionId: string) =>
        values.filter(v => v.product_option_id === optionId)

    /* ---------- CRUD Options ---------- */

    const handleAddOption = (productId: string, appliesToPosition: boolean) => {
        setOptionModal({ mode: 'create', productId, appliesToPosition })
    }

    const handleEditOption = (option: ProductOption) => {
        setOptionModal({ mode: 'edit', option })
    }

    const handleDeleteOption = async (optionId: string, optionLabel: string) => {
        if (!confirm(`Eliminare l'opzione "${optionLabel}" e tutti i suoi valori?`)) return

        const supabase = createClient()
        const { error: delErr } = await supabase
            .from('product_options')
            .delete()
            .eq('id', optionId)

        if (delErr) {
            if (delErr.message.includes('violates foreign key') || delErr.code === '23503') {
                if (confirm(`L'opzione "${optionLabel}" è usata in preventivi esistenti. Vuoi disattivarla invece?`)) {
                    await supabase.from('product_options').update({ is_active: false }).eq('id', optionId)
                    await fetchData()
                }
            } else {
                alert('Errore: ' + delErr.message)
            }
            return
        }
        await fetchData()
    }

    const handleSaveOption = async (data: Partial<ProductOption> & { product_id: string }) => {
        const supabase = createClient()

        if (optionModal.mode === 'create') {
            const { error: insErr } = await supabase.from('product_options').insert(data as any)
            if (insErr) {
                alert('Errore creazione: ' + insErr.message)
                return
            }
        } else if (optionModal.mode === 'edit') {
            const { id, ...updateData } = data as ProductOption
            const { error: updErr } = await supabase.from('product_options').update(updateData as any).eq('id', id)
            if (updErr) {
                alert('Errore aggiornamento: ' + updErr.message)
                return
            }
        }

        setOptionModal({ mode: 'closed' })
        await fetchData()
    }

    /* ---------- CRUD Values ---------- */

    const handleAddValue = (optionId: string, option: ProductOption) => {
        setValueModal({ mode: 'create', optionId, option })
    }

    const handleEditValue = (value: ProductOptionValue, option: ProductOption) => {
        setValueModal({ mode: 'edit', value, option })
    }

    const handleDeleteValue = async (valueId: string, valueLabel: string) => {
        if (!confirm(`Eliminare il valore "${valueLabel}"?`)) return

        const supabase = createClient()
        const { error: delErr } = await supabase
            .from('product_option_values')
            .delete()
            .eq('id', valueId)

        if (delErr) {
            if (delErr.message.includes('violates foreign key') || delErr.code === '23503') {
                if (confirm(`Il valore "${valueLabel}" è usato in preventivi esistenti. Vuoi disattivarlo invece?`)) {
                    await supabase.from('product_option_values').update({ is_active: false }).eq('id', valueId)
                    await fetchData()
                }
            } else {
                alert('Errore: ' + delErr.message)
            }
            return
        }
        await fetchData()
    }

    const handleSaveValue = async (data: Partial<ProductOptionValue> & { product_option_id: string }) => {
        const supabase = createClient()

        if (valueModal.mode === 'create') {
            const { error: insErr } = await supabase.from('product_option_values').insert(data as any)
            if (insErr) {
                alert('Errore creazione: ' + insErr.message)
                return
            }
        } else if (valueModal.mode === 'edit') {
            const { id, ...updateData } = data as ProductOptionValue
            const { error: updErr } = await supabase.from('product_option_values').update(updateData as any).eq('id', id)
            if (updErr) {
                alert('Errore aggiornamento: ' + updErr.message)
                return
            }
        }

        setValueModal({ mode: 'closed' })
        await fetchData()
    }

    /* ---------- Render helpers ---------- */

    const renderProductAccordion = (product: Product) => {
        const isExpanded = expandedProductId === product.id
        const productOptions = getOptionsForProduct(product.id)
        const generalOptions = productOptions.filter(o => !o.applies_to_position)
        const positionOptions = productOptions.filter(o => o.applies_to_position)

        return (
            <div key={product.id} className={styles.productAccordion}>
                <div
                    className={styles.productHeader}
                    onClick={() => setExpandedProductId(prev => (prev === product.id ? null : product.id))}
                >
                    <div className={styles.productInfo}>
                        <span className={styles.productName}>{product.nome}</span>
                        <span className={styles.productCode}>{product.codice}</span>
                        <span className={styles.optionCount}>
                            {productOptions.length} opzion{productOptions.length === 1 ? 'e' : 'i'}
                        </span>
                    </div>
                    <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>▼</span>
                </div>

                {isExpanded && (
                    <div className={styles.productBody}>
                        {/* General options */}
                        <div className={styles.optionsSection}>
                            <div className={styles.optionsSectionTitle}>
                                <span>⚙️ Opzioni generali</span>
                                <button
                                    className={styles.addOptionBtn}
                                    onClick={() => handleAddOption(product.id, false)}
                                >
                                    + Aggiungi
                                </button>
                            </div>
                            {generalOptions.length === 0 ? (
                                <div className={styles.emptyOptions}>Nessuna opzione generale</div>
                            ) : (
                                <div className={styles.optionsList}>
                                    {generalOptions.map(opt => renderOptionCard(opt))}
                                </div>
                            )}
                        </div>

                        {/* Position options */}
                        <div className={styles.optionsSection}>
                            <div className={styles.optionsSectionTitle}>
                                <span>📐 Opzioni per posizione</span>
                                <button
                                    className={styles.addOptionBtn}
                                    onClick={() => handleAddOption(product.id, true)}
                                >
                                    + Aggiungi
                                </button>
                            </div>
                            {positionOptions.length === 0 ? (
                                <div className={styles.emptyOptions}>Nessuna opzione per posizione</div>
                            ) : (
                                <div className={styles.optionsList}>
                                    {positionOptions.map(opt => renderOptionCard(opt))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderOptionCard = (opt: ProductOption) => {
        const optionValues = getValuesForOption(opt.id)

        return (
            <div key={opt.id} className={styles.optionCard}>
                <div className={styles.optionHeader}>
                    <div className={styles.optionInfo}>
                        <span className={styles.optionLabel}>{opt.option_label}</span>
                        <span className={styles.optionKey}>{opt.option_key}</span>
                        <span className={`${styles.optionBadge} ${styles.badgeType}`}>{opt.option_type}</span>
                        {opt.is_required && <span className={`${styles.optionBadge} ${styles.badgeRequired}`}>Obbligatoria</span>}
                        {!opt.is_active && <span className={`${styles.optionBadge} ${styles.badgeInactive}`}>Disattivata</span>}
                    </div>
                    <div className={styles.optionActions}>
                        <button className={styles.iconBtn} onClick={() => handleEditOption(opt)} title="Modifica">✏️</button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDeleteOption(opt.id, opt.option_label)} title="Elimina">🗑️</button>
                    </div>
                </div>

                {/* Values */}
                <div className={styles.valuesList}>
                    {optionValues.map(val => (
                        <div key={val.id} className={styles.valueRow}>
                            <div className={styles.valueInfo}>
                                <span className={styles.valueLabel}>{val.value_label}</span>
                                {val.price_adjustment != null && val.price_adjustment !== 0 && (
                                    <span className={styles.valuePrice}>
                                        {val.price_adjustment > 0 ? '+' : ''}{val.price_adjustment}€
                                        {val.price_mode !== 'fixed' && ` (${val.price_mode})`}
                                    </span>
                                )}
                                {val.is_default && <span className={styles.valueBadge}>Default</span>}
                                {!val.is_active && <span className={`${styles.optionBadge} ${styles.badgeInactive}`}>Off</span>}
                            </div>
                            <div className={styles.optionActions}>
                                <button className={styles.iconBtn} onClick={() => handleEditValue(val, opt)} title="Modifica">✏️</button>
                                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => handleDeleteValue(val.id, val.value_label)} title="Elimina">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>

                <button className={styles.addValueBtn} onClick={() => handleAddValue(opt.id, opt)}>
                    + Aggiungi valore
                </button>
            </div>
        )
    }

    /* ---------- Render: loading / error ---------- */

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Caricamento opzioni prodotti...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>
                    <p>Errore: {error}</p>
                    <button className="btn btn-primary" onClick={fetchData}>Riprova</button>
                </div>
            </div>
        )
    }

    /* ---------- Render: main ---------- */

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Opzioni Prodotti</h1>
                    <p className={styles.subtitle}>
                        Gestisci opzioni, valori e maggiorazioni per ogni prodotto
                    </p>
                </div>
            </div>

            <div className={styles.productsList}>
                {categories.filter(c => c.attiva).map(cat => {
                    const catProducts = getProductsForCategory(cat.id)
                    if (catProducts.length === 0) return null

                    return (
                        <div key={cat.id} className={styles.categoryGroup}>
                            <div className={styles.categoryTitle}>
                                <span className={styles.categoryIcon}>{cat.icona || '📦'}</span>
                                {cat.nome}
                            </div>
                            {catProducts.map(p => renderProductAccordion(p))}
                        </div>
                    )
                })}

                {uncategorizedProducts.length > 0 && (
                    <div className={styles.categoryGroup}>
                        <div className={styles.categoryTitle}>
                            <span className={styles.categoryIcon}>📋</span>
                            Senza categoria
                        </div>
                        {uncategorizedProducts.map(p => renderProductAccordion(p))}
                    </div>
                )}
            </div>

            {/* ========== Option Modal ========== */}
            {optionModal.mode !== 'closed' && (
                <OptionModal
                    modal={optionModal}
                    productOptions={options}
                    productValues={values}
                    onSave={handleSaveOption}
                    onClose={() => setOptionModal({ mode: 'closed' })}
                />
            )}

            {/* ========== Value Modal ========== */}
            {valueModal.mode !== 'closed' && (
                <ValueModal
                    modal={valueModal}
                    allValues={values}
                    onSave={handleSaveValue}
                    onClose={() => setValueModal({ mode: 'closed' })}
                />
            )}
        </div>
    )
}

/* ========== OPTION MODAL COMPONENT ========== */

function OptionModal({
    modal,
    productOptions,
    productValues,
    onSave,
    onClose,
}: {
    modal: Exclude<OptionModalState, { mode: 'closed' }>
    productOptions: ProductOption[]
    productValues: ProductOptionValue[]
    onSave: (data: Partial<ProductOption> & { product_id: string }) => Promise<void>
    onClose: () => void
}) {
    const isEdit = modal.mode === 'edit'
    const productId = isEdit ? modal.option.product_id : modal.productId
    const appliesToPosition = isEdit ? modal.option.applies_to_position : modal.appliesToPosition

    const [label, setLabel] = useState(isEdit ? modal.option.option_label : '')
    const [key, setKey] = useState(isEdit ? modal.option.option_key : '')
    const [type, setType] = useState(isEdit ? modal.option.option_type : 'select')
    const [required, setRequired] = useState(isEdit ? modal.option.is_required : false)
    const [sortOrder, setSortOrder] = useState(isEdit ? modal.option.sort_order : 0)
    const [priceDefault, setPriceDefault] = useState(isEdit ? (modal.option.price_adjustment_default ?? 0) : 0)
    const [active, setActive] = useState(isEdit ? modal.option.is_active : true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isEdit && label) {
            setKey(slugify(label))
        }
    }, [label, isEdit])

    useEffect(() => {
        if (!isEdit) {
            const existing = productOptions.filter(o => o.product_id === productId)
            const maxSort = existing.length > 0 ? Math.max(...existing.map(o => o.sort_order)) : -1
            setSortOrder(maxSort + 1)
        }
    }, [isEdit, productId, productOptions])

    const handleSubmit = async () => {
        if (!label.trim() || !key.trim()) {
            alert('Label e Key sono obbligatori')
            return
        }
        setSaving(true)
        await onSave({
            ...(isEdit ? { id: modal.option.id } : {}),
            product_id: productId,
            option_key: key,
            option_label: label,
            option_type: type,
            is_required: required,
            sort_order: sortOrder,
            applies_to_position: appliesToPosition,
            price_adjustment_default: priceDefault || null,
            is_active: active,
        } as Partial<ProductOption> & { product_id: string })
        setSaving(false)
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{isEdit ? 'Modifica Opzione' : 'Nuova Opzione'}</h3>
                    <button className={styles.modalCloseBtn} onClick={onClose}>×</button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>Label</label>
                        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="es. Colore" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Key (auto-generata)</label>
                        <input value={key} onChange={e => setKey(e.target.value)} placeholder="es. colore" />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Tipo</label>
                            <select value={type} onChange={e => setType(e.target.value)}>
                                <option value="select">Select</option>
                                <option value="multi_select">Multi Select</option>
                                <option value="boolean">Boolean</option>
                                <option value="text">Testo</option>
                                <option value="number">Numero</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ordine</label>
                            <input type="number" value={sortOrder} onChange={e => setSortOrder(+e.target.value)} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Maggiorazione default (€)</label>
                        <input type="number" step="0.01" value={priceDefault} onChange={e => setPriceDefault(+e.target.value)} />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} id="opt-req" />
                            <label htmlFor="opt-req">Obbligatoria</label>
                        </div>
                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} id="opt-active" />
                            <label htmlFor="opt-active">Attiva</label>
                        </div>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.btnSecondary} onClick={onClose}>Annulla</button>
                    <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Salvataggio...' : isEdit ? 'Salva modifiche' : 'Crea opzione'}
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ========== VALUE MODAL COMPONENT ========== */

function ValueModal({
    modal,
    allValues,
    onSave,
    onClose,
}: {
    modal: Exclude<ValueModalState, { mode: 'closed' }>
    allValues: ProductOptionValue[]
    onSave: (data: Partial<ProductOptionValue> & { product_option_id: string }) => Promise<void>
    onClose: () => void
}) {
    const isEdit = modal.mode === 'edit'
    const optionId = isEdit ? modal.value.product_option_id : modal.optionId

    const [label, setLabel] = useState(isEdit ? modal.value.value_label : '')
    const [key, setKey] = useState(isEdit ? modal.value.value_key : '')
    const [priceAdj, setPriceAdj] = useState(isEdit ? (modal.value.price_adjustment ?? 0) : 0)
    const [priceMode, setPriceMode] = useState(isEdit ? modal.value.price_mode : 'fixed')
    const [sortOrder, setSortOrder] = useState(isEdit ? modal.value.sort_order : 0)
    const [isDefault, setIsDefault] = useState(isEdit ? modal.value.is_default : false)
    const [active, setActive] = useState(isEdit ? modal.value.is_active : true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isEdit && label) {
            setKey(slugify(label))
        }
    }, [label, isEdit])

    useEffect(() => {
        if (!isEdit) {
            const existing = allValues.filter(v => v.product_option_id === optionId)
            const maxSort = existing.length > 0 ? Math.max(...existing.map(v => v.sort_order)) : -1
            setSortOrder(maxSort + 1)
        }
    }, [isEdit, optionId, allValues])

    const handleSubmit = async () => {
        if (!label.trim() || !key.trim()) {
            alert('Label e Key sono obbligatori')
            return
        }
        setSaving(true)
        await onSave({
            ...(isEdit ? { id: modal.value.id } : {}),
            product_option_id: optionId,
            value_key: key,
            value_label: label,
            price_adjustment: priceAdj,
            price_mode: priceMode,
            sort_order: sortOrder,
            is_default: isDefault,
            is_active: active,
        } as Partial<ProductOptionValue> & { product_option_id: string })
        setSaving(false)
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{isEdit ? 'Modifica Valore' : 'Nuovo Valore'}</h3>
                    <button className={styles.modalCloseBtn} onClick={onClose}>×</button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label>Label</label>
                        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="es. Bianco RAL 9010" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Key (auto-generata)</label>
                        <input value={key} onChange={e => setKey(e.target.value)} placeholder="es. bianco_ral_9010" />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Maggiorazione (€)</label>
                            <input type="number" step="0.01" value={priceAdj} onChange={e => setPriceAdj(+e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Modalità prezzo</label>
                            <select value={priceMode} onChange={e => setPriceMode(e.target.value)}>
                                <option value="fixed">Fisso</option>
                                <option value="percentage">Percentuale</option>
                                <option value="per_sqm">Per m²</option>
                                <option value="per_unit">Per unità</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Ordine</label>
                        <input type="number" value={sortOrder} onChange={e => setSortOrder(+e.target.value)} />
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} id="val-def" />
                            <label htmlFor="val-def">Default</label>
                        </div>
                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} id="val-active" />
                            <label htmlFor="val-active">Attivo</label>
                        </div>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.btnSecondary} onClick={onClose}>Annulla</button>
                    <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Salvataggio...' : isEdit ? 'Salva modifiche' : 'Crea valore'}
                    </button>
                </div>
            </div>
        </div>
    )
}

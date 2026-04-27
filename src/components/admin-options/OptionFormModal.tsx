'use client'

import { useState, useEffect, useMemo } from 'react'
import styles from './OptionFormModal.module.css'

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

interface OptionFormModalProps {
    mode: 'create' | 'edit'
    option?: CategoryOption
    categoryId: string
    appliesToPosition: boolean
    categoryOptions: CategoryOption[]
    categoryValues: CategoryOptionValue[]
    existingKeys: string[]
    onSave: (data: Partial<CategoryOption> & { category_id: string }) => Promise<void>
    onClose: () => void
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
}

export default function OptionFormModal({
    mode,
    option,
    categoryId,
    appliesToPosition,
    categoryOptions,
    categoryValues,
    existingKeys,
    onSave,
    onClose,
}: OptionFormModalProps) {
    const [label, setLabel] = useState(option?.option_label || '')
    const [key, setKey] = useState(option?.option_key || '')
    const [keyManuallyEdited, setKeyManuallyEdited] = useState(mode === 'edit')
    const [type, setType] = useState(option?.option_type || 'select')
    const [isRequired, setIsRequired] = useState(option?.is_required ?? false)
    const [sortOrder, setSortOrder] = useState(option?.sort_order ?? getNextSortOrder())
    const [priceAdjDefault, setPriceAdjDefault] = useState(option?.price_adjustment_default ?? 0)
    const [dependsOnOptionId, setDependsOnOptionId] = useState(option?.depends_on_option_id || '')
    const [dependsOnValues, setDependsOnValues] = useState<string[]>(option?.depends_on_values_json || [])
    const [isActive, setIsActive] = useState(option?.is_active ?? true)
    const [saving, setSaving] = useState(false)

    function getNextSortOrder(): number {
        const samePositionOpts = categoryOptions.filter(o => o.applies_to_position === appliesToPosition)
        if (samePositionOpts.length === 0) return 10
        return Math.max(...samePositionOpts.map(o => o.sort_order)) + 10
    }

    useEffect(() => {
        if (!keyManuallyEdited && label) {
            const timer = setTimeout(() => {
                setKey(slugify(label))
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [label, keyManuallyEdited])

    const keyError = useMemo(() => {
        if (key && existingKeys.includes(key) && (!option || option.option_key !== key)) {
            return 'Chiave già esistente in questa categoria'
        }
        return ''
    }, [key, existingKeys, option])

    const parentOptionValues = dependsOnOptionId
        ? categoryValues.filter(v => v.category_option_id === dependsOnOptionId)
        : []

    const availableParentOptions = categoryOptions.filter(o => {
        if (option && o.id === option.id) return false
        if (o.option_type !== 'select' && o.option_type !== 'multi_select') return false
        return true
    })

    const handleDependsOnValueToggle = (valueKey: string) => {
        setDependsOnValues(prev =>
            prev.includes(valueKey)
                ? prev.filter(v => v !== valueKey)
                : [...prev, valueKey]
        )
    }

    const handleSubmit = async () => {
        if (!label.trim() || !key.trim() || keyError) return

        setSaving(true)
        const data: Partial<CategoryOption> & { category_id: string } = {
            category_id: categoryId,
            option_label: label.trim(),
            option_key: key.trim(),
            option_type: type,
            is_required: isRequired,
            sort_order: sortOrder,
            applies_to_position: appliesToPosition,
            price_adjustment_default: type === 'boolean' ? priceAdjDefault : null,
            depends_on_option_id: dependsOnOptionId || null,
            depends_on_values_json: dependsOnOptionId && dependsOnValues.length > 0 ? dependsOnValues : null,
            is_active: isActive,
        }

        if (mode === 'edit' && option) {
            data.id = option.id
        }

        await onSave(data)
        setSaving(false)
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{mode === 'create' ? 'Nuova Opzione' : 'Modifica Opzione'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nome Opzione *</label>
                        <input
                            className={styles.formInput}
                            type="text"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            placeholder="Es. Colore profilo"
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Chiave</label>
                        <input
                            className={styles.formInput}
                            type="text"
                            value={key}
                            onChange={e => {
                                setKey(e.target.value)
                                setKeyManuallyEdited(true)
                            }}
                            placeholder="colore_profilo"
                        />
                        {keyError && <span className={styles.formError}>{keyError}</span>}
                        <span className={styles.formHint}>Auto-generata dal nome. Modificabile manualmente.</span>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tipo *</label>
                            <select
                                className={styles.formSelect}
                                value={type}
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="select">Select (scelta singola)</option>
                                <option value="multi_select">Multi Select (scelta multipla)</option>
                                <option value="boolean">Si/No</option>
                                <option value="text">Testo libero</option>
                                <option value="number">Numero</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Ordine</label>
                            <input
                                className={styles.formInput}
                                type="number"
                                value={sortOrder}
                                onChange={e => setSortOrder(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="isRequired"
                                checked={isRequired}
                                onChange={e => setIsRequired(e.target.checked)}
                            />
                            <label htmlFor="isRequired">Obbligatorio</label>
                        </div>
                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                            />
                            <label htmlFor="isActive">Attivo</label>
                        </div>
                    </div>

                    {type === 'boolean' && (
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Maggiorazione prezzo (EUR)</label>
                            <input
                                className={styles.formInput}
                                type="number"
                                step="0.01"
                                min="0"
                                value={priceAdjDefault ?? 0}
                                onChange={e => setPriceAdjDefault(Number(e.target.value))}
                            />
                            <span className={styles.formHint}>Importo aggiunto al prezzo quando selezionato &quot;Si&quot;</span>
                        </div>
                    )}

                    {availableParentOptions.length > 0 && (
                        <div className={styles.dependencySection}>
                            <div className={styles.dependencyTitle}>Dipendenza condizionale</div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Dipende da opzione</label>
                                <select
                                    className={styles.formSelect}
                                    value={dependsOnOptionId}
                                    onChange={e => {
                                        setDependsOnOptionId(e.target.value)
                                        setDependsOnValues([])
                                    }}
                                >
                                    <option value="">Nessuna dipendenza</option>
                                    {availableParentOptions.map(o => (
                                        <option key={o.id} value={o.id}>
                                            {o.option_label} ({o.option_key})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {dependsOnOptionId && parentOptionValues.length > 0 && (
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Mostra solo quando il valore è (click per selezionare/deselezionare):
                                    </label>
                                    <div className={styles.multiSelectList}>
                                        {parentOptionValues.map(v => (
                                            <span
                                                key={v.id}
                                                className={styles.multiSelectChip}
                                                style={{
                                                    background: dependsOnValues.includes(v.value_key)
                                                        ? 'var(--color-primary)'
                                                        : 'var(--color-surface-hover)',
                                                    color: dependsOnValues.includes(v.value_key)
                                                        ? 'white'
                                                        : 'var(--color-text-secondary)',
                                                }}
                                                onClick={() => handleDependsOnValueToggle(v.value_key)}
                                            >
                                                {v.value_label}
                                            </span>
                                        ))}
                                    </div>
                                    <span className={styles.formHint}>
                                        {dependsOnValues.length === 0
                                            ? 'Nessun filtro: visibile per tutti i valori'
                                            : `Visibile quando: ${dependsOnValues.join(', ')}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className="btn btn-outline" onClick={onClose} disabled={saving}>
                        Annulla
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={saving || !label.trim() || !key.trim() || !!keyError}
                    >
                        {saving ? 'Salvataggio...' : mode === 'create' ? 'Crea Opzione' : 'Salva Modifiche'}
                    </button>
                </div>
            </div>
        </div>
    )
}

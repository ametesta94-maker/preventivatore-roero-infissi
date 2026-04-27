'use client'

import { useState, useEffect, useMemo } from 'react'
import styles from './ValueFormModal.module.css'

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

interface ValueFormModalProps {
    mode: 'create' | 'edit'
    value?: CategoryOptionValue
    optionId: string
    option: CategoryOption
    existingValues: CategoryOptionValue[]
    allValues: CategoryOptionValue[]
    onSave: (data: Partial<CategoryOptionValue> & { category_option_id: string }) => Promise<void>
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

export default function ValueFormModal({
    mode,
    value,
    optionId,
    option,
    existingValues,
    allValues,
    onSave,
    onClose,
}: ValueFormModalProps) {
    const [label, setLabel] = useState(value?.value_label || '')
    const [key, setKey] = useState(value?.value_key || '')
    const [keyManuallyEdited, setKeyManuallyEdited] = useState(mode === 'edit')
    const [priceAdj, setPriceAdj] = useState(value?.price_adjustment ?? 0)
    const [priceMode, setPriceMode] = useState(value?.price_mode || 'fixed')
    const [sortOrder, setSortOrder] = useState(value?.sort_order ?? getNextSortOrder())
    const [dependsOnValueId, setDependsOnValueId] = useState(value?.depends_on_value_id || '')
    const [isDefault, setIsDefault] = useState(value?.is_default ?? false)
    const [isActive, setIsActive] = useState(value?.is_active ?? true)
    const [saving, setSaving] = useState(false)

    function getNextSortOrder(): number {
        if (existingValues.length === 0) return 10
        return Math.max(...existingValues.map(v => v.sort_order)) + 10
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
        const existingKeys = existingValues.map(v => v.value_key)
        if (key && existingKeys.includes(key) && (!value || value.value_key !== key)) {
            return 'Chiave già esistente per questa opzione'
        }
        return ''
    }, [key, existingValues, value])

    // Values from parent option (for depends_on_value_id)
    const parentOptionId = option.depends_on_option_id
    const parentOptionValues = parentOptionId
        ? allValues.filter(v => v.category_option_id === parentOptionId)
        : []

    // Sibling values for same option (for depends_on_value_id within same option)
    const siblingValues = existingValues.filter(v => !value || v.id !== value.id)

    const dependencyOptions = parentOptionValues.length > 0 ? parentOptionValues : siblingValues

    const handleSubmit = async () => {
        if (!label.trim() || !key.trim() || keyError) return

        setSaving(true)
        const data: Partial<CategoryOptionValue> & { category_option_id: string } = {
            category_option_id: optionId,
            value_label: label.trim(),
            value_key: key.trim(),
            price_adjustment: priceAdj,
            price_mode: priceMode,
            sort_order: sortOrder,
            depends_on_value_id: dependsOnValueId || null,
            is_default: isDefault,
            is_active: isActive,
        }

        if (mode === 'edit' && value) {
            data.id = value.id
        }

        await onSave(data)
        setSaving(false)
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>
                        {mode === 'create' ? 'Nuovo Valore' : 'Modifica Valore'}
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginLeft: 'var(--space-2)' }}>
                            ({option.option_label})
                        </span>
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nome Valore *</label>
                        <input
                            className={styles.formInput}
                            type="text"
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            placeholder="Es. Bianco"
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
                            placeholder="bianco"
                        />
                        {keyError && <span className={styles.formError}>{keyError}</span>}
                        <span className={styles.formHint}>Auto-generata dal nome.</span>
                    </div>

                    <div className={styles.priceGroup}>
                        <p className={styles.priceGroupTitle}>Maggiorazione Prezzo</p>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Importo</label>
                                <input
                                    className={styles.formInput}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={priceAdj}
                                    onChange={e => setPriceAdj(Number(e.target.value))}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Modalità</label>
                                <select
                                    className={styles.formSelect}
                                    value={priceMode}
                                    onChange={e => setPriceMode(e.target.value)}
                                >
                                    <option value="fixed">Fisso (EUR)</option>
                                    <option value="percentage">Percentuale (%)</option>
                                    <option value="per_sqm">Per mq (EUR/mq)</option>
                                    <option value="per_unit">Per unità (EUR/pz)</option>
                                </select>
                            </div>
                        </div>
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

                    {dependencyOptions.length > 0 && (
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Dipende da valore</label>
                            <select
                                className={styles.formSelect}
                                value={dependsOnValueId}
                                onChange={e => setDependsOnValueId(e.target.value)}
                            >
                                <option value="">Nessuna dipendenza</option>
                                {dependencyOptions.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.value_label} ({v.value_key})
                                    </option>
                                ))}
                            </select>
                            <span className={styles.formHint}>
                                {parentOptionValues.length > 0
                                    ? "Valori dell'opzione padre"
                                    : 'Valori fratelli della stessa opzione'}
                            </span>
                        </div>
                    )}

                    <div className={styles.checkboxRow}>
                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="valIsDefault"
                                checked={isDefault}
                                onChange={e => setIsDefault(e.target.checked)}
                            />
                            <label htmlFor="valIsDefault">Valore predefinito</label>
                        </div>
                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="valIsActive"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                            />
                            <label htmlFor="valIsActive">Attivo</label>
                        </div>
                    </div>
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
                        {saving ? 'Salvataggio...' : mode === 'create' ? 'Crea Valore' : 'Salva Modifiche'}
                    </button>
                </div>
            </div>
        </div>
    )
}

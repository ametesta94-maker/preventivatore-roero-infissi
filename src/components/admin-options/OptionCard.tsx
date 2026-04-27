'use client'

import DependencyBadge from './DependencyBadge'
import ValueRow from './ValueRow'
import styles from './OptionCard.module.css'

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

interface OptionCardProps {
    option: CategoryOption
    values: CategoryOptionValue[]
    allOptions: CategoryOption[]
    allValues: CategoryOptionValue[]
    onEdit: () => void
    onDelete: () => void
    onAddValue: () => void
    onEditValue: (value: CategoryOptionValue) => void
    onDeleteValue: (valueId: string, valueLabel: string) => void
}

function getTypeBadgeClass(type: string): string {
    switch (type) {
        case 'select': return styles.typeSelect
        case 'multi_select': return styles.typeMultiSelect
        case 'boolean': return styles.typeBoolean
        case 'text': return styles.typeText
        case 'number': return styles.typeNumber
        default: return styles.typeText
    }
}

function getTypeLabel(type: string): string {
    switch (type) {
        case 'select': return 'Select'
        case 'multi_select': return 'Multi Select'
        case 'boolean': return 'Si/No'
        case 'text': return 'Testo'
        case 'number': return 'Numero'
        default: return type
    }
}

export default function OptionCard({
    option,
    values,
    allOptions,
    allValues,
    onEdit,
    onDelete,
    onAddValue,
    onEditValue,
    onDeleteValue,
}: OptionCardProps) {
    const parentOption = option.depends_on_option_id
        ? allOptions.find(o => o.id === option.depends_on_option_id) || null
        : null

    const hasValues = option.option_type === 'select' || option.option_type === 'multi_select'

    const activeValues = values.filter(v => v.is_active)
    const inactiveValues = values.filter(v => !v.is_active)
    const sortedValues = [...activeValues, ...inactiveValues]

    return (
        <div className={`${styles.optionCard} ${!option.is_active ? styles.inactive : ''}`}>
            <div className={styles.optionHeader}>
                <span className={`${styles.typeBadge} ${getTypeBadgeClass(option.option_type)}`}>
                    {getTypeLabel(option.option_type)}
                </span>
                <div className={styles.optionInfo}>
                    <div className={styles.optionTitle}>
                        <span className={styles.optionLabel}>{option.option_label}</span>
                        <code className={styles.keyCode}>{option.option_key}</code>
                        {option.is_required && (
                            <span className="badge badge-error" style={{ fontSize: 'var(--text-xs)' }}>Obbligatorio</span>
                        )}
                        {!option.is_active && (
                            <span className="badge badge-warning" style={{ fontSize: 'var(--text-xs)' }}>Disattivato</span>
                        )}
                    </div>
                    <div className={styles.optionMeta}>
                        <span className={styles.metaItem}>Ordine: {option.sort_order}</span>
                        {parentOption && (
                            <DependencyBadge
                                dependsOnOption={parentOption}
                                dependsOnValues={option.depends_on_values_json}
                            />
                        )}
                        {option.option_type === 'boolean' && option.price_adjustment_default !== null && option.price_adjustment_default > 0 && (
                            <span className={styles.booleanPrice}>
                                Maggiorazione: +{new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(option.price_adjustment_default)} EUR
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.optionActions}>
                    <button className="btn btn-sm btn-outline" onClick={onEdit} title="Modifica opzione">
                        &#9998;
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={onDelete} title="Elimina opzione">
                        &#128465;
                    </button>
                </div>
            </div>

            {hasValues && (
                <div className={styles.valuesSection}>
                    <div className={styles.valuesHeader}>
                        <span className={styles.valuesTitle}>
                            Valori ({values.length})
                        </span>
                        <button className="btn btn-sm btn-outline" onClick={onAddValue}>
                            + Aggiungi Valore
                        </button>
                    </div>
                    {sortedValues.length === 0 ? (
                        <p className={styles.emptyValues}>Nessun valore configurato.</p>
                    ) : (
                        <table className={styles.valuesTable}>
                            <thead>
                                <tr>
                                    <th>Valore</th>
                                    <th>Chiave</th>
                                    <th>Maggiorazione</th>
                                    <th>Modo</th>
                                    <th>Default</th>
                                    <th>Info</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedValues.map(v => (
                                    <ValueRow
                                        key={v.id}
                                        value={v}
                                        allValues={allValues}
                                        onEdit={() => onEditValue(v)}
                                        onDelete={() => onDeleteValue(v.id, v.value_label)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    )
}

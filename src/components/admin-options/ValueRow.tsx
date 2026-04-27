'use client'

import DependencyBadge from './DependencyBadge'
import styles from './OptionCard.module.css'

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

interface ValueRowProps {
    value: CategoryOptionValue
    allValues: CategoryOptionValue[]
    onEdit: () => void
    onDelete: () => void
}

function formatPrice(amount: number | null, mode: string): string {
    if (amount === null || amount === 0) return '-'
    const formatter = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    switch (mode) {
        case 'percentage':
            return `+${formatter.format(amount)}%`
        case 'per_sqm':
            return `+${formatter.format(amount)} EUR/mq`
        case 'per_unit':
            return `+${formatter.format(amount)} EUR/pz`
        default:
            return `+${formatter.format(amount)} EUR`
    }
}

function formatPriceMode(mode: string): string {
    switch (mode) {
        case 'percentage': return 'Percentuale'
        case 'per_sqm': return 'Per mq'
        case 'per_unit': return 'Per unita'
        default: return 'Fisso'
    }
}

export default function ValueRow({ value, allValues, onEdit, onDelete }: ValueRowProps) {
    const parentValue = value.depends_on_value_id
        ? allValues.find(v => v.id === value.depends_on_value_id)
        : null

    return (
        <tr className={`${styles.valueRow} ${!value.is_active ? styles.inactive : ''}`}>
            <td className={styles.valueCell}>{value.value_label}</td>
            <td className={styles.valueCell}>
                <code className={styles.keyCode}>{value.value_key}</code>
            </td>
            <td className={styles.valueCell}>
                <span className={value.price_adjustment && value.price_adjustment > 0 ? styles.pricePositive : ''}>
                    {formatPrice(value.price_adjustment, value.price_mode)}
                </span>
            </td>
            <td className={styles.valueCell}>{formatPriceMode(value.price_mode)}</td>
            <td className={styles.valueCell}>
                {value.is_default && <span className="badge badge-info">Default</span>}
            </td>
            <td className={styles.valueCell}>
                {!value.is_active && <span className="badge badge-warning">Disattivato</span>}
                {parentValue && (
                    <DependencyBadge
                        dependsOnOption={null}
                        dependsOnValues={null}
                        dependsOnValueLabel={parentValue.value_label}
                    />
                )}
            </td>
            <td className={styles.valueCell}>
                <div className={styles.valueActions}>
                    <button className="btn btn-sm btn-outline" onClick={onEdit} title="Modifica">
                        &#9998;
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={onDelete} title="Elimina">
                        &#128465;
                    </button>
                </div>
            </td>
        </tr>
    )
}

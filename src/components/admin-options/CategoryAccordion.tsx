'use client'

import OptionCard from './OptionCard'
import styles from './CategoryAccordion.module.css'

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

interface CategoryAccordionProps {
    category: Category
    options: CategoryOption[]
    values: CategoryOptionValue[]
    allOptions: CategoryOption[]
    allValues: CategoryOptionValue[]
    isExpanded: boolean
    onToggle: () => void
    onEditOption: (option: CategoryOption) => void
    onDeleteOption: (optionId: string, optionLabel: string) => void
    onAddOption: (categoryId: string, appliesToPosition: boolean) => void
    onAddValue: (optionId: string, option: CategoryOption) => void
    onEditValue: (value: CategoryOptionValue, option: CategoryOption) => void
    onDeleteValue: (valueId: string, valueLabel: string) => void
}

export default function CategoryAccordion({
    category,
    options,
    values,
    allOptions,
    allValues,
    isExpanded,
    onToggle,
    onEditOption,
    onDeleteOption,
    onAddOption,
    onAddValue,
    onEditValue,
    onDeleteValue,
}: CategoryAccordionProps) {
    const globalOptions = options
        .filter(o => !o.applies_to_position)
        .sort((a, b) => a.sort_order - b.sort_order)
    const positionOptions = options
        .filter(o => o.applies_to_position)
        .sort((a, b) => a.sort_order - b.sort_order)

    const getValuesForOption = (optionId: string) =>
        values.filter(v => v.category_option_id === optionId)

    return (
        <div className={styles.accordion}>
            <button className={styles.accordionHeader} onClick={onToggle}>
                <div className={styles.headerLeft}>
                    <span className={styles.categoryIcon}>{category.icona || '📁'}</span>
                    <span className={styles.categoryName}>{category.nome}</span>
                </div>
                <div className={styles.headerRight}>
                    <span className={styles.optionCount}>
                        {options.length} opzion{options.length === 1 ? 'e' : 'i'}
                    </span>
                    <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
                        &#9660;
                    </span>
                </div>
            </button>

            {isExpanded && (
                <div className={styles.accordionBody}>
                    {/* Opzioni Globali */}
                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>
                                Opzioni Globali ({globalOptions.length})
                            </span>
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => onAddOption(category.id, false)}
                            >
                                + Nuova Opzione
                            </button>
                        </div>
                        {globalOptions.length === 0 ? (
                            <p className={styles.emptySection}>Nessuna opzione globale configurata.</p>
                        ) : (
                            globalOptions.map(opt => (
                                <OptionCard
                                    key={opt.id}
                                    option={opt}
                                    values={getValuesForOption(opt.id)}
                                    allOptions={allOptions}
                                    allValues={allValues}
                                    onEdit={() => onEditOption(opt)}
                                    onDelete={() => onDeleteOption(opt.id, opt.option_label)}
                                    onAddValue={() => onAddValue(opt.id, opt)}
                                    onEditValue={(v) => onEditValue(v, opt)}
                                    onDeleteValue={(vId, vLabel) => onDeleteValue(vId, vLabel)}
                                />
                            ))
                        )}
                    </div>

                    {/* Opzioni Posizione */}
                    <div className={styles.sectionGroup}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>
                                Opzioni Posizione ({positionOptions.length})
                            </span>
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => onAddOption(category.id, true)}
                            >
                                + Nuova Opzione
                            </button>
                        </div>
                        {positionOptions.length === 0 ? (
                            <p className={styles.emptySection}>Nessuna opzione posizione configurata.</p>
                        ) : (
                            positionOptions.map(opt => (
                                <OptionCard
                                    key={opt.id}
                                    option={opt}
                                    values={getValuesForOption(opt.id)}
                                    allOptions={allOptions}
                                    allValues={allValues}
                                    onEdit={() => onEditOption(opt)}
                                    onDelete={() => onDeleteOption(opt.id, opt.option_label)}
                                    onAddValue={() => onAddValue(opt.id, opt)}
                                    onEditValue={(v) => onEditValue(v, opt)}
                                    onDeleteValue={(vId, vLabel) => onDeleteValue(vId, vLabel)}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

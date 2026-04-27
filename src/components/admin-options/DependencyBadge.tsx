'use client'

interface CategoryOption {
    id: string
    option_key: string
    option_label: string
}

interface DependencyBadgeProps {
    dependsOnOption: CategoryOption | null
    dependsOnValues: string[] | null
    dependsOnValueLabel?: string | null
}

export default function DependencyBadge({ dependsOnOption, dependsOnValues, dependsOnValueLabel }: DependencyBadgeProps) {
    if (!dependsOnOption && !dependsOnValueLabel) return null

    let text = ''
    if (dependsOnValueLabel) {
        text = `Dipende da valore: ${dependsOnValueLabel}`
    } else if (dependsOnOption) {
        text = `Dipende da: ${dependsOnOption.option_label}`
        if (dependsOnValues && dependsOnValues.length > 0) {
            text += ` = [${dependsOnValues.join(', ')}]`
        }
    }

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-info)',
            background: 'var(--color-info-light)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 500,
        }}>
            &#x1F517; {text}
        </span>
    )
}

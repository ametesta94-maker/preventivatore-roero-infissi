'use client'

import { useMemo } from 'react'
import type { CategoryOption, CategoryOptionValue } from '@/types/database'
import { resolveVisibleOptions } from '@/lib/utils/option-resolver'
import DynamicOptionField from './DynamicOptionField'
import styles from './Options.module.css'

interface OptionGroupPanelProps {
  options: CategoryOption[]
  values: CategoryOptionValue[]
  selections: Record<string, string | string[] | boolean | null>
  onSelectionChange: (optionKey: string, value: string | string[] | boolean | null) => void
  title?: string
  disabled?: boolean
}

export default function OptionGroupPanel({
  options,
  values,
  selections,
  onSelectionChange,
  title,
  disabled = false,
}: OptionGroupPanelProps) {
  const resolvedOptions = useMemo(
    () => resolveVisibleOptions(options, values, selections),
    [options, values, selections]
  )

  const visibleOptions = resolvedOptions.filter((r) => r.visible)

  if (visibleOptions.length === 0) return null

  return (
    <div className={styles.optionGroup}>
      {title && <h4 className={styles.optionGroupTitle}>{title}</h4>}
      <div className={styles.optionGrid}>
        {visibleOptions.map((resolved) => (
          <DynamicOptionField
            key={resolved.option.id}
            option={resolved.option}
            values={resolved.values}
            currentValue={selections[resolved.option.option_key] ?? null}
            onChange={onSelectionChange}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

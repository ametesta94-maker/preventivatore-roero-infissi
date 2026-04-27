'use client'

import type { CategoryOption, CategoryOptionValue } from '@/types/database'

interface DynamicOptionFieldProps {
  option: CategoryOption
  values: CategoryOptionValue[]
  currentValue: string | string[] | boolean | null
  onChange: (optionKey: string, value: string | string[] | boolean | null) => void
  disabled?: boolean
}

export default function DynamicOptionField({
  option,
  values,
  currentValue,
  onChange,
  disabled = false,
}: DynamicOptionFieldProps) {
  const handleChange = (value: string | string[] | boolean | null) => {
    onChange(option.option_key, value)
  }

  return (
    <div className="form-group">
      <label className="form-label">
        {option.option_label}
        {option.is_required && <span style={{ color: 'var(--color-error)' }}> *</span>}
      </label>

      {option.option_type === 'select' && (
        <select
          className="form-input"
          value={(currentValue as string) || ''}
          onChange={(e) => handleChange(e.target.value || null)}
          disabled={disabled}
          required={option.is_required}
        >
          <option value="">Seleziona...</option>
          {values.map((v) => (
            <option key={v.id} value={v.value_key}>
              {v.value_label}
              {v.price_adjustment > 0 && ` (+${formatPrice(v.price_adjustment)})`}
            </option>
          ))}
        </select>
      )}

      {option.option_type === 'multi_select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {values.map((v) => {
            const selectedArray = Array.isArray(currentValue) ? currentValue : []
            const isChecked = selectedArray.includes(v.value_key)
            return (
              <label key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() => {
                    const newValues = isChecked
                      ? selectedArray.filter((k) => k !== v.value_key)
                      : [...selectedArray, v.value_key]
                    handleChange(newValues.length > 0 ? newValues : null)
                  }}
                />
                <span>{v.value_label}</span>
                {v.price_adjustment > 0 && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
                    +{formatPrice(v.price_adjustment)}
                  </span>
                )}
              </label>
            )
          })}
        </div>
      )}

      {option.option_type === 'boolean' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={currentValue === true}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.checked)}
          />
          <span>Si</span>
          {option.price_adjustment_default > 0 && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
              +{formatPrice(option.price_adjustment_default)}
            </span>
          )}
        </label>
      )}

      {option.option_type === 'text' && (
        <input
          type="text"
          className="form-input"
          value={(currentValue as string) || ''}
          onChange={(e) => handleChange(e.target.value || null)}
          disabled={disabled}
          required={option.is_required}
          placeholder={option.option_label}
        />
      )}

      {option.option_type === 'number' && (
        <input
          type="number"
          className="form-input"
          value={currentValue != null && currentValue !== false ? String(currentValue) : ''}
          onChange={(e) => handleChange(e.target.value ? e.target.value : null)}
          disabled={disabled}
          required={option.is_required}
          placeholder={option.option_label}
        />
      )}
    </div>
  )
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

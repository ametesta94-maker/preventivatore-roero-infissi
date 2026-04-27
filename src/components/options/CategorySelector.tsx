'use client'

import type { Category } from '@/types/database'

interface CategorySelectorProps {
  value: string
  onChange: (categoryId: string) => void
  categories: Category[]
  disabled?: boolean
  excludeIds?: string[]
}

export default function CategorySelector({
  value,
  onChange,
  categories,
  disabled = false,
  excludeIds = [],
}: CategorySelectorProps) {
  const availableCategories = categories
    .filter((c) => c.attiva && !excludeIds.includes(c.id))
    .sort((a, b) => a.ordine - b.ordine)

  return (
    <select
      className="form-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Seleziona categoria...</option>
      {availableCategories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.icona} {cat.nome}
        </option>
      ))}
    </select>
  )
}

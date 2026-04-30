'use client'

import useSWR from 'swr'
import type { CategoryOption, CategoryOptionValue } from '@/types/database'

interface CategoryOptionsData {
  options: CategoryOption[]
  values: CategoryOptionValue[]
}

async function fetchCategoryOptions(categoryId: string): Promise<CategoryOptionsData> {
  const res = await fetch(`/api/categorie/${categoryId}/opzioni`)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Errore caricamento opzioni categoria')
  }

  return {
    options: (data.options || []) as CategoryOption[],
    values: (data.values || []) as CategoryOptionValue[],
  }
}

export function useCategoryOptions(categoryId: string | null) {
  const { data, error, isLoading } = useSWR<CategoryOptionsData>(
    categoryId ? `category-options-${categoryId}` : null,
    () => fetchCategoryOptions(categoryId!),
    { revalidateOnFocus: false }
  )

  return {
    options: data?.options || [],
    values: data?.values || [],
    globalOptions: (data?.options || []).filter((o) => !o.applies_to_position),
    positionOptions: (data?.options || []).filter((o) => o.applies_to_position),
    globalValues: filterValuesByOptions(data?.values || [], (data?.options || []).filter((o) => !o.applies_to_position)),
    positionValues: filterValuesByOptions(data?.values || [], (data?.options || []).filter((o) => o.applies_to_position)),
    isLoading,
    error,
  }
}

function filterValuesByOptions(values: CategoryOptionValue[], options: CategoryOption[]): CategoryOptionValue[] {
  const optionIds = new Set(options.map((o) => o.id))
  return values.filter((v) => optionIds.has(v.category_option_id))
}

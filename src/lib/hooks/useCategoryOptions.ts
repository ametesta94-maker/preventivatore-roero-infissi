'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { CategoryOption, CategoryOptionValue } from '@/types/database'

interface CategoryOptionsData {
  options: CategoryOption[]
  values: CategoryOptionValue[]
}

async function fetchCategoryOptions(categoryId: string): Promise<CategoryOptionsData> {
  const supabase = createClient()

  const [optionsRes, valuesRes] = await Promise.all([
    supabase
      .from('category_options')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('category_option_values')
      .select('*, category_options!inner(category_id)')
      .eq('category_options.category_id', categoryId)
      .eq('is_active', true)
      .order('sort_order'),
  ])

  return {
    options: (optionsRes.data || []) as CategoryOption[],
    values: ((valuesRes.data || []) as (CategoryOptionValue & { category_options: unknown })[]).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ category_options: _, ...v }) => v as CategoryOptionValue
    ),
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

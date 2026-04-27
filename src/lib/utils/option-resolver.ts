/**
 * Resolver dipendenze opzioni
 * Determina quali opzioni e valori sono visibili in base alle selezioni correnti
 */

import type { CategoryOption, CategoryOptionValue } from '@/types/database'

export interface ResolvedOption {
  option: CategoryOption
  values: CategoryOptionValue[]
  visible: boolean
}

/**
 * Data una lista di opzioni di categoria e le selezioni correnti,
 * determina quali opzioni sono visibili e quali valori mostrare.
 *
 * Logica:
 * - Se option.depends_on_option_id e null → sempre visibile
 * - Se option.depends_on_option_id punta a un'opzione boolean → visibile se il boolean e true
 * - Se option.depends_on_values_json ha valori → visibile se la selezione corrente del genitore e tra quei valori
 * - I valori con depends_on_value_id sono filtrati in base al valore selezionato del loro genitore
 */
export function resolveVisibleOptions(
  allOptions: CategoryOption[],
  allValues: CategoryOptionValue[],
  currentSelections: Record<string, string | string[] | boolean | null>
): ResolvedOption[] {
  // Mappa option_key → option per lookup veloce
  const optionById = new Map<string, CategoryOption>()
  const optionByKey = new Map<string, CategoryOption>()
  for (const opt of allOptions) {
    optionById.set(opt.id, opt)
    optionByKey.set(opt.option_key, opt)
  }

  // Mappa value_id → value per lookup
  const valueById = new Map<string, CategoryOptionValue>()
  for (const val of allValues) {
    valueById.set(val.id, val)
  }

  return allOptions
    .filter(opt => opt.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(option => {
      const visible = isOptionVisible(option, optionById, currentSelections)

      // Filtra i valori per questa opzione
      const optionValues = allValues
        .filter(v => v.category_option_id === option.id && v.is_active)
        .filter(v => isValueVisible(v, valueById, currentSelections, optionById))
        .sort((a, b) => a.sort_order - b.sort_order)

      return { option, values: optionValues, visible }
    })
}

/**
 * Determina se un'opzione e visibile in base alle sue dipendenze
 */
function isOptionVisible(
  option: CategoryOption,
  optionById: Map<string, CategoryOption>,
  selections: Record<string, string | string[] | boolean | null>
): boolean {
  // Nessuna dipendenza → sempre visibile
  if (!option.depends_on_option_id) {
    return true
  }

  const parentOption = optionById.get(option.depends_on_option_id)
  if (!parentOption) return true

  const parentValue = selections[parentOption.option_key]

  // Se il genitore e un boolean → visibile se true
  if (parentOption.option_type === 'boolean') {
    return parentValue === true
  }

  // Se ci sono valori specifici richiesti
  if (option.depends_on_values_json) {
    const requiredValues = option.depends_on_values_json as string[]

    // Il genitore potrebbe essere multi_select (array) o select (stringa)
    if (Array.isArray(parentValue)) {
      // multi_select: visibile se c'e intersezione
      return parentValue.some(v => requiredValues.includes(v))
    }

    if (typeof parentValue === 'string') {
      return requiredValues.includes(parentValue)
    }

    return false
  }

  // Dipendenza senza valori specifici → visibile se il genitore ha un valore
  return parentValue != null && parentValue !== '' && parentValue !== false
}

/**
 * Determina se un valore e visibile in base a depends_on_value_id
 * Usato per sotto-opzioni condizionali (es. tipo maniglie dipende da modello maniglie)
 */
function isValueVisible(
  value: CategoryOptionValue,
  valueById: Map<string, CategoryOptionValue>,
  selections: Record<string, string | string[] | boolean | null>,
  optionById: Map<string, CategoryOption>
): boolean {
  // Nessuna dipendenza su valore → sempre visibile
  if (!value.depends_on_value_id) {
    return true
  }

  const parentValue = valueById.get(value.depends_on_value_id)
  if (!parentValue) return true

  // Trova l'opzione a cui appartiene il valore genitore
  const parentOption = findOptionForValue(parentValue.category_option_id, optionById)
  if (!parentOption) return true

  const selectedValue = selections[parentOption.option_key]

  // Controlla se il valore genitore e attualmente selezionato
  if (Array.isArray(selectedValue)) {
    return selectedValue.includes(parentValue.value_key)
  }

  return selectedValue === parentValue.value_key
}

/**
 * Trova l'opzione che contiene un determinato category_option_id
 */
function findOptionForValue(
  categoryOptionId: string,
  optionById: Map<string, CategoryOption>
): CategoryOption | undefined {
  return optionById.get(categoryOptionId)
}

/**
 * Estrae le maggiorazioni dalle selezioni correnti
 * Ritorna un array di {price_adjustment, price_mode} per il calcolo prezzi
 */
export function extractPriceAdjustments(
  resolvedOptions: ResolvedOption[],
  selections: Record<string, string | string[] | boolean | null>
): Array<{ price_adjustment: number; price_mode: 'fixed' | 'percentage' | 'per_sqm' | 'per_unit' }> {
  const adjustments: Array<{ price_adjustment: number; price_mode: 'fixed' | 'percentage' | 'per_sqm' | 'per_unit' }> = []

  for (const resolved of resolvedOptions) {
    if (!resolved.visible) continue

    const selection = selections[resolved.option.option_key]
    if (selection == null || selection === '' || selection === false) continue

    if (resolved.option.option_type === 'select' && typeof selection === 'string') {
      const selectedVal = resolved.values.find(v => v.value_key === selection)
      if (selectedVal && selectedVal.price_adjustment !== 0) {
        adjustments.push({
          price_adjustment: selectedVal.price_adjustment,
          price_mode: selectedVal.price_mode as 'fixed' | 'percentage' | 'per_sqm' | 'per_unit',
        })
      }
    } else if (resolved.option.option_type === 'multi_select' && Array.isArray(selection)) {
      for (const key of selection) {
        const selectedVal = resolved.values.find(v => v.value_key === key)
        if (selectedVal && selectedVal.price_adjustment !== 0) {
          adjustments.push({
            price_adjustment: selectedVal.price_adjustment,
            price_mode: selectedVal.price_mode as 'fixed' | 'percentage' | 'per_sqm' | 'per_unit',
          })
        }
      }
    } else if (resolved.option.option_type === 'boolean' && selection === true) {
      if (resolved.option.price_adjustment_default !== 0) {
        adjustments.push({
          price_adjustment: resolved.option.price_adjustment_default,
          price_mode: 'fixed',
        })
      }
    }
  }

  return adjustments
}

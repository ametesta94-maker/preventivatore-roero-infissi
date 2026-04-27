'use client'

import { useReducer, useCallback } from 'react'
import type { Category } from '@/types/database'

// ============================================================
// State types
// ============================================================

export interface QuotePositionState {
  tempId: string
  prodotto_id: string
  prodotto_nome: string
  quantita: number
  larghezza_mm: number
  altezza_mm: number
  posizione_locale: string
  descrizione: string
  positionOptions: Record<string, string | string[] | boolean | null>
  prezzo_unitario: number
  subtotale_calcolato: number
  manual_price_override: number | null
}

export interface QuoteSectionState {
  tempId: string
  category_id: string
  category: Category
  globalOptions: Record<string, string | string[] | boolean | null>
  positions: QuotePositionState[]
  trasporto: number
  posa: number
  sconto_percentuale: number
  subtotale_sezione: number
  show_line_prices: boolean
  manual_total_override: number | null
  notes: string
  free_description: string
}

export interface QuoteFormState {
  cliente_id: string
  sede_id: string
  aliquota_iva_id: string
  data_preventivo: string
  validita_giorni: number
  note: string
  note_interne: string
  sections: QuoteSectionState[]
  sconto_globale_1: number
  sconto_globale_2: number
  show_grand_total: boolean
  show_iva: boolean
  payment_method_id: string
  payment_notes: string
  services: QuoteServiceState[]
  stato: string
  importo_beni_significativi: number
  emesso_da: string
}

export interface QuoteServiceState {
  tempId: string
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  notes: string
}

// ============================================================
// Actions
// ============================================================

export type QuoteAction =
  | { type: 'SET_FIELD'; field: keyof QuoteFormState; value: string | number | boolean }
  | { type: 'ADD_SECTION'; category: Category }
  | { type: 'REMOVE_SECTION'; tempId: string }
  | { type: 'SET_SECTION_GLOBAL_OPTION'; sectionTempId: string; optionKey: string; value: string | string[] | boolean | null }
  | { type: 'SET_SECTION_FIELD'; sectionTempId: string; field: 'trasporto' | 'posa' | 'sconto_percentuale' | 'note_sezione' | 'show_line_prices' | 'manual_total_override' | 'notes' | 'free_description'; value: number | string | boolean | null }
  | { type: 'ADD_POSITION'; sectionTempId: string }
  | { type: 'REMOVE_POSITION'; sectionTempId: string; positionTempId: string }
  | { type: 'UPDATE_POSITION'; sectionTempId: string; positionTempId: string; field: string; value: string | number | boolean | null }
  | { type: 'SET_POSITION_OPTION'; sectionTempId: string; positionTempId: string; optionKey: string; value: string | string[] | boolean | null }
  | { type: 'UPDATE_POSITION_PRICE'; sectionTempId: string; positionTempId: string; subtotale: number }
  | { type: 'UPDATE_SECTION_SUBTOTAL'; sectionTempId: string; subtotale: number }
  | { type: 'ADD_SERVICE' }
  | { type: 'REMOVE_SERVICE'; tempId: string }
  | { type: 'UPDATE_SERVICE'; tempId: string; field: string; value: string | number }

// ============================================================
// Helper
// ============================================================

let counter = 0
function genTempId(): string {
  return `tmp_${Date.now()}_${++counter}`
}

function createEmptyPosition(): QuotePositionState {
  return {
    tempId: genTempId(),
    prodotto_id: '',
    prodotto_nome: '',
    quantita: 1,
    larghezza_mm: 0,
    altezza_mm: 0,
    posizione_locale: '',
    descrizione: '',
    positionOptions: {},
    prezzo_unitario: 0,
    subtotale_calcolato: 0,
    manual_price_override: null,
  }
}

function createEmptyService(): QuoteServiceState {
  return {
    tempId: genTempId(),
    service_id: '',
    service_name: '',
    quantity: 1,
    unit_price: 0,
    notes: '',
  }
}

// ============================================================
// Reducer
// ============================================================

function quoteReducer(state: QuoteFormState, action: QuoteAction): QuoteFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }

    case 'ADD_SECTION':
      return {
        ...state,
        sections: [
          ...state.sections,
          {
            tempId: genTempId(),
            category_id: action.category.id,
            category: action.category,
            globalOptions: {},
            positions: [createEmptyPosition()],
            trasporto: 0,
            posa: 0,
            sconto_percentuale: 0,
            subtotale_sezione: 0,
            show_line_prices: true,
            manual_total_override: null,
            notes: '',
            free_description: '',
          },
        ],
      }

    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections.filter((s) => s.tempId !== action.tempId),
      }

    case 'SET_SECTION_GLOBAL_OPTION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.tempId === action.sectionTempId
            ? { ...s, globalOptions: { ...s.globalOptions, [action.optionKey]: action.value } }
            : s
        ),
      }

    case 'SET_SECTION_FIELD':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.tempId === action.sectionTempId ? { ...s, [action.field]: action.value } : s
        ),
      }

    case 'ADD_POSITION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.tempId === action.sectionTempId
            ? { ...s, positions: [...s.positions, createEmptyPosition()] }
            : s
        ),
      }

    case 'REMOVE_POSITION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.tempId === action.sectionTempId
            ? { ...s, positions: s.positions.filter((p) => p.tempId !== action.positionTempId) }
            : s
        ),
      }

    case 'UPDATE_POSITION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.tempId === action.sectionTempId
            ? {
              ...s,
              positions: s.positions.map((p) =>
                p.tempId === action.positionTempId ? { ...p, [action.field]: action.value } : p
              ),
            }
            : s
        ),
      }

    case 'SET_POSITION_OPTION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.tempId === action.sectionTempId
            ? {
              ...s,
              positions: s.positions.map((p) =>
                p.tempId === action.positionTempId
                  ? { ...p, positionOptions: { ...p.positionOptions, [action.optionKey]: action.value } }
                  : p
              ),
            }
            : s
        ),
      }

    case 'UPDATE_POSITION_PRICE':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.tempId === action.sectionTempId
            ? {
              ...s,
              positions: s.positions.map((p) =>
                p.tempId === action.positionTempId ? { ...p, subtotale_calcolato: action.subtotale } : p
              ),
            }
            : s
        ),
      }

    case 'UPDATE_SECTION_SUBTOTAL':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.tempId === action.sectionTempId ? { ...s, subtotale_sezione: action.subtotale } : s
        ),
      }

    case 'ADD_SERVICE':
      return {
        ...state,
        services: [...state.services, createEmptyService()],
      }

    case 'REMOVE_SERVICE':
      return {
        ...state,
        services: state.services.filter((s) => s.tempId !== action.tempId),
      }

    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map((s) =>
          s.tempId === action.tempId ? { ...s, [action.field]: action.value } : s
        ),
      }

    default:
      return state
  }
}

// ============================================================
// Hook
// ============================================================

const today = new Date().toISOString().split('T')[0]

const initialState: QuoteFormState = {
  cliente_id: '',
  sede_id: '',
  aliquota_iva_id: '',
  data_preventivo: today,
  validita_giorni: 30,
  note: '',
  note_interne: '',
  sections: [],
  sconto_globale_1: 0,
  sconto_globale_2: 0,
  show_grand_total: true,
  show_iva: true,
  payment_method_id: '',
  payment_notes: '',
  services: [],
  stato: 'bozza',
  importo_beni_significativi: 0,
  emesso_da: '',
}

export function useQuoteForm(initialData?: QuoteFormState) {
  const [state, dispatch] = useReducer(quoteReducer, initialData || initialState)

  const setField = useCallback(
    (field: keyof QuoteFormState, value: string | number | boolean) => dispatch({ type: 'SET_FIELD', field, value }),
    []
  )

  const addSection = useCallback(
    (category: Category) => dispatch({ type: 'ADD_SECTION', category }),
    []
  )

  const removeSection = useCallback(
    (tempId: string) => dispatch({ type: 'REMOVE_SECTION', tempId }),
    []
  )

  const setSectionGlobalOption = useCallback(
    (sectionTempId: string, optionKey: string, value: string | string[] | boolean | null) =>
      dispatch({ type: 'SET_SECTION_GLOBAL_OPTION', sectionTempId, optionKey, value }),
    []
  )

  const setSectionField = useCallback(
    (sectionTempId: string, field: 'trasporto' | 'posa' | 'sconto_percentuale' | 'note_sezione' | 'show_line_prices' | 'manual_total_override' | 'notes' | 'free_description', value: number | string | boolean | null) =>
      dispatch({ type: 'SET_SECTION_FIELD', sectionTempId, field, value }),
    []
  )

  const addPosition = useCallback(
    (sectionTempId: string) => dispatch({ type: 'ADD_POSITION', sectionTempId }),
    []
  )

  const removePosition = useCallback(
    (sectionTempId: string, positionTempId: string) =>
      dispatch({ type: 'REMOVE_POSITION', sectionTempId, positionTempId }),
    []
  )

  const updatePosition = useCallback(
    (sectionTempId: string, positionTempId: string, field: string, value: string | number | boolean | null) =>
      dispatch({ type: 'UPDATE_POSITION', sectionTempId, positionTempId, field, value }),
    []
  )

  const setPositionOption = useCallback(
    (sectionTempId: string, positionTempId: string, optionKey: string, value: string | string[] | boolean | null) =>
      dispatch({ type: 'SET_POSITION_OPTION', sectionTempId, positionTempId, optionKey, value }),
    []
  )

  const updatePositionPrice = useCallback(
    (sectionTempId: string, positionTempId: string, subtotale: number) =>
      dispatch({ type: 'UPDATE_POSITION_PRICE', sectionTempId, positionTempId, subtotale }),
    []
  )

  const updateSectionSubtotal = useCallback(
    (sectionTempId: string, subtotale: number) =>
      dispatch({ type: 'UPDATE_SECTION_SUBTOTAL', sectionTempId, subtotale }),
    []
  )

  const addService = useCallback(
    () => dispatch({ type: 'ADD_SERVICE' }),
    []
  )

  const removeService = useCallback(
    (tempId: string) => dispatch({ type: 'REMOVE_SERVICE', tempId }),
    []
  )

  const updateService = useCallback(
    (tempId: string, field: string, value: string | number) =>
      dispatch({ type: 'UPDATE_SERVICE', tempId, field, value }),
    []
  )

  return {
    state,
    dispatch,
    setField,
    addSection,
    removeSection,
    setSectionGlobalOption,
    setSectionField,
    addPosition,
    removePosition,
    updatePosition,
    setPositionOption,
    updatePositionPrice,
    updateSectionSubtotal,
    addService,
    removeService,
    updateService,
  }
}

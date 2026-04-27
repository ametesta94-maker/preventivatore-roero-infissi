/**
 * Modulo calcolo prezzi preventivo
 * Funzioni pure — nessuna chiamata DB, nessun side effect
 */

export interface OptionAdjustment {
  price_adjustment: number
  price_mode: 'fixed' | 'percentage' | 'per_sqm' | 'per_unit'
}

export interface LineItemPriceInput {
  prezzo_base: number
  quantita: number
  larghezza_mm?: number
  altezza_mm?: number
  unita_misura: 'pezzo' | 'mq' | 'ml'
  option_adjustments: OptionAdjustment[]
  manual_price_override?: number | null
}

export interface SectionPriceInput {
  righe: Array<{ subtotale: number }>
  global_option_adjustments: OptionAdjustment[]
  trasporto: number
  posa: number
  sconto_percentuale: number
  manual_total_override?: number | null
}

export interface QuotePriceInput {
  sezioni: Array<{ subtotale_sezione: number }>
  servizi?: Array<{ quantity: number; unit_price: number }>
  aliquota_iva_percentuale: number
  sconto_globale_1: number
  sconto_globale_2: number
  // IVA combinata (beni significativi, es. 10%/22%)
  is_combined?: boolean
  rate_secondary?: number | null
  importo_beni_significativi?: number
}

export interface QuoteTotals {
  totale_imponibile: number
  totale_imponibile_scontato: number
  totale_iva: number
  totale_preventivo: number
  // IVA combinata - valorizzati solo quando is_combined=true
  iva_ridotta?: number
  iva_piena?: number
  base_ridotta?: number
  base_piena?: number
}

/**
 * Calcola i mq da larghezza e altezza in mm
 */
export function calcMetriQuadri(larghezza_mm: number, altezza_mm: number): number {
  return (larghezza_mm / 1000) * (altezza_mm / 1000)
}

/**
 * Applica una singola maggiorazione al prezzo base
 */
function applyAdjustment(
  adj: OptionAdjustment,
  prezzo_base: number,
  mq: number
): number {
  switch (adj.price_mode) {
    case 'fixed':
      return adj.price_adjustment
    case 'percentage':
      return prezzo_base * (adj.price_adjustment / 100)
    case 'per_sqm':
      return adj.price_adjustment * mq
    case 'per_unit':
      return adj.price_adjustment
    default:
      return adj.price_adjustment
  }
}

/**
 * Calcola il prezzo di una singola riga/posizione
 *
 * Se manual_price_override è presente, usa quello.
 * Altrimenti: prezzo_riga = (prezzo_base_prodotto + SUM(maggiorazioni_opzioni)) * quantita
 *
 * Per unita_misura 'mq': prezzo_base e per mq, moltiplicato per area
 */
export function calculateLineItemPrice(input: LineItemPriceInput): number {
  const { manual_price_override } = input

  // Se c'è un prezzo manuale, usalo
  if (manual_price_override !== null && manual_price_override !== undefined) {
    return round2(manual_price_override)
  }

  // Altrimenti calcolo automatico
  const { prezzo_base, quantita, larghezza_mm = 0, altezza_mm = 0, unita_misura, option_adjustments } = input

  const mq = calcMetriQuadri(larghezza_mm, altezza_mm)

  // Prezzo base in base all'unita di misura
  let prezzo_unitario: number
  if (unita_misura === 'mq') {
    prezzo_unitario = prezzo_base * mq
  } else if (unita_misura === 'ml') {
    prezzo_unitario = prezzo_base * (larghezza_mm / 1000)
  } else {
    prezzo_unitario = prezzo_base
  }

  // Somma delle maggiorazioni opzioni
  const totale_maggiorazioni = option_adjustments.reduce(
    (sum, adj) => sum + applyAdjustment(adj, prezzo_unitario, mq),
    0
  )

  return round2((prezzo_unitario + totale_maggiorazioni) * quantita)
}

/**
 * Calcola il subtotale di una sezione
 *
 * Se manual_total_override è presente, usa quello.
 * Altrimenti: prezzo_sezione = SUM(subtotali_righe) + SUM(maggiorazioni_globali) + trasporto + posa - sconto%
 */
export function calculateSectionPrice(input: SectionPriceInput): number {
  const { manual_total_override } = input

  // Se c'è un totale manuale, usalo
  if (manual_total_override !== null && manual_total_override !== undefined) {
    return round2(manual_total_override)
  }

  // Altrimenti calcolo automatico
  const { righe, global_option_adjustments, trasporto, posa, sconto_percentuale } = input

  const totale_righe = righe.reduce((sum, r) => sum + r.subtotale, 0)

  // Maggiorazioni globali della sezione
  // For global options, we apply them based on their price_mode:
  // - 'fixed' and 'per_unit': add the adjustment directly
  // - 'percentage': apply as percentage of totale_righe
  // - 'per_sqm': not typically used for global options, but treat as fixed
  const totale_maggiorazioni_globali = global_option_adjustments.reduce(
    (sum, adj) => {
      switch (adj.price_mode) {
        case 'percentage':
          return sum + (totale_righe * (adj.price_adjustment / 100))
        case 'fixed':
        case 'per_unit':
        case 'per_sqm':
        default:
          return sum + adj.price_adjustment
      }
    },
    0
  )

  const subtotale_lordo = totale_righe + totale_maggiorazioni_globali + trasporto + posa
  const sconto = subtotale_lordo * (sconto_percentuale / 100)

  return round2(subtotale_lordo - sconto)
}

/**
 * Calcola i totali finali del preventivo
 *
 * totale_imponibile = SUM(subtotali_sezioni) + SUM(totali_servizi)
 * scontato = imponibile * (1 - sconto1%) * (1 - sconto2%)
 * iva = scontato * aliquota%
 * totale = scontato + iva
 *
 * IVA combinata (beni significativi, D.P.R. 633/72):
 * - eccedenza = max(0, beni_significativi - (scontato - beni_significativi))
 * - base_piena = eccedenza  → tassata a rate_secondary (es. 22%)
 * - base_ridotta = scontato - eccedenza → tassata a aliquota_iva_percentuale (es. 10%)
 */
export function calculateQuoteTotal(input: QuotePriceInput): QuoteTotals {
  const {
    sezioni, servizi = [], aliquota_iva_percentuale, sconto_globale_1, sconto_globale_2,
    is_combined = false, rate_secondary, importo_beni_significativi = 0,
  } = input

  const totale_sezioni = sezioni.reduce((sum, s) => sum + s.subtotale_sezione, 0)
  const totale_servizi = servizi.reduce((sum, s) => sum + (s.quantity * s.unit_price), 0)

  const totale_imponibile = round2(totale_sezioni + totale_servizi)

  const fattore_sconto_1 = 1 - (sconto_globale_1 / 100)
  const fattore_sconto_2 = 1 - (sconto_globale_2 / 100)
  const totale_imponibile_scontato = round2(totale_imponibile * fattore_sconto_1 * fattore_sconto_2)

  if (is_combined && rate_secondary != null && importo_beni_significativi > 0) {
    // Formula beni significativi
    const beni = Math.min(importo_beni_significativi, totale_imponibile_scontato)
    const altri = totale_imponibile_scontato - beni
    const eccedenza = round2(Math.max(0, beni - altri))
    const base_piena = eccedenza
    const base_ridotta = round2(totale_imponibile_scontato - base_piena)
    const iva_piena = round2(base_piena * (rate_secondary / 100))
    const iva_ridotta = round2(base_ridotta * (aliquota_iva_percentuale / 100))
    const totale_iva = round2(iva_ridotta + iva_piena)
    const totale_preventivo = round2(totale_imponibile_scontato + totale_iva)
    return {
      totale_imponibile,
      totale_imponibile_scontato,
      totale_iva,
      totale_preventivo,
      iva_ridotta,
      iva_piena,
      base_ridotta,
      base_piena,
    }
  }

  const totale_iva = round2(totale_imponibile_scontato * (aliquota_iva_percentuale / 100))
  const totale_preventivo = round2(totale_imponibile_scontato + totale_iva)

  return {
    totale_imponibile,
    totale_imponibile_scontato,
    totale_iva,
    totale_preventivo,
  }
}

/**
 * Arrotonda a 2 decimali
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

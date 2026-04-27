'use client'

import { useState } from 'react'
import type { CategoryOption, CategoryOptionValue } from '@/types/database'
import type { QuotePositionState } from '@/lib/hooks/useQuoteForm'
import OptionGroupPanel from '@/components/options/OptionGroupPanel'
import styles from './PositionRow.module.css'

interface PositionRowProps {
  position: QuotePositionState
  index: number
  options: CategoryOption[]
  values: CategoryOptionValue[]
  prodotti: Array<{ id: string; nome: string; prezzo_listino: number }>
  onRemove: () => void
  onUpdateField: (field: string, value: string | number | boolean | null) => void
  onSetOption: (optionKey: string, value: string | string[] | boolean | null) => void
  canRemove: boolean
  categorySlug?: string
}

export default function PositionRow({
  position,
  index,
  options,
  values,
  prodotti,
  onRemove,
  onUpdateField,
  onSetOption,
  canRemove,
  categorySlug,
}: PositionRowProps) {
  const [showOptions, setShowOptions] = useState(false)

  // Zanzariere: hide dimensions (misure rilevate)
  // Blindato PASSATA: hide dimensions, show manual price
  const isBlindato = categorySlug === 'blindato' || categorySlug === 'blindati_portoncini'
  const isZanzariere = categorySlug === 'zanzariere' || categorySlug === 'zanzariere_tende'
  const isPassata = isBlindato && position.positionOptions?.['passata'] === true
  const hideDimensions = isZanzariere || isPassata
  // Porte / Porte Interne: mostra campo descrizione manuale
  const isPorte = categorySlug === 'porte' || categorySlug === 'porte_interne'

  const handleProductChange = (prodottoId: string) => {
    const prodotto = prodotti.find(p => p.id === prodottoId)
    onUpdateField('prodotto_id', prodottoId)
    onUpdateField('prodotto_nome', prodotto?.nome || '')
    onUpdateField('prezzo_unitario', prodotto?.prezzo_listino || 0)
  }

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount)

  return (
    <div className={styles.positionCard}>
      <div className={styles.positionHeader}>
        <span className={styles.positionNumber}>#{index + 1}</span>
        <div className={styles.fieldRow}>
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">Prodotto</label>
            <select
              className="form-input"
              value={position.prodotto_id}
              onChange={(e) => handleProductChange(e.target.value)}
            >
              <option value="">Seleziona prodotto...</option>
              {prodotti.map(p => (
                <option key={p.id} value={p.id}>{p.nome} ({formatPrice(p.prezzo_listino)})</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 0.5 }}>
            <label className="form-label">Qt.</label>
            <input
              type="number"
              className="form-input"
              value={position.quantita}
              onChange={(e) => onUpdateField('quantita', parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>
          {!hideDimensions && (
            <>
              <div className="form-group" style={{ flex: 0.7 }}>
                <label className="form-label">L (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={position.larghezza_mm || ''}
                  onChange={(e) => onUpdateField('larghezza_mm', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <div className="form-group" style={{ flex: 0.7 }}>
                <label className="form-label">H (mm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={position.altezza_mm || ''}
                  onChange={(e) => onUpdateField('altezza_mm', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </>
          )}
          {isPassata && (
            <div className="form-group" style={{ flex: 0.7 }}>
              <label className="form-label">Prezzo</label>
              <input
                type="number"
                className="form-input"
                value={position.manual_price_override ?? ''}
                onChange={(e) => onUpdateField('manual_price_override', e.target.value ? parseFloat(e.target.value) : null)}
                step="0.01"
                min={0}
                placeholder="Inserisci prezzo..."
              />
            </div>
          )}
        </div>
        {isPorte && (
          <div className={styles.fieldRow} style={{ marginTop: '0.8rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Descrizione</label>
              <textarea
                className="form-input"
                value={position.descrizione || ''}
                onChange={(e) => onUpdateField('descrizione', e.target.value)}
                placeholder="Descrizione manuale del prodotto..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        )}
        {canRemove && (
          <button type="button" onClick={onRemove} className="btn btn-outline btn-sm" style={{ color: 'var(--color-error)', alignSelf: 'flex-start', marginTop: '1.5rem' }}>
            ✕
          </button>
        )}
      </div>

      {options.length > 0 && (
        <>
          <button
            type="button"
            className={styles.optionsToggle}
            onClick={() => setShowOptions(!showOptions)}
          >
            {showOptions ? '▼ Nascondi opzioni' : '▶ Mostra opzioni'}
          </button>
          {showOptions && (
            <OptionGroupPanel
              options={options}
              values={values}
              selections={position.positionOptions}
              onSelectionChange={onSetOption}
              title="Opzioni Posizione"
            />
          )}
        </>
      )}

      <div className={styles.positionFooter}>
        <span>Subtotale: <strong>{formatPrice(position.subtotale_calcolato)}</strong></span>
      </div>
    </div>
  )
}

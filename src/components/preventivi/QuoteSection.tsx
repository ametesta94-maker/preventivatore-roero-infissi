'use client'

import { useState } from 'react'
import type { CategoryOption, CategoryOptionValue } from '@/types/database'
import type { QuoteSectionState } from '@/lib/hooks/useQuoteForm'
import OptionGroupPanel from '@/components/options/OptionGroupPanel'
import PositionRow from './PositionRow'
import SectionTotals from './SectionTotals'
import styles from './QuoteSection.module.css'

interface QuoteSectionProps {
  section: QuoteSectionState
  globalOptions: CategoryOption[]
  globalValues: CategoryOptionValue[]
  positionOptions: CategoryOption[]
  positionValues: CategoryOptionValue[]
  prodotti: Array<{ id: string; nome: string; prezzo_listino: number }>
  onRemove: () => void
  onSetGlobalOption: (optionKey: string, value: string | string[] | boolean | null) => void
  onSetSectionField: (field: 'trasporto' | 'posa' | 'sconto_percentuale' | 'note_sezione' | 'show_line_prices' | 'manual_total_override' | 'notes' | 'free_description', value: number | string | boolean | null) => void
  onAddPosition: () => void
  onRemovePosition: (positionTempId: string) => void
  onUpdatePosition: (positionTempId: string, field: string, value: string | number | boolean | null) => void
  onSetPositionOption: (positionTempId: string, optionKey: string, value: string | string[] | boolean | null) => void
}

export default function QuoteSection({
  section,
  globalOptions,
  globalValues,
  positionOptions,
  positionValues,
  prodotti,
  onRemove,
  onSetGlobalOption,
  onSetSectionField,
  onAddPosition,
  onRemovePosition,
  onUpdatePosition,
  onSetPositionOption,
}: QuoteSectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} onClick={() => setCollapsed(!collapsed)}>
        <div className={styles.sectionTitle}>
          <span style={{ cursor: 'pointer' }}>{collapsed ? '▶' : '▼'}</span>
          <h3>{section.category.icona} {section.category.nome}</h3>
          {!section.show_line_prices && (
            <span className={styles.badge} style={{ marginLeft: '8px', fontSize: '12px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px' }}>
              Prezzi nascosti
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={section.show_line_prices}
              onChange={(e) => onSetSectionField('show_line_prices', e.target.checked)}
            />
            <span>Mostra prezzi posizioni</span>
          </label>
          <button type="button" className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); onRemove() }} style={{ color: 'var(--color-error)' }}>
            Rimuovi sezione
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className={styles.sectionBody}>
          {globalOptions.length > 0 && (
            <OptionGroupPanel
              options={globalOptions}
              values={globalValues}
              selections={section.globalOptions}
              onSelectionChange={onSetGlobalOption}
              title="Opzioni Globali"
            />
          )}

          {/* Descrizione libera sezione */}
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f9fa', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
              Descrizione libera sezione
            </label>
            <textarea
              className="form-input"
              value={section.free_description || ''}
              onChange={(e) => onSetSectionField('free_description', e.target.value)}
              placeholder="Descrizione personalizzata per questa sezione..."
              rows={4}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div className={styles.positionsList}>
            {section.positions.map((position, idx) => (
              <PositionRow
                key={position.tempId}
                position={position}
                index={idx}
                options={positionOptions}
                values={positionValues}
                prodotti={prodotti}
                onRemove={() => onRemovePosition(position.tempId)}
                onUpdateField={(field, value) => onUpdatePosition(position.tempId, field, value)}
                onSetOption={(optionKey, value) => onSetPositionOption(position.tempId, optionKey, value)}
                canRemove={section.positions.length > 1}
                categorySlug={section.category.slug}
              />
            ))}
            <button
              type="button"
              className={`btn btn-outline btn-sm ${styles.addPositionBtn}`}
              onClick={onAddPosition}
            >
              + Aggiungi riga
            </button>
          </div>

          <SectionTotals
            section={section}
            onFieldChange={onSetSectionField}
          />

          {/* Note sezione */}
          <div style={{ marginTop: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
              Note sezione (differenze, alternative, ecc.)
            </label>
            <textarea
              className="form-input"
              value={section.notes || ''}
              onChange={(e) => onSetSectionField('notes', e.target.value)}
              placeholder="Es. Differenza per motorizzazione: +€ 300"
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import type { QuoteSectionState } from '@/lib/hooks/useQuoteForm'
import styles from './SectionTotals.module.css'

interface SectionTotalsProps {
  section: QuoteSectionState
  onFieldChange: (field: 'trasporto' | 'posa' | 'sconto_percentuale' | 'note_sezione' | 'show_line_prices' | 'manual_total_override' | 'notes' | 'free_description', value: number | string | boolean | null) => void
}

export default function SectionTotals({ section, onFieldChange }: SectionTotalsProps) {
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount)

  return (
    <div className={styles.totalsContainer}>
      <div className={styles.totalsGrid}>
        <div className="form-group">
          <label className="form-label">Trasporto (EUR)</label>
          <input
            type="number"
            className="form-input"
            value={section.trasporto}
            onChange={(e) => onFieldChange('trasporto', parseFloat(e.target.value) || 0)}
            min={0}
            step={0.01}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Posa (EUR)</label>
          <input
            type="number"
            className="form-input"
            value={section.posa}
            onChange={(e) => onFieldChange('posa', parseFloat(e.target.value) || 0)}
            min={0}
            step={0.01}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Sconto (%)</label>
          <input
            type="number"
            className="form-input"
            value={section.sconto_percentuale}
            onChange={(e) => onFieldChange('sconto_percentuale', parseFloat(e.target.value) || 0)}
            min={0}
            max={100}
            step={0.5}
          />
        </div>
        <div className="form-group">
          <label className="form-label">
            Totale manuale 
            <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>(opzionale)</span>
          </label>
          <input
            type="number"
            className="form-input"
            value={section.manual_total_override || ''}
            onChange={(e) => onFieldChange('manual_total_override', e.target.value ? parseFloat(e.target.value) : null)}
            min={0}
            step={0.01}
            placeholder="Lascia vuoto per calcolo automatico"
            style={section.manual_total_override ? { background: '#fff3cd', borderColor: '#ffc107' } : {}}
          />
        </div>
        <div className={styles.subtotaleDisplay}>
          <span>
            Subtotale Sezione:
            {section.manual_total_override && <span style={{ fontSize: '12px', color: '#856404', marginLeft: '4px' }}>✏️ Manuale</span>}
          </span>
          <strong>{formatPrice(section.manual_total_override || section.subtotale_sezione)}</strong>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PaymentMethod } from '@/types/database'
import styles from './QuoteTotals.module.css'

interface QuoteTotalsProps {
  totale_imponibile: number
  totale_imponibile_scontato: number
  totale_iva: number
  totale_preventivo: number
  sconto_globale_1: number
  sconto_globale_2: number
  onScontoChange: (field: 'sconto_globale_1' | 'sconto_globale_2', value: number) => void
  aliquota_label: string
  show_iva: boolean
  show_grand_total: boolean
  payment_method_id: string
  payment_notes: string
  onToggleIVA: (value: boolean) => void
  onToggleGrandTotal: (value: boolean) => void
  onPaymentMethodChange: (value: string) => void
  onPaymentNotesChange: (value: string) => void
  // IVA combinata
  is_combined?: boolean
  rate_secondary?: number | null
  importo_beni_significativi?: number
  onImportoBeniChange?: (value: number) => void
  iva_ridotta?: number
  iva_piena?: number
  base_ridotta?: number
  base_piena?: number
}

export default function QuoteTotals({
  totale_imponibile,
  totale_imponibile_scontato,
  totale_iva,
  totale_preventivo,
  sconto_globale_1,
  sconto_globale_2,
  onScontoChange,
  aliquota_label,
  show_iva,
  show_grand_total,
  payment_method_id,
  payment_notes,
  onToggleIVA,
  onToggleGrandTotal,
  onPaymentMethodChange,
  onPaymentNotesChange,
  is_combined = false,
  rate_secondary,
  importo_beni_significativi = 0,
  onImportoBeniChange,
  iva_ridotta,
  iva_piena,
  base_ridotta,
  base_piena,
}: QuoteTotalsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPaymentMethods = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (!error && data) {
        setPaymentMethods(data)
      }
      setLoading(false)
    }

    loadPaymentMethods()
  }, [])

  const fmt = (n: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === payment_method_id)
  const isCustomPayment = selectedPaymentMethod?.name === 'Accordo personalizzato'

  const showCombined = is_combined && rate_secondary != null && iva_ridotta != null && iva_piena != null

  return (
    <div className={styles.totalsCard}>
      <h3>Riepilogo</h3>

      {/* Controlli Toggle */}
      <div className={styles.togglesRow}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={show_iva}
            onChange={(e) => onToggleIVA(e.target.checked)}
          />
          <span>Mostra IVA</span>
        </label>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={show_grand_total}
            onChange={(e) => onToggleGrandTotal(e.target.checked)}
          />
          <span>Mostra totale generale</span>
        </label>
      </div>

      {/* Modalità di Pagamento */}
      <div className={styles.paymentSection}>
        <label className="form-label">Modalità di Pagamento</label>
        {loading ? (
          <p style={{ fontSize: '14px', color: '#666' }}>Caricamento...</p>
        ) : (
          <>
            <select
              className="form-input"
              value={payment_method_id}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
            >
              <option value="">Seleziona modalità...</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name}
                </option>
              ))}
            </select>

            {isCustomPayment && (
              <textarea
                className="form-input"
                value={payment_notes}
                onChange={(e) => onPaymentNotesChange(e.target.value)}
                placeholder="Specifica l'accordo personalizzato..."
                rows={3}
                style={{ marginTop: '8px' }}
              />
            )}

            {selectedPaymentMethod && selectedPaymentMethod.description && !isCustomPayment && (
              <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                {selectedPaymentMethod.description}
              </p>
            )}
          </>
        )}
      </div>

      {/* Totali */}
      {show_grand_total && (
        <>
          <div className={styles.totalsRows}>
            <div className={styles.totalsRow}>
              <span>Totale Imponibile:</span>
              <span>{fmt(totale_imponibile)}</span>
            </div>
            <div className={styles.scontiRow}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Sconto 1 (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={sconto_globale_1}
                  onChange={(e) => onScontoChange('sconto_globale_1', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  step={0.5}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Sconto 2 (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={sconto_globale_2}
                  onChange={(e) => onScontoChange('sconto_globale_2', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  step={0.5}
                />
              </div>
            </div>
            {(sconto_globale_1 > 0 || sconto_globale_2 > 0) && (
              <div className={styles.totalsRow}>
                <span>Imponibile Scontato:</span>
                <span>{fmt(totale_imponibile_scontato)}</span>
              </div>
            )}

            {/* IVA combinata: input beni significativi */}
            {is_combined && show_iva && (
              <div className={styles.totalsRow} style={{ alignItems: 'center', gap: '8px' }}>
                <span style={{ flex: 1 }}>Beni significativi (€):</span>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '140px', textAlign: 'right' }}
                  value={importo_beni_significativi}
                  onChange={(e) => onImportoBeniChange?.(parseFloat(e.target.value) || 0)}
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                />
              </div>
            )}

            {show_iva && (
              showCombined ? (
                <>
                  <div className={styles.totalsRow}>
                    <span>{aliquota_label} (su {fmt(base_ridotta ?? 0)}):</span>
                    <span>{fmt(iva_ridotta ?? 0)}</span>
                  </div>
                  <div className={styles.totalsRow}>
                    <span>IVA {rate_secondary}% (su {fmt(base_piena ?? 0)}):</span>
                    <span>{fmt(iva_piena ?? 0)}</span>
                  </div>
                </>
              ) : (
                <div className={styles.totalsRow}>
                  <span>{aliquota_label}:</span>
                  <span>{fmt(totale_iva)}</span>
                </div>
              )
            )}
            <div className={`${styles.totalsRow} ${styles.totaleFinal}`}>
              <span>TOTALE PREVENTIVO:</span>
              <strong>{fmt(totale_preventivo)}</strong>
            </div>
          </div>
        </>
      )}

      {!show_grand_total && (
        <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginTop: '16px' }}>
          Totale generale nascosto (utile per preventivi con alternative)
        </p>
      )}
    </div>
  )
}

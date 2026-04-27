'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ConvertToOrderModal.module.css'

interface ConvertToOrderModalProps {
    quoteId: string
    quoteNumber: string
    onClose: () => void
}

const DEDUCTION_OPTIONS = [
    { value: 'nessuna', label: 'Nessuna detrazione' },
    { value: 'ecobonus', label: 'Ecobonus' },
    { value: 'bonus_casa', label: 'Bonus Casa' },
    { value: 'bonus_sicurezza', label: 'Bonus Sicurezza' },
]

export default function ConvertToOrderModal({ quoteId, quoteNumber, onClose }: ConvertToOrderModalProps) {
    const router = useRouter()
    const [deductionType, setDeductionType] = useState('nessuna')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/ordini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quote_id: quoteId,
                    deduction_type: deductionType,
                    notes: notes || null,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Errore nella creazione dell\'ordine')
            }

            const data = await res.json()
            router.push(`/ordini/${data.order.id}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Trasforma in Ordine</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <p className={styles.description}>
                            Stai convertendo il preventivo <strong>{quoteNumber}</strong> in un ordine.
                            Questa azione aggiornerà lo stato del preventivo.
                        </p>

                        {error && (
                            <div className={styles.errorBox}>{error}</div>
                        )}

                        <div className={styles.field}>
                            <label className={styles.label}>Tipo Detrazione Fiscale</label>
                            <div className={styles.radioGroup}>
                                {DEDUCTION_OPTIONS.map((opt) => (
                                    <label key={opt.value} className={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="deduction_type"
                                            value={opt.value}
                                            checked={deductionType === opt.value}
                                            onChange={() => setDeductionType(opt.value)}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Note (opzionale)</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Note aggiuntive per l'ordine..."
                            />
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.btnCancel} onClick={onClose} disabled={loading}>
                            Annulla
                        </button>
                        <button type="submit" className={styles.btnConfirm} disabled={loading}>
                            {loading ? 'Creazione...' : 'Conferma Ordine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

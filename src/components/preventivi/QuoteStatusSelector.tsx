'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import styles from '@/app/(app)/preventivi/page.module.css'

interface QuoteStatusSelectorProps {
    quoteId: string
    currentStatus: string
}

const statoLabels: Record<string, { label: string; className: string }> = {
    bozza: { label: 'Bozza', className: styles.badgeBozza },
    inviato: { label: 'Inviato', className: styles.badgeInviato },
    accettato: { label: 'Accettato', className: styles.badgeAccettato },
    rifiutato: { label: 'Rifiutato', className: styles.badgeRifiutato },
    scaduto: { label: 'Scaduto', className: styles.badgeScaduto },
    convertito_ordine: { label: 'Ordinato', className: styles.badgeOrdinato },
}

export default function QuoteStatusSelector({ quoteId, currentStatus }: QuoteStatusSelectorProps) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status) return

        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('preventivi')
                .update({ stato: newStatus })
                .eq('id', quoteId)

            if (error) throw error

            setStatus(newStatus)
            router.refresh()
        } catch (err) {
            console.error('Error updating status:', err)
            // Revert state visuale in caso di errore
            setStatus(currentStatus)
        } finally {
            setLoading(false)
        }
    }

    // Se è "convertito_ordine", mostriamo un badge fisso, non si può più cambiare stato
    if (currentStatus === 'convertito_ordine') {
        return (
            <span className={`${styles.badge} ${statoLabels.convertito_ordine.className}`}>
                {statoLabels.convertito_ordine.label}
            </span>
        )
    }

    return (
        <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className={`${styles.badge} ${statoLabels[status]?.className || styles.badgeBozza}`}
            style={{
                cursor: loading ? 'wait' : 'pointer',
                border: 'none',
                outline: 'none',
                appearance: 'auto', // Mostra la freccetta
                paddingRight: '20px'
            }}
        >
            <option value="bozza">Bozza</option>
            <option value="inviato">Inviato</option>
            <option value="accettato">Accettato</option>
            <option value="rifiutato">Rifiutato</option>
            <option value="scaduto">Scaduto</option>
        </select>
    )
}

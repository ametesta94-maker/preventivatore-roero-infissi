'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
    { value: 'confermato', label: 'Confermato' },
    { value: 'in_lavorazione', label: 'In Lavorazione' },
    { value: 'completato', label: 'Completato' },
    { value: 'annullato', label: 'Annullato' },
]

interface OrderStatusSelectorProps {
    orderId: string
    currentStatus: string
    quoteId: string
}

export default function OrderStatusSelector({ orderId, currentStatus, quoteId }: OrderStatusSelectorProps) {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleChange = async (newStatus: string) => {
        if (newStatus === status) return
        setLoading(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)
            if (error) throw error
            setStatus(newStatus)

            // If annullato, also restore quote to accettato
            if (newStatus === 'annullato') {
                await supabase
                    .from('preventivi')
                    .update({ stato: 'accettato' })
                    .eq('id', quoteId)
            }

            router.refresh()
        } catch (err) {
            console.error('Error updating order status:', err)
            setStatus(currentStatus)
        } finally {
            setLoading(false)
        }
    }

    return (
        <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            disabled={loading}
            style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: '#fff',
            }}
        >
            {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )
}

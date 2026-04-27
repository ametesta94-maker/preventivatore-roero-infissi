'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RevertOrderButtonProps {
    orderId: string
    orderStatus: string
    quoteId: string
}

export default function RevertOrderButton({ orderId, orderStatus, quoteId }: RevertOrderButtonProps) {
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const router = useRouter()

    // Don't show if already annullato
    if (orderStatus === 'annullato') return null

    const handleRevert = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/ordini', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, action: 'revert_to_quote' }),
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Errore durante il ripristino')
            } else {
                router.push(`/preventivi/${quoteId}/modifica`)
            }
        } catch {
            alert('Errore di rete')
        } finally {
            setLoading(false)
            setShowConfirm(false)
        }
    }

    if (showConfirm) {
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
            }}>
                <span style={{ fontSize: '13px', color: '#991b1b' }}>
                    Annullare l&apos;ordine e riportare a preventivo?
                </span>
                <button
                    onClick={handleRevert}
                    disabled={loading}
                    style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'white',
                        backgroundColor: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? 'Annullamento...' : 'Conferma'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#6b7280',
                        backgroundColor: 'transparent',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                    }}
                >
                    Annulla
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            style={{
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#dc2626',
                backgroundColor: 'transparent',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
            }}
        >
            ↩ Riporta a Preventivo
        </button>
    )
}

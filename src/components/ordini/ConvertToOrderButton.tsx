'use client'

import { useState } from 'react'
import ConvertToOrderModal from '@/components/ordini/ConvertToOrderModal'

interface ConvertToOrderButtonProps {
    quoteId: string
    quoteNumber: string
    quoteStatus: string
}

export default function ConvertToOrderButton({ quoteId, quoteNumber, quoteStatus }: ConvertToOrderButtonProps) {
    const [showModal, setShowModal] = useState(false)

    // Don't show button if already converted
    if (quoteStatus === 'convertito_ordine') {
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#ede9fe',
                color: '#7c3aed',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '8px',
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Convertito in Ordine
            </span>
        )
    }

    // Only show for accepted quotes
    if (quoteStatus !== 'accettato') {
        return null
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-secondary)',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-secondary-dark)')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-secondary)')}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                Trasforma in Ordine
            </button>

            {showModal && (
                <ConvertToOrderModal
                    quoteId={quoteId}
                    quoteNumber={quoteNumber}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    )
}

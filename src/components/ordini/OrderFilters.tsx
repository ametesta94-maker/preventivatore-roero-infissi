'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const DEDUCTION_OPTIONS = [
    { value: '', label: 'Tutte le detrazioni' },
    { value: 'nessuna', label: 'Nessuna' },
    { value: 'ecobonus', label: 'Ecobonus' },
    { value: 'bonus_casa', label: 'Bonus Casa' },
    { value: 'bonus_sicurezza', label: 'Bonus Sicurezza' },
]

export default function OrderFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [q, setQ] = useState(searchParams.get('q') || '')
    const [from, setFrom] = useState(searchParams.get('from') || '')
    const [to, setTo] = useState(searchParams.get('to') || '')

    const pushParams = (overrides: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())
        const vals = { q, from, to, ...overrides }
        vals.q ? params.set('q', vals.q) : params.delete('q')
        vals.from ? params.set('from', vals.from) : params.delete('from')
        vals.to ? params.set('to', vals.to) : params.delete('to')
        router.push(`/ordini?${params.toString()}`)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        pushParams({})
    }

    const handleStatusFilter = (status: string) => {
        const params = new URLSearchParams(searchParams.toString())
        status ? params.set('status', status) : params.delete('status')
        router.push(`/ordini?${params.toString()}`)
    }

    const handleDeductionFilter = (deduction: string) => {
        const params = new URLSearchParams(searchParams.toString())
        deduction ? params.set('deduction', deduction) : params.delete('deduction')
        router.push(`/ordini?${params.toString()}`)
    }

    const handleDateChange = (field: 'from' | 'to', value: string) => {
        if (field === 'from') setFrom(value)
        else setTo(value)
        pushParams({ [field]: value })
    }

    const currentStatus = searchParams.get('status') || ''
    const currentDeduction = searchParams.get('deduction') || ''

    return (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Ricerca per numero */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Cerca per numero ordine..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        width: '220px',
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'var(--color-secondary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        cursor: 'pointer',
                    }}
                >
                    Cerca
                </button>
            </form>

            {/* Filtro status */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {[
                    { value: '', label: 'Tutti' },
                    { value: 'confermato', label: 'Confermati' },
                    { value: 'in_lavorazione', label: 'In Lavorazione' },
                    { value: 'completato', label: 'Completati' },
                ].map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => handleStatusFilter(opt.value)}
                        style={{
                            padding: '6px 14px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-xs)',
                            cursor: 'pointer',
                            backgroundColor: currentStatus === opt.value ? 'var(--color-secondary)' : 'var(--color-surface)',
                            color: currentStatus === opt.value ? 'white' : 'var(--color-text)',
                            fontWeight: currentStatus === opt.value ? '600' : '400',
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Filtro detrazione */}
            <select
                value={currentDeduction}
                onChange={(e) => handleDeductionFilter(e.target.value)}
                style={{
                    padding: '7px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    backgroundColor: 'var(--color-surface)',
                    cursor: 'pointer',
                }}
            >
                {DEDUCTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            {/* Filtro data */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>Dal</span>
                <input
                    type="date"
                    value={from}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                    }}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>al</span>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                    }}
                />
            </div>
        </div>
    )
}

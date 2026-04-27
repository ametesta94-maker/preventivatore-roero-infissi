'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Search, X } from 'lucide-react'
import styles from './PreventivoFilters.module.css'

export default function PreventivoFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        router.replace(`/preventivi?${params.toString()}`)
    }, 300)

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams)
        if (status) {
            params.set('status', status)
        } else {
            params.delete('status')
        }
        router.replace(`/preventivi?${params.toString()}`)
    }

    const handleDateChange = (type: 'from' | 'to', date: string) => {
        const params = new URLSearchParams(searchParams)
        if (date) {
            params.set(type, date)
        } else {
            params.delete(type)
        }
        router.replace(`/preventivi?${params.toString()}`)
    }

    const clearFilters = () => {
        router.replace('/preventivi')
    }

    const hasFilters = searchParams.get('q') || searchParams.get('status') || searchParams.get('from') || searchParams.get('to')

    return (
        <div className={styles.filtersContainer}>
            {/* Search */}
            <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={18} />
                <input
                    type="text"
                    placeholder="Cerca numero o cliente..."
                    defaultValue={searchParams.get('q') || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Status Filter */}
            <div className={styles.selectWrapper}>
                <select
                    className={styles.select}
                    value={searchParams.get('status') || ''}
                    onChange={(e) => handleStatusChange(e.target.value)}
                >
                    <option value="">Tutti gli stati</option>
                    <option value="bozza">Bozza</option>
                    <option value="inviato">Inviato</option>
                    <option value="accettato">Accettato</option>
                    <option value="rifiutato">Rifiutato</option>
                    <option value="scaduto">Scaduto</option>
                    <option value="convertito_ordine">Ordinato</option>
                </select>
            </div>

            {/* Date Filters */}
            <div className={styles.dateWrapper}>
                <input
                    type="date"
                    className={styles.dateInput}
                    placeholder="gg/mm/aaaa"
                    defaultValue={searchParams.get('from') || ''}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                />
                <span className={styles.dateSeparator}>-</span>
                <input
                    type="date"
                    className={styles.dateInput}
                    placeholder="gg/mm/aaaa"
                    defaultValue={searchParams.get('to') || ''}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                />
            </div>

            {/* Clear Button */}
            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className={styles.clearBtn}
                    title="Rimuovi filtri"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    )
}

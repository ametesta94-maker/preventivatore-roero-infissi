import { createAdminClient as createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'
import styles from './page.module.css'
import OrderFilters from '@/components/ordini/OrderFilters'

const STATUS_LABELS: Record<string, string> = {
    confermato: 'Confermato',
    in_lavorazione: 'In Lavorazione',
    completato: 'Completato',
}

const DEDUCTION_LABELS: Record<string, string> = {
    ecobonus: 'Ecobonus',
    bonus_casa: 'Bonus Casa',
    bonus_sicurezza: 'Bonus Sicurezza',
    nessuna: 'Nessuna',
    // Legacy support
    ecobonus_50: 'Ecobonus',
    bonus_casa_36: 'Bonus Casa',
}

function statusBadgeClass(status: string) {
    switch (status) {
        case 'confermato': return styles.badgeConfermato
        case 'in_lavorazione': return styles.badgeInLavorazione
        case 'completato': return styles.badgeCompletato
        default: return ''
    }
}

export default async function OrdiniPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; status?: string; deduction?: string; from?: string; to?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()

    let query = supabase
        .from('orders')
        .select(`
            *,
            preventivi (
                numero,
                clienti (
                    ragione_sociale
                )
            )
        `)
        .order('created_at', { ascending: false })

    if (params.status) {
        query = query.eq('status', params.status)
    }

    if (params.deduction) {
        // Match both new and legacy deduction values
        const legacyMap: Record<string, string> = {
            ecobonus: 'ecobonus_50',
            bonus_casa: 'bonus_casa_36',
        }
        const legacy = legacyMap[params.deduction]
        if (legacy) {
            query = query.in('deduction_type', [params.deduction, legacy])
        } else {
            query = query.eq('deduction_type', params.deduction)
        }
    }

    if (params.from) {
        query = query.gte('order_date', params.from)
    }

    if (params.to) {
        query = query.lte('order_date', params.to)
    }

    if (params.q) {
        query = query.ilike('order_number', `%${params.q}%`)
    }

    const { data: orders, error } = await query

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Ordini</h1>
                    <p className={styles.subtitle}>
                        Gestione ordini confermati
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <span className={styles.brandLabel}>
                        {orders?.length || 0} ordini
                    </span>
                </div>
            </div>

            <Suspense fallback={null}>
                <OrderFilters />
            </Suspense>

            <div className={styles.tableCard}>
                {error ? (
                    <div className={styles.emptyState}>
                        <p>Errore nel caricamento degli ordini.</p>
                    </div>
                ) : !orders || orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Nessun ordine trovato</p>
                        <p style={{ fontSize: '14px' }}>
                            Gli ordini verranno creati convertendo i preventivi accettati.
                        </p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>N. Ordine</th>
                                    <th>N. Preventivo</th>
                                    <th>Cliente</th>
                                    <th>Data</th>
                                    <th>Detrazione</th>
                                    <th>Stato</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td className={styles.cellStrong}>
                                            {order.order_number}
                                        </td>
                                        <td>
                                            <Link
                                                href={`/preventivi/${order.quote_id}`}
                                                style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}
                                            >
                                                {order.preventivi?.numero || '-'}
                                            </Link>
                                        </td>
                                        <td>
                                            {(order.preventivi as any)?.clienti?.ragione_sociale || '-'}
                                        </td>
                                        <td>
                                            {new Date(order.order_date).toLocaleDateString('it-IT')}
                                        </td>
                                        <td>
                                            <span className={styles.deductionBadge}>
                                                {DEDUCTION_LABELS[order.deduction_type] || order.deduction_type || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${statusBadgeClass(order.status)}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link
                                                    href={`/ordini/${order.id}`}
                                                    className={styles.btnAction}
                                                    title="Dettaglio"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

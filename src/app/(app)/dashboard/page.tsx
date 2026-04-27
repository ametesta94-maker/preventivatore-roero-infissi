import Link from 'next/link'
import { createAdminClient as createClient } from '@/lib/supabase/server'
import styles from './page.module.css'
import RevenueChart from '@/components/dashboard/RevenueChart'
import { format, subMonths, startOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'

export const metadata = {
    title: 'Dashboard',
}

export default async function DashboardPage() {
    const supabase = await createClient()

    // Date range for chart (last 12 months)
    const startDate = startOfMonth(subMonths(new Date(), 11)).toISOString()

    // Fetch statistics and chart data
    const [
        { count: totalClienti },
        { count: totalProdotti },
        { count: totalPreventivi },
        { data: recentPreventivi },
        { data: chartRawData }
    ] = await Promise.all([
        supabase.from('clienti').select('*', { count: 'exact', head: true }).eq('attivo', true),
        supabase.from('prodotti').select('*', { count: 'exact', head: true }).eq('attivo', true),
        supabase.from('preventivi').select('*', { count: 'exact', head: true }),
        supabase
            .from('preventivi')
            .select(`
        id,
        numero,
        data_preventivo,
        totale_preventivo,
        stato,
        clienti (ragione_sociale)
      `)
            .order('created_at', { ascending: false })
            .limit(5),
        supabase
            .from('preventivi')
            .select('data_preventivo, totale_preventivo')
            .gte('data_preventivo', startDate)
            .order('data_preventivo', { ascending: true })
    ])

    // Aggregate chart data by month
    const monthlyDataMap = new Map<string, { revenue: number; count: number }>()

    // Initialize last 12 months with 0
    for (let i = 11; i >= 0; i--) {
        const d = subMonths(new Date(), i)
        const key = format(d, 'MMM yyyy', { locale: it })
        monthlyDataMap.set(key, { revenue: 0, count: 0 })
    }

    if (chartRawData) {
        chartRawData.forEach(p => {
            const date = new Date(p.data_preventivo)
            const key = format(date, 'MMM yyyy', { locale: it })
            const current = monthlyDataMap.get(key) || { revenue: 0, count: 0 }
            monthlyDataMap.set(key, {
                revenue: current.revenue + (p.totale_preventivo || 0),
                count: current.count + 1
            })
        })
    }

    const chartData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        count: data.count
    }))

    const statoLabels: Record<string, { label: string; className: string }> = {
        bozza: { label: 'Bozza', className: 'badge-bozza' },
        inviato: { label: 'Inviato', className: 'badge-inviato' },
        accettato: { label: 'Accettato', className: 'badge-accettato' },
        rifiutato: { label: 'Rifiutato', className: 'badge-rifiutato' },
        scaduto: { label: 'Scaduto', className: 'badge-warning' },
        convertito_ordine: { label: 'Ordinato', className: 'badge-ordinato' },
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Dashboard</h1>
                    <p className={styles.subtitle}>Benvenuto nel sistema preventivatore.</p>
                </div>
            </div>

            {/* Stats Cards - KPI */}
            <div className={styles.statsGrid}>
                <div className="kpi-card">
                    <div className="kpi-icon kpi-icon-blue">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-value">{totalClienti || 0}</div>
                        <div className="kpi-label">Clienti Attivi</div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon kpi-icon-orange">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-value">{totalProdotti || 0}</div>
                        <div className="kpi-label">Prodotti a Catalogo</div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon kpi-icon-green">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <line x1="10" y1="9" x2="8" y2="9"/>
                        </svg>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-value">{totalPreventivi || 0}</div>
                        <div className="kpi-label">Preventivi Totali</div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className={styles.chartSection}>
                <RevenueChart data={chartData} />
            </div>

            {/* Bottom Section */}
            <div className={styles.bottomSection}>
                {/* Recent Preventivi */}
                <div className={styles.tableCard}>
                    <div className={styles.tableCardHeader}>
                        <h3>Ultimi Preventivi</h3>
                        <Link href="/preventivi" className={styles.linkButton}>
                            Vedi tutti
                        </Link>
                    </div>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>NUMERO</th>
                                    <th>CLIENTE</th>
                                    <th>DATA</th>
                                    <th>TOTALE</th>
                                    <th>STATO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPreventivi && recentPreventivi.length > 0 ? (
                                    recentPreventivi.map((prev) => (
                                        <tr key={prev.id}>
                                            <td>{prev.numero}</td>
                                            <td>{(prev.clienti as { ragione_sociale: string })?.ragione_sociale || '-'}</td>
                                            <td>{new Date(prev.data_preventivo).toLocaleDateString('it-IT')}</td>
                                            <td>{new Intl.NumberFormat('it-IT', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            }).format(prev.totale_preventivo)}</td>
                                            <td>
                                                <span className={`badge ${statoLabels[prev.stato]?.className || 'badge-bozza'}`}>
                                                    {statoLabels[prev.stato]?.label || prev.stato}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className={styles.emptyState}>
                                            Nessun preventivo trovato
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.actionsCard}>
                    <h3>Azioni Rapide</h3>
                    <div className={styles.quickActions}>
                        <Link href="/preventivi/nuovo" className={styles.actionButton}>
                            <div className={styles.actionIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                            </div>
                            <span>Nuovo Preventivo</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

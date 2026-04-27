import { createAdminClient as createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

export const metadata = {
    title: 'Statistiche',
}

export default async function StatistichePage() {
    const supabase = await createClient()

    // ------ Ordini Acquisiti ------
    // Count orders with status != 'annullato'
    const { count: ordiniAcquisitiCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'annullato')

    // Sum values of converted quotes
    const { data: ordiniRows } = await supabase
        .from('orders')
        .select('preventivi (totale_preventivo)')
        .neq('status', 'annullato')

    const ordiniAcquisitiValore = (ordiniRows || []).reduce((sum, o) => {
        const tot = (o.preventivi as any)?.totale_preventivo ?? 0
        return sum + tot
    }, 0)

    // ------ Persi / Rifiutati ------
    const { count: persiCount } = await supabase
        .from('preventivi')
        .select('*', { count: 'exact', head: true })
        .eq('stato', 'rifiutato')

    const { data: persiRows } = await supabase
        .from('preventivi')
        .select('totale_preventivo')
        .eq('stato', 'rifiutato')

    const persiValore = (persiRows || []).reduce((sum, p) => sum + (p.totale_preventivo || 0), 0)

    // ------ In Trattativa ------
    // Preventivi with stato in ('inviato', 'accettato')
    const { count: inTrattativaCount } = await supabase
        .from('preventivi')
        .select('*', { count: 'exact', head: true })
        .in('stato', ['inviato', 'accettato'])

    const { data: inTrattativaRows } = await supabase
        .from('preventivi')
        .select('totale_preventivo')
        .in('stato', ['inviato', 'accettato'])

    const inTrattativaValore = (inTrattativaRows || []).reduce((sum, p) => sum + (p.totale_preventivo || 0), 0)

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Statistiche</h1>
                <p className={styles.subtitle}>Panoramica ordini, preventivi persi e in trattativa.</p>
            </div>

            <div className={styles.grid}>
                {/* Ordini Acquisiti */}
                <div className={`${styles.card} ${styles.cardGreen}`}>
                    <div className={styles.cardIcon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardLabel}>Ordini Acquisiti</div>
                        <div className={styles.cardCount}>{ordiniAcquisitiCount || 0}</div>
                        <div className={styles.cardValue}>{formatCurrency(ordiniAcquisitiValore)}</div>
                    </div>
                </div>

                {/* Persi / Rifiutati */}
                <div className={`${styles.card} ${styles.cardRed}`}>
                    <div className={styles.cardIcon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardLabel}>Persi / Rifiutati</div>
                        <div className={styles.cardCount}>{persiCount || 0}</div>
                        <div className={styles.cardValue}>{formatCurrency(persiValore)}</div>
                    </div>
                </div>

                {/* In Trattativa */}
                <div className={`${styles.card} ${styles.cardAmber}`}>
                    <div className={styles.cardIcon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardLabel}>In Trattativa</div>
                        <div className={styles.cardCount}>{inTrattativaCount || 0}</div>
                        <div className={styles.cardValue}>{formatCurrency(inTrattativaValore)}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

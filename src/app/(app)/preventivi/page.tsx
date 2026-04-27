import Link from 'next/link'
import { createAdminClient as createClient } from '@/lib/supabase/server'
import styles from './page.module.css'
import PreventivoFilters from '@/components/preventivi/PreventivoFilters'
import ConvertToOrderButton from '@/components/ordini/ConvertToOrderButton'
import QuoteStatusSelector from '@/components/preventivi/QuoteStatusSelector'

export const metadata = {
    title: 'Preventivi',
}

interface PreventiviPageProps {
    searchParams: Promise<{
        q?: string
        status?: string
        from?: string
        to?: string
    }>
}

export default async function PreventiviPage(props: PreventiviPageProps) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    let query = supabase
        .from('preventivi')
        .select(`
      id,
      numero,
      data_preventivo,
      data_validita,
      totale_preventivo,
      stato,
      note_preventivo,
      emesso_da,
      clienti (id, ragione_sociale)
    `)
        .order('created_at', { ascending: false })

    if (searchParams.q) {
        query = query.ilike('numero', `%${searchParams.q}%`)
    }

    if (searchParams.status) {
        query = query.eq('stato', searchParams.status)
    }

    if (searchParams.from) {
        query = query.gte('data_preventivo', searchParams.from)
    }

    if (searchParams.to) {
        query = query.lte('data_preventivo', searchParams.to)
    }

    const { data: preventivi } = await query

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Preventivi</h1>
                    <p className={styles.subtitle}>Gestisci i tuoi preventivi</p>
                </div>
                <div className={styles.headerActions}>
                    <span className={styles.brandLabel}>ROERO INFISSI</span>
                    <Link href="/preventivi/nuovo" className={styles.btnPrimary}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nuovo Preventivo
                    </Link>
                </div>
            </div>

            <PreventivoFilters />

            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>NUMERO</th>
                                <th>CLIENTE</th>
                                <th>DATA</th>
                                <th>VALIDITÀ</th>
                                <th>TOTALE</th>
                                <th>OPERATORE</th>
                                <th>STATO</th>
                                <th>AZIONI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preventivi && preventivi.length > 0 ? (
                                preventivi.map((prev) => (
                                    <tr key={prev.id}>
                                        <td className={styles.cellStrong}>{prev.numero}</td>
                                        <td>{(prev.clienti as { ragione_sociale: string })?.ragione_sociale || '-'}</td>
                                        <td>{new Date(prev.data_preventivo).toLocaleDateString('it-IT')}</td>
                                        <td>{prev.data_validita ? new Date(prev.data_validita).toLocaleDateString('it-IT') : '-'}</td>
                                        <td className={styles.cellPrice}>
                                            {new Intl.NumberFormat('it-IT', {
                                                style: 'currency',
                                                currency: 'EUR'
                                            }).format(prev.totale_preventivo)}
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                            {(prev as any).emesso_da || '-'}
                                        </td>
                                        <td>
                                            <QuoteStatusSelector
                                                quoteId={prev.id}
                                                currentStatus={prev.stato}
                                            />
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link href={`/preventivi/${prev.id}`} className={styles.btnAction} title="Visualizza">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </Link>
                                                <Link href={`/preventivi/${prev.id}/modifica`} className={styles.btnAction} title="Modifica">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </Link>
                                                <a
                                                    href={`/api/preventivi/${prev.id}/pdf`}
                                                    className={styles.btnAction}
                                                    title="Scarica PDF"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line x1="16" y1="13" x2="8" y2="13" />
                                                        <line x1="16" y1="17" x2="8" y2="17" />
                                                        <line x1="10" y1="9" x2="8" y2="9" />
                                                    </svg>
                                                </a>
                                                <ConvertToOrderButton
                                                    quoteId={prev.id}
                                                    quoteNumber={prev.numero}
                                                    quoteStatus={prev.stato}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className={styles.emptyState}>
                                        <div>
                                            <p>📋 Nessun preventivo trovato</p>
                                            <Link href="/preventivi/nuovo" className={styles.btnPrimarySmall}>
                                                Crea il primo preventivo
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className={styles.pagination}>
                    <span className={styles.paginationInfo}>
                        Visualizzando 1 a {preventivi?.length || 0} di {preventivi?.length || 0} risultati
                    </span>
                    <div className={styles.paginationControls}>
                        <button className={styles.paginationBtn} disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button className={`${styles.paginationBtn} ${styles.paginationBtnActive}`}>1</button>
                        <button className={styles.paginationBtn} disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

import { createAdminClient as createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import styles from './page.module.css'
import DownloadAllButton from '@/components/ordini/DownloadAllButton'
import RevertOrderButton from '@/components/ordini/RevertOrderButton'
import OrderStatusSelector from '@/components/ordini/OrderStatusSelector'

const STATUS_LABELS: Record<string, string> = {
    confermato: 'Confermato',
    in_lavorazione: 'In Lavorazione',
    completato: 'Completato',
    annullato: 'Annullato',
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

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
            *,
            preventivi (
                id,
                numero,
                totale_preventivo,
                clienti (
                    ragione_sociale,
                    email,
                    telefono_principale
                )
            )
        `)
        .eq('id', id)
        .single()

    const { data: documents } = await supabase
        .from('order_documents')
        .select('*')
        .eq('order_id', id)
        .order('generated_at', { ascending: false })

    if (error || !order) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <p>Ordine non trovato</p>
                    <Link href="/ordini" className={styles.backLink}>← Torna alla lista</Link>
                </div>
            </div>
        )
    }

    const statusClass = order.status === 'confermato'
        ? styles.badgeConfermato
        : order.status === 'in_lavorazione'
            ? styles.badgeInLavorazione
            : order.status === 'annullato'
                ? styles.badgeAnnullato
                : styles.badgeCompletato

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <Link href="/ordini" className={styles.backLink}>← Torna alla lista</Link>
            </div>

            <div className={styles.header}>
                <div>
                    <h1>{order.order_number}</h1>
                    <p className={styles.subtitle}>
                        Ordine del {new Date(order.order_date).toLocaleDateString('it-IT')}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link
                        href={`/preventivi/${order.preventivi?.id}`}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            color: 'var(--color-text)',
                            textDecoration: 'none',
                            fontSize: '14px',
                        }}
                    >
                        Vedi Preventivo
                    </Link>
                    <Link
                        href={`/preventivi/${order.preventivi?.id}/modifica`}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #0ea5e9',
                            borderRadius: '6px',
                            color: '#0ea5e9',
                            textDecoration: 'none',
                            fontSize: '14px',
                        }}
                    >
                        Modifica Preventivo
                    </Link>
                    <OrderStatusSelector orderId={order.id} currentStatus={order.status} quoteId={order.quote_id} />
                    <RevertOrderButton orderId={order.id} orderStatus={order.status} quoteId={order.quote_id} />
                </div>
            </div>

            <div className={styles.grid}>
                {/* Info Preventivo */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Preventivo Collegato</h3>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Numero:</span>
                            <Link
                                href={`/preventivi/${order.preventivi?.id}`}
                                className={styles.link}
                            >
                                {order.preventivi?.numero || '-'}
                            </Link>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Totale:</span>
                            <span className={styles.infoValue}>
                                € {((order.preventivi as any)?.totale_preventivo || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Cliente */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Cliente</h3>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Nome:</span>
                            <span className={styles.infoValue}>
                                {(order.preventivi as any)?.clienti?.ragione_sociale || '-'}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Email:</span>
                            <span className={styles.infoValue}>
                                {(order.preventivi as any)?.clienti?.email || '-'}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Telefono:</span>
                            <span className={styles.infoValue}>
                                {(order.preventivi as any)?.clienti?.telefono_principale || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Ordine */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Dettagli Ordine</h3>
                    <div className={styles.cardBody}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Detrazione:</span>
                            <span className={styles.infoValue}>
                                {DEDUCTION_LABELS[order.deduction_type || ''] || order.deduction_type || '-'}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Data ordine:</span>
                            <span className={styles.infoValue}>
                                {new Date(order.order_date).toLocaleDateString('it-IT')}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Creato:</span>
                            <span className={styles.infoValue}>
                                {new Date(order.created_at).toLocaleDateString('it-IT')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Note */}
                {order.notes && (
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Note</h3>
                        <div className={styles.cardBody}>
                            <p className={styles.noteText}>{order.notes}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Documents */}
            <div className={styles.card} style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className={styles.cardTitle} style={{ margin: 0 }}>Documenti</h3>
                    {documents && documents.length > 1 && (
                        <DownloadAllButton documents={documents} orderNumber={order.order_number} />
                    )}
                </div>
                <div className={styles.cardBody}>
                    {!documents || documents.length === 0 ? (
                        <p className={styles.emptyText}>Nessun documento disponibile</p>
                    ) : (
                        <div className={styles.docList}>
                            {documents.map((doc: any) => (
                                <div key={doc.id} className={styles.docItem}>
                                    <div>
                                        <span className={styles.docName}>{doc.document_name}</span>
                                        <span className={styles.docType}>{doc.document_type}</span>
                                    </div>
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.downloadBtn}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Scarica
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

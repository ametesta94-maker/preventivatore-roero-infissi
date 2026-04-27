import Link from 'next/link'
import { createAdminClient as createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

export const metadata = {
    title: 'Posizioni',
}

export default async function ProdottiPage() {
    const supabase = await createClient()

    const { data: prodotti } = await supabase
        .from('prodotti')
        .select('*, categories(nome, icona)')
        .order('nome')

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Posizioni</h1>
                    <p className={styles.subtitle}>Catalogo posizioni e serramenti</p>
                </div>
                <Link href="/prodotti/nuovo" className="btn btn-primary">
                    ➕ Nuova Posizione
                </Link>
            </div>

            <div className={styles.grid}>
                {prodotti && prodotti.length > 0 ? (
                    prodotti.map((prodotto) => (
                        <div key={prodotto.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>{prodotto.nome}</h3>
                                <span className={prodotto.attivo ? styles.badgeSuccess : styles.badgeDefault}>
                                    {prodotto.attivo ? 'Attivo' : 'Inattivo'}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <p className={styles.categoria}>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {prodotto.categories
                                        ? `${(prodotto.categories as any).icona || ''} ${(prodotto.categories as any).nome}`
                                        : prodotto.categoria || 'Senza prodotto'}
                                </p>
                                {prodotto.descrizione_breve && (
                                    <p className={styles.descrizione}>{prodotto.descrizione_breve}</p>
                                )}
                                <div className={styles.prezzo}>
                                    <span>Prezzo listino:</span>
                                    <strong>
                                        {new Intl.NumberFormat('it-IT', {
                                            style: 'currency',
                                            currency: 'EUR'
                                        }).format(prodotto.prezzo_listino)}
                                    </strong>
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <Link href={`/prodotti/${prodotto.id}`} className="btn btn-outline btn-sm">
                                    Modifica
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <p>📦 Nessuna posizione trovata</p>
                        <Link href="/prodotti/nuovo" className="btn btn-primary">
                            Aggiungi la prima posizione
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

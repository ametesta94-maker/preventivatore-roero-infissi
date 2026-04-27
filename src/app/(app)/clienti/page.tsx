'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

/** Apre il CRM con SSO automatico nella scheda corrente. */
function openCRM(after = '/') {
    const url = `/api/sso/to-crm?after=${encodeURIComponent(after)}`
    window.location.href = url
}

interface ClienteCRM {
    crm_id: number
    ragione_sociale: string
    email: string | null
    telefono_principale: string | null
    citta: string | null
    provincia: string | null
    indirizzo: string | null
}

export default function ClientiPage() {
    const [results, setResults] = useState<ClienteCRM[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fetchContatti = useCallback(async (q: string) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/clienti/from-crm?q=${encodeURIComponent(q)}`)
            const data = await res.json()
            if (data.error) {
                setError(data.error)
                setResults([])
            } else {
                setResults(data.results || [])
            }
        } catch {
            setError('Impossibile connettersi al CRM')
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Carica lista iniziale (tutti, senza filtro)
    useEffect(() => {
        fetchContatti('')
    }, [fetchContatti])

    const handleSearch = (value: string) => {
        setQuery(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => fetchContatti(value), 350)
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Clienti</h1>
                    <p className={styles.subtitle}>
                        Contatti dal CRM — selezionali per creare preventivi
                    </p>
                </div>
                <button
                    onClick={() => openCRM('/?goto=nuovo_cliente')}
                    className="btn btn-outline"
                >
                    Gestisci nel CRM ↗
                </button>
            </div>

            {/* Ricerca */}
            <div style={{ marginBottom: '1.25rem' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Cerca per nome, cognome, azienda, telefono, città..."
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ maxWidth: 480 }}
                    autoFocus
                />
                {loading && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Caricamento...</p>}
                {!loading && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{results.length} contatti</p>}
            </div>

            {error && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(220,38,38,0.08)', borderRadius: '0.375rem', color: 'var(--color-error)', marginBottom: '1rem' }}>
                    <strong>Errore CRM:</strong> {error}
                    <br />
                    <small>Assicurati che il CRM sia in esecuzione su http://localhost:5000</small>
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome / Ragione Sociale</th>
                            <th>Telefono</th>
                            <th>Email</th>
                            <th>Città</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && results.length === 0 && !error && (
                            <tr>
                                <td colSpan={5} className={styles.emptyState}>
                                    <div>
                                        <p>{query.length >= 2 ? `Nessun contatto trovato per "${query}"` : 'Nessun contatto nel CRM'}</p>
                                        <button className="btn btn-primary btn-sm" onClick={() => openCRM('/?goto=nuovo_cliente')}>
                                            Crea contatto nel CRM ↗
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {results.map((c) => (
                            <tr key={c.crm_id}>
                                <td><strong>{c.ragione_sociale}</strong></td>
                                <td>{c.telefono_principale || '—'}</td>
                                <td>{c.email || '—'}</td>
                                <td>{[c.citta, c.provincia].filter(Boolean).join(' (') + (c.provincia ? ')' : '')}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <Link
                                            href={`/preventivi/nuovo?crm_id=${c.crm_id}&nome=${encodeURIComponent(c.ragione_sociale)}`}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Nuovo preventivo
                                        </Link>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => openCRM(`/?goto=contatto&id=${c.crm_id}`)}
                                        >
                                            Apri nel CRM ↗
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

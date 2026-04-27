'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function NuovoClientePage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const [formData, setFormData] = useState({
        ragione_sociale: '',
        tipo_cliente: 'privato',
        codice_fiscale: '',
        partita_iva: '',
        email: '',
        telefono_principale: '',
        indirizzo: '',
        cap: '',
        citta: '',
        provincia: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const supabase = createClient()

            // Filtra i campi vuoti - invia solo quelli con valore
            const dataToInsert: Record<string, string | boolean> = {
                ragione_sociale: formData.ragione_sociale,
                tipo_cliente: formData.tipo_cliente,
                attivo: true,
            }

            // Aggiungi solo i campi opzionali se hanno valore
            if (formData.codice_fiscale) dataToInsert.codice_fiscale = formData.codice_fiscale
            if (formData.partita_iva) dataToInsert.partita_iva = formData.partita_iva
            if (formData.email) dataToInsert.email = formData.email
            if (formData.telefono_principale) dataToInsert.telefono_principale = formData.telefono_principale
            if (formData.indirizzo) dataToInsert.indirizzo = formData.indirizzo
            if (formData.cap) dataToInsert.cap = formData.cap
            if (formData.citta) dataToInsert.citta = formData.citta
            if (formData.provincia) dataToInsert.provincia = formData.provincia

            const { error: insertError } = await supabase
                .from('clienti')
                .insert(dataToInsert as any)

            if (insertError) {
                console.error('Supabase error:', insertError)
                throw new Error(insertError.message)
            }

            router.push('/clienti')
            router.refresh()
        } catch (err) {
            console.error('Full error:', err)
            setError(err instanceof Error ? err.message : 'Errore durante la creazione del cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Nuovo Cliente</h1>
                    <p className={styles.subtitle}>Aggiungi un nuovo cliente</p>
                </div>
                <Link href="/clienti" className="btn btn-outline">
                    ← Torna alla lista
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                {error && <div className={styles.error}>{error}</div>}

                <div className="card">
                    <div className="card-header">
                        <h3>Dati Anagrafici</h3>
                    </div>
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="ragione_sociale" className="form-label required">
                                    Ragione Sociale / Nome
                                </label>
                                <input
                                    type="text"
                                    id="ragione_sociale"
                                    name="ragione_sociale"
                                    className="form-input"
                                    value={formData.ragione_sociale}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tipo_cliente" className="form-label required">
                                    Tipo Cliente
                                </label>
                                <select
                                    id="tipo_cliente"
                                    name="tipo_cliente"
                                    className="form-input"
                                    value={formData.tipo_cliente}
                                    onChange={handleChange}
                                >
                                    <option value="privato">👤 Privato</option>
                                    <option value="azienda">🏢 Azienda</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="codice_fiscale" className="form-label">
                                    Codice Fiscale
                                </label>
                                <input
                                    type="text"
                                    id="codice_fiscale"
                                    name="codice_fiscale"
                                    className="form-input"
                                    value={formData.codice_fiscale}
                                    onChange={handleChange}
                                    maxLength={16}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="partita_iva" className="form-label">
                                    Partita IVA
                                </label>
                                <input
                                    type="text"
                                    id="partita_iva"
                                    name="partita_iva"
                                    className="form-input"
                                    value={formData.partita_iva}
                                    onChange={handleChange}
                                    maxLength={11}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Contatti</h3>
                    </div>
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="telefono_principale" className="form-label">Telefono</label>
                                <input
                                    type="tel"
                                    id="telefono_principale"
                                    name="telefono_principale"
                                    className="form-input"
                                    value={formData.telefono_principale}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Indirizzo</h3>
                    </div>
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label htmlFor="indirizzo" className="form-label">Indirizzo</label>
                                <input
                                    type="text"
                                    id="indirizzo"
                                    name="indirizzo"
                                    className="form-input"
                                    value={formData.indirizzo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="cap" className="form-label">CAP</label>
                                <input
                                    type="text"
                                    id="cap"
                                    name="cap"
                                    className="form-input"
                                    value={formData.cap}
                                    onChange={handleChange}
                                    maxLength={5}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="citta" className="form-label">Città</label>
                                <input
                                    type="text"
                                    id="citta"
                                    name="citta"
                                    className="form-input"
                                    value={formData.citta}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="provincia" className="form-label">Provincia</label>
                                <input
                                    type="text"
                                    id="provincia"
                                    name="provincia"
                                    className="form-input"
                                    value={formData.provincia}
                                    onChange={handleChange}
                                    maxLength={2}
                                    placeholder="es. CN"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Link href="/clienti" className="btn btn-outline">
                        Annulla
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Salvataggio...' : '💾 Salva Cliente'}
                    </button>
                </div>
            </form>
        </div>
    )
}

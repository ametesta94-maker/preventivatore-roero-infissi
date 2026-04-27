'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from '../nuovo/page.module.css'

export default function ModificaClientePage() {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [notFound, setNotFound] = useState(false)
    const router = useRouter()
    const params = useParams()
    const clienteId = params.id as string

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

    useEffect(() => {
        const fetchCliente = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('clienti')
                .select('*')
                .eq('id', clienteId)
                .single()

            if (error || !data) {
                setNotFound(true)
                return
            }

            setFormData({
                ragione_sociale: data.ragione_sociale || '',
                tipo_cliente: data.tipo_cliente || 'privato',
                codice_fiscale: data.codice_fiscale || '',
                partita_iva: data.partita_iva || '',
                email: data.email || '',
                telefono_principale: data.telefono_principale || '',
                indirizzo: data.indirizzo || '',
                cap: data.cap || '',
                citta: data.citta || '',
                provincia: data.provincia || '',
            })
        }

        fetchCliente()
    }, [clienteId])

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

            const { error: updateError } = await supabase
                .from('clienti')
                .update({
                    ragione_sociale: formData.ragione_sociale,
                    tipo_cliente: formData.tipo_cliente,
                    codice_fiscale: formData.codice_fiscale || null,
                    partita_iva: formData.partita_iva || null,
                    email: formData.email || null,
                    telefono_principale: formData.telefono_principale,
                    indirizzo: formData.indirizzo,
                    cap: formData.cap,
                    citta: formData.citta,
                    provincia: formData.provincia,
                    updated_at: new Date().toISOString(),
                } as any)
                .eq('id', clienteId)

            if (updateError) throw new Error(updateError.message)

            router.push('/clienti')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il salvataggio')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return

        setDeleting(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('clienti')
                .delete()
                .eq('id', clienteId)

            if (error) throw new Error(error.message)

            router.push('/clienti')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante eliminazione')
            setDeleting(false)
        }
    }

    if (notFound) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Cliente non trovato</div>
                <Link href="/clienti" className="btn btn-outline">← Torna alla lista</Link>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Modifica Cliente</h1>
                    <p className={styles.subtitle}>Aggiorna i dati del cliente</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        onClick={handleDelete}
                        className="btn btn-outline"
                        style={{ color: 'var(--color-error)' }}
                        disabled={deleting}
                    >
                        {deleting ? '...' : '🗑️ Elimina'}
                    </button>
                    <Link href="/clienti" className="btn btn-outline">
                        ← Torna alla lista
                    </Link>
                </div>
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
                                <label htmlFor="codice_fiscale" className="form-label">Codice Fiscale</label>
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
                                <label htmlFor="partita_iva" className="form-label">Partita IVA</label>
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
                        {loading ? 'Salvataggio...' : '💾 Salva Modifiche'}
                    </button>
                </div>
            </form>
        </div>
    )
}

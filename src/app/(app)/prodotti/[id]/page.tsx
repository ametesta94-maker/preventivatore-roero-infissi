'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types/database'
import CategorySelector from '@/components/options/CategorySelector'
import styles from '../nuovo/page.module.css'

export default function ModificaProdottoPage() {
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [notFound, setNotFound] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const router = useRouter()
    const params = useParams()
    const prodottoId = params.id as string

    const [formData, setFormData] = useState({
        nome: '',
        descrizione_breve: '',
        descrizione_estesa: '',
        category_id: '',
        prezzo_listino: 0,
        costo_posa: 0,
        unita_misura: 'pezzo',
        attivo: true,
    })

    useEffect(() => {
        const supabase = createClient()

        // Load categories
        supabase
            .from('categories')
            .select('*')
            .eq('attiva', true)
            .order('ordine')
            .then(({ data }) => {
                if (data) setCategories(data)
            })

        // Load product
        const fetchProdotto = async () => {
            const { data, error } = await supabase
                .from('prodotti')
                .select('*')
                .eq('id', prodottoId)
                .single()

            if (error || !data) {
                setNotFound(true)
                return
            }

            setFormData({
                nome: data.nome || '',
                descrizione_breve: data.descrizione_breve || '',
                descrizione_estesa: data.descrizione_estesa || '',
                category_id: data.category_id || '',
                prezzo_listino: data.prezzo_listino || 0,
                costo_posa: data.costo_posa || 0,
                unita_misura: data.unita_misura || 'pezzo',
                attivo: data.attivo ?? true,
            })
            setImageUrl(data.immagine_url || null)
        }

        fetchProdotto()
    }, [prodottoId])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError(null)

        try {
            const fd = new FormData()
            fd.append('file', file)

            const res = await fetch('/api/upload/prodotto', { method: 'POST', body: fd })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Errore upload')

            setImageUrl(data.url)
        } catch (err: any) {
            setError(`Errore upload immagine: ${err.message}`)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            if (!formData.category_id) {
                throw new Error('Seleziona un prodotto')
            }

            const supabase = createClient()

            // Trova lo slug della categoria per backward compatibility
            const selectedCategory = categories.find(c => c.id === formData.category_id)
            const categoriaSlug = selectedCategory?.slug || 'altro'

            const { error: updateError } = await supabase
                .from('prodotti')
                .update({
                    nome: formData.nome,
                    descrizione_breve: formData.descrizione_breve,
                    descrizione_estesa: formData.descrizione_estesa || null,
                    categoria: categoriaSlug,
                    category_id: formData.category_id || null,
                    prezzo_listino: formData.prezzo_listino,
                    costo_posa: formData.costo_posa,
                    unita_misura: formData.unita_misura,
                    immagine_url: imageUrl,
                    attivo: formData.attivo,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', prodottoId)

            if (updateError) throw updateError

            router.push('/prodotti')
            router.refresh()
        } catch (err: unknown) {
            console.error('Product update error:', err)
            const errObj = err as { message?: string; details?: string; hint?: string; code?: string }
            const msg = errObj?.message || errObj?.details || 'Errore sconosciuto'
            const hint = errObj?.hint ? ` (${errObj.hint})` : ''
            const code = errObj?.code ? ` [${errObj.code}]` : ''
            setError(`Errore: ${msg}${hint}${code}`)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Sei sicuro di voler eliminare questa posizione?')) return

        setDeleting(true)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('prodotti')
                .delete()
                .eq('id', prodottoId)

            if (error) throw new Error(error.message)

            router.push('/prodotti')
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante eliminazione')
            setDeleting(false)
        }
    }

    if (notFound) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Posizione non trovata</div>
                <Link href="/prodotti" className="btn btn-outline">← Torna al catalogo</Link>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Modifica Posizione</h1>
                    <p className={styles.subtitle}>Aggiorna i dati della posizione</p>
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
                    <Link href="/prodotti" className="btn btn-outline">
                        ← Torna al catalogo
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {error && <div className={styles.error}>{error}</div>}

                <div className="card">
                    <div className="card-header">
                        <h3>Informazioni Posizione</h3>
                    </div>
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="nome" className="form-label required">Nome Posizione</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    className="form-input"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="es. Finestra PVC Bianco"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoria" className="form-label required">Prodotto</label>
                                <CategorySelector
                                    value={formData.category_id}
                                    onChange={(categoryId) => setFormData(prev => ({ ...prev, category_id: categoryId }))}
                                    categories={categories}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="unita_misura" className="form-label">Unita di Misura</label>
                                <select
                                    id="unita_misura"
                                    name="unita_misura"
                                    className="form-input"
                                    value={formData.unita_misura}
                                    onChange={handleChange}
                                >
                                    <option value="pezzo">Pezzo (pz)</option>
                                    <option value="mq">Metro Quadro (mq)</option>
                                    <option value="ml">Metro Lineare (ml)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="attivo" className="form-label">Stato</label>
                                <select
                                    id="attivo"
                                    name="attivo"
                                    className="form-input"
                                    value={formData.attivo ? 'true' : 'false'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, attivo: e.target.value === 'true' }))}
                                >
                                    <option value="true">Attivo</option>
                                    <option value="false">Inattivo</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label htmlFor="descrizione_breve" className="form-label">Descrizione Breve</label>
                                <input
                                    type="text"
                                    id="descrizione_breve"
                                    name="descrizione_breve"
                                    className="form-input"
                                    value={formData.descrizione_breve}
                                    onChange={handleChange}
                                    placeholder="Descrizione sintetica della posizione..."
                                />
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label htmlFor="descrizione_estesa" className="form-label">Descrizione Estesa</label>
                                <textarea
                                    id="descrizione_estesa"
                                    name="descrizione_estesa"
                                    className="form-input"
                                    value={formData.descrizione_estesa}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Descrizione dettagliata della posizione (opzionale)..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Immagine Posizione</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Immagine (PNG, JPG, WebP - max 5MB)</label>
                            {imageUrl && (
                                <div style={{ marginBottom: '12px' }}>
                                    <img
                                        src={imageUrl}
                                        alt="Anteprima prodotto"
                                        style={{
                                            maxWidth: '200px',
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-border)',
                                        }}
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleImageUpload}
                                disabled={uploading}
                                className="form-input"
                            />
                            {uploading && <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Caricamento in corso...</p>}
                            {imageUrl && (
                                <button
                                    type="button"
                                    onClick={() => setImageUrl(null)}
                                    style={{ marginTop: '8px', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Rimuovi immagine
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>Prezzi</h3>
                    </div>
                    <div className="card-body">
                        <div className={styles.formGrid}>
                            <div className="form-group">
                                <label htmlFor="prezzo_listino" className="form-label required">Prezzo Listino (EUR)</label>
                                <input
                                    type="number"
                                    id="prezzo_listino"
                                    name="prezzo_listino"
                                    className="form-input"
                                    value={formData.prezzo_listino}
                                    onChange={handleChange}
                                    min={0}
                                    step={0.01}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="costo_posa" className="form-label">Costo Posa (EUR)</label>
                                <input
                                    type="number"
                                    id="costo_posa"
                                    name="costo_posa"
                                    className="form-input"
                                    value={formData.costo_posa}
                                    onChange={handleChange}
                                    min={0}
                                    step={0.01}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <Link href="/prodotti" className="btn btn-outline">
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

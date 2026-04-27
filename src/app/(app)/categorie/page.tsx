'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

interface Category {
    id: string
    slug: string
    nome: string
    descrizione: string | null
    icona: string | null
    ordine: number
    attiva: boolean
    image_url: string | null
    description_template: string | null
    created_at: string
    updated_at: string
}

type ModalState =
    | { mode: 'closed' }
    | { mode: 'create' }
    | { mode: 'edit'; category: Category }

const ICONS = ['🪟', '🏠', '🚪', '🔒', '🪰', '📦', '🛡️', '🪵', '⚙️', '🔧', '🏗️', '🪜', '🧱', '🔩', '📐', '🎨']

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
}

export default function CategoriePage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

    const fetchCategories = useCallback(async () => {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('ordine')
        setCategories(data || [])
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const handleDelete = async (id: string, nome: string) => {
        if (!confirm(`Eliminare il prodotto "${nome}"? Verranno eliminate anche tutte le opzioni associate.`)) return

        const supabase = createClient()
        const { error } = await supabase.from('categories').delete().eq('id', id)

        if (error) {
            if (error.code === '23503') {
                if (confirm(`Il prodotto "${nome}" è usato in posizioni o preventivi. Vuoi disattivarlo invece?`)) {
                    await supabase.from('categories').update({ attiva: false }).eq('id', id)
                    await fetchCategories()
                }
            } else {
                alert('Errore: ' + error.message)
            }
            return
        }
        await fetchCategories()
    }

    const handleSave = async (data: Partial<Category>) => {
        const supabase = createClient()

        if (modal.mode === 'create') {
            const { error } = await supabase.from('categories').insert(data as Category)
            if (error) {
                alert('Errore creazione: ' + error.message)
                return
            }
        } else if (modal.mode === 'edit') {
            const { error } = await supabase
                .from('categories')
                .update(data)
                .eq('id', modal.category.id)
            if (error) {
                alert('Errore aggiornamento: ' + error.message)
                return
            }
        }

        setModal({ mode: 'closed' })
        await fetchCategories()
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Prodotti</h1>
                    <p className={styles.subtitle}>Gestisci i prodotti del catalogo</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
                    + Nuovo Prodotto
                </button>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: 60 }}>Icona</th>
                            <th>Nome</th>
                            <th>Slug</th>
                            <th>Descrizione</th>
                            <th style={{ width: 80 }}>Ordine</th>
                            <th style={{ width: 100 }}>Stato</th>
                            <th style={{ width: 120 }}>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                    Caricamento...
                                </td>
                            </tr>
                        ) : categories.length > 0 ? (
                            categories.map(cat => (
                                <tr key={cat.id}>
                                    <td className={styles.iconCell}>{cat.icona || '📁'}</td>
                                    <td><strong>{cat.nome}</strong></td>
                                    <td><code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{cat.slug}</code></td>
                                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {cat.descrizione || '-'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{cat.ordine}</td>
                                    <td>
                                        <span className={cat.attiva ? styles.badgeSuccess : styles.badgeDefault}>
                                            {cat.attiva ? 'Attiva' : 'Disattivata'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => setModal({ mode: 'edit', category: cat })}
                                                title="Modifica"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                style={{ color: 'var(--color-error)' }}
                                                onClick={() => handleDelete(cat.id, cat.nome)}
                                                title="Elimina"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className={styles.emptyState}>
                                    <div>
                                        <p>📁 Nessun prodotto trovato</p>
                                        <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode: 'create' })}>
                                            Aggiungi il primo prodotto
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modal.mode !== 'closed' && (
                <CategoryFormModal
                    mode={modal.mode}
                    category={modal.mode === 'edit' ? modal.category : undefined}
                    existingSlugs={categories.map(c => c.slug)}
                    nextOrder={categories.length > 0 ? Math.max(...categories.map(c => c.ordine)) + 10 : 10}
                    onSave={handleSave}
                    onClose={() => setModal({ mode: 'closed' })}
                />
            )}
        </div>
    )
}

/* ========================================
   Modal inline per creare/modificare categoria
   ======================================== */

interface CategoryFormModalProps {
    mode: 'create' | 'edit'
    category?: Category
    existingSlugs: string[]
    nextOrder: number
    onSave: (data: Partial<Category>) => Promise<void>
    onClose: () => void
}

function CategoryFormModal({ mode, category, existingSlugs, nextOrder, onSave, onClose }: CategoryFormModalProps) {
    const [nome, setNome] = useState(category?.nome || '')
    const [slug, setSlug] = useState(category?.slug || '')
    const [slugManual, setSlugManual] = useState(mode === 'edit')
    const [descrizione, setDescrizione] = useState(category?.descrizione || '')
    const [icona, setIcona] = useState(category?.icona || '📁')
    const [ordine, setOrdine] = useState(category?.ordine ?? nextOrder)
    const [attiva, setAttiva] = useState(category?.attiva ?? true)
    const [imageUrl, setImageUrl] = useState(category?.image_url || '')
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [descriptionTemplate, setDescriptionTemplate] = useState(category?.description_template || '')
    const [saving, setSaving] = useState(false)
    const [slugError, setSlugError] = useState('')

    useEffect(() => {
        if (!slugManual && nome) {
            setSlug(slugify(nome))
        }
    }, [nome, slugManual])

    useEffect(() => {
        if (slug && existingSlugs.includes(slug) && (!category || category.slug !== slug)) {
            setSlugError('Slug già esistente')
        } else {
            setSlugError('')
        }
    }, [slug, existingSlugs, category])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setUploadError('')
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload/categoria', { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload fallito')
            setImageUrl(data.url)
        } catch (err: any) {
            setUploadError(err.message || 'Errore upload')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async () => {
        if (!nome.trim() || !slug.trim() || slugError) return
        setSaving(true)
        await onSave({
            nome: nome.trim(),
            slug: slug.trim(),
            descrizione: descrizione.trim() || null,
            icona,
            ordine,
            attiva,
            image_url: imageUrl.trim() || null,
            description_template: descriptionTemplate.trim() || null,
        })
        setSaving(false)
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{mode === 'create' ? 'Nuovo Prodotto' : 'Modifica Prodotto'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nome *</label>
                        <input
                            className={styles.formInput}
                            type="text"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            placeholder="Es. Serramenti"
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Slug</label>
                        <input
                            className={styles.formInput}
                            type="text"
                            value={slug}
                            onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
                            placeholder="serramenti"
                        />
                        {slugError && <span className={styles.formError}>{slugError}</span>}
                        <span className={styles.formHint}>Identificatore univoco. Auto-generato dal nome.</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Descrizione</label>
                        <input
                            className={styles.formInput}
                            type="text"
                            value={descrizione}
                            onChange={e => setDescrizione(e.target.value)}
                            placeholder="Breve descrizione del prodotto"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Icona</label>
                        <div className={styles.iconPicker}>
                            {ICONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    className={`${styles.iconOption} ${icona === icon ? styles.iconOptionSelected : ''}`}
                                    onClick={() => setIcona(icon)}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                        <span className={styles.formHint}>Oppure scrivi una emoji personalizzata:</span>
                        <input
                            className={styles.formInput}
                            type="text"
                            value={icona}
                            onChange={e => setIcona(e.target.value)}
                            maxLength={4}
                            style={{ width: 80 }}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Ordine</label>
                            <input
                                className={styles.formInput}
                                type="number"
                                value={ordine}
                                onChange={e => setOrdine(Number(e.target.value))}
                                min={0}
                            />
                        </div>
                        <div className={styles.checkboxGroup} style={{ alignSelf: 'end', paddingBottom: 'var(--space-2)' }}>
                            <input
                                type="checkbox"
                                id="catAttiva"
                                checked={attiva}
                                onChange={e => setAttiva(e.target.checked)}
                            />
                            <label htmlFor="catAttiva">Attiva</label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Immagine Prodotto</label>
                        {imageUrl && (
                            <div style={{ marginBottom: 8, position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={imageUrl}
                                    alt="Anteprima"
                                    style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, objectFit: 'contain', border: '1px solid #e5e7eb' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setImageUrl('')}
                                    style={{ position: 'absolute', top: 4, right: 4, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 14, lineHeight: '24px', textAlign: 'center' }}
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className={styles.formInput}
                        />
                        {uploading && <span style={{ fontSize: 12, color: '#6b7280' }}>Caricamento in corso...</span>}
                        {uploadError && <span style={{ fontSize: 12, color: '#ef4444' }}>{uploadError}</span>}
                        <span className={styles.formHint}>Immagine mostrata nell&apos;intestazione sezione del preventivo. PNG, JPG o WebP, max 5MB.</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Template Descrizione</label>
                        <textarea
                            className={styles.formInput}
                            value={descriptionTemplate}
                            onChange={e => setDescriptionTemplate(e.target.value)}
                            placeholder={"Es. Fornitura e posa di {{tipologia}} in {{materiale}}, colore {{colore}}..."}
                            rows={4}
                        />
                        <span className={styles.formHint}>Usa {'{{nome_opzione}}'} come placeholder per le opzioni selezionate. Verranno sostituite automaticamente nella descrizione del preventivo.</span>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className="btn btn-outline" onClick={onClose} disabled={saving}>
                        Annulla
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={saving || !nome.trim() || !slug.trim() || !!slugError}
                    >
                        {saving ? 'Salvataggio...' : mode === 'create' ? 'Crea Prodotto' : 'Salva Modifiche'}
                    </button>
                </div>
            </div>
        </div>
    )
}

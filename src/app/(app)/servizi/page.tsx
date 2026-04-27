'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types/database'
import styles from './page.module.css'

export default function ServiziPage() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        price: 0,
        unit: 'forfait',
        is_active: true,
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadServices()
    }, [])

    const loadServices = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('name')

        if (error) {
            console.error('Errore caricamento servizi:', error)
        } else {
            setServices(data || [])
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSaving(true)

        const supabase = createClient()

        try {
            if (editingService) {
                // Update
                const { error: updateError } = await supabase
                    .from('services')
                    .update({
                        name: formData.name,
                        code: formData.code || null,
                        description: formData.description || null,
                        price: formData.price,
                        unit: formData.unit,
                        is_active: formData.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingService.id)

                if (updateError) throw updateError
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('services')
                    .insert({
                        name: formData.name,
                        code: formData.code || null,
                        description: formData.description || null,
                        price: formData.price,
                        unit: formData.unit,
                        is_active: formData.is_active,
                    })

                if (insertError) throw insertError
            }

            await loadServices()
            resetForm()
            setShowForm(false)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Errore durante il salvataggio')
            }
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (service: Service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            code: service.code || '',
            description: service.description || '',
            price: service.price,
            unit: service.unit,
            is_active: service.is_active,
        })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Sei sicuro di voler eliminare questo servizio?')) return

        const supabase = createClient()
        const { error } = await supabase.from('services').delete().eq('id', id)

        if (error) {
            alert('Errore durante eliminazione: ' + error.message)
        } else {
            await loadServices()
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            description: '',
            price: 0,
            unit: 'forfait',
            is_active: true,
        })
        setEditingService(null)
        setError(null)
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <p style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
                    Caricamento servizi...
                </p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Servizi</h1>
                    <p className={styles.subtitle}>Gestisci i servizi aggiuntivi (Pratica ENEA, Smaltimento, Trasporto, ecc.)</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm()
                        setShowForm(true)
                    }}
                >
                    + Nuovo Servizio
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <div className="card-header">
                        <h3>{editingService ? 'Modifica Servizio' : 'Nuovo Servizio'}</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <div className={styles.error} style={{ marginBottom: 'var(--space-4)' }}>
                                    {error}
                                </div>
                            )}

                            <div className={styles.formGrid}>
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label required">Nome Servizio</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Es. Pratica ENEA"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="code" className="form-label">Codice</label>
                                    <input
                                        type="text"
                                        id="code"
                                        className="form-input"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="Es. SRV-ENEA"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price" className="form-label required">Prezzo (€)</label>
                                    <input
                                        type="number"
                                        id="price"
                                        className="form-input"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="unit" className="form-label">Unità di Misura</label>
                                    <select
                                        id="unit"
                                        className="form-input"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="forfait">Forfait</option>
                                        <option value="pezzo">Pezzo</option>
                                        <option value="ora">Ora</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description" className="form-label">Descrizione</label>
                                <textarea
                                    id="description"
                                    className="form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Descrizione dettagliata del servizio..."
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span>Servizio attivo</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        resetForm()
                                        setShowForm(false)
                                    }}
                                    disabled={saving}
                                >
                                    Annulla
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Salvataggio...' : 'Salva Servizio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Codice</th>
                                    <th>Descrizione</th>
                                    <th>Prezzo</th>
                                    <th>Unità</th>
                                    <th>Stato</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
                                            Nessun servizio trovato. Clicca su &quot;Nuovo Servizio&quot; per aggiungerne uno.
                                        </td>
                                    </tr>
                                ) : (
                                    services.map((service) => (
                                        <tr key={service.id}>
                                            <td className={styles.nameCell}>{service.name}</td>
                                            <td>{service.code || '-'}</td>
                                            <td className={styles.descriptionCell}>{service.description || '-'}</td>
                                            <td>€ {service.price.toFixed(2)}</td>
                                            <td>{service.unit}</td>
                                            <td>
                                                <span className={`${styles.badge} ${service.is_active ? styles.badgeSuccess : styles.badgeInactive}`}>
                                                    {service.is_active ? 'Attivo' : 'Inattivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => handleEdit(service)}
                                                        title="Modifica"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => handleDelete(service.id)}
                                                        title="Elimina"
                                                        style={{ color: 'var(--color-danger)' }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

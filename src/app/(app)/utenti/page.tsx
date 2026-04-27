'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface CRMUser {
    id: number
    username: string
    display_name: string
    role: 'admin' | 'user'
    attivo: number  // 1 = attivo, 0 = inattivo
}

export default function UtentiPage() {
    const [users, setUsers] = useState<CRMUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Form nuovo utente
    const [formUsername, setFormUsername] = useState('')
    const [formPassword, setFormPassword] = useState('')
    const [formDisplayName, setFormDisplayName] = useState('')
    const [formRole, setFormRole] = useState<'admin' | 'user'>('user')

    useEffect(() => { fetchUsers() }, [])

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/utenti/crm')
            const data = await res.json()
            if (data.error) {
                setError(data.error)
            } else {
                setUsers(Array.isArray(data) ? data : [])
            }
        } catch {
            setError('Impossibile connettersi al CRM')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formUsername || !formPassword || !formDisplayName) return
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch('/api/utenti/crm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formUsername.toLowerCase().trim(),
                    password: formPassword,
                    display_name: formDisplayName.trim(),
                    role: formRole,
                    attivo: true,
                }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setMessage({ type: 'success', text: `Utente "${formDisplayName}" creato con successo nel CRM.` })
            setFormUsername(''); setFormPassword(''); setFormDisplayName(''); setFormRole('user')
            setShowForm(false)
            fetchUsers()
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Errore creazione utente' })
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (u: CRMUser) => {
        try {
            const res = await fetch('/api/utenti/crm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: u.id, display_name: u.display_name, role: u.role, attivo: !u.attivo }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            fetchUsers()
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Errore aggiornamento' })
        }
    }

    const handleChangeRole = async (u: CRMUser, newRole: 'admin' | 'user') => {
        try {
            const res = await fetch('/api/utenti/crm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: u.id, display_name: u.display_name, role: newRole, attivo: u.attivo }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            fetchUsers()
            setMessage({ type: 'success', text: 'Ruolo aggiornato' })
        } catch (err: unknown) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Errore aggiornamento ruolo' })
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Gestione Utenti</h1>
                    <p className={styles.subtitle}>Utenti dal CRM — accesso condiviso con il preventivatore</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className={styles.btnPrimary}>
                    {showForm ? '✕ Annulla' : '+ Nuovo Utente'}
                </button>
            </div>

            {message && (
                <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                </div>
            )}

            {error && (
                <div className={styles.alertError} style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}>
                    <strong>Errore CRM:</strong> {error}
                    <br /><small>Assicurati che il CRM sia in esecuzione su localhost:5000 e che tu sia autenticato.</small>
                </div>
            )}

            {showForm && (
                <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
                    <div className={styles.cardHeader}><h3>Crea Nuovo Utente CRM</h3></div>
                    <form onSubmit={handleCreate} className={styles.cardBody}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Username / Email *</label>
                                <input type="text" className="form-input" value={formUsername}
                                    onChange={e => setFormUsername(e.target.value)} required
                                    placeholder="nome@esempio.it" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nome visualizzato *</label>
                                <input type="text" className="form-input" value={formDisplayName}
                                    onChange={e => setFormDisplayName(e.target.value)} required
                                    placeholder="Mario Rossi" />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Password *</label>
                                <input type="password" className="form-input" value={formPassword}
                                    onChange={e => setFormPassword(e.target.value)} required
                                    placeholder="Minimo 6 caratteri" minLength={6} />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Ruolo</label>
                                <select className="form-input" value={formRole} onChange={e => setFormRole(e.target.value as 'admin' | 'user')}>
                                    <option value="user">Operatore</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button type="submit" className={styles.btnPrimary} disabled={saving}>
                                {saving ? 'Creazione...' : 'Crea Utente'}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                                Annulla
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Username (login)</th>
                            <th>Ruolo</th>
                            <th>Stato</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Caricamento dal CRM...</td></tr>
                        ) : users.length === 0 && !error ? (
                            <tr><td colSpan={5} className={styles.emptyState}><div><p>Nessun utente trovato nel CRM</p></div></td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td><strong>{u.display_name}</strong></td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{u.username}</td>
                                <td>
                                    <select
                                        className="form-input"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
                                        value={u.role}
                                        onChange={e => handleChangeRole(u, e.target.value as 'admin' | 'user')}
                                    >
                                        <option value="user">Operatore</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={u.attivo ? styles.badgeSuccess : styles.badgeDefault}>
                                        {u.attivo ? 'Attivo' : 'Inattivo'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleToggleActive(u)}
                                    >
                                        {u.attivo ? 'Disattiva' : 'Attiva'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

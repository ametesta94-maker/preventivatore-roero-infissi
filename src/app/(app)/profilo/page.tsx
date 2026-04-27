'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function ProfiloPage() {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const router = useRouter()

    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        ruolo: '',
    })

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient()
            
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            
            setUserId(user.id)
            
            // Get profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            
            if (profile) {
                setFormData({
                    nome: profile.nome || '',
                    cognome: profile.cognome || '',
                    email: profile.email || user.email || '',
                    ruolo: profile.ruolo || 'operatore',
                })
            }
        }
        
        fetchProfile()
    }, [router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) return
        
        setSaving(true)
        setMessage(null)
        
        try {
            const supabase = createClient()
            
            const { error } = await supabase
                .from('profiles')
                .update({
                    nome: formData.nome,
                    cognome: formData.cognome,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
            
            if (error) throw error
            
            setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' })
            router.refresh()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Errore durante il salvataggio' })
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = async () => {
        setLoading(true)
        setMessage(null)
        
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            
            if (error) throw error
            
            setMessage({ type: 'success', text: 'Email per il reset della password inviata!' })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Errore durante l\'invio dell\'email' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Il Mio Profilo</h1>
                    <p className={styles.subtitle}>Gestisci le tue informazioni personali</p>
                </div>
            </div>

            {message && (
                <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.grid}>
                <form onSubmit={handleSubmit} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Informazioni Personali</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.formGroup}>
                            <label htmlFor="nome" className={styles.label}>Nome</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Il tuo nome"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="cognome" className={styles.label}>Cognome</label>
                            <input
                                type="text"
                                id="cognome"
                                name="cognome"
                                value={formData.cognome}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Il tuo cognome"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className={`${styles.input} ${styles.inputDisabled}`}
                            />
                            <span className={styles.hint}>L'email non può essere modificata</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="ruolo" className={styles.label}>Ruolo</label>
                            <input
                                type="text"
                                id="ruolo"
                                name="ruolo"
                                value={formData.ruolo === 'admin' ? 'Amministratore' : 'Operatore'}
                                disabled
                                className={`${styles.input} ${styles.inputDisabled}`}
                            />
                            <span className={styles.hint}>Il ruolo può essere modificato solo dall'amministratore</span>
                        </div>
                    </div>
                    <div className={styles.cardFooter}>
                        <button type="submit" className={styles.btnPrimary} disabled={saving}>
                            {saving ? 'Salvataggio...' : '💾 Salva Modifiche'}
                        </button>
                    </div>
                </form>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>Sicurezza</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <p className={styles.text}>
                            Per modificare la tua password, clicca sul pulsante qui sotto. 
                            Riceverai un'email con le istruzioni per impostare una nuova password.
                        </p>
                    </div>
                    <div className={styles.cardFooter}>
                        <button 
                            onClick={handlePasswordChange} 
                            className={styles.btnOutline}
                            disabled={loading}
                        >
                            {loading ? 'Invio...' : '🔐 Cambia Password'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

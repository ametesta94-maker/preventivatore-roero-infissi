'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validazione
        if (formData.password !== formData.confirmPassword) {
            setError('Le password non coincidono')
            return
        }

        if (formData.password.length < 6) {
            setError('La password deve essere di almeno 6 caratteri')
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()

            // Registrazione utente
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nome: formData.nome,
                        cognome: formData.cognome,
                    }
                }
            })

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('Questa email è già registrata')
                } else {
                    setError(signUpError.message)
                }
                return
            }

            if (data.user) {
                // Inserisci profilo
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: formData.email,
                        nome: formData.nome,
                        cognome: formData.cognome,
                        ruolo: 'operatore',
                        attivo: true,
                    })

                if (profileError) {
                    console.error('Profile error:', profileError)
                }

                setSuccess(true)

                // Se l'utente è già confermato (email confirmation disabilitata)
                if (data.session) {
                    router.push('/dashboard')
                    router.refresh()
                }
            }
        } catch {
            setError('Si è verificato un errore. Riprova.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successMessage}>
                        <span className={styles.successIcon}>✅</span>
                        <h2>Registrazione completata!</h2>
                        <p>
                            Controlla la tua email per confermare l&apos;account,
                            oppure <Link href="/login">accedi ora</Link> se la conferma email è disabilitata.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect x="10" y="10" width="80" height="80" rx="8" fill="#1B4F72" />
                            <rect x="20" y="20" width="25" height="60" rx="4" fill="#00A9CE" />
                            <rect x="55" y="20" width="25" height="60" rx="4" fill="#00A9CE" />
                            <circle cx="38" cy="50" r="4" fill="#C9A227" />
                            <circle cx="62" cy="50" r="4" fill="#C9A227" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Registrati</h1>
                    <p className={styles.subtitle}>Crea il tuo account</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.row}>
                        <div className="form-group">
                            <label htmlFor="nome" className="form-label required">
                                Nome
                            </label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                className="form-input"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Mario"
                                required
                                autoComplete="given-name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="cognome" className="form-label required">
                                Cognome
                            </label>
                            <input
                                type="text"
                                id="cognome"
                                name="cognome"
                                className="form-input"
                                value={formData.cognome}
                                onChange={handleChange}
                                placeholder="Rossi"
                                required
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label required">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="nome@esempio.it"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label required">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimo 6 caratteri"
                            required
                            autoComplete="new-password"
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label required">
                            Conferma Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="form-input"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Ripeti la password"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: 16, height: 16 }} />
                                Registrazione in corso...
                            </>
                        ) : (
                            'Registrati'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Hai già un account?{' '}
                        <Link href="/login">Accedi</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

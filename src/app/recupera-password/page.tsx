'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function RecuperaPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage(null)
        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/aggiorna-password`,
            })

            if (error) {
                setError(error.message)
                return
            }

            setMessage('Ti abbiamo inviato un\'email con le istruzioni per reimpostare la password.')
            setEmail('')
        } catch {
            setError('Si è verificato un errore. Riprova.')
        } finally {
            setLoading(false)
        }
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
                    <h1 className={styles.title}>Recupera Password</h1>
                    <p className={styles.subtitle}>
                        Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className={styles.success}>
                            {message}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email" className="form-label required">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nome@esempio.it"
                            required
                            autoComplete="email"
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
                                Invio in corso...
                            </>
                        ) : (
                            'Invia istruzioni'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        <Link href="/login">← Torna al login</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './page.module.css'

const ERROR_MESSAGES: Record<string, string> = {
    sessione_scaduta: 'Sessione scaduta. Accedi di nuovo per continuare.',
}

function LoginContent() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlError = searchParams.get('error')
    const urlErrorMessage = urlError ? (ERROR_MESSAGES[urlError] ?? 'Errore di accesso. Riprova.') : null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const data = await res.json()

            if (!res.ok || !data.ok) {
                setError(data.error || 'Credenziali non valide')
                return
            }

            // Se c'è un 'next' che punta al CRM, redirect lì dopo il login
            const next = searchParams.get('next')
            if (next && /^https?:\/\/(localhost|127\.0\.0\.1):5000(\/|$)/.test(next)) {
                const crmNext = new URL(next)
                const after = `${crmNext.pathname}${crmNext.search}${crmNext.hash}`
                window.location.replace(`/api/sso/to-crm?after=${encodeURIComponent(after)}`)
                return
            }

            router.push('/dashboard')
            router.refresh()
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
                    <h1 className={styles.title}>Accedi</h1>
                    <p className={styles.subtitle}>Inserisci le tue credenziali per accedere</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {(error || urlErrorMessage) && (
                        <div className={styles.error}>
                            {error ?? urlErrorMessage}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username" className="form-label required">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="es. amministrazione"
                            required
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label required">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
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
                                Accesso in corso...
                            </>
                        ) : (
                            'Accedi'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className={styles.container} />}>
            <LoginContent />
        </Suspense>
    )
}

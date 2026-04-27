'use client'

import { useState } from 'react'
import JSZip from 'jszip'

interface Document {
    file_url: string
    document_name: string
    document_type: string
}

interface DownloadAllButtonProps {
    documents: Document[]
    orderNumber: string
}

export default function DownloadAllButton({ documents, orderNumber }: DownloadAllButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleDownloadAll = async () => {
        if (documents.length === 0) return
        setLoading(true)
        try {
            const zip = new JSZip()
            await Promise.all(
                documents.map(async (doc) => {
                    const response = await fetch(doc.file_url)
                    const blob = await response.blob()
                    const filename = `${orderNumber}_${doc.document_type}.pdf`
                    zip.file(filename, blob)
                })
            )
            const zipBlob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(zipBlob)
            const a = window.document.createElement('a')
            a.href = url
            a.download = `${orderNumber}_documenti.zip`
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            // Fallback: apri i PDF singolarmente
            for (const doc of documents) {
                window.open(doc.file_url, '_blank')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownloadAll}
            disabled={loading}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: 'var(--color-text)',
                opacity: loading ? 0.7 : 1,
            }}
        >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {loading ? 'Preparazione ZIP...' : 'Scarica tutti (ZIP)'}
        </button>
    )
}

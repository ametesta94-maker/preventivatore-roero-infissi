'use client'

import Link from 'next/link'
import { Printer, Edit, Download, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

interface QuoteActionsProps {
    quoteId: string
}

export default function QuoteActions({ quoteId }: QuoteActionsProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true)
            const response = await fetch(`/api/preventivi/${quoteId}/pdf`)

            if (!response.ok) {
                const error = await response.json()
                console.error('PDF download error:', error)
                alert(`Errore durante il download del PDF: ${error.details || error.error}`)
                return
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Preventivo_${quoteId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('PDF download failed:', error)
            alert('Errore durante il download del PDF')
        } finally {
            setIsDownloading(false)
        }
    }
    return (
        <div className="flex gap-2 mb-4 no-print" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <Link
                href="/preventivi"
                className="btn btn-outline flex items-center gap-2"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #ccc', background: 'white', borderRadius: '4px', textDecoration: 'none', color: '#333' }}
            >
                <ArrowLeft size={16} />
                Indietro
            </Link>
            <button
                onClick={() => window.print()}
                className="btn btn-primary flex items-center gap-2"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#333', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
                <Printer size={16} />
                Stampa
            </button>

            <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="btn btn-secondary flex items-center gap-2"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isDownloading ? '#ccc' : '#00A9CE', color: 'white', borderRadius: '4px', border: 'none', cursor: isDownloading ? 'not-allowed' : 'pointer' }}
            >
                <Download size={16} />
                {isDownloading ? 'Download...' : 'Scarica PDF'}
            </button>

            {/* 
        For now, we link to the edit page. 
        Note: The edit page needs to be implemented. 
        Ideally it should be /preventivi/[id]/modifica 
      */}
            <Link
                href={`/preventivi/${quoteId}/modifica`}
                className="btn btn-outline flex items-center gap-2"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #ccc', background: 'white', borderRadius: '4px', textDecoration: 'none', color: '#333' }}
            >
                <Edit size={16} />
                Modifica
            </Link>
        </div>
    )
}

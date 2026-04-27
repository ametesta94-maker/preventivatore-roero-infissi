'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'
import Image from 'next/image'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), { ssr: false })

// ── Types ──────────────────────────────────────────────────────────────────────
interface Impostazioni {
    id: string
    nome_azienda: string
    indirizzo_azienda: string | null
    citta_azienda: string | null
    cap_azienda: string | null
    provincia_azienda: string | null
    partita_iva: string | null
    codice_fiscale: string | null
    telefono: string | null
    email: string | null
    pec: string | null
    sito_web: string | null
    iban: string | null
    banca: string | null
    condizioni_pagamento_standard: string | null
    validita_preventivo_giorni: number
    prefisso_preventivo: string | null
    termini_condizioni: string | null
    note_pie_pagina: string | null
    informativa_privacy: string | null
    dichiarazione_iva_agevolata: string | null
    testo_condizioni_pagamento_doc: string | null
    testo_iva_agevolata_doc: string | null
    testo_atto_notorio: string | null
    testo_scheda_enea: string | null
    logo_url: string | null
    testo_condizioni_vendita: string | null
    testo_informativa_privacy: string | null
}

interface AliquotaIva {
    id: string
    nome: string
    percentuale: number
    descrizione: string | null
    richiede_dichiarazione: boolean
    ordine: number
    attiva: boolean
    is_combined: boolean
    rate_secondary: number | null
}

interface PaymentMethod {
    id: string
    name: string
    description: string | null
    is_active: boolean
    sort_order: number
    created_at: string
    updated_at: string
}

type Tab = 'azienda' | 'iva' | 'pagamento' | 'documenti'

// ── Component ──────────────────────────────────────────────────────────────────
export default function ImpostazioniPage() {
    const [activeTab, setActiveTab] = useState<Tab>('azienda')

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>⚙️ Impostazioni</h1>
                    <p className={styles.subtitle}>Configurazione aziendale e parametri di sistema</p>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={activeTab === 'azienda' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('azienda')}
                >
                    🏢 Dati Azienda
                </button>
                <button
                    className={activeTab === 'iva' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('iva')}
                >
                    💰 Aliquote IVA
                </button>
                <button
                    className={activeTab === 'pagamento' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('pagamento')}
                >
                    💳 Modalità Pagamento
                </button>
                <button
                    className={activeTab === 'documenti' ? styles.tabActive : styles.tab}
                    onClick={() => setActiveTab('documenti')}
                >
                    Documenti Ordine
                </button>
            </div>

            {(activeTab === 'azienda' || activeTab === 'documenti') && <AziendaTab activeTab={activeTab} />}
            {activeTab === 'iva' && <AliquoteIvaTab />}
            {activeTab === 'pagamento' && <PagamentoTab />}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AZIENDA TAB
// ═══════════════════════════════════════════════════════════════════════════════
function AziendaTab({ activeTab }: { activeTab: 'azienda' | 'documenti' }) {
    const [data, setData] = useState<Impostazioni | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const load = useCallback(async () => {
        const supabase = createClient()
        const { data: rows, error } = await supabase
            .from('impostazioni')
            .select('*')
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') {
            setMessage({ type: 'error', text: `Errore caricamento: ${error.message}` })
        }
        if (rows) setData(rows as Impostazioni)
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!data) return
        const value = e.target.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value
        setData({ ...data, [e.target.name]: value })
    }

    const handleFieldChange = (field: string, value: string) => {
        setData(prev => prev ? { ...prev, [field]: value } : prev)
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]

        setUploading(true)
        setMessage(null)

        try {
            // Create FormData
            const formData = new FormData()
            formData.append('file', file)

            // Upload via API
            const response = await fetch('/api/upload/logo', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed')
            }

            // Update state with the new logo URL
            if (data) {
                setData({ ...data, logo_url: result.url })
            }

            setMessage({ type: 'success', text: 'Logo caricato con successo! Ricorda di salvare.' })

        } catch (error: any) {
            setMessage({ type: 'error', text: `Errore caricamento logo: ${error.message}` })
        } finally {
            setUploading(false)
        }
    }

    const handleSave = async () => {
        if (!data) return
        setSaving(true)
        setMessage(null)

        const supabase = createClient()
        const { id, ...updateData } = data
        const { error } = await supabase
            .from('impostazioni')
            .update(updateData)
            .eq('id', id)

        if (error) {
            setMessage({ type: 'error', text: `Errore salvataggio: ${error.message}` })
        } else {
            setMessage({ type: 'success', text: 'Impostazioni salvate con successo!' })
        }
        setSaving(false)
    }

    if (loading) return <div className={styles.emptyState}>Caricamento...</div>
    if (!data) return <div className={styles.emptyState}>Nessuna impostazione trovata. Contatta l&apos;amministratore.</div>

    return (
        <div>
            {message && (
                <div className={message.type === 'success' ? styles.success : styles.error}>
                    {message.text}
                </div>
            )}

            {activeTab === 'azienda' && (
            <div className="card">
                <div className="card-body">
                    <div className={styles.formGrid}>
                        <h4 className={styles.sectionTitle}>Logo Azienda</h4>

                        <div className={`form-group ${styles.formGridFull}`}>
                            <div className={styles.logoUploadContainer}>
                                {data.logo_url ? (
                                    <div className={styles.logoPreview}>
                                        <Image
                                            src={data.logo_url}
                                            alt="Logo Azienda"
                                            width={150}
                                            height={150}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.logoPlaceholder}>
                                        Nessun logo
                                    </div>
                                )}

                                <div className={styles.uploadActions}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleLogoUpload}
                                        accept="image/png, image/jpeg, image/svg+xml"
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Caricamento...' : '📤 Carica Logo'}
                                    </button>
                                    <p className={styles.helpText}>Formati supportati: PNG, JPG, SVG. Max 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <h4 className={styles.sectionTitle}>Anagrafica Azienda</h4>

                        <div className="form-group">
                            <label className="form-label required">Nome Azienda</label>
                            <input className="form-input" name="nome_azienda" value={data.nome_azienda} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Partita IVA</label>
                            <input className="form-input" name="partita_iva" value={data.partita_iva || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Codice Fiscale</label>
                            <input className="form-input" name="codice_fiscale" value={data.codice_fiscale || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Indirizzo</label>
                            <input className="form-input" name="indirizzo_azienda" value={data.indirizzo_azienda || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Città</label>
                            <input className="form-input" name="citta_azienda" value={data.citta_azienda || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">CAP</label>
                            <input className="form-input" name="cap_azienda" value={data.cap_azienda || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Provincia</label>
                            <input className="form-input" name="provincia_azienda" value={data.provincia_azienda || ''} onChange={handleChange} />
                        </div>

                        <h4 className={styles.sectionTitle}>Contatti</h4>

                        <div className="form-group">
                            <label className="form-label">Telefono</label>
                            <input className="form-input" name="telefono" value={data.telefono || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" name="email" type="email" value={data.email || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">PEC</label>
                            <input className="form-input" name="pec" value={data.pec || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sito Web</label>
                            <input className="form-input" name="sito_web" value={data.sito_web || ''} onChange={handleChange} />
                        </div>

                        <h4 className={styles.sectionTitle}>Dati Bancari</h4>

                        <div className="form-group">
                            <label className="form-label">IBAN</label>
                            <input className="form-input" name="iban" value={data.iban || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Banca</label>
                            <input className="form-input" name="banca" value={data.banca || ''} onChange={handleChange} />
                        </div>

                        <h4 className={styles.sectionTitle}>Preventivi</h4>

                        <div className="form-group">
                            <label className="form-label">Prefisso Numero Preventivo</label>
                            <input className="form-input" name="prefisso_preventivo" value={data.prefisso_preventivo || ''} onChange={handleChange} placeholder="es. PRV" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Validità Preventivo (giorni)</label>
                            <input className="form-input" name="validita_preventivo_giorni" type="number" value={data.validita_preventivo_giorni} onChange={handleChange} min={1} />
                        </div>

                        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>
                            Testi Documenti Preventivo
                        </h3>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Condizioni Generali di Vendita</label>
                            <RichTextEditor
                                content={data?.testo_condizioni_vendita || ''}
                                onChange={(html: string) => handleFieldChange('testo_condizioni_vendita', html)}
                                variables={['{{modalita_pagamento}}']}
                                placeholder="Inserisci le condizioni generali di vendita..."
                            />
                            <span className={styles.formHint}>Usa {'{{modalita_pagamento}}'} per inserire la modalità di pagamento selezionata.</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Testo Informativa Privacy</label>
                            <RichTextEditor
                                content={data?.testo_informativa_privacy || ''}
                                onChange={(html: string) => handleFieldChange('testo_informativa_privacy', html)}
                                variables={['{{nome_cliente}}', '{{indirizzo_cliente}}', '{{telefono_cliente}}', '{{codice_fiscale}}', '{{partita_iva}}', '{{aliquota_iva}}']}
                                placeholder="Inserisci il testo dell'informativa privacy..."
                            />
                            <span className={styles.formHint}>Le variabili verranno sostituite con i dati del cliente nel preventivo.</span>
                        </div>
                    </div>

                    <div className={styles.saveBar}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Salvataggio...' : '💾 Salva Impostazioni'}
                        </button>
                    </div>
                </div>
            </div>
            )}

            {activeTab === 'documenti' && (
                <div className={styles.tabContent}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                        Testi Documenti Ordine
                    </h3>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                        I testi inseriti qui verranno utilizzati nella generazione dei documenti PDF dell&apos;ordine.
                        Le variabili tra doppie graffe verranno sostituite automaticamente.
                    </p>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Condizioni di Pagamento</label>
                        <RichTextEditor
                            content={data?.testo_condizioni_pagamento_doc || ''}
                            onChange={(html: string) => handleFieldChange('testo_condizioni_pagamento_doc', html)}
                            variables={['{{modalita_pagamento}}', '{{nome_cliente}}', '{{numero_preventivo}}']}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Dichiarazione IVA Agevolata</label>
                        <RichTextEditor
                            content={data?.testo_iva_agevolata_doc || ''}
                            onChange={(html: string) => handleFieldChange('testo_iva_agevolata_doc', html)}
                            variables={['{{nome_cliente}}', '{{indirizzo_sede}}', '{{numero_preventivo}}']}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Atto Notorio</label>
                        <RichTextEditor
                            content={data?.testo_atto_notorio || ''}
                            onChange={(html: string) => handleFieldChange('testo_atto_notorio', html)}
                            variables={['{{nome_cliente}}', '{{codice_fiscale}}', '{{tipo_detrazione}}', '{{indirizzo_sede}}']}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Scheda ENEA</label>
                        <RichTextEditor
                            content={data?.testo_scheda_enea || ''}
                            onChange={(html: string) => handleFieldChange('testo_scheda_enea', html)}
                            variables={['{{nome_cliente}}', '{{indirizzo_sede}}', '{{codice_fiscale}}']}
                        />
                    </div>

                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
                    </button>
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ALIQUOTE IVA TAB
// ═══════════════════════════════════════════════════════════════════════════════
function AliquoteIvaTab() {
    const [aliquote, setAliquote] = useState<AliquotaIva[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        nome: '',
        percentuale: 0,
        descrizione: '',
        richiede_dichiarazione: false,
        ordine: 0,
        is_combined: false,
        rate_secondary: 0,
    })

    const load = useCallback(async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('aliquote_iva')
            .select('*')
            .order('ordine')

        if (error) {
            setMessage({ type: 'error', text: `Errore: ${error.message}` })
        }
        if (data) setAliquote(data as AliquotaIva[])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const resetForm = () => {
        setFormData({ nome: '', percentuale: 0, descrizione: '', richiede_dichiarazione: false, ordine: 0, is_combined: false, rate_secondary: 0 })
        setEditingId(null)
        setShowForm(false)
    }

    const handleEdit = (a: AliquotaIva) => {
        setFormData({
            nome: a.nome,
            percentuale: a.percentuale,
            descrizione: a.descrizione || '',
            richiede_dichiarazione: a.richiede_dichiarazione,
            ordine: a.ordine,
            is_combined: a.is_combined || false,
            rate_secondary: a.rate_secondary || 0,
        })
        setEditingId(a.id)
        setShowForm(true)
    }

    const handleSave = async () => {
        const supabase = createClient()
        setMessage(null)

        const payload = {
            nome: formData.nome,
            percentuale: formData.percentuale,
            descrizione: formData.descrizione || null,
            richiede_dichiarazione: formData.richiede_dichiarazione,
            ordine: formData.ordine,
            is_combined: formData.is_combined,
            rate_secondary: formData.is_combined ? (formData.rate_secondary || null) : null,
        }

        if (editingId) {
            const { error } = await supabase
                .from('aliquote_iva')
                .update(payload)
                .eq('id', editingId)

            if (error) {
                setMessage({ type: 'error', text: `Errore: ${error.message}` })
                return
            }
            setMessage({ type: 'success', text: 'Aliquota aggiornata!' })
        } else {
            const { error } = await supabase
                .from('aliquote_iva')
                .insert(payload)

            if (error) {
                setMessage({ type: 'error', text: `Errore: ${error.message}` })
                return
            }
            setMessage({ type: 'success', text: 'Aliquota creata!' })
        }

        resetForm()
        load()
    }

    const handleToggleActive = async (a: AliquotaIva) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('aliquote_iva')
            .update({ attiva: !a.attiva })
            .eq('id', a.id)

        if (error) {
            setMessage({ type: 'error', text: `Errore: ${error.message}` })
            return
        }
        load()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Sei sicuro di voler eliminare questa aliquota? Questa operazione non può essere annullata.')) return

        const supabase = createClient()

        // Prima verifica se l'aliquota è usata in preventivi
        const { data: preventiviUsed, error: checkError } = await supabase
            .from('preventivi')
            .select('id')
            .eq('aliquota_iva_id', id)
            .limit(1)

        if (checkError) {
            setMessage({ type: 'error', text: `Errore verifica: ${checkError.message}` })
            return
        }

        if (preventiviUsed && preventiviUsed.length > 0) {
            setMessage({ type: 'error', text: 'Impossibile eliminare: questa aliquota è utilizzata in uno o più preventivi. Disattivala invece di eliminarla.' })
            return
        }

        const { data: deletedData, error, count } = await supabase
            .from('aliquote_iva')
            .delete()
            .eq('id', id)
            .select()

        console.log('Delete result:', { deletedData, error, count })

        if (error) {
            setMessage({ type: 'error', text: `Errore eliminazione: ${error.message}` })
            return
        }

        if (!deletedData || deletedData.length === 0) {
            setMessage({ type: 'error', text: 'Eliminazione fallita: nessuna riga eliminata. Potrebbe essere un problema di permessi (RLS).' })
            return
        }

        setMessage({ type: 'success', text: 'Aliquota eliminata con successo!' })
        load()
    }

    if (loading) return <div className={styles.emptyState}>Caricamento...</div>

    return (
        <div>
            {message && (
                <div className={message.type === 'success' ? styles.success : styles.error}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div className={styles.ivaHeader}>
                        <h3>Aliquote IVA</h3>
                        {!showForm && (
                            <button
                                className="btn btn-primary"
                                onClick={() => { resetForm(); setShowForm(true) }}
                            >
                                ➕ Nuova Aliquota
                            </button>
                        )}
                    </div>

                    {aliquote.length > 0 ? (
                        <table className={styles.ivaTable}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Percentuale</th>
                                    <th>Descrizione</th>
                                    <th>Dichiarazione</th>
                                    <th>Stato</th>
                                    <th>Ordine</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {aliquote.map((a) => (
                                    <tr key={a.id}>
                                        <td><strong>{a.nome}</strong></td>
                                        <td className={styles.percentage}>
                                            {a.is_combined && a.rate_secondary
                                                ? `${a.percentuale}% + ${a.rate_secondary}%`
                                                : `${a.percentuale}%`}
                                        </td>
                                        <td>{a.descrizione || '—'}</td>
                                        <td>{a.richiede_dichiarazione ? '✅ Sì' : '—'}</td>
                                        <td>
                                            <label className={styles.toggle}>
                                                <input
                                                    type="checkbox"
                                                    checked={a.attiva}
                                                    onChange={() => handleToggleActive(a)}
                                                />
                                                <span className={styles.toggleSlider}></span>
                                            </label>
                                        </td>
                                        <td>{a.ordine}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.btnIcon} onClick={() => handleEdit(a)} title="Modifica">
                                                    ✏️
                                                </button>
                                                <button className={styles.btnIconDanger} onClick={() => handleDelete(a.id)} title="Elimina">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Nessuna aliquota IVA configurata</p>
                        </div>
                    )}

                    {/* Inline form */}
                    {showForm && (
                        <div className={styles.ivaForm}>
                            <h4>{editingId ? '✏️ Modifica Aliquota' : '➕ Nuova Aliquota'}</h4>
                            <div className={styles.ivaFormGrid}>
                                <div className="form-group">
                                    <label className="form-label required">Nome</label>
                                    <input
                                        className="form-input"
                                        value={formData.nome}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                        placeholder="es. IVA 22%"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <div className={styles.checkboxGroup} style={{ marginBottom: '8px' }}>
                                        <input
                                            type="checkbox"
                                            id="is_combined"
                                            checked={formData.is_combined}
                                            onChange={(e) => setFormData(prev => ({ ...prev, is_combined: e.target.checked }))}
                                        />
                                        <label htmlFor="is_combined">Aliquota combinata (es. 10% + 22%)</label>
                                    </div>
                                    <label className="form-label required">
                                        {formData.is_combined ? 'Aliquota 1 (%)' : 'Percentuale (%)'}
                                    </label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        value={formData.percentuale}
                                        onChange={(e) => setFormData(prev => ({ ...prev, percentuale: parseFloat(e.target.value) || 0 }))}
                                        min={0}
                                        max={100}
                                        step={0.01}
                                        required
                                    />
                                    {formData.is_combined && (
                                        <>
                                            <label className="form-label required" style={{ marginTop: '8px' }}>Aliquota 2 (%)</label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                value={formData.rate_secondary}
                                                onChange={(e) => setFormData(prev => ({ ...prev, rate_secondary: parseFloat(e.target.value) || 0 }))}
                                                min={0}
                                                max={100}
                                                step={0.01}
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ordine</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        value={formData.ordine}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ordine: parseInt(e.target.value) || 0 }))}
                                        min={0}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Descrizione</label>
                                    <input
                                        className="form-input"
                                        value={formData.descrizione}
                                        onChange={(e) => setFormData(prev => ({ ...prev, descrizione: e.target.value }))}
                                        placeholder="es. Aliquota ordinaria"
                                    />
                                </div>
                                <div className="form-group">
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            id="richiede_dichiarazione"
                                            checked={formData.richiede_dichiarazione}
                                            onChange={(e) => setFormData(prev => ({ ...prev, richiede_dichiarazione: e.target.checked }))}
                                        />
                                        <label htmlFor="richiede_dichiarazione">Richiede Dichiarazione</label>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.ivaFormActions}>
                                <button className="btn btn-outline" onClick={resetForm}>
                                    Annulla
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {editingId ? 'Aggiorna' : 'Crea Aliquota'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MODALITÀ PAGAMENTO TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PagamentoTab() {
    const [methods, setMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sort_order: 0,
    })

    const load = useCallback(async () => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .order('sort_order')

        if (error) {
            setMessage({ type: 'error', text: `Errore: ${error.message}` })
        }
        if (data) setMethods(data as PaymentMethod[])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const resetForm = () => {
        setFormData({ name: '', description: '', sort_order: 0 })
        setEditingId(null)
        setShowForm(false)
    }

    const handleEdit = (m: PaymentMethod) => {
        setFormData({
            name: m.name,
            description: m.description || '',
            sort_order: m.sort_order,
        })
        setEditingId(m.id)
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'Il nome è obbligatorio' })
            return
        }

        const supabase = createClient()
        setMessage(null)

        if (editingId) {
            const { error } = await supabase
                .from('payment_methods')
                .update({
                    name: formData.name,
                    description: formData.description || null,
                    sort_order: formData.sort_order,
                })
                .eq('id', editingId)

            if (error) {
                setMessage({ type: 'error', text: `Errore: ${error.message}` })
                return
            }
            setMessage({ type: 'success', text: 'Modalità aggiornata!' })
        } else {
            const { error } = await supabase
                .from('payment_methods')
                .insert({
                    name: formData.name,
                    description: formData.description || null,
                    sort_order: formData.sort_order,
                })

            if (error) {
                setMessage({ type: 'error', text: `Errore: ${error.message}` })
                return
            }
            setMessage({ type: 'success', text: 'Modalità di pagamento creata!' })
        }

        resetForm()
        load()
    }

    const handleToggleActive = async (m: PaymentMethod) => {
        const supabase = createClient()
        const { error } = await supabase
            .from('payment_methods')
            .update({ is_active: !m.is_active })
            .eq('id', m.id)

        if (error) {
            setMessage({ type: 'error', text: `Errore: ${error.message}` })
            return
        }
        load()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Sei sicuro di voler eliminare questa modalità di pagamento?')) return

        const supabase = createClient()

        // Check if used in quotes
        const { data: quotesUsed, error: checkError } = await supabase
            .from('preventivi')
            .select('id')
            .eq('payment_method_id', id)
            .limit(1)

        if (checkError) {
            setMessage({ type: 'error', text: `Errore verifica: ${checkError.message}` })
            return
        }

        if (quotesUsed && quotesUsed.length > 0) {
            setMessage({ type: 'error', text: 'Impossibile eliminare: questa modalità è usata in uno o più preventivi. Disattivala invece.' })
            return
        }

        const { data: deletedData, error } = await supabase
            .from('payment_methods')
            .delete()
            .eq('id', id)
            .select()

        if (error) {
            setMessage({ type: 'error', text: `Errore eliminazione: ${error.message}` })
            return
        }

        if (!deletedData || deletedData.length === 0) {
            setMessage({ type: 'error', text: 'Eliminazione fallita: nessuna riga eliminata. Potrebbe essere un problema di permessi (RLS).' })
            return
        }

        setMessage({ type: 'success', text: 'Modalità eliminata con successo!' })
        load()
    }

    if (loading) return <div className={styles.emptyState}>Caricamento...</div>

    return (
        <div>
            {message && (
                <div className={message.type === 'success' ? styles.success : styles.error}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div className={styles.ivaHeader}>
                        <h3>Modalità di Pagamento</h3>
                        {!showForm && (
                            <button
                                className="btn btn-primary"
                                onClick={() => { resetForm(); setShowForm(true) }}
                            >
                                ➕ Nuova Modalità
                            </button>
                        )}
                    </div>

                    {methods.length > 0 ? (
                        <table className={styles.ivaTable}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Descrizione</th>
                                    <th>Stato</th>
                                    <th>Ordine</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {methods.map((m) => (
                                    <tr key={m.id}>
                                        <td><strong>{m.name}</strong></td>
                                        <td>{m.description || '—'}</td>
                                        <td>
                                            <label className={styles.toggle}>
                                                <input
                                                    type="checkbox"
                                                    checked={m.is_active}
                                                    onChange={() => handleToggleActive(m)}
                                                />
                                                <span className={styles.toggleSlider}></span>
                                            </label>
                                        </td>
                                        <td>{m.sort_order}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.btnIcon} onClick={() => handleEdit(m)} title="Modifica">
                                                    ✏️
                                                </button>
                                                <button className={styles.btnIconDanger} onClick={() => handleDelete(m.id)} title="Elimina">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Nessuna modalità di pagamento configurata</p>
                        </div>
                    )}

                    {/* Inline form */}
                    {showForm && (
                        <div className={styles.ivaForm}>
                            <h4>{editingId ? '✏️ Modifica Modalità' : '➕ Nuova Modalità di Pagamento'}</h4>
                            <div className={styles.ivaFormGrid}>
                                <div className="form-group">
                                    <label className="form-label required">Nome</label>
                                    <input
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="es. 50% all'ordine + 50% fine lavori"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ordine</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                                        min={0}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Descrizione</label>
                                    <textarea
                                        className="form-input"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Descrizione dettagliata della modalità di pagamento..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className={styles.ivaFormActions}>
                                <button className="btn btn-outline" onClick={resetForm}>
                                    Annulla
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    {editingId ? 'Aggiorna' : 'Crea Modalità'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

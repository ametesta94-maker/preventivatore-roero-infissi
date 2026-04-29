import { Tables } from '@/types/database'
import styles from './QuoteDocument.module.css'
import QuoteActions from './QuoteActions'

type PreventivoWithRelations = Omit<Tables<'preventivi'>, 'payment_methods'> & {
    clienti: Tables<'clienti'> | null
    sedi: Tables<'sedi'> | null
    aliquote_iva: Tables<'aliquote_iva'> | null
    payment_methods: { name: string } | null
}

type SectionWithCategory = Tables<'quote_sections'> & {
    categories: (Tables<'categories'> & { image_url?: string | null; description_template?: string | null }) | null
}

type SectionOptionWithDetails = Tables<'quote_section_options'> & {
    category_options: Tables<'category_options'> | null
    category_option_values: Tables<'category_option_values'> | null
}

type RigaWithProduct = Tables<'righe_preventivo'> & {
    prodotti: Tables<'prodotti'> | null
}

type ItemOptionWithDetails = Tables<'quote_item_options'> & {
    category_options: Tables<'category_options'> | null
    category_option_values: Tables<'category_option_values'> | null
}

type QuoteServiceWithDetails = {
    id: string
    custom_name?: string | null
    description?: string | null
    unit_price: number
    quantity: number
    notes?: string | null
    services: { name: string } | null
}

interface QuoteDocumentProps {
    preventivo: PreventivoWithRelations
    sections: SectionWithCategory[]
    sectionOptions: SectionOptionWithDetails[]
    righe: RigaWithProduct[]
    itemOptions: ItemOptionWithDetails[]
    azienda: Tables<'impostazioni'> | null
    quoteServices: QuoteServiceWithDetails[]
}

/**
 * Resolves a description_template by replacing {{option_key}} placeholders
 * with the actual option values selected for that section/position.
 * Supports conditional blocks: {{#if key=value}}content{{/if}}
 * Also accepts item-level options for position-based conditions (e.g. modello).
 * Additionally replaces legacy patterns like "(modello da scegliere)" with the
 * actual selected model value.
 */
const resolveDescriptionTemplate = (
    template: string,
    sectionOpts: SectionOptionWithDetails[],
    itemOpts?: ItemOptionWithDetails[]
): string => {
    if (!template) return ''

    // Build an option value lookup from section + item options
    const optionValues: Record<string, string> = {}
    // Also build a lookup using value_key for conditional matching
    const optionValueKeys: Record<string, string> = {}
    for (const opt of sectionOpts) {
        const key = (opt.category_options as any)?.option_key
        if (!key) continue
        const displayValue = getOptionDisplayValue(opt, opt.category_option_values)
        const valueKey = (opt.category_option_values as any)?.value_key
        if (displayValue) optionValues[key] = displayValue
        if (valueKey) optionValueKeys[key] = valueKey
    }
    // Item-level options override section-level for conditional matching
    if (itemOpts) {
        for (const opt of itemOpts) {
            const key = (opt.category_options as any)?.option_key
            if (!key) continue
            const displayValue = getOptionDisplayValue(opt, opt.category_option_values)
            const valueKey = (opt.category_option_values as any)?.value_key
            // Item options override section options
            if (valueKey) optionValueKeys[key] = valueKey
            if (displayValue) optionValues[key] = displayValue
        }
    }

    let resolved = template

    // Process conditional blocks: {{#if key=value}}content{{/if}}
    resolved = resolved.replace(
        /\{\{#if\s+(\w+)=(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
        (_match, condKey: string, condValue: string, content: string) => {
            // Use value_key for conditional matching (more reliable than display label)
            const actualValue = optionValueKeys[condKey] || optionValues[condKey] || ''
            return actualValue.toLowerCase() === condValue.toLowerCase() ? content : ''
        }
    )

    // Replace simple placeholders: {{key}}
    for (const [key, value] of Object.entries(optionValues)) {
        resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }

    // Replace legacy pattern "(modello da scegliere)" with actual model value
    const modelloValue = optionValues['modello'] || optionValues['modello_posizione'] || ''
    if (modelloValue) {
        resolved = resolved.replace(/\(modello da scegliere\)/gi, modelloValue)
    }

    // Clean up unreplaced placeholders
    resolved = resolved.replace(/\{\{[^}]+\}\}/g, '')
    // Clean up extra whitespace from removed conditional blocks
    resolved = resolved.replace(/\n{3,}/g, '\n\n')
    return resolved.trim()
}

const getOptionDisplayValue = (
    opt: { selected_boolean: boolean | null; selected_text: string | null },
    valInfo: Tables<'category_option_values'> | null
) => {
    if (opt.selected_boolean != null) return opt.selected_boolean ? 'Sì' : 'No'
    if (valInfo) return valInfo.value_label
    if (opt.selected_text) return opt.selected_text
    return ''
}

export default function QuoteDocument({
    preventivo,
    sections,
    sectionOptions,
    righe,
    itemOptions,
    azienda,
    quoteServices,
}: QuoteDocumentProps) {
    const fmt = (n: number) =>
        new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)

    const fmtDate = (d: string) => new Date(d).toLocaleDateString('it-IT')

    // Group options by section/riga
    const sectionOptionsMap = new Map<string, SectionOptionWithDetails[]>()
    for (const opt of sectionOptions) {
        const list = sectionOptionsMap.get(opt.quote_section_id) || []
        list.push(opt)
        sectionOptionsMap.set(opt.quote_section_id, list)
    }

    const itemOptionsMap = new Map<string, ItemOptionWithDetails[]>()
    for (const opt of itemOptions) {
        const list = itemOptionsMap.get(opt.riga_preventivo_id) || []
        list.push(opt)
        itemOptionsMap.set(opt.riga_preventivo_id, list)
    }

    // Group righe by section
    const righeBySection = new Map<string, RigaWithProduct[]>()
    for (const riga of righe) {
        const sectionId = riga.quote_section_id || '_nosection'
        const list = righeBySection.get(sectionId) || []
        list.push(riga)
        righeBySection.set(sectionId, list)
    }

    // Check if any product has an image
    const hasAnyImage = righe.some((r: RigaWithProduct) => r.prodotti?.immagine_url)

    // Flags
    const showGrandTotal = (preventivo as any).show_grand_total !== false
    const showIva = (preventivo as any).show_iva !== false

    // Use stored totals
    const totImponibile = preventivo.totale_imponibile || 0
    const totImponibileScontato = preventivo.totale_imponibile_scontato || totImponibile
    const totIva = preventivo.totale_iva || 0
    const totPreventivo = preventivo.totale_preventivo || 0
    const ivaPercent = preventivo.aliquote_iva?.percentuale ?? 22
    const hasGlobalDiscount = preventivo.sconto_globale_1 || preventivo.sconto_globale_2

    // IVA combinata
    const isCombined = preventivo.aliquote_iva?.is_combined === true
    const rateSecondary = preventivo.aliquote_iva?.rate_secondary ?? null
    const importoBeni = (preventivo as any).importo_beni_significativi || 0
    let ivaRidotta: number | null = null
    let ivaFull: number | null = null
    let baseRidotta: number | null = null
    let baseFull: number | null = null
    if (isCombined && rateSecondary != null && importoBeni > 0) {
        const beni = Math.min(importoBeni, totImponibileScontato)
        const altri = totImponibileScontato - beni
        const eccedenza = Math.max(0, beni - altri)
        baseFull = Math.round(eccedenza * 100) / 100
        baseRidotta = Math.round((totImponibileScontato - baseFull) * 100) / 100
        ivaFull = Math.round(baseFull * (rateSecondary / 100) * 100) / 100
        ivaRidotta = Math.round(baseRidotta * (ivaPercent / 100) * 100) / 100
    }

    // Payment
    const paymentMethodName = preventivo.payment_methods?.name || null
    const paymentNotes = (preventivo as any).payment_notes || null

    // Condizioni di vendita — sostituisci {{modalita_pagamento}}
    const rawCondizioni = (azienda as any)?.testo_condizioni_vendita || azienda?.termini_condizioni || ''
    const condizioniVendita = rawCondizioni.replace(
        /\{\{modalita_pagamento\}\}/g,
        paymentMethodName || '—'
    )
    const renderSectionOptions = (options: SectionOptionWithDetails[]) => {
        if (!options || options.length === 0) return null
        return (
            <div className={styles.sectionOptions}>
                {options.map((opt) => {
                    const displayValue = getOptionDisplayValue(opt, opt.category_option_values)
                    if (!displayValue) return null
                    return (
                        <div key={opt.id} className={styles.optionRow}>
                            <span className={styles.optionLabel}>{opt.category_options?.option_label}:</span>
                            <span className={styles.optionValue}>{displayValue}</span>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderItemOptions = (options: ItemOptionWithDetails[]) => {
        if (!options || options.length === 0) return null
        return options.map((opt) => {
            const displayValue = getOptionDisplayValue(opt, opt.category_option_values)
            if (!displayValue) return null
            return (
                <div key={opt.id} className={styles.descriptionDetail}>
                    {opt.category_options?.option_label}: {displayValue}
                </div>
            )
        })
    }

    return (
        <div className={styles.container}>
            {/* Action Buttons (Hidden when printing) */}
            <QuoteActions quoteId={preventivo.id} />

            {/* Header - Stile PDF */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    {azienda?.logo_url && (
                        <img
                            src={azienda.logo_url}
                            alt={azienda.nome_azienda}
                            className={styles.companyLogo}
                        />
                    )}
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.companyName}>{azienda?.nome_azienda || 'Nome Azienda'}</div>
                    <div className={styles.companyDetails}>
                        {azienda?.indirizzo_azienda}<br />
                        {azienda?.cap_azienda} {azienda?.citta_azienda} {azienda?.provincia_azienda && `(${azienda.provincia_azienda})`}<br />
                        {azienda?.partita_iva && <>P.IVA: {azienda.partita_iva}<br /></>}
                        {azienda?.codice_fiscale && <>C.F.: {azienda.codice_fiscale}<br /></>}
                        {azienda?.telefono && <>Tel: {azienda.telefono}<br /></>}
                        {azienda?.email && <>Email: {azienda.email}</>}
                    </div>
                </div>
            </div>

            {/* Quote Info & Client - Stile PDF */}
            <div className={styles.quoteInfo}>
                <div className={styles.quoteInfoLeft}>
                    <div className={styles.quoteTitle}>Preventivo #{preventivo.numero}</div>
                    <div className={styles.quoteMeta}>
                        <div><strong>Data:</strong> {fmtDate(preventivo.data_preventivo)}</div>
                        <div><strong>Valido fino al:</strong> {preventivo.data_validita ? fmtDate(preventivo.data_validita) : '-'}</div>
                    </div>
                </div>
                <div className={styles.quoteInfoRight}>
                    <div className={styles.customerLabel}>Spett.le Cliente:</div>
                    <div className={styles.customerName}>{preventivo.clienti?.ragione_sociale}</div>
                    <div className={styles.companyDetails}>
                        {preventivo.clienti?.indirizzo}<br />
                        {preventivo.clienti?.cap} {preventivo.clienti?.citta} {preventivo.clienti?.provincia && `(${preventivo.clienti.provincia})`}<br />
                        {preventivo.clienti?.partita_iva && <>P.IVA: {preventivo.clienti.partita_iva}<br /></>}
                        {preventivo.clienti?.codice_fiscale && <>C.F.: {preventivo.clienti.codice_fiscale}</>}
                    </div>
                </div>
            </div>

            {/* Destination site if present */}
            {preventivo.sedi && (
                <div style={{ marginBottom: 16, padding: 10, backgroundColor: '#f9fafb', borderRadius: 4 }}>
                    <div className={styles.customerLabel} style={{ fontWeight: 'bold' }}>Luogo di destinazione:</div>
                    <div className={styles.customerName}>{preventivo.sedi.nome_sede}</div>
                    <div className={styles.companyDetails}>
                        {preventivo.sedi.indirizzo} - {preventivo.sedi.citta} {preventivo.sedi.provincia && `(${preventivo.sedi.provincia})`}
                    </div>
                </div>
            )}

            {/* Sections & Items - Stile PDF */}
            {sections.map((section) => {
                const sOpts = sectionOptionsMap.get(section.id) || []
                const sRighe = righeBySection.get(section.id) || []
                const showLinePrices = (section as any).show_line_prices !== false

                // Description template (resolved per-position below)
                const descriptionTemplate = section.categories?.description_template

                // Category image
                const categoryImageUrl = section.categories?.image_url

                // Free description (sezione)
                const freeDescription = (section as any).free_description

                return (
                    <div key={section.id} className={styles.section}>
                        {/* Section header with optional category image */}
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionTitle}>{section.categories?.nome || 'Sezione'}</span>
                            {categoryImageUrl && (
                                <img
                                    src={categoryImageUrl}
                                    alt={section.categories?.nome || ''}
                                    className={styles.sectionCategoryImage}
                                />
                            )}
                        </div>

                        {/* Free description (entered manually per section) */}
                        {freeDescription && (
                            <div className={styles.sectionDescription}>
                                {freeDescription}
                            </div>
                        )}

                        {/* Section-level options */}
                        {sOpts.length > 0 && renderSectionOptions(sOpts)}

                        {/* Items table (respects show_line_prices) */}
                        {sRighe.length > 0 && (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.colPos}>#</th>
                                        {hasAnyImage && <th className={styles.colImage}></th>}
                                        <th className={
                                            !showLinePrices
                                                ? (hasAnyImage ? styles.colProdNoPriceWithImg : styles.colProdNoPriceNoImg)
                                                : (hasAnyImage ? styles.colProd : styles.colProdNoImg)
                                        }>Posizione</th>
                                        <th className={styles.colDims}>Dimensioni</th>
                                        <th className={styles.colQty}>Qtà</th>
                                        {showLinePrices && (
                                            <>
                                                <th className={styles.colPrice}>Prezzo Unit.</th>
                                                <th className={styles.colTotal}>Totale</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sRighe.map((riga) => {
                                        const rOpts = itemOptionsMap.get(riga.id) || []
                                        // Resolve description template per-position using this riga's options
                                        const rigaResolvedDescription = descriptionTemplate
                                            ? resolveDescriptionTemplate(descriptionTemplate, sOpts, rOpts)
                                            : ''
                                        return (
                                            <tr key={riga.id}>
                                                <td className={styles.colPos}>{riga.numero_riga}</td>
                                                {hasAnyImage && (
                                                    <td className={styles.colImage}>
                                                        {riga.prodotti?.immagine_url && (
                                                            <img
                                                                src={riga.prodotti.immagine_url}
                                                                alt={riga.prodotti.nome}
                                                                className={styles.productImage}
                                                            />
                                                        )}
                                                    </td>
                                                )}
                                                <td className={
                                                    !showLinePrices
                                                        ? (hasAnyImage ? styles.colProdNoPriceWithImg : styles.colProdNoPriceNoImg)
                                                        : (hasAnyImage ? styles.colProd : styles.colProdNoImg)
                                                }>
                                                    <div className={styles.productName}>{riga.prodotti?.nome}</div>
                                                    {/* Manual description (porte/porte_interne) */}
                                                    {riga.descrizione_personalizzata && (
                                                        <div className={styles.descriptionDetail}>{riga.descrizione_personalizzata}</div>
                                                    )}
                                                    {/* Auto-resolved description from category template */}
                                                    {!(riga.descrizione_personalizzata) && rigaResolvedDescription && (
                                                        <div className={styles.descriptionDetail} style={{ fontSize: '0.8em', color: '#555', marginTop: 2 }}>
                                                            {rigaResolvedDescription}
                                                        </div>
                                                    )}
                                                    {renderItemOptions(rOpts)}
                                                </td>
                                                <td className={styles.colDims}>
                                                    {riga.larghezza_mm && riga.altezza_mm ? (
                                                        <div className={styles.descriptionDetail}>
                                                            L: {riga.larghezza_mm} x H: {riga.altezza_mm} mm
                                                        </div>
                                                    ) : (
                                                        <div className={styles.descriptionDetail}>-</div>
                                                    )}
                                                    {riga.posizione_locale && (
                                                        <div className={styles.descriptionDetail}>
                                                            Locale: {riga.posizione_locale}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className={styles.colQty}>{riga.quantita}</td>
                                                {showLinePrices && (
                                                    <>
                                                        <td className={styles.colPrice}>{fmt(riga.prezzo_unitario_effettivo)}</td>
                                                        <td className={styles.colTotal}>{fmt(riga.subtotale_riga)}</td>
                                                    </>
                                                )}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* Section extras: trasporto, posa, sconto */}
                        {(section.trasporto > 0 || section.posa > 0 || section.sconto_percentuale > 0) && (
                            <div className={styles.sectionExtras}>
                                {section.trasporto > 0 && (
                                    <div>+ Trasporto: {fmt(section.trasporto)}</div>
                                )}
                                {section.posa > 0 && (
                                    <div>+ Posa: {fmt(section.posa)}</div>
                                )}
                                {section.sconto_percentuale > 0 && (
                                    <div>Sconto: {section.sconto_percentuale}%</div>
                                )}
                                <div className={styles.extraTotal}>
                                    Totale Sezione: {fmt(section.subtotale_sezione)}
                                </div>
                            </div>
                        )}

                        {/* Section notes — check both 'notes' (new) and 'note_sezione' (legacy) */}
                        {((section as any).notes || section.note_sezione) && (
                            <div className={styles.sectionNotes}>
                                <div className={styles.sectionNotesLabel}>Note:</div>
                                <div className={styles.sectionNotesText}>{(section as any).notes || section.note_sezione}</div>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Righe senza sezione (Migration fallback) */}
            {(righeBySection.get('_nosection') || []).length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Altro</span>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.colPos}>#</th>
                                <th className={styles.colProd}>Posizione</th>
                                <th className={styles.colDims}>Dimensioni</th>
                                <th className={styles.colQty}>Qtà</th>
                                <th className={styles.colPrice}>Prezzo Unit.</th>
                                <th className={styles.colTotal}>Totale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(righeBySection.get('_nosection') || []).map((riga) => (
                                <tr key={riga.id}>
                                    <td className={styles.colPos}>{riga.numero_riga}</td>
                                    <td className={styles.colProd}>
                                        <div className={styles.productName}>{riga.prodotti?.nome}</div>
                                    </td>
                                    <td className={styles.colDims}>
                                        {riga.larghezza_mm && riga.altezza_mm ? (
                                            <div className={styles.descriptionDetail}>
                                                L: {riga.larghezza_mm} x H: {riga.altezza_mm} mm
                                            </div>
                                        ) : (
                                            <div className={styles.descriptionDetail}>-</div>
                                        )}
                                    </td>
                                    <td className={styles.colQty}>{riga.quantita}</td>
                                    <td className={styles.colPrice}>{fmt(riga.prezzo_unitario_effettivo)}</td>
                                    <td className={styles.colTotal}>{fmt(riga.subtotale_riga)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Services section */}
            {quoteServices && quoteServices.length > 0 && (
                <div className={styles.servicesSection}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>Servizi</span>
                    </div>
                    {quoteServices.map((qs) => {
                        const serviceTotal = (qs.unit_price || 0) * (qs.quantity || 1)
                        return (
                            <div key={qs.id} className={styles.serviceRow}>
                                <span className={styles.serviceName}>
                                    {qs.services?.name || qs.custom_name || 'Servizio'}
                                    {qs.quantity > 1 && ` (x${qs.quantity})`}
                                </span>
                                {qs.notes && (
                                    <span className={styles.serviceDescription}>{qs.notes}</span>
                                )}
                                <span className={styles.servicePrice}>{fmt(serviceTotal)}</span>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Totals — respects show_grand_total and show_iva */}
            {showGrandTotal && (
                <div className={styles.totalsSection}>
                    <div className={styles.totalsBox}>
                        <div className={styles.totalsRow}>
                            <span>Totale Imponibile</span>
                            <span>{fmt(totImponibile)}</span>
                        </div>
                        {hasGlobalDiscount && (
                            <>
                                {preventivo.sconto_globale_1 ? (
                                    <div className={styles.totalsRow}>
                                        <span>Sconto 1 ({preventivo.sconto_globale_1}%)</span>
                                        <span>-</span>
                                    </div>
                                ) : null}
                                {preventivo.sconto_globale_2 ? (
                                    <div className={styles.totalsRow}>
                                        <span>Sconto 2 ({preventivo.sconto_globale_2}%)</span>
                                        <span>-</span>
                                    </div>
                                ) : null}
                                <div className={styles.totalsRow}>
                                    <span>Imponibile Scontato</span>
                                    <span>{fmt(totImponibileScontato)}</span>
                                </div>
                            </>
                        )}
                        {showIva && (
                            isCombined && ivaRidotta != null && ivaFull != null ? (
                                <>
                                    <div className={styles.totalsRow}>
                                        <span>IVA {ivaPercent}% (su {fmt(baseRidotta ?? 0)})</span>
                                        <span>{fmt(ivaRidotta)}</span>
                                    </div>
                                    <div className={styles.totalsRow}>
                                        <span>IVA {rateSecondary}% (su {fmt(baseFull ?? 0)})</span>
                                        <span>{fmt(ivaFull)}</span>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.totalsRow}>
                                    <span>IVA ({ivaPercent}%)</span>
                                    <span>{fmt(totIva)}</span>
                                </div>
                            )
                        )}
                        <div className={styles.finalTotal}>
                            <span>TOTALE</span>
                            <span>{fmt(showIva ? totPreventivo : totImponibileScontato)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment method info */}
            {paymentMethodName && (
                <div className={styles.paymentSection}>
                    <div className={styles.paymentTitle}>Modalità di Pagamento</div>
                    <div className={styles.paymentText}>{paymentMethodName}</div>
                    {paymentNotes && (
                        <div className={styles.paymentText} style={{ marginTop: 4 }}>{paymentNotes}</div>
                    )}
                </div>
            )}

            {/* Notes & Condizioni */}
            {(preventivo.note_preventivo || condizioniVendita) && (
                <div className={styles.notesSection}>
                    {preventivo.note_preventivo && (
                        <div style={{ marginBottom: 20 }}>
                            <div className={styles.notesTitle}>Note:</div>
                            <div className={styles.notesText}>{preventivo.note_preventivo}</div>
                        </div>
                    )}
                    {condizioniVendita && (
                        <div style={{ marginBottom: 20 }}>
                            <div className={styles.notesTitle}>Condizioni Generali di Vendita:</div>
                            <div
                                className={`${styles.notesText} ${styles.terminiText}`}
                                dangerouslySetInnerHTML={{ __html: condizioniVendita }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Privacy - brief reference only; full document generated during order conversion */}
            <div className={styles.privacySection}>
                <div className={styles.privacyTitle}>Informativa Privacy</div>
                <div className={styles.privacyText}>
                    Ai sensi del D.Lgs. 196/2003 e del Regolamento UE 2016/679 (GDPR), i dati personali
                    forniti saranno trattati esclusivamente per le finalità connesse al presente preventivo.
                    L&apos;informativa completa è disponibile su richiesta e verrà consegnata in fase di conferma ordine.
                </div>
            </div>

            {/* Footer - Stile PDF */}
            {azienda?.note_pie_pagina && (
                <div className={styles.footer}>
                    {azienda.note_pie_pagina}
                </div>
            )}
        </div>
    )
}

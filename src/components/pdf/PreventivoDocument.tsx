import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { renderHtmlToPdf } from '@/lib/pdf/htmlToPdfElements';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#333',
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    headerLeft: {
        width: '40%',
    },
    logo: {
        width: 120,
        height: 60,
        objectFit: 'contain' as any,
        marginBottom: 10,
    },
    headerRight: {
        width: '60%',
        textAlign: 'right',
    },
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00A9CE',
        marginBottom: 4,
    },
    companyDetails: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#666',
    },
    // Quote info
    quoteInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        backgroundColor: '#f9fafb',
        padding: 10,
        borderRadius: 4,
    },
    quoteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 4,
    },
    label: {
        fontSize: 9,
        color: '#666',
        marginBottom: 2,
    },
    value: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    // Section
    sectionContainer: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00A9CE',
        padding: 6,
        paddingHorizontal: 10,
        borderRadius: 3,
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 1,
    },
    sectionCategoryImage: {
        width: 40,
        height: 30,
        objectFit: 'contain' as any,
        borderRadius: 2,
        marginLeft: 6,
    },
    sectionOptions: {
        paddingHorizontal: 10,
        paddingBottom: 6,
    },
    optionRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    optionLabel: {
        fontSize: 8,
        color: '#666',
        fontWeight: 'bold',
        marginRight: 4,
    },
    optionValue: {
        fontSize: 8,
        color: '#444',
    },
    // Description from template
    sectionDescription: {
        paddingHorizontal: 10,
        paddingBottom: 6,
    },
    sectionDescriptionText: {
        fontSize: 9,
        color: '#444',
        lineHeight: 1.4,
        fontStyle: 'italic',
    },
    // Table
    table: {
        width: '100%',
        marginBottom: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#00A9CE',
        backgroundColor: '#f0f9fa',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
        paddingHorizontal: 4,
        minHeight: 30,
    },
    colPos: { width: '5%', textAlign: 'center' },
    colImage: { width: '10%', paddingRight: 4 },
    colDesc: { width: '35%' },
    colDims: { width: '12%', textAlign: 'center' },
    colQty: { width: '8%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '15%', textAlign: 'right' },
    // no image variant — wider desc
    colDescNoImg: { width: '45%' },
    // no-price variants — wider desc
    colDescNoPriceNoImg: { width: '75%' },
    colDescNoPriceWithImg: { width: '65%' },
    productImage: {
        width: 50,
        height: 40,
        objectFit: 'contain' as any,
        borderRadius: 2,
    },
    descriptionTitle: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    descriptionDetail: {
        fontSize: 8,
        color: '#666',
    },
    // Section extras
    sectionExtras: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 3,
        marginBottom: 4,
    },
    extraText: {
        fontSize: 9,
        color: '#555',
    },
    extraTotal: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#111',
    },
    // Section notes
    sectionNotes: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 8,
    },
    sectionNotesLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 2,
    },
    sectionNotesText: {
        fontSize: 8,
        color: '#555',
        lineHeight: 1.4,
    },
    // Services section
    servicesContainer: {
        marginTop: 10,
        marginBottom: 16,
    },
    servicesHeader: {
        backgroundColor: '#00A9CE',
        padding: 6,
        paddingHorizontal: 10,
        borderRadius: 3,
        marginBottom: 6,
    },
    servicesTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    serviceName: {
        fontSize: 9,
        color: '#333',
        flex: 1,
    },
    serviceDescription: {
        fontSize: 8,
        color: '#666',
        flex: 2,
        paddingHorizontal: 6,
    },
    servicePrice: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#111',
        textAlign: 'right',
    },
    // Totals
    totalsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    totalsBox: {
        width: '45%',
        padding: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    totalLabel: {
        fontSize: 10,
        color: '#666',
    },
    totalValue: {
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    finalTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 2,
        borderTopColor: '#00A9CE',
        paddingTop: 6,
        marginTop: 6,
    },
    finalTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111',
    },
    finalTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00A9CE',
    },
    // Payment info
    paymentSection: {
        marginTop: 12,
        padding: 8,
        backgroundColor: '#f0f9fa',
        borderRadius: 4,
    },
    paymentTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#00A9CE',
        marginBottom: 4,
    },
    paymentText: {
        fontSize: 9,
        color: '#444',
        lineHeight: 1.4,
    },
    // Notes
    notesSection: {
        marginTop: 30,
    },
    notesTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 9,
        color: '#666',
        lineHeight: 1.4,
    },
    // Privacy
    privacySection: {
        marginTop: 16,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    privacyTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 4,
    },
    privacyText: {
        fontSize: 7,
        color: '#999',
        lineHeight: 1.4,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#999',
        marginBottom: 4,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 8,
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#999',
    },
});

interface PreventivoDocumentProps {
    preventivo: any;
    azienda: any;
    sections: any[];
    sectionOptions: any[];
    righe: any[];
    itemOptions: any[];
    quoteServices: any[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
};

const getOptionDisplayValue = (
    opt: { selected_boolean: boolean | null; selected_text: string | null },
    valInfo: any | null
) => {
    if (opt.selected_boolean != null) return opt.selected_boolean ? 'Sì' : 'No';
    if (valInfo) return valInfo.value_label;
    if (opt.selected_text) return opt.selected_text;
    return '';
};

/**
 * Resolves a description_template by replacing {{option_key}} placeholders
 * with the actual option values selected for that section.
 * Supports conditional blocks: {{#if key=value}}content{{/if}}
 */
const resolveDescriptionTemplate = (template: string, sectionOpts: any[], itemOpts?: any[]): string => {
    if (!template) return '';

    // Build an option value lookup from section + item options
    const optionValues: Record<string, string> = {};
    for (const opt of sectionOpts) {
        const key = opt.category_options?.option_key;
        if (!key) continue;
        const displayValue = getOptionDisplayValue(opt, opt.category_option_values);
        if (displayValue) optionValues[key] = displayValue;
    }
    // Item-level options override section options — value_key is preferred for conditionals
    const optionValueKeys: Record<string, string> = {};
    // Seed from section options
    for (const opt of sectionOpts) {
        const key = opt.category_options?.option_key;
        if (!key) continue;
        const valueKey = opt.category_option_values?.value_key;
        if (valueKey) optionValueKeys[key] = valueKey;
    }
    if (itemOpts) {
        for (const opt of itemOpts) {
            const key = opt.category_options?.option_key;
            if (!key) continue;
            const valueKey = opt.category_option_values?.value_key;
            const displayValue = getOptionDisplayValue(opt, opt.category_option_values);
            // Item options override section options
            if (valueKey) optionValueKeys[key] = valueKey;
            if (displayValue) optionValues[key] = displayValue;
        }
    }

    let resolved = template;

    // Process conditional blocks: {{#if key=value}}content{{/if}}
    resolved = resolved.replace(
        /\{\{#if\s+(\w+)=(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
        (_match: string, condKey: string, condValue: string, content: string) => {
            const actualValue = optionValueKeys[condKey] || optionValues[condKey] || '';
            return actualValue.toLowerCase() === condValue.toLowerCase() ? content : '';
        }
    );

    // Replace simple placeholders: {{key}}
    for (const [key, value] of Object.entries(optionValues)) {
        resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }

    // Replace legacy pattern "(modello da scegliere)" with actual model value
    const modelloValue = optionValues['modello'] || optionValues['modello_posizione'] || '';
    if (modelloValue) {
        resolved = resolved.replace(/\(modello da scegliere\)/gi, modelloValue);
    }

    // Clean up unreplaced placeholders
    resolved = resolved.replace(/\{\{[^}]+\}\}/g, '');
    // Clean up extra whitespace from removed conditional blocks
    resolved = resolved.replace(/\n{3,}/g, '\n\n');
    return resolved.trim();
};

export const PreventivoDocument = ({
    preventivo,
    azienda,
    sections,
    sectionOptions,
    righe,
    itemOptions,
    quoteServices,
}: PreventivoDocumentProps) => {
    // Group options by section
    const sectionOptionsMap = new Map<string, any[]>();
    for (const opt of sectionOptions) {
        const list = sectionOptionsMap.get(opt.quote_section_id) || [];
        list.push(opt);
        sectionOptionsMap.set(opt.quote_section_id, list);
    }

    // Group options by riga
    const itemOptionsMap = new Map<string, any[]>();
    for (const opt of itemOptions) {
        const list = itemOptionsMap.get(opt.riga_preventivo_id) || [];
        list.push(opt);
        itemOptionsMap.set(opt.riga_preventivo_id, list);
    }

    // Group righe by section
    const righeBySection = new Map<string, any[]>();
    for (const riga of righe) {
        const sectionId = riga.quote_section_id || '_nosection';
        const list = righeBySection.get(sectionId) || [];
        list.push(riga);
        righeBySection.set(sectionId, list);
    }

    // Check if any product has an image
    const hasAnyImage = righe.some((r: any) => r.prodotti?.immagine_url);

    // Flags from preventivo
    const showGrandTotal = preventivo.show_grand_total !== false;
    const showIva = preventivo.show_iva !== false;

    // Use stored totals from preventivo
    const totImponibile = preventivo.totale_imponibile || 0;
    const totImponibileScontato = preventivo.totale_imponibile_scontato || totImponibile;
    const totIva = preventivo.totale_iva || 0;
    const totPreventivo = preventivo.totale_preventivo || 0;
    const ivaPercent = preventivo.aliquote_iva?.percentuale ?? 22;
    const hasGlobalDiscount = preventivo.sconto_globale_1 || preventivo.sconto_globale_2;

    // IVA combinata
    const isCombined = preventivo.aliquote_iva?.is_combined === true;
    const rateSecondary = preventivo.aliquote_iva?.rate_secondary ?? null;
    const importoBeni = (preventivo as any).importo_beni_significativi || 0;
    let ivaRidotta: number | null = null;
    let ivaFull: number | null = null;
    let baseRidotta: number | null = null;
    let baseFull: number | null = null;
    if (isCombined && rateSecondary != null && importoBeni > 0) {
        const beni = Math.min(importoBeni, totImponibileScontato);
        const altri = totImponibileScontato - beni;
        const eccedenza = Math.max(0, beni - altri);
        baseFull = Math.round(eccedenza * 100) / 100;
        baseRidotta = Math.round((totImponibileScontato - baseFull) * 100) / 100;
        ivaFull = Math.round(baseFull * (rateSecondary / 100) * 100) / 100;
        ivaRidotta = Math.round(baseRidotta * (ivaPercent / 100) * 100) / 100;
    }

    // Payment info
    const paymentMethodName = preventivo.payment_methods?.name || null;
    const paymentNotes = preventivo.payment_notes || null;

    // Condizioni di vendita — sostituisci {{modalita_pagamento}}
    const rawCondizioni = azienda?.testo_condizioni_vendita || azienda?.termini_condizioni || '';
    const condizioniVendita = rawCondizioni.replace(
        /\{\{modalita_pagamento\}\}/g,
        paymentMethodName || '—'
    );

    const renderOptions = (options: any[]) => {
        if (!options || options.length === 0) return null;
        return (
            <View style={styles.sectionOptions}>
                {options.map((opt: any) => {
                    const displayValue = getOptionDisplayValue(opt, opt.category_option_values);
                    if (!displayValue) return null;
                    return (
                        <View key={opt.id} style={styles.optionRow}>
                            <Text style={styles.optionLabel}>{opt.category_options?.option_label}:</Text>
                            <Text style={styles.optionValue}>{displayValue}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderItemOptions = (options: any[]) => {
        if (!options || options.length === 0) return null;
        return options.map((opt: any) => {
            const displayValue = getOptionDisplayValue(opt, opt.category_option_values);
            if (!displayValue) return null;
            return (
                <Text key={opt.id} style={styles.descriptionDetail}>
                    {opt.category_options?.option_label}: {displayValue}
                </Text>
            );
        });
    };

    const renderSectionTable = (sRighe: any[], showLinePrices: boolean, sOpts?: any[], descriptionTemplate?: string | null) => {
        // Determine column styles based on flags
        const getDescCol = () => {
            if (!showLinePrices) {
                return hasAnyImage ? styles.colDescNoPriceWithImg : styles.colDescNoPriceNoImg;
            }
            return hasAnyImage ? styles.colDesc : styles.colDescNoImg;
        };

        return (
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.colPos}>#</Text>
                    {hasAnyImage && <Text style={styles.colImage}></Text>}
                    <Text style={getDescCol()}>Posizione</Text>
                    <Text style={styles.colDims}>Dimensioni</Text>
                    <Text style={styles.colQty}>Qtà</Text>
                    {showLinePrices && (
                        <>
                            <Text style={styles.colPrice}>Prezzo Unit.</Text>
                            <Text style={styles.colTotal}>Totale</Text>
                        </>
                    )}
                </View>

                {sRighe.map((riga: any) => {
                    const rOpts = itemOptionsMap.get(riga.id) || [];
                    // Resolve description template per-position
                    const rigaResolvedDesc = descriptionTemplate && sOpts
                        ? resolveDescriptionTemplate(descriptionTemplate, sOpts, rOpts)
                        : '';
                    return (
                        <View key={riga.id} style={styles.tableRow} wrap={false}>
                            <Text style={styles.colPos}>{riga.numero_riga}</Text>
                            {hasAnyImage && (
                                <View style={styles.colImage}>
                                    {riga.prodotti?.immagine_url && (
                                        <Image style={styles.productImage} src={riga.prodotti.immagine_url} />
                                    )}
                                </View>
                            )}
                            <View style={getDescCol()}>
                                <Text style={styles.descriptionTitle}>{riga.prodotti?.nome}</Text>
                                {riga.descrizione_personalizzata && (
                                    <Text style={styles.descriptionDetail}>{riga.descrizione_personalizzata}</Text>
                                )}
                                {!riga.descrizione_personalizzata && rigaResolvedDesc ? (
                                    <Text style={{ ...styles.descriptionDetail, fontSize: 7, color: '#555' }}>{rigaResolvedDesc}</Text>
                                ) : null}
                                {renderItemOptions(rOpts)}
                            </View>
                            <View style={styles.colDims}>
                                {riga.larghezza_mm && riga.altezza_mm ? (
                                    <Text style={styles.descriptionDetail}>
                                        L:{riga.larghezza_mm} x H:{riga.altezza_mm} mm
                                    </Text>
                                ) : (
                                    <Text style={styles.descriptionDetail}>-</Text>
                                )}
                                {riga.posizione_locale && (
                                    <Text style={styles.descriptionDetail}>
                                        Locale: {riga.posizione_locale}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.colQty}>{riga.quantita}</Text>
                            {showLinePrices && (
                                <>
                                    <Text style={styles.colPrice}>{formatCurrency(riga.prezzo_unitario_effettivo)}</Text>
                                    <Text style={styles.colTotal}>{formatCurrency(riga.subtotale_riga)}</Text>
                                </>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header} fixed>
                    <View style={styles.headerLeft}>
                        {azienda?.logo_url && (
                            <Image style={styles.logo} src={azienda.logo_url} />
                        )}
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.companyName}>{azienda?.nome_azienda || 'Nome Azienda'}</Text>
                        {azienda?.indirizzo_azienda && (
                            <Text style={styles.companyDetails}>{azienda.indirizzo_azienda}</Text>
                        )}
                        {(azienda?.cap_azienda || azienda?.citta_azienda) && (
                            <Text style={styles.companyDetails}>
                                {azienda.cap_azienda} {azienda.citta_azienda} {azienda.provincia_azienda && `(${azienda.provincia_azienda})`}
                            </Text>
                        )}
                        {azienda?.partita_iva && (
                            <Text style={styles.companyDetails}>P.IVA: {azienda.partita_iva}</Text>
                        )}
                        {azienda?.codice_fiscale && (
                            <Text style={styles.companyDetails}>C.F.: {azienda.codice_fiscale}</Text>
                        )}
                        {azienda?.telefono && (
                            <Text style={styles.companyDetails}>Tel: {azienda.telefono}</Text>
                        )}
                        {azienda?.email && (
                            <Text style={styles.companyDetails}>Email: {azienda.email}</Text>
                        )}
                    </View>
                </View>

                {/* Quote Info & Client */}
                <View style={styles.quoteInfo}>
                    <View>
                        <Text style={styles.quoteTitle}>Preventivo #{preventivo.numero}</Text>
                        <Text style={styles.label}>Data: {format(new Date(preventivo.data_preventivo), 'dd/MM/yyyy')}</Text>
                        <Text style={styles.label}>Valido fino al: {preventivo.data_validita ? format(new Date(preventivo.data_validita), 'dd/MM/yyyy') : '-'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.label}>Spett.le Cliente:</Text>
                        {preventivo.clienti?.ragione_sociale && (
                            <Text style={styles.value}>{preventivo.clienti.ragione_sociale}</Text>
                        )}
                        {(preventivo.clienti?.nome || preventivo.clienti?.cognome) && (
                            <Text style={styles.value}>
                                {preventivo.clienti.nome} {preventivo.clienti.cognome}
                            </Text>
                        )}
                        {preventivo.clienti?.indirizzo && (
                            <Text style={styles.companyDetails}>{preventivo.clienti.indirizzo}</Text>
                        )}
                        {(preventivo.clienti?.cap || preventivo.clienti?.citta) && (
                            <Text style={styles.companyDetails}>
                                {preventivo.clienti.cap} {preventivo.clienti.citta} {preventivo.clienti.provincia && `(${preventivo.clienti.provincia})`}
                            </Text>
                        )}
                        {preventivo.clienti?.partita_iva && (
                            <Text style={styles.companyDetails}>P.IVA: {preventivo.clienti.partita_iva}</Text>
                        )}
                        {preventivo.clienti?.codice_fiscale && (
                            <Text style={styles.companyDetails}>C.F.: {preventivo.clienti.codice_fiscale}</Text>
                        )}
                    </View>
                </View>

                {/* Destination site if present */}
                {preventivo.sedi && (
                    <View style={{ marginBottom: 16, padding: 8, backgroundColor: '#f9fafb', borderRadius: 4 }}>
                        <Text style={{ ...styles.label, fontWeight: 'bold' }}>Luogo di destinazione:</Text>
                        <Text style={styles.value}>{preventivo.sedi.nome_sede}</Text>
                        {preventivo.sedi.indirizzo && (
                            <Text style={styles.companyDetails}>
                                {preventivo.sedi.indirizzo} - {preventivo.sedi.citta} {preventivo.sedi.provincia && `(${preventivo.sedi.provincia})`}
                            </Text>
                        )}
                    </View>
                )}

                {/* Sections & Items */}
                {sections.map((section: any) => {
                    const sOpts = sectionOptionsMap.get(section.id) || [];
                    const sRighe = righeBySection.get(section.id) || [];
                    const showLinePrices = section.show_line_prices !== false;

                    // Description: free_description shown at section level; template resolved per-position
                    const freeDescription = section.free_description as string | null | undefined;
                    const descriptionTemplate = section.categories?.description_template;

                    // Category image
                    const categoryImageUrl = section.categories?.image_url;

                    return (
                        <View key={section.id} style={styles.sectionContainer} wrap={false}>
                            {/* Section header with optional category image */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    {section.categories?.nome || 'Sezione'}
                                </Text>
                                {categoryImageUrl && (
                                    <Image style={styles.sectionCategoryImage} src={categoryImageUrl} />
                                )}
                            </View>

                            {/* Free description (entered manually per section) */}
                            {freeDescription ? (
                                <View style={styles.sectionDescription}>
                                    <Text style={styles.sectionDescriptionText}>{freeDescription}</Text>
                                </View>
                            ) : null}

                            {/* Section-level options */}
                            {sOpts.length > 0 && renderOptions(sOpts)}

                            {/* Items table (respects show_line_prices) */}
                            {sRighe.length > 0 && renderSectionTable(sRighe, showLinePrices, sOpts, descriptionTemplate)}

                            {/* Section extras: trasporto, posa, sconto */}
                            {(section.trasporto > 0 || section.posa > 0 || section.sconto_percentuale > 0) && (
                                <View style={styles.sectionExtras}>
                                    {section.trasporto > 0 && (
                                        <Text style={styles.extraText}>+ Trasporto: {formatCurrency(section.trasporto)}</Text>
                                    )}
                                    {section.posa > 0 && (
                                        <Text style={styles.extraText}>+ Posa: {formatCurrency(section.posa)}</Text>
                                    )}
                                    {section.sconto_percentuale > 0 && (
                                        <Text style={styles.extraText}>Sconto: {section.sconto_percentuale}%</Text>
                                    )}
                                    <Text style={styles.extraTotal}>
                                        Totale Sezione: {formatCurrency(section.subtotale_sezione)}
                                    </Text>
                                </View>
                            )}

                            {/* Section notes — check both 'notes' (new) and 'note_sezione' (legacy) */}
                            {(section.notes || section.note_sezione) && (
                                <View style={styles.sectionNotes}>
                                    <Text style={styles.sectionNotesLabel}>Note:</Text>
                                    <Text style={styles.sectionNotesText}>{section.notes || section.note_sezione}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Righe without section (fallback) */}
                {(righeBySection.get('_nosection') || []).length > 0 && (
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Altro</Text>
                        </View>
                        {renderSectionTable(righeBySection.get('_nosection') || [], true)}
                    </View>
                )}

                {/* Services section */}
                {quoteServices && quoteServices.length > 0 && (
                    <View style={styles.servicesContainer}>
                        <View style={styles.servicesHeader}>
                            <Text style={styles.servicesTitle}>Servizi</Text>
                        </View>
                        {quoteServices.map((qs: any) => (
                            <View key={qs.id} style={styles.serviceRow}>
                                <Text style={styles.serviceName}>
                                    {qs.services?.name || qs.custom_name || 'Servizio'}
                                    {(qs.quantity || 1) > 1 ? ` (x${qs.quantity})` : ''}
                                </Text>
                                {qs.description && (
                                    <Text style={styles.serviceDescription}>{qs.description}</Text>
                                )}
                                <Text style={styles.servicePrice}>{formatCurrency((qs.quantity || 1) * (qs.unit_price || 0))}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Totals — respects show_grand_total and show_iva */}
                {showGrandTotal && (
                    <View style={styles.totalsContainer} wrap={false}>
                        <View style={styles.totalsBox}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Totale Imponibile</Text>
                                <Text style={styles.totalValue}>{formatCurrency(totImponibile)}</Text>
                            </View>
                            {hasGlobalDiscount && (
                                <>
                                    {preventivo.sconto_globale_1 ? (
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Sconto 1 ({preventivo.sconto_globale_1}%)</Text>
                                            <Text style={styles.totalValue}>-</Text>
                                        </View>
                                    ) : null}
                                    {preventivo.sconto_globale_2 ? (
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Sconto 2 ({preventivo.sconto_globale_2}%)</Text>
                                            <Text style={styles.totalValue}>-</Text>
                                        </View>
                                    ) : null}
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Imponibile Scontato</Text>
                                        <Text style={styles.totalValue}>{formatCurrency(totImponibileScontato)}</Text>
                                    </View>
                                </>
                            )}
                            {showIva && (
                                isCombined && ivaRidotta != null && ivaFull != null ? (
                                    <>
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>IVA {ivaPercent}% (su {formatCurrency(baseRidotta ?? 0)})</Text>
                                            <Text style={styles.totalValue}>{formatCurrency(ivaRidotta)}</Text>
                                        </View>
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>IVA {rateSecondary}% (su {formatCurrency(baseFull ?? 0)})</Text>
                                            <Text style={styles.totalValue}>{formatCurrency(ivaFull)}</Text>
                                        </View>
                                    </>
                                ) : (
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>IVA ({ivaPercent}%)</Text>
                                        <Text style={styles.totalValue}>{formatCurrency(totIva)}</Text>
                                    </View>
                                )
                            )}
                            <View style={styles.finalTotal}>
                                <Text style={styles.finalTotalLabel}>TOTALE</Text>
                                <Text style={styles.finalTotalValue}>
                                    {formatCurrency(showIva ? totPreventivo : totImponibileScontato)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Payment method info */}
                {paymentMethodName && (
                    <View style={styles.paymentSection}>
                        <Text style={styles.paymentTitle}>Modalità di Pagamento</Text>
                        <Text style={styles.paymentText}>{paymentMethodName}</Text>
                        {paymentNotes && (
                            <Text style={{ ...styles.paymentText, marginTop: 4 }}>{paymentNotes}</Text>
                        )}
                    </View>
                )}

                {/* Notes & Condizioni */}
                {(preventivo.note_preventivo || condizioniVendita) && (
                    <View style={styles.notesSection}>
                        {preventivo.note_preventivo && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={styles.notesTitle}>Note:</Text>
                                <Text style={styles.notesText}>{preventivo.note_preventivo}</Text>
                            </View>
                        )}
                        {condizioniVendita && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={styles.notesTitle}>Condizioni Generali di Vendita:</Text>
                                {renderHtmlToPdf(condizioniVendita)}
                            </View>
                        )}
                    </View>
                )}

                {/* Privacy — breve riferimento, documento completo consegnato in fase ordine */}
                <View style={styles.privacySection}>
                    <Text style={styles.privacyTitle}>Informativa Privacy</Text>
                    <Text style={styles.privacyText}>
                        Ai sensi del Reg. UE 2016/679 (GDPR), i dati personali del Cliente saranno trattati esclusivamente per le finalità connesse all&apos;esecuzione del presente preventivo e degli eventuali lavori correlati. L&apos;informativa completa è disponibile presso la sede dell&apos;azienda e verrà consegnata in fase di conferma ordine.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    {azienda?.note_pie_pagina && (
                        <Text style={styles.footerText}>
                            {azienda.note_pie_pagina}
                        </Text>
                    )}
                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) =>
                        `${pageNumber} / ${totalPages}`
                    } fixed />
                </View>

            </Page>
        </Document>
    );
};

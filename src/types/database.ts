export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            aliquote_iva: {
                Row: {
                    attiva: boolean
                    created_at: string
                    descrizione: string | null
                    id: string
                    nome: string
                    ordine: number
                    percentuale: number
                    richiede_dichiarazione: boolean
                    is_combined: boolean
                    rate_secondary: number | null
                    updated_at: string
                }
                Insert: {
                    attiva?: boolean
                    created_at?: string
                    descrizione?: string | null
                    id?: string
                    nome: string
                    ordine?: number
                    percentuale: number
                    richiede_dichiarazione?: boolean
                    is_combined?: boolean
                    rate_secondary?: number | null
                    updated_at?: string
                }
                Update: {
                    attiva?: boolean
                    created_at?: string
                    descrizione?: string | null
                    id?: string
                    nome?: string
                    ordine?: number
                    percentuale?: number
                    richiede_dichiarazione?: boolean
                    is_combined?: boolean
                    rate_secondary?: number | null
                    updated_at?: string
                }
                Relationships: []
            }
            clienti: {
                Row: {
                    attivo: boolean
                    cap: string
                    citta: string
                    codice_fiscale: string | null
                    created_at: string
                    created_by: string | null
                    email: string | null
                    id: string
                    indirizzo: string
                    note: string | null
                    partita_iva: string | null
                    pec: string | null
                    provincia: string
                    ragione_sociale: string
                    telefono_principale: string
                    telefono_secondario: string | null
                    tipo_cliente: string
                    updated_at: string
                }
                Insert: {
                    attivo?: boolean
                    cap: string
                    citta: string
                    codice_fiscale?: string | null
                    created_at?: string
                    created_by?: string | null
                    email?: string | null
                    id?: string
                    indirizzo: string
                    note?: string | null
                    partita_iva?: string | null
                    pec?: string | null
                    provincia: string
                    ragione_sociale: string
                    telefono_principale: string
                    telefono_secondario?: string | null
                    tipo_cliente: string
                    updated_at?: string
                }
                Update: {
                    attivo?: boolean
                    cap?: string
                    citta?: string
                    codice_fiscale?: string | null
                    created_at?: string
                    created_by?: string | null
                    email?: string | null
                    id?: string
                    indirizzo?: string
                    note?: string | null
                    partita_iva?: string | null
                    pec?: string | null
                    provincia?: string
                    ragione_sociale?: string
                    telefono_principale?: string
                    telefono_secondario?: string | null
                    tipo_cliente?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "clienti_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            configurazioni_prodotto: {
                Row: {
                    applicazione: string
                    attiva: boolean
                    created_at: string
                    descrizione: string | null
                    id: string
                    nome: string
                    obbligatoria: boolean
                    ordine: number
                    prodotto_id: string
                    tipo: string
                    tipo_maggiorazione: string
                    updated_at: string
                    valore_maggiorazione: number
                }
                Insert: {
                    applicazione?: string
                    attiva?: boolean
                    created_at?: string
                    descrizione?: string | null
                    id?: string
                    nome: string
                    obbligatoria?: boolean
                    ordine?: number
                    prodotto_id: string
                    tipo: string
                    tipo_maggiorazione: string
                    updated_at?: string
                    valore_maggiorazione?: number
                }
                Update: {
                    applicazione?: string
                    attiva?: boolean
                    created_at?: string
                    descrizione?: string | null
                    id?: string
                    nome?: string
                    obbligatoria?: boolean
                    ordine?: number
                    prodotto_id?: string
                    tipo?: string
                    tipo_maggiorazione?: string
                    updated_at?: string
                    valore_maggiorazione?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "configurazioni_prodotto_prodotto_id_fkey"
                        columns: ["prodotto_id"]
                        isOneToOne: false
                        referencedRelation: "prodotti"
                        referencedColumns: ["id"]
                    }
                ]
            }
            configurazioni_riga: {
                Row: {
                    configurazione_id: string
                    created_at: string
                    id: string
                    maggiorazione_applicata: number
                    riga_preventivo_id: string
                    valore_selezionato: string | null
                }
                Insert: {
                    configurazione_id: string
                    created_at?: string
                    id?: string
                    maggiorazione_applicata?: number
                    riga_preventivo_id: string
                    valore_selezionato?: string | null
                }
                Update: {
                    configurazione_id?: string
                    created_at?: string
                    id?: string
                    maggiorazione_applicata?: number
                    riga_preventivo_id?: string
                    valore_selezionato?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "configurazioni_riga_configurazione_id_fkey"
                        columns: ["configurazione_id"]
                        isOneToOne: false
                        referencedRelation: "configurazioni_prodotto"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "configurazioni_riga_riga_preventivo_id_fkey"
                        columns: ["riga_preventivo_id"]
                        isOneToOne: false
                        referencedRelation: "righe_preventivo"
                        referencedColumns: ["id"]
                    }
                ]
            }
            costi_indiretti: {
                Row: {
                    attivo: boolean
                    categoria: string
                    costo_azienda: number | null
                    created_at: string
                    descrizione: string | null
                    id: string
                    importo: number
                    nome: string
                    tipo_calcolo: string
                    updated_at: string
                }
                Insert: {
                    attivo?: boolean
                    categoria: string
                    costo_azienda?: number | null
                    created_at?: string
                    descrizione?: string | null
                    id?: string
                    importo: number
                    nome: string
                    tipo_calcolo: string
                    updated_at?: string
                }
                Update: {
                    attivo?: boolean
                    categoria?: string
                    costo_azienda?: number | null
                    created_at?: string
                    descrizione?: string | null
                    id?: string
                    importo?: number
                    nome?: string
                    tipo_calcolo?: string
                    updated_at?: string
                }
                Relationships: []
            }
            costi_preventivo: {
                Row: {
                    costo_id: string
                    created_at: string
                    id: string
                    importo_totale: number
                    note: string | null
                    preventivo_id: string
                    quantita: number
                }
                Insert: {
                    costo_id: string
                    created_at?: string
                    id?: string
                    importo_totale?: number
                    note?: string | null
                    preventivo_id: string
                    quantita?: number
                }
                Update: {
                    costo_id?: string
                    created_at?: string
                    id?: string
                    importo_totale?: number
                    note?: string | null
                    preventivo_id?: string
                    quantita?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "costi_preventivo_costo_id_fkey"
                        columns: ["costo_id"]
                        isOneToOne: false
                        referencedRelation: "costi_indiretti"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "costi_preventivo_preventivo_id_fkey"
                        columns: ["preventivo_id"]
                        isOneToOne: false
                        referencedRelation: "preventivi"
                        referencedColumns: ["id"]
                    }
                ]
            }
            impostazioni: {
                Row: {
                    anno_corrente: number | null
                    banca: string | null
                    cap_azienda: string | null
                    citta_azienda: string | null
                    codice_fiscale: string | null
                    condizioni_pagamento_standard: string | null
                    created_at: string
                    dichiarazione_iva_agevolata: string | null
                    email: string | null
                    formato_numero: string | null
                    iban: string | null
                    id: string
                    indirizzo_azienda: string | null
                    informativa_privacy: string | null
                    logo_url: string | null
                    nome_azienda: string
                    note_pie_pagina: string | null
                    partita_iva: string | null
                    pec: string | null
                    prefisso_preventivo: string | null
                    provincia_azienda: string | null
                    reset_annuale: boolean | null
                    sito_web: string | null
                    telefono: string | null
                    termini_condizioni: string | null
                    ultimo_numero_anno: number | null
                    testo_informativa_privacy: string | null
                    testo_condizioni_vendita: string | null
                    updated_at: string
                    validita_preventivo_giorni: number
                }
                Insert: {
                    anno_corrente?: number | null
                    banca?: string | null
                    cap_azienda?: string | null
                    citta_azienda?: string | null
                    codice_fiscale?: string | null
                    condizioni_pagamento_standard?: string | null
                    created_at?: string
                    dichiarazione_iva_agevolata?: string | null
                    email?: string | null
                    formato_numero?: string | null
                    iban?: string | null
                    id?: string
                    indirizzo_azienda?: string | null
                    informativa_privacy?: string | null
                    logo_url?: string | null
                    nome_azienda?: string
                    note_pie_pagina?: string | null
                    partita_iva?: string | null
                    pec?: string | null
                    prefisso_preventivo?: string | null
                    provincia_azienda?: string | null
                    reset_annuale?: boolean | null
                    sito_web?: string | null
                    telefono?: string | null
                    termini_condizioni?: string | null
                    ultimo_numero_anno?: number | null
                    testo_informativa_privacy?: string | null
                    testo_condizioni_vendita?: string | null
                    updated_at?: string
                    validita_preventivo_giorni?: number
                }
                Update: {
                    anno_corrente?: number | null
                    banca?: string | null
                    cap_azienda?: string | null
                    citta_azienda?: string | null
                    codice_fiscale?: string | null
                    condizioni_pagamento_standard?: string | null
                    created_at?: string
                    dichiarazione_iva_agevolata?: string | null
                    email?: string | null
                    formato_numero?: string | null
                    iban?: string | null
                    id?: string
                    indirizzo_azienda?: string | null
                    informativa_privacy?: string | null
                    logo_url?: string | null
                    nome_azienda?: string
                    note_pie_pagina?: string | null
                    partita_iva?: string | null
                    pec?: string | null
                    prefisso_preventivo?: string | null
                    provincia_azienda?: string | null
                    reset_annuale?: boolean | null
                    sito_web?: string | null
                    telefono?: string | null
                    termini_condizioni?: string | null
                    ultimo_numero_anno?: number | null
                    testo_informativa_privacy?: string | null
                    testo_condizioni_vendita?: string | null
                    updated_at?: string
                    validita_preventivo_giorni?: number
                }
                Relationships: []
            }
            preventivi: {
                Row: {
                    aliquota_iva_id: string
                    cliente_id: string
                    condizioni_pagamento: string | null
                    costo_totale_azienda: number | null
                    created_at: string
                    created_by: string | null
                    data_preventivo: string
                    data_validita: string
                    id: string
                    margine_previsto: number | null
                    note_interne: string | null
                    note_preventivo: string | null
                    numero: string
                    percentuale_margine: number | null
                    sconto_globale_1: number | null
                    sconto_globale_2: number | null
                    sede_id: string | null
                    stato: string
                    totale_imponibile: number
                    totale_imponibile_scontato: number
                    totale_iva: number
                    totale_preventivo: number
                    show_grand_total: boolean
                    show_iva: boolean
                    payment_method_id: string | null
                    payment_notes: string | null
                    importo_beni_significativi: number
                    updated_at: string
                }
                Insert: {
                    aliquota_iva_id: string
                    cliente_id: string
                    condizioni_pagamento?: string | null
                    costo_totale_azienda?: number | null
                    created_at?: string
                    created_by?: string | null
                    data_preventivo?: string
                    data_validita: string
                    id?: string
                    margine_previsto?: number | null
                    note_interne?: string | null
                    note_preventivo?: string | null
                    numero: string
                    percentuale_margine?: number | null
                    sconto_globale_1?: number | null
                    sconto_globale_2?: number | null
                    sede_id?: string | null
                    stato?: string
                    totale_imponibile?: number
                    totale_imponibile_scontato?: number
                    totale_iva?: number
                    totale_preventivo?: number
                    show_grand_total?: boolean
                    show_iva?: boolean
                    payment_method_id?: string | null
                    payment_notes?: string | null
                    importo_beni_significativi?: number
                    updated_at?: string
                }
                Update: {
                    aliquota_iva_id?: string
                    cliente_id?: string
                    condizioni_pagamento?: string | null
                    costo_totale_azienda?: number | null
                    created_at?: string
                    created_by?: string | null
                    data_preventivo?: string
                    data_validita?: string
                    id?: string
                    margine_previsto?: number | null
                    note_interne?: string | null
                    note_preventivo?: string | null
                    numero?: string
                    percentuale_margine?: number | null
                    sconto_globale_1?: number | null
                    sconto_globale_2?: number | null
                    sede_id?: string | null
                    stato?: string
                    totale_imponibile?: number
                    totale_imponibile_scontato?: number
                    totale_iva?: number
                    totale_preventivo?: number
                    show_grand_total?: boolean
                    show_iva?: boolean
                    payment_method_id?: string | null
                    payment_notes?: string | null
                    importo_beni_significativi?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "preventivi_aliquota_iva_id_fkey"
                        columns: ["aliquota_iva_id"]
                        isOneToOne: false
                        referencedRelation: "aliquote_iva"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "preventivi_cliente_id_fkey"
                        columns: ["cliente_id"]
                        isOneToOne: false
                        referencedRelation: "clienti"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "preventivi_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "preventivi_sede_id_fkey"
                        columns: ["sede_id"]
                        isOneToOne: false
                        referencedRelation: "sedi"
                        referencedColumns: ["id"]
                    }
                ]
            }
            prodotti: {
                Row: {
                    attivo: boolean
                    categoria: string
                    category_id: string | null
                    codice: string
                    costo_acquisto: number | null
                    costo_posa: number
                    created_at: string
                    created_by: string | null
                    descrizione_breve: string
                    descrizione_estesa: string | null
                    id: string
                    immagine_url: string | null
                    nome: string
                    note: string | null
                    percentuale_ricarico: number
                    prezzo_listino: number
                    richiede_configurazione: boolean
                    richiede_dimensioni: boolean
                    unita_misura: string
                    updated_at: string
                }
                Insert: {
                    attivo?: boolean
                    categoria: string
                    category_id?: string | null
                    codice: string
                    costo_acquisto?: number | null
                    costo_posa?: number
                    created_at?: string
                    created_by?: string | null
                    descrizione_breve: string
                    descrizione_estesa?: string | null
                    id?: string
                    immagine_url?: string | null
                    nome: string
                    note?: string | null
                    percentuale_ricarico?: number
                    prezzo_listino: number
                    richiede_configurazione?: boolean
                    richiede_dimensioni?: boolean
                    unita_misura: string
                    updated_at?: string
                }
                Update: {
                    attivo?: boolean
                    categoria?: string
                    category_id?: string | null
                    codice?: string
                    costo_acquisto?: number | null
                    costo_posa?: number
                    created_at?: string
                    created_by?: string | null
                    descrizione_breve?: string
                    descrizione_estesa?: string | null
                    id?: string
                    immagine_url?: string | null
                    nome?: string
                    note?: string | null
                    percentuale_ricarico?: number
                    prezzo_listino?: number
                    richiede_configurazione?: boolean
                    richiede_dimensioni?: boolean
                    unita_misura?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "prodotti_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            profiles: {
                Row: {
                    attivo: boolean
                    cognome: string | null
                    created_at: string
                    email: string | null
                    id: string
                    nome: string | null
                    ruolo: string
                    updated_at: string
                }
                Insert: {
                    attivo?: boolean
                    cognome?: string | null
                    created_at?: string
                    email?: string | null
                    id: string
                    nome?: string | null
                    ruolo?: string
                    updated_at?: string
                }
                Update: {
                    attivo?: boolean
                    cognome?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    nome?: string | null
                    ruolo?: string
                    updated_at?: string
                }
                Relationships: []
            }
            product_options: {
                Row: {
                    applies_to_position: boolean
                    created_at: string
                    depends_on_option_id: string | null
                    depends_on_values_json: Json | null
                    id: string
                    is_active: boolean
                    is_required: boolean
                    option_key: string
                    option_label: string
                    option_type: string
                    price_adjustment_default: number | null
                    product_id: string
                    sort_order: number
                    updated_at: string
                }
                Insert: {
                    applies_to_position?: boolean
                    created_at?: string
                    depends_on_option_id?: string | null
                    depends_on_values_json?: Json | null
                    id?: string
                    is_active?: boolean
                    is_required?: boolean
                    option_key: string
                    option_label: string
                    option_type: string
                    price_adjustment_default?: number | null
                    product_id: string
                    sort_order?: number
                    updated_at?: string
                }
                Update: {
                    applies_to_position?: boolean
                    created_at?: string
                    depends_on_option_id?: string | null
                    depends_on_values_json?: Json | null
                    id?: string
                    is_active?: boolean
                    is_required?: boolean
                    option_key?: string
                    option_label?: string
                    option_type?: string
                    price_adjustment_default?: number | null
                    product_id?: string
                    sort_order?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_options_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "prodotti"
                        referencedColumns: ["id"]
                    }
                ]
            }
            product_option_values: {
                Row: {
                    created_at: string
                    depends_on_value_id: string | null
                    id: string
                    is_active: boolean
                    is_default: boolean
                    metadata_json: Json | null
                    price_adjustment: number | null
                    price_mode: string
                    product_option_id: string
                    sort_order: number
                    updated_at: string
                    value_key: string
                    value_label: string
                }
                Insert: {
                    created_at?: string
                    depends_on_value_id?: string | null
                    id?: string
                    is_active?: boolean
                    is_default?: boolean
                    metadata_json?: Json | null
                    price_adjustment?: number | null
                    price_mode: string
                    product_option_id: string
                    sort_order?: number
                    updated_at?: string
                    value_key: string
                    value_label: string
                }
                Update: {
                    created_at?: string
                    depends_on_value_id?: string | null
                    id?: string
                    is_active?: boolean
                    is_default?: boolean
                    metadata_json?: Json | null
                    price_adjustment?: number | null
                    price_mode?: string
                    product_option_id?: string
                    sort_order?: number
                    updated_at?: string
                    value_key?: string
                    value_label?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_option_values_product_option_id_fkey"
                        columns: ["product_option_id"]
                        isOneToOne: false
                        referencedRelation: "product_options"
                        referencedColumns: ["id"]
                    }
                ]
            }
            righe_preventivo: {
                Row: {
                    aggiorna_prodotto_originale: boolean | null
                    altezza_mm: number | null
                    quote_section_id: string | null
                    costo_posa_unitario: number
                    costo_riga_azienda: number | null
                    created_at: string
                    descrizione_personalizzata: string | null
                    id: string
                    includi_controtelaio: boolean | null
                    larghezza_mm: number | null
                    metri_quadri: number | null
                    note: string | null
                    numero_ante: number | null
                    numero_riga: number
                    posizione_locale: string | null
                    preventivo_id: string
                    prezzo_unitario_effettivo: number
                    prezzo_unitario_personalizzato: number | null
                    prodotto_id: string
                    quantita: number
                    subtotale_riga: number
                    tipo_montaggio: string | null
                    totale_maggiorazioni: number
                    manual_price_override: number | null
                    updated_at: string
                    usa_prezzo_personalizzato: boolean
                }
                Insert: {
                    aggiorna_prodotto_originale?: boolean | null
                    altezza_mm?: number | null
                    quote_section_id?: string | null
                    costo_posa_unitario?: number
                    costo_riga_azienda?: number | null
                    created_at?: string
                    descrizione_personalizzata?: string | null
                    id?: string
                    includi_controtelaio?: boolean | null
                    larghezza_mm?: number | null
                    metri_quadri?: number | null
                    note?: string | null
                    numero_ante?: number | null
                    numero_riga: number
                    posizione_locale?: string | null
                    preventivo_id: string
                    prezzo_unitario_effettivo: number
                    prezzo_unitario_personalizzato?: number | null
                    prodotto_id: string
                    quantita?: number
                    subtotale_riga?: number
                    tipo_montaggio?: string | null
                    totale_maggiorazioni?: number
                    manual_price_override?: number | null
                    updated_at?: string
                    usa_prezzo_personalizzato?: boolean
                }
                Update: {
                    aggiorna_prodotto_originale?: boolean | null
                    altezza_mm?: number | null
                    quote_section_id?: string | null
                    costo_posa_unitario?: number
                    costo_riga_azienda?: number | null
                    created_at?: string
                    descrizione_personalizzata?: string | null
                    id?: string
                    includi_controtelaio?: boolean | null
                    larghezza_mm?: number | null
                    metri_quadri?: number | null
                    note?: string | null
                    numero_ante?: number | null
                    numero_riga?: number
                    posizione_locale?: string | null
                    preventivo_id?: string
                    prezzo_unitario_effettivo?: number
                    prezzo_unitario_personalizzato?: number | null
                    prodotto_id?: string
                    quantita?: number
                    subtotale_riga?: number
                    tipo_montaggio?: string | null
                    totale_maggiorazioni?: number
                    manual_price_override?: number | null
                    updated_at?: string
                    usa_prezzo_personalizzato?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "righe_preventivo_preventivo_id_fkey"
                        columns: ["preventivo_id"]
                        isOneToOne: false
                        referencedRelation: "preventivi"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "righe_preventivo_prodotto_id_fkey"
                        columns: ["prodotto_id"]
                        isOneToOne: false
                        referencedRelation: "prodotti"
                        referencedColumns: ["id"]
                    }
                ]
            }
            categories: {
                Row: {
                    id: string
                    slug: string
                    nome: string
                    descrizione: string | null
                    icona: string | null
                    ordine: number
                    attiva: boolean
                    description_template: string | null
                    image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    nome: string
                    descrizione?: string | null
                    icona?: string | null
                    ordine?: number
                    attiva?: boolean
                    description_template?: string | null
                    image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    nome?: string
                    descrizione?: string | null
                    icona?: string | null
                    ordine?: number
                    attiva?: boolean
                    description_template?: string | null
                    image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            category_options: {
                Row: {
                    id: string
                    category_id: string
                    option_key: string
                    option_label: string
                    option_type: string
                    is_required: boolean
                    sort_order: number
                    applies_to_position: boolean
                    price_adjustment_default: number
                    depends_on_option_id: string | null
                    depends_on_values_json: Json | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    category_id: string
                    option_key: string
                    option_label: string
                    option_type: string
                    is_required?: boolean
                    sort_order?: number
                    applies_to_position?: boolean
                    price_adjustment_default?: number
                    depends_on_option_id?: string | null
                    depends_on_values_json?: Json | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    category_id?: string
                    option_key?: string
                    option_label?: string
                    option_type?: string
                    is_required?: boolean
                    sort_order?: number
                    applies_to_position?: boolean
                    price_adjustment_default?: number
                    depends_on_option_id?: string | null
                    depends_on_values_json?: Json | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "category_options_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "category_options_depends_on_option_id_fkey"
                        columns: ["depends_on_option_id"]
                        isOneToOne: false
                        referencedRelation: "category_options"
                        referencedColumns: ["id"]
                    }
                ]
            }
            category_option_values: {
                Row: {
                    id: string
                    category_option_id: string
                    value_key: string
                    value_label: string
                    price_adjustment: number
                    price_mode: string
                    sort_order: number
                    depends_on_value_id: string | null
                    is_default: boolean
                    is_active: boolean
                    metadata_json: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    category_option_id: string
                    value_key: string
                    value_label: string
                    price_adjustment?: number
                    price_mode?: string
                    sort_order?: number
                    depends_on_value_id?: string | null
                    is_default?: boolean
                    is_active?: boolean
                    metadata_json?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    category_option_id?: string
                    value_key?: string
                    value_label?: string
                    price_adjustment?: number
                    price_mode?: string
                    sort_order?: number
                    depends_on_value_id?: string | null
                    is_default?: boolean
                    is_active?: boolean
                    metadata_json?: Json | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "category_option_values_category_option_id_fkey"
                        columns: ["category_option_id"]
                        isOneToOne: false
                        referencedRelation: "category_options"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "category_option_values_depends_on_value_id_fkey"
                        columns: ["depends_on_value_id"]
                        isOneToOne: false
                        referencedRelation: "category_option_values"
                        referencedColumns: ["id"]
                    }
                ]
            }
            quote_sections: {
                Row: {
                    id: string
                    preventivo_id: string
                    category_id: string
                    ordine: number
                    note_sezione: string | null
                    trasporto: number
                    posa: number
                    sconto_percentuale: number
                    subtotale_sezione: number
                    show_line_prices: boolean
                    manual_total_override: number | null
                    notes: string | null
                    free_description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    preventivo_id: string
                    category_id: string
                    ordine?: number
                    note_sezione?: string | null
                    trasporto?: number
                    posa?: number
                    sconto_percentuale?: number
                    subtotale_sezione?: number
                    show_line_prices?: boolean
                    manual_total_override?: number | null
                    notes?: string | null
                    free_description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    preventivo_id?: string
                    category_id?: string
                    ordine?: number
                    note_sezione?: string | null
                    trasporto?: number
                    posa?: number
                    sconto_percentuale?: number
                    subtotale_sezione?: number
                    show_line_prices?: boolean
                    manual_total_override?: number | null
                    notes?: string | null
                    free_description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "quote_sections_preventivo_id_fkey"
                        columns: ["preventivo_id"]
                        isOneToOne: false
                        referencedRelation: "preventivi"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "quote_sections_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
            quote_section_options: {
                Row: {
                    id: string
                    quote_section_id: string
                    category_option_id: string
                    selected_value_id: string | null
                    selected_text: string | null
                    selected_boolean: boolean | null
                    price_adjustment: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    quote_section_id: string
                    category_option_id: string
                    selected_value_id?: string | null
                    selected_text?: string | null
                    selected_boolean?: boolean | null
                    price_adjustment?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    quote_section_id?: string
                    category_option_id?: string
                    selected_value_id?: string | null
                    selected_text?: string | null
                    selected_boolean?: boolean | null
                    price_adjustment?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "quote_section_options_quote_section_id_fkey"
                        columns: ["quote_section_id"]
                        isOneToOne: false
                        referencedRelation: "quote_sections"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "quote_section_options_category_option_id_fkey"
                        columns: ["category_option_id"]
                        isOneToOne: false
                        referencedRelation: "category_options"
                        referencedColumns: ["id"]
                    }
                ]
            }
            quote_item_options: {
                Row: {
                    id: string
                    riga_preventivo_id: string
                    category_option_id: string
                    selected_value_id: string | null
                    selected_text: string | null
                    selected_boolean: boolean | null
                    price_adjustment: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    riga_preventivo_id: string
                    category_option_id: string
                    selected_value_id?: string | null
                    selected_text?: string | null
                    selected_boolean?: boolean | null
                    price_adjustment?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    riga_preventivo_id?: string
                    category_option_id?: string
                    selected_value_id?: string | null
                    selected_text?: string | null
                    selected_boolean?: boolean | null
                    price_adjustment?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "quote_item_options_riga_preventivo_id_fkey"
                        columns: ["riga_preventivo_id"]
                        isOneToOne: false
                        referencedRelation: "righe_preventivo"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "quote_item_options_category_option_id_fkey"
                        columns: ["category_option_id"]
                        isOneToOne: false
                        referencedRelation: "category_options"
                        referencedColumns: ["id"]
                    }
                ]
            }
            sedi: {
                Row: {
                    attiva: boolean
                    cap: string
                    citta: string
                    cliente_id: string
                    created_at: string
                    id: string
                    indirizzo: string
                    nome_sede: string
                    note: string | null
                    provincia: string
                    referente: string | null
                    telefono_referente: string | null
                    updated_at: string
                }
                Insert: {
                    attiva?: boolean
                    cap: string
                    citta: string
                    cliente_id: string
                    created_at?: string
                    id?: string
                    indirizzo: string
                    nome_sede: string
                    note?: string | null
                    provincia: string
                    referente?: string | null
                    telefono_referente?: string | null
                    updated_at?: string
                }
                Update: {
                    attiva?: boolean
                    cap?: string
                    citta?: string
                    cliente_id?: string
                    created_at?: string
                    id?: string
                    indirizzo?: string
                    nome_sede?: string
                    note?: string | null
                    provincia?: string
                    referente?: string | null
                    telefono_referente?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "sedi_cliente_id_fkey"
                        columns: ["cliente_id"]
                        isOneToOne: false
                        referencedRelation: "clienti"
                        referencedColumns: ["id"]
                    }
                ]
            }
            payment_methods: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    is_active: boolean
                    sort_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    is_active?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    is_active?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            orders: {
                Row: {
                    id: string
                    quote_id: string
                    order_number: string
                    status: string
                    deduction_type: string | null
                    order_date: string
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    quote_id: string
                    order_number: string
                    status?: string
                    deduction_type?: string | null
                    order_date?: string
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    quote_id?: string
                    order_number?: string
                    status?: string
                    deduction_type?: string | null
                    order_date?: string
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_quote_id_fkey"
                        columns: ["quote_id"]
                        isOneToOne: false
                        referencedRelation: "preventivi"
                        referencedColumns: ["id"]
                    }
                ]
            }
            order_documents: {
                Row: {
                    id: string
                    order_id: string
                    document_type: string
                    document_name: string
                    file_url: string
                    generated_at: string
                }
                Insert: {
                    id?: string
                    order_id: string
                    document_type: string
                    document_name: string
                    file_url: string
                    generated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string
                    document_type?: string
                    document_name?: string
                    file_url?: string
                    generated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "order_documents_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    }
                ]
            }
            services: {
                Row: {
                    id: string
                    name: string
                    code: string | null
                    description: string | null
                    price: number
                    unit: string
                    is_active: boolean
                    sort_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    code?: string | null
                    description?: string | null
                    price?: number
                    unit?: string
                    is_active?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    code?: string | null
                    description?: string | null
                    price?: number
                    unit?: string
                    is_active?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            quote_services: {
                Row: {
                    id: string
                    quote_id: string
                    service_id: string
                    quantity: number
                    unit_price: number
                    notes: string | null
                    sort_order: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    quote_id: string
                    service_id: string
                    quantity?: number
                    unit_price: number
                    notes?: string | null
                    sort_order?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    quote_id?: string
                    service_id?: string
                    quantity?: number
                    unit_price?: number
                    notes?: string | null
                    sort_order?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "quote_services_quote_id_fkey"
                        columns: ["quote_id"]
                        isOneToOne: false
                        referencedRelation: "preventivi"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "quote_services_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            genera_numero_preventivo: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            genera_numero_ordine: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types for common usage
export type Cliente = Tables<'clienti'>
export type Sede = Tables<'sedi'>
export type Prodotto = Tables<'prodotti'>
export type ConfigurazioneProdotto = Tables<'configurazioni_prodotto'>
export type CostoIndiretto = Tables<'costi_indiretti'>
export type AliquotaIva = Tables<'aliquote_iva'>
export type Preventivo = Tables<'preventivi'>
export type RigaPreventivo = Tables<'righe_preventivo'>
export type ConfigurazioneRiga = Tables<'configurazioni_riga'>
export type CostoPreventivo = Tables<'costi_preventivo'>
export type Impostazioni = Tables<'impostazioni'>
export type Profile = Tables<'profiles'>
export type ProductOption = Tables<'product_options'>
export type ProductOptionValue = Tables<'product_option_values'>

// New table types (category options system)
export type Category = Tables<'categories'>
export type CategoryOption = Tables<'category_options'>
export type CategoryOptionValue = Tables<'category_option_values'>
export type QuoteSection = Tables<'quote_sections'>
export type QuoteSectionOption = Tables<'quote_section_options'>
export type QuoteItemOption = Tables<'quote_item_options'>

// New tables (refactoring)
export type PaymentMethod = Tables<'payment_methods'>
export type Order = Tables<'orders'>
export type OrderDocument = Tables<'order_documents'>
export type Service = Tables<'services'>
export type QuoteService = Tables<'quote_services'>

// Enum types
export type TipoCliente = 'privato' | 'azienda' | 'ente_pubblico'
export type CategoriaProduct = 'serramenti_pvc' | 'serramenti_legno_alluminio' | 'serramenti_alluminio' | 'persiane' | 'tapparelle' | 'zanzariere' | 'vari'
export type OptionType = 'select' | 'multi_select' | 'boolean' | 'text' | 'number'
export type PriceMode = 'fixed' | 'percentage' | 'per_sqm' | 'per_unit'
export type UnitaMisura = 'pezzo' | 'mq' | 'ml'
export type TipoConfigurazione = 'vetro' | 'colore' | 'accessorio' | 'maniglieria' | 'motorizzazione' | 'altro'
export type TipoMaggiorazione = 'fisso' | 'percentuale' | 'mq' | 'ml'
export type CategoriaCosto = 'trasporto' | 'attrezzature' | 'pratiche' | 'compensi' | 'altro'
export type StatoPreventivo = 'bozza' | 'inviato' | 'accettato' | 'rifiutato' | 'scaduto' | 'convertito_ordine'
export type RuoloUtente = 'admin' | 'operatore' | 'visualizzatore'
export type OrderStatus = 'confermato' | 'in_lavorazione' | 'completato' | 'annullato'
export type DeductionType = 'ecobonus' | 'bonus_casa' | 'bonus_sicurezza' | 'nessuna' | 'ecobonus_50' | 'bonus_casa_36'
export type DocumentType = 'privacy' | 'iva_declaration' | 'payment_terms' | 'atto_notorio' | 'scheda_enea'

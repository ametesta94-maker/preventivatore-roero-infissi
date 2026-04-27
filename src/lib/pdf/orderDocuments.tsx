/**
 * PDF React components per i documenti dell'ordine
 * Usa @react-pdf/renderer (solo server-side)
 */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { renderHtmlToPdf, replaceVariables } from '@/lib/pdf/htmlToPdfElements'

// --- Styles ---
const s = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 70,
    paddingHorizontal: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 12,
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginBottom: 2,
  },
  companyMeta: { fontSize: 8, color: '#6b7280', lineHeight: 1.4 },
  orderRef: { fontSize: 8, color: '#9ca3af', marginTop: 4 },
  docTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  docSubtitle: { fontSize: 9, textAlign: 'center', color: '#6b7280', marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
    marginBottom: 8,
    marginTop: 14,
  },
  fieldRow: { flexDirection: 'row', marginBottom: 5 },
  fieldLabel: { width: 160, fontSize: 9, color: '#6b7280', paddingTop: 1 },
  fieldValue: { flex: 1, fontSize: 10 },
  paragraph: { fontSize: 10, lineHeight: 1.7, marginBottom: 8, textAlign: 'justify' },
  paragraphBold: {
    fontSize: 10,
    lineHeight: 1.7,
    marginBottom: 8,
    textAlign: 'justify',
    fontFamily: 'Helvetica-Bold',
  },
  bullet: { fontSize: 10, lineHeight: 1.7, marginBottom: 6 },
  signatureArea: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  signatureBox: { width: '45%' },
  signatureLine: { borderTopWidth: 1, borderTopColor: '#9ca3af', marginBottom: 5 },
  signatureLabel: { fontSize: 8, color: '#9ca3af', textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 7.5,
    color: '#d1d5db',
  },
  fillBox: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 8,
    marginBottom: 8,
    minHeight: 35,
  },
  fillLabel: { fontSize: 7.5, color: '#9ca3af', marginBottom: 4 },
  divider: {
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    marginTop: 12,
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    padding: 10,
    marginBottom: 12,
  },
  infoText: { fontSize: 9, color: '#0c4a6e', lineHeight: 1.5 },
  halfLeft: { width: '47%' },
  halfRight: { width: '47%', marginLeft: 'auto' },
  spacer6: { height: 6 },
})

// --- Interfaces ---
export interface OrderDocumentData {
  azienda: {
    nome_azienda: string
    indirizzo_azienda?: string | null
    citta_azienda?: string | null
    cap_azienda?: string | null
    partita_iva?: string | null
    codice_fiscale?: string | null
    email?: string | null
    telefono?: string | null
    testo_informativa_privacy?: string | null
    testo_condizioni_vendita?: string | null
    dichiarazione_iva_agevolata?: string | null
    testo_condizioni_pagamento_doc?: string | null
    testo_iva_agevolata_doc?: string | null
    testo_atto_notorio?: string | null
    testo_scheda_enea?: string | null
  }
  cliente: {
    ragione_sociale: string
    codice_fiscale?: string | null
    partita_iva?: string | null
    indirizzo?: string | null
    citta?: string | null
    cap?: string | null
    provincia?: string | null
    email?: string | null
    telefono_principale?: string | null
  }
  preventivo: {
    numero: string
    totale_imponibile?: number | null
    aliquota_iva?: number | null
  }
  paymentMethodName?: string | null
  order: {
    order_number: string
    order_date: string
    deduction_type: string
  }
}

// --- Shared helpers ---

function DocHeader({ data }: { data: OrderDocumentData }) {
  const { azienda, order, preventivo } = data
  const address = [azienda.indirizzo_azienda, azienda.citta_azienda].filter(Boolean).join(', ')
  const meta = [
    azienda.partita_iva ? `P.IVA: ${azienda.partita_iva}` : '',
    azienda.email || '',
    azienda.telefono || '',
  ]
    .filter(Boolean)
    .join('  •  ')

  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <Text style={s.companyName}>{azienda.nome_azienda}</Text>
        {address ? <Text style={s.companyMeta}>{address}</Text> : null}
        {meta ? <Text style={s.companyMeta}>{meta}</Text> : null}
      </View>
      <View style={s.headerRight}>
        <Text style={s.companyMeta}>Ordine N° {order.order_number}</Text>
        <Text style={s.orderRef}>Data: {order.order_date}</Text>
        <Text style={s.orderRef}>Rif. Preventivo: {preventivo.numero}</Text>
      </View>
    </View>
  )
}

function ClienteBlock({ cliente }: { cliente: OrderDocumentData['cliente'] }) {
  const address = [cliente.indirizzo, cliente.citta, cliente.cap, cliente.provincia]
    .filter(Boolean)
    .join(', ')

  return (
    <View>
      <Text style={s.sectionTitle}>Dati del Cliente</Text>
      <View style={s.fieldRow}>
        <Text style={s.fieldLabel}>Nominativo / Ragione Sociale:</Text>
        <Text style={s.fieldValue}>{cliente.ragione_sociale}</Text>
      </View>
      {cliente.codice_fiscale ? (
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Codice Fiscale:</Text>
          <Text style={s.fieldValue}>{cliente.codice_fiscale}</Text>
        </View>
      ) : null}
      {cliente.partita_iva ? (
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Partita IVA:</Text>
          <Text style={s.fieldValue}>{cliente.partita_iva}</Text>
        </View>
      ) : null}
      {address ? (
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Indirizzo:</Text>
          <Text style={s.fieldValue}>{address}</Text>
        </View>
      ) : null}
      {cliente.email ? (
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Email:</Text>
          <Text style={s.fieldValue}>{cliente.email}</Text>
        </View>
      ) : null}
    </View>
  )
}

function SignatureRow({
  left = 'Per il Fornitore',
  right = 'Firma del Cliente',
}: {
  left?: string
  right?: string
}) {
  return (
    <View style={s.signatureArea}>
      <View style={s.signatureBox}>
        <View style={s.signatureLine} />
        <Text style={s.signatureLabel}>{left}</Text>
      </View>
      <View style={s.signatureBox}>
        <View style={s.signatureLine} />
        <Text style={s.signatureLabel}>{right}</Text>
      </View>
    </View>
  )
}

function TextBlock({ text }: { text: string }) {
  const paragraphs = text.split('\n').filter((p) => p.trim().length > 0)
  return (
    <View>
      {paragraphs.map((p, i) => (
        <Text key={i} style={s.paragraph}>
          {p.trim()}
        </Text>
      ))}
    </View>
  )
}

function PageFooter({ azienda }: { azienda: OrderDocumentData['azienda'] }) {
  const info = [
    azienda.nome_azienda,
    azienda.partita_iva ? `P.IVA: ${azienda.partita_iva}` : '',
  ]
    .filter(Boolean)
    .join(' — ')
  return <Text style={s.footer}>{info}</Text>
}

const DEDUCTION_LABELS: Record<string, string> = {
  ecobonus: 'Ecobonus (D.L. 63/2013 conv. L. 90/2013)',
  bonus_casa: 'Bonus Casa (Art. 16-bis TUIR)',
  bonus_sicurezza: 'Bonus Sicurezza (D.L. 63/2013)',
  // Legacy support
  ecobonus_50: 'Ecobonus (D.L. 63/2013 conv. L. 90/2013)',
  bonus_casa_36: 'Bonus Casa (Art. 16-bis TUIR)',
}

// =====================================================
// 1. INFORMATIVA PRIVACY
// =====================================================
export function PrivacyDocument({ data }: { data: OrderDocumentData }) {
  const { azienda, cliente } = data
  const defaultText =
    `Ai sensi del Regolamento Europeo 2016/679 (GDPR) e del D.Lgs. 196/2003 e successive modifiche, La informiamo che i Suoi dati personali saranno trattati da ${azienda.nome_azienda} per le seguenti finalità: esecuzione del contratto di fornitura e posa in opera, adempimenti fiscali e contabili, gestione delle pratiche burocratiche connesse ai lavori.\n` +
    `I dati raccolti potranno essere comunicati esclusivamente a soggetti funzionalmente collegati all'esecuzione delle attività (es. installatori, enti previdenziali, autorità fiscali), nel rispetto della normativa vigente. I dati non saranno trasferiti a Paesi al di fuori dell'Unione Europea.\n` +
    `I dati saranno conservati per il tempo necessario all'adempimento degli obblighi contrattuali e di legge (normalmente 10 anni).\n` +
    `Lei ha il diritto di accedere ai propri dati, richiederne la rettifica, la cancellazione o la limitazione del trattamento, nonché di opporsi al trattamento e di proporre reclamo all'Autorità Garante per la protezione dei dati personali.` +
    (azienda.email ? ` Per esercitare tali diritti: ${azienda.email}.` : '')

  const customPrivacyText = azienda.testo_informativa_privacy

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <DocHeader data={data} />
        <Text style={s.docTitle}>INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI</Text>
        <Text style={s.docSubtitle}>Ai sensi del Reg. UE 2016/679 (GDPR) e del D.Lgs. 196/2003</Text>
        <ClienteBlock cliente={cliente} />
        <View style={s.divider} />
        {customPrivacyText
          ? renderHtmlToPdf(replaceVariables(customPrivacyText, {
              nome_azienda: azienda.nome_azienda || '',
              nome_cliente: cliente.ragione_sociale || '',
              codice_fiscale: cliente.codice_fiscale || '',
              indirizzo_cliente: [cliente.indirizzo, cliente.citta].filter(Boolean).join(', '),
              email_azienda: azienda.email || '',
            }))
          : <TextBlock text={defaultText} />
        }
        <View style={s.divider} />
        <Text style={s.paragraph}>
          Il/La sottoscritto/a dichiara di aver ricevuto e compreso l&apos;informativa sul
          trattamento dei dati personali e presta il proprio consenso al trattamento degli stessi per
          le finalità indicate.
        </Text>
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Luogo e Data:</Text>
          <Text style={s.fieldValue}>__________________________________</Text>
        </View>
        <SignatureRow left={azienda.nome_azienda} right="Firma del Cliente" />
        <PageFooter azienda={azienda} />
      </Page>
    </Document>
  )
}

// =====================================================
// 2. CONDIZIONI DI PAGAMENTO
// =====================================================
export function CondizioniPagamentoDocument({ data }: { data: OrderDocumentData }) {
  const { azienda, cliente, preventivo, paymentMethodName } = data
  const defaultText = `Il pagamento dovrà essere effettuato secondo le modalità concordate tra le parti. L'importo dovuto è quello indicato nel preventivo accettato. In caso di ritardo nel pagamento saranno dovuti interessi di mora ai sensi del D.Lgs. 231/2002.`

  let condizioniText = azienda.testo_condizioni_pagamento_doc || azienda.testo_condizioni_vendita || defaultText
  condizioniText = replaceVariables(condizioniText, {
    modalita_pagamento: paymentMethodName || '—',
    nome_cliente: cliente.ragione_sociale || '',
    numero_preventivo: preventivo.numero || '',
    nome_azienda: azienda.nome_azienda || '',
  })

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <DocHeader data={data} />
        <Text style={s.docTitle}>CONDIZIONI DI PAGAMENTO E VENDITA</Text>
        <Text style={s.docSubtitle}>Preventivo N° {preventivo.numero}</Text>
        <ClienteBlock cliente={cliente} />
        {paymentMethodName ? (
          <View>
            <Text style={s.sectionTitle}>Modalità di Pagamento Concordata</Text>
            <View style={s.infoBox}>
              <Text style={s.infoText}>{paymentMethodName}</Text>
            </View>
          </View>
        ) : null}
        <Text style={s.sectionTitle}>Condizioni Generali</Text>
        {renderHtmlToPdf(condizioniText)}
        <View style={s.divider} />
        <Text style={s.paragraph}>
          Il/La sottoscritto/a dichiara di aver letto e di accettare integralmente le condizioni di
          vendita e pagamento sopra riportate.
        </Text>
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Luogo e Data:</Text>
          <Text style={s.fieldValue}>__________________________________</Text>
        </View>
        <SignatureRow left={azienda.nome_azienda} right="Firma del Cliente" />
        <PageFooter azienda={azienda} />
      </Page>
    </Document>
  )
}

// =====================================================
// 3. DICHIARAZIONE IVA AGEVOLATA
// =====================================================
export function IvaAgevolataDocument({ data }: { data: OrderDocumentData }) {
  const { azienda, cliente, preventivo } = data
  const defaultText =
    `Il/La sottoscritto/a dichiara, ai fini dell'applicazione dell'aliquota IVA agevolata al 10% prevista dal D.P.R. n. 633/1972 (Tabella A, Parte III, n. 127-undecies), che i lavori di ristrutturazione/manutenzione per i quali è emesso il preventivo N° ${preventivo.numero} vengono eseguiti su immobile a uso residenziale privato.\n` +
    `L'immobile non rientra nelle categorie catastali A/1 (abitazioni di tipo signorile), A/8 (ville) e A/9 (castelli e palazzi).\n` +
    `Il/La sottoscritto/a è consapevole che, in caso di dichiarazione mendace, sarà tenuto/a al pagamento della differenza tra l'aliquota ordinaria (22%) e quella agevolata applicata (10%), oltre alle sanzioni previste dalla legge.`

  const ivaText = replaceVariables(
    azienda.testo_iva_agevolata_doc || azienda.dichiarazione_iva_agevolata || defaultText,
    {
      nome_cliente: cliente.ragione_sociale || '',
      codice_fiscale: cliente.codice_fiscale || '',
      numero_preventivo: preventivo.numero || '',
      nome_azienda: azienda.nome_azienda || '',
      indirizzo_cliente: [cliente.indirizzo, cliente.citta].filter(Boolean).join(', '),
    }
  )

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <DocHeader data={data} />
        <Text style={s.docTitle}>
          DICHIARAZIONE PER L&apos;APPLICAZIONE DELL&apos;ALIQUOTA IVA AGEVOLATA AL 10%
        </Text>
        <Text style={s.docSubtitle}>
          D.P.R. n. 633/1972 — Tabella A, Parte III, n. 127-undecies
        </Text>
        <ClienteBlock cliente={cliente} />
        <View style={s.divider} />
        <Text style={s.sectionTitle}>Dichiarazione del Cliente</Text>
        {renderHtmlToPdf(ivaText)}
        <Text style={s.sectionTitle}>Dati dell&apos;Immobile Oggetto dei Lavori</Text>
        <View style={s.fillBox}>
          <Text style={s.fillLabel}>Indirizzo completo dell&apos;immobile:</Text>
          <Text style={s.spacer6}> </Text>
        </View>
        <View style={s.fieldRow}>
          <View style={s.halfLeft}>
            <View style={s.fillBox}>
              <Text style={s.fillLabel}>Comune:</Text>
              <Text style={s.spacer6}> </Text>
            </View>
          </View>
          <View style={s.halfRight}>
            <View style={s.fillBox}>
              <Text style={s.fillLabel}>Foglio / Particella / Subalterno Catastale:</Text>
              <Text style={s.spacer6}> </Text>
            </View>
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Luogo e Data:</Text>
          <Text style={s.fieldValue}>__________________________________</Text>
        </View>
        <SignatureRow left={azienda.nome_azienda} right="Firma del Cliente" />
        <PageFooter azienda={azienda} />
      </Page>
    </Document>
  )
}

// =====================================================
// 4. ATTO NOTORIO (solo se con detrazione)
// =====================================================
export function AttoNotorioDocument({ data }: { data: OrderDocumentData }) {
  const { azienda, cliente, preventivo, order } = data
  const deductionLabel = DEDUCTION_LABELS[order.deduction_type] || order.deduction_type

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <DocHeader data={data} />
        <Text style={s.docTitle}>DICHIARAZIONE SOSTITUTIVA DELL&apos;ATTO DI NOTORIETÀ</Text>
        <Text style={s.docSubtitle}>Art. 47 D.P.R. 28 dicembre 2000, n. 445</Text>
        <ClienteBlock cliente={cliente} />
        <View style={s.divider} />
        {azienda.testo_atto_notorio ? (
          <View>{renderHtmlToPdf(replaceVariables(azienda.testo_atto_notorio, {
            nome_cliente: cliente.ragione_sociale || '',
            codice_fiscale: cliente.codice_fiscale || '',
            tipo_detrazione: deductionLabel,
            numero_preventivo: preventivo.numero || '',
            nome_azienda: azienda.nome_azienda || '',
            indirizzo_cliente: [cliente.indirizzo, cliente.citta].filter(Boolean).join(', '),
          }))}</View>
        ) : (
          <>
            <Text style={s.sectionTitle}>Dichiarazione</Text>
            <Text style={s.paragraph}>
              Il/La sottoscritto/a, consapevole delle conseguenze civili e penali previste dagli artt.
              75 e 76 del D.P.R. 445/2000 in caso di dichiarazioni false o mendaci,
            </Text>
            <Text style={s.paragraphBold}>DICHIARA</Text>
            <Text style={s.bullet}>
              • di essere proprietario/a o avente diritto sull&apos;immobile oggetto dei lavori
              indicato di seguito;
            </Text>
            <Text style={s.bullet}>
              • che i lavori oggetto del preventivo N° {preventivo.numero} emesso da{' '}
              {azienda.nome_azienda} sono eseguiti sull&apos;immobile sotto indicato;
            </Text>
            <Text style={s.bullet}>
              • che per detti lavori intende usufruire della detrazione fiscale: {deductionLabel};
            </Text>
            <Text style={s.bullet}>
              • che l&apos;immobile è regolarmente censito presso il Catasto e non è classificato nelle
              categorie catastali A/1, A/8, A/9;
            </Text>
            <Text style={s.bullet}>
              • che sono stati rispettati gli obblighi di pagamento con strumenti tracciabili (bonifico
              bancario o postale) ai sensi della normativa vigente.
            </Text>
            <Text style={s.sectionTitle}>Dati dell&apos;Immobile Oggetto dei Lavori</Text>
            <View style={s.fillBox}>
              <Text style={s.fillLabel}>Indirizzo completo:</Text>
              <Text style={s.spacer6}> </Text>
            </View>
            <View style={s.fieldRow}>
              <View style={s.halfLeft}>
                <View style={s.fillBox}>
                  <Text style={s.fillLabel}>Comune:</Text>
                  <Text style={s.spacer6}> </Text>
                </View>
              </View>
              <View style={s.halfRight}>
                <View style={s.fillBox}>
                  <Text style={s.fillLabel}>Foglio / Particella / Subalterno:</Text>
                  <Text style={s.spacer6}> </Text>
                </View>
              </View>
            </View>
            <View style={s.fillBox}>
              <Text style={s.fillLabel}>Destinazione d&apos;uso (es. abitazione principale, secondaria, locata):</Text>
              <Text style={s.spacer6}> </Text>
            </View>
            <View style={s.divider} />
            <Text style={s.paragraph}>
              Il/La sottoscritto/a è consapevole che la presente dichiarazione è resa ai sensi
              dell&apos;art. 47 D.P.R. 445/2000 e che le dichiarazioni mendaci comportano le sanzioni
              penali previste dall&apos;art. 76 dello stesso decreto.
            </Text>
          </>
        )}
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Luogo e Data:</Text>
          <Text style={s.fieldValue}>__________________________________</Text>
        </View>
        <SignatureRow left="Timbro e Firma del Fornitore" right="Firma del Dichiarante" />
        <PageFooter azienda={azienda} />
      </Page>
    </Document>
  )
}

// =====================================================
// 5. SCHEDA ENEA (solo se con detrazione)
// =====================================================
export function SchedaENEADocument({ data }: { data: OrderDocumentData }) {
  const { azienda, cliente, preventivo, order } = data
  const deductionLabel = DEDUCTION_LABELS[order.deduction_type] || order.deduction_type

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <DocHeader data={data} />
        <Text style={s.docTitle}>SCHEDA INFORMATIVA INTERVENTO — RIFERIMENTO ENEA</Text>
        <Text style={s.docSubtitle}>
          Comunicazione per interventi di risparmio energetico (L. 296/2006 e s.m.i.)
        </Text>
        {azienda.testo_scheda_enea ? (
          <View>
            <ClienteBlock cliente={cliente} />
            <View style={s.divider} />
            {renderHtmlToPdf(replaceVariables(azienda.testo_scheda_enea, {
              nome_cliente: cliente.ragione_sociale || '',
              codice_fiscale: cliente.codice_fiscale || '',
              tipo_detrazione: deductionLabel,
              numero_preventivo: preventivo.numero || '',
              nome_azienda: azienda.nome_azienda || '',
              importo_lavori: preventivo.totale_imponibile
                ? `€ ${preventivo.totale_imponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
                : '________',
              indirizzo_cliente: [cliente.indirizzo, cliente.citta].filter(Boolean).join(', '),
            }))}
          </View>
        ) : (
          <>
            <View style={s.infoBox}>
              <Text style={s.infoText}>
                IMPORTANTE: La comunicazione all&apos;ENEA è obbligatoria per le detrazioni fiscali per
                riqualificazione energetica. Deve essere effettuata online su: bonusfiscali.enea.it
                entro 90 giorni dalla data del collaudo / fine lavori. Il presente documento è un
                riepilogo di riferimento da conservare.
              </Text>
            </View>
            <ClienteBlock cliente={cliente} />
            <Text style={s.sectionTitle}>Dati dell&apos;Edificio</Text>
            <View style={s.fillBox}>
              <Text style={s.fillLabel}>Indirizzo dell&apos;immobile:</Text>
              <Text style={s.spacer6}> </Text>
            </View>
            <View style={s.fieldRow}>
              <View style={s.halfLeft}>
                <View style={s.fillBox}>
                  <Text style={s.fillLabel}>Comune:</Text>
                  <Text style={s.spacer6}> </Text>
                </View>
              </View>
              <View style={s.halfRight}>
                <View style={s.fillBox}>
                  <Text style={s.fillLabel}>Anno di costruzione:</Text>
                  <Text style={s.spacer6}> </Text>
                </View>
              </View>
            </View>
            <View style={s.fillBox}>
              <Text style={s.fillLabel}>Destinazione d&apos;uso (es. residenziale, commerciale):</Text>
              <Text style={s.spacer6}> </Text>
            </View>
            <Text style={s.sectionTitle}>Tipo di Intervento</Text>
            <Text style={s.paragraph}>Sostituzione serramenti e infissi</Text>
            <View style={s.fillBox}>
              <Text style={s.fillLabel}>Descrizione specifica (es. finestre PVC, serrande, portoni):</Text>
              <Text style={s.spacer6}> </Text>
            </View>
            <View style={s.fieldRow}>
              <View style={s.halfLeft}>
                <View style={s.fillBox}>
                  <Text style={s.fillLabel}>Trasmittanza U prima dei lavori (W/m²K):</Text>
                  <Text style={s.spacer6}> </Text>
                </View>
              </View>
              <View style={s.halfRight}>
                <View style={s.fillBox}>
                  <Text style={s.fillLabel}>Trasmittanza U dopo i lavori (W/m²K):</Text>
                  <Text style={s.spacer6}> </Text>
                </View>
              </View>
            </View>
            <View style={s.fillBox}>
              <Text style={s.fillLabel}>Superficie totale serramenti sostituiti (m²):</Text>
              <Text style={s.spacer6}> </Text>
            </View>
            <Text style={s.sectionTitle}>Importi e Detrazione</Text>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Importo lavori (imponibile):</Text>
              <Text style={s.fieldValue}>
                {preventivo.totale_imponibile
                  ? `€ ${preventivo.totale_imponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
                  : '_________________________ €'}
              </Text>
            </View>
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>Tipo di detrazione:</Text>
              <Text style={s.fieldValue}>{deductionLabel}</Text>
            </View>
          </>
        )}
        <View style={s.divider} />
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Luogo e Data:</Text>
          <Text style={s.fieldValue}>__________________________________</Text>
        </View>
        <SignatureRow left={azienda.nome_azienda} right="Firma del Cliente" />
        <PageFooter azienda={azienda} />
      </Page>
    </Document>
  )
}

/**
 * Genera e salva su Supabase Storage i PDF dei documenti dell'ordine.
 * Chiamato dalla API route POST /api/ordini dopo la creazione dell'ordine.
 */
import React from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { createAdminClient } from '@/lib/supabase/server'
import {
  PrivacyDocument,
  CondizioniPagamentoDocument,
  IvaAgevolataDocument,
  AttoNotorioDocument,
  SchedaENEADocument,
  OrderDocumentData,
} from './orderDocuments'

const BUCKET = 'order-documents'

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

export async function generateAndStoreOrderDocuments(
  orderId: string,
  quoteId: string
): Promise<void> {
  const supabase = await createAdminClient()

  // Fetch all data in parallel
  const [{ data: impostazioni }, { data: preventivo }, { data: order }] = await Promise.all([
    supabase.from('impostazioni').select('*').single(),
    supabase
      .from('preventivi')
      .select(
        `
        numero,
        totale_preventivo,
        aliquote_iva ( percentuale ),
        payment_methods ( name, description ),
        clienti (
          ragione_sociale,
          codice_fiscale,
          partita_iva,
          indirizzo,
          citta,
          cap,
          provincia,
          email,
          telefono_principale
        )
      `
      )
      .eq('id', quoteId)
      .single(),
    supabase
      .from('orders')
      .select('order_number, order_date, deduction_type')
      .eq('id', orderId)
      .single(),
  ])

  if (!impostazioni || !preventivo || !order) {
    console.error('[generateOrderDocuments] Missing data:', {
      impostazioni: !!impostazioni,
      preventivo: !!preventivo,
      order: !!order,
    })
    return
  }

  const cliente = (preventivo.clienti as any) || {}
  const paymentMethod = (preventivo.payment_methods as any)
  const aliquotaIva = (preventivo.aliquote_iva as any)

  const docData: OrderDocumentData = {
    azienda: {
      nome_azienda: impostazioni.nome_azienda || 'Roero Infissi',
      indirizzo_azienda: impostazioni.indirizzo_azienda,
      citta_azienda: impostazioni.citta_azienda,
      cap_azienda: impostazioni.cap_azienda,
      partita_iva: impostazioni.partita_iva,
      codice_fiscale: impostazioni.codice_fiscale,
      email: impostazioni.email,
      telefono: impostazioni.telefono,
      testo_informativa_privacy: impostazioni.testo_informativa_privacy,
      testo_condizioni_vendita: impostazioni.testo_condizioni_vendita,
      dichiarazione_iva_agevolata: impostazioni.dichiarazione_iva_agevolata,
      testo_condizioni_pagamento_doc: impostazioni.testo_condizioni_pagamento_doc,
      testo_iva_agevolata_doc: impostazioni.testo_iva_agevolata_doc,
      testo_atto_notorio: impostazioni.testo_atto_notorio,
      testo_scheda_enea: impostazioni.testo_scheda_enea,
    },
    cliente: {
      ragione_sociale: cliente.ragione_sociale || '',
      codice_fiscale: cliente.codice_fiscale,
      partita_iva: cliente.partita_iva,
      indirizzo: cliente.indirizzo,
      citta: cliente.citta,
      cap: cliente.cap,
      provincia: cliente.provincia,
      email: cliente.email,
      telefono_principale: cliente.telefono_principale,
    },
    preventivo: {
      numero: preventivo.numero || '',
      totale_imponibile: (preventivo as any).totale_preventivo,
      aliquota_iva: aliquotaIva?.percentuale,
    },
    paymentMethodName: paymentMethod?.name,
    order: {
      order_number: order.order_number,
      order_date: new Date(order.order_date).toLocaleDateString('it-IT'),
      deduction_type: order.deduction_type || 'nessuna',
    },
  }

  // Create bucket if it doesn't exist (ignore error if already exists)
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  // Define which documents to generate
  const hasDeduction = order.deduction_type && order.deduction_type !== 'nessuna'

  const documents: Array<{ type: string; name: string; element: React.ReactElement }> = [
    {
      type: 'informativa_privacy',
      name: 'Informativa Privacy',
      element: React.createElement(PrivacyDocument, { data: docData }),
    },
    {
      type: 'condizioni_pagamento',
      name: 'Condizioni di Pagamento',
      element: React.createElement(CondizioniPagamentoDocument, { data: docData }),
    },
    {
      type: 'iva_agevolata',
      name: 'Dichiarazione IVA Agevolata',
      element: React.createElement(IvaAgevolataDocument, { data: docData }),
    },
  ]

  if (hasDeduction) {
    documents.push(
      {
        type: 'atto_notorio',
        name: 'Atto Notorio',
        element: React.createElement(AttoNotorioDocument, { data: docData }),
      },
      {
        type: 'scheda_enea',
        name: 'Scheda ENEA',
        element: React.createElement(SchedaENEADocument, { data: docData }),
      }
    )
  }

  // Render, upload, and record each document
  for (const doc of documents) {
    try {
      const stream = await renderToStream(doc.element as any)
      const buffer = await streamToBuffer(stream as unknown as NodeJS.ReadableStream)
      const filePath = `${orderId}/${doc.type}.pdf`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, { contentType: 'application/pdf', upsert: true })

      if (uploadError) {
        console.error(`[generateOrderDocuments] Upload failed for ${doc.type}:`, uploadError)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

      const { error: insertError } = await supabase.from('order_documents').insert({
        order_id: orderId,
        document_type: doc.type,
        document_name: doc.name,
        file_url: publicUrl,
      })

      if (insertError) {
        console.error(`[generateOrderDocuments] Insert failed for ${doc.type}:`, insertError)
      }
    } catch (err) {
      console.error(`[generateOrderDocuments] Error for ${doc.type}:`, err)
    }
  }
}

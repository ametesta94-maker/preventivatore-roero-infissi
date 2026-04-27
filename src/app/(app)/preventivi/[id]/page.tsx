import { createAdminClient as createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QuoteDocument from '@/components/preventivi/QuoteDocument'
import ConvertToOrderButton from '@/components/ordini/ConvertToOrderButton'

export const dynamic = 'force-dynamic'

export default async function PreventivoPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch preventivo with relations
  const { data: rawPreventivo, error } = await supabase
    .from('preventivi')
    .select(
      `*, clienti (*), sedi (*), aliquote_iva (*), payment_methods (*)`
    )
    .eq('id', id)
    .single()

  if (error || !rawPreventivo) {
    notFound()
  }

  const preventivo = rawPreventivo as any

  // Fetch company info
  const { data: azienda } = await supabase.from('impostazioni').select('*').single()

  // Fetch sections with category info
  const { data: sections } = await supabase
    .from('quote_sections')
    .select('*, categories (*)')
    .eq('preventivo_id', id)
    .order('ordine')

  // Fetch section options
  const sectionIds = (sections || []).map((s) => s.id)
  const { data: rawSectionOptions } =
    sectionIds.length > 0
      ? await supabase
        .from('quote_section_options')
        .select(
          '*, category_options (*)'
        )
        .in('quote_section_id', sectionIds)
      : { data: [] }

  // Manually fetch section option values
  const sectionValueIds = (rawSectionOptions || [])
    .map((o) => o.selected_value_id)
    .filter((id): id is string => id !== null)

  const { data: sectionOptionValues } =
    sectionValueIds.length > 0
      ? await supabase.from('category_option_values').select('*').in('id', sectionValueIds)
      : { data: [] }

  const sectionOptions = (rawSectionOptions || []).map((opt) => ({
    ...opt,
    category_option_values:
      sectionOptionValues?.find((v) => v.id === opt.selected_value_id) || null,
  }))

  // Fetch line items grouped by section
  const { data: righe } = await supabase
    .from('righe_preventivo')
    .select('*, prodotti (*)')
    .eq('preventivo_id', id)
    .order('numero_riga')

  // Fetch item options
  const rigaIds = (righe || []).map((r) => r.id)
  const { data: rawItemOptions } =
    rigaIds.length > 0
      ? await supabase
        .from('quote_item_options')
        .select(
          '*, category_options (*)'
        )
        .in('riga_preventivo_id', rigaIds)
      : { data: [] }

  // Manually fetch item option values
  const itemValueIds = (rawItemOptions || [])
    .map((o) => o.selected_value_id)
    .filter((id): id is string => id !== null)

  const { data: itemOptionValues } =
    itemValueIds.length > 0
      ? await supabase.from('category_option_values').select('*').in('id', itemValueIds)
      : { data: [] }

  const itemOptions = (rawItemOptions || []).map((opt) => ({
    ...opt,
    category_option_values:
      itemOptionValues?.find((v) => v.id === opt.selected_value_id) || null,
  }))

  // Fetch quote services
  const { data: quoteServices } = await supabase
    .from('quote_services')
    .select('*, services(name)')
    .eq('quote_id', id)
    .order('sort_order')

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', maxWidth: 'var(--container-max-width)', margin: '0 auto 16px' }}>
        <ConvertToOrderButton
          quoteId={preventivo.id}
          quoteNumber={preventivo.numero}
          quoteStatus={preventivo.stato}
        />
      </div>
      <QuoteDocument
        preventivo={preventivo}
        sections={sections || []}
        sectionOptions={sectionOptions || []}
        righe={righe || []}
        itemOptions={itemOptions || []}
        azienda={azienda}
        quoteServices={quoteServices || []}
      />
    </>
  )
}


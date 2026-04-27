'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types/database'
import type { QuoteServiceState } from '@/lib/hooks/useQuoteForm'
import styles from './QuoteServices.module.css'

interface QuoteServicesProps {
    services: QuoteServiceState[]
    onAddService: () => void
    onRemoveService: (tempId: string) => void
    onUpdateService: (tempId: string, field: string, value: string | number) => void
}

export default function QuoteServices({
    services,
    onAddService,
    onRemoveService,
    onUpdateService,
}: QuoteServicesProps) {
    const [availableServices, setAvailableServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadServices = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')

            if (!error && data) {
                setAvailableServices(data)
            }
            setLoading(false)
        }

        loadServices()
    }, [])

    const handleServiceSelect = (tempId: string, serviceId: string) => {
        const service = availableServices.find(s => s.id === serviceId)
        if (service) {
            onUpdateService(tempId, 'service_id', serviceId)
            onUpdateService(tempId, 'service_name', service.name)
            onUpdateService(tempId, 'unit_price', service.price)
        }
    }

    const calculateServiceTotal = (service: QuoteServiceState) => {
        return service.quantity * service.unit_price
    }

    const calculateServicesTotal = () => {
        return services.reduce((sum, s) => sum + calculateServiceTotal(s), 0)
    }

    if (loading) return null

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Servizi Aggiuntivi</h3>
                <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={onAddService}
                >
                    + Aggiungi Servizio
                </button>
            </div>

            {services.length > 0 && (
                <div className={styles.servicesTable}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Servizio</th>
                                <th style={{ width: '15%' }}>Quantità</th>
                                <th style={{ width: '20%' }}>Prezzo Unit.</th>
                                <th style={{ width: '20%' }}>Totale</th>
                                <th style={{ width: '10%' }}>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.tempId}>
                                    <td>
                                        <select
                                            className="form-input"
                                            value={service.service_id}
                                            onChange={(e) => handleServiceSelect(service.tempId, e.target.value)}
                                        >
                                            <option value="">Seleziona servizio...</option>
                                            {availableServices.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={service.quantity}
                                            onChange={(e) => onUpdateService(service.tempId, 'quantity', parseInt(e.target.value) || 1)}
                                            min="1"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={service.unit_price}
                                            onChange={(e) => onUpdateService(service.tempId, 'unit_price', parseFloat(e.target.value) || 0)}
                                            step="0.01"
                                            min="0"
                                        />
                                    </td>
                                    <td className={styles.totalCell}>
                                        € {calculateServiceTotal(service).toFixed(2)}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline"
                                            onClick={() => onRemoveService(service.tempId)}
                                            title="Rimuovi servizio"
                                            style={{ color: 'var(--color-danger)' }}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>
                                    Totale Servizi:
                                </td>
                                <td className={styles.totalCell} style={{ fontWeight: 600 }}>
                                    € {calculateServicesTotal().toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    )
}

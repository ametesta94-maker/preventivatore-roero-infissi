'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RevenueChartProps {
    data: {
        month: string
        revenue: number
        count: number
    }[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-[400px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Andamento Preventivi (Ultimi 12 Mesi)</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            fontSize={12}
                            tickMargin={10}
                        />
                        <YAxis
                            fontSize={12}
                            tickFormatter={(value) => `€${value / 1000}k`}
                        />
                        <Tooltip
                            formatter={(value: number | string | Array<number | string> | undefined) => {
                                if (typeof value === 'number') {
                                    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
                                }
                                return value;
                            }}
                            labelStyle={{ color: '#333' }}
                        />
                        <Legend />
                        <Bar
                            dataKey="revenue"
                            name="Valore Preventivi"
                            fill="#00A9CE"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

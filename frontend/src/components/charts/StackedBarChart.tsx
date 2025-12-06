import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Domain, DOMAIN_COLORS } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../hooks/useSettings';

interface StackedBarChartProps {
    data: { name: string; value: number; id: string }[];
    domains: Domain[];
    loading?: boolean;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
    data,
    loading = false,
}) => {
    const { theme } = useTheme();
    const { formatCurrencyCompact, formatCurrency } = useSettings();
    const isDark = theme === 'dark';

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;

        const tooltipData = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="label">{tooltipData.name}</p>
                <div className="item">
                    <span className="item-label">Total Cost</span>
                    <span className="item-value">{formatCurrency(tooltipData.value)}</span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="card p-6 h-[350px]">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="skeleton h-full rounded-lg"></div>
            </div>
        );
    }

    const textColor = isDark ? '#e5e5e5' : '#737373';
    const labelColor = isDark ? '#f5f5f5' : '#525252';
    const gridColor = isDark ? '#404040' : '#e5e5e5';

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Cost by Domain
            </h3>
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                        <XAxis
                            type="number"
                            tickFormatter={(value) => formatCurrencyCompact(value)}
                            tick={{ fontSize: 12, fill: textColor }}
                            tickLine={false}
                            axisLine={{ stroke: gridColor }}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 12, fill: labelColor }}
                            tickLine={false}
                            axisLine={false}
                            width={150}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                            {data.map((entry) => (
                                <Cell
                                    key={entry.id}
                                    fill={DOMAIN_COLORS[entry.id] || '#6366f1'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StackedBarChart;

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';
import { PieChartDataPoint } from '../../types';
import { useSettings } from '../../hooks/useSettings';

interface DonutChartProps {
    data: PieChartDataPoint[];
    title: string;
    loading?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    title,
    loading = false,
}) => {
    const { formatCurrency, formatCurrencyCompact } = useSettings();

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;

        const tooltipData = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="label">{tooltipData.name}</p>
                <div className="item">
                    <span className="item-label">Cost</span>
                    <span className="item-value">{formatCurrency(tooltipData.value)}</span>
                </div>
            </div>
        );
    };

    const renderLegend = (props: any) => {
        const { payload } = props;

        return (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-neutral-600 dark:text-neutral-300">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="card p-6 h-[350px]">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="skeleton h-48 w-48 rounded-full mx-auto"></div>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">{title}</h3>
            <div className="h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center total */}
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {formatCurrencyCompact(total)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Total</p>
                </div>
            </div>
        </div>
    );
};

export default DonutChart;

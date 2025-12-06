import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Domain, AWSService, DOMAIN_COLORS, SERVICE_COLORS } from '../../types';
import { formatShortDate } from '../../utils/helpers';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../hooks/useSettings';

interface TimeSeriesChartProps {
    data: { date: string;[key: string]: string | number }[];
    entities: (Domain | AWSService)[];
    groupBy: 'domain' | 'service';
    loading?: boolean;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
    data,
    entities,
    groupBy,
    loading = false,
}) => {
    const { theme } = useTheme();
    const { formatCurrencyCompact } = useSettings();
    const isDark = theme === 'dark';

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;

        return (
            <div className="custom-tooltip">
                <p className="label">{formatShortDate(label)}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="item">
                            <span className="item-label">
                                <span
                                    className="w-3 h-3 rounded-full inline-block mr-2"
                                    style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}
                            </span>
                            <span className="item-value">{formatCurrencyCompact(entry.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="card p-6 h-[400px]">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="skeleton h-full rounded-lg"></div>
            </div>
        );
    }

    const colors = groupBy === 'domain' ? DOMAIN_COLORS : SERVICE_COLORS;
    const textColor = isDark ? '#e5e5e5' : '#737373';
    const gridColor = isDark ? '#404040' : '#e5e5e5';

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Daily Cloud Cost Trend
            </h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            {entities.map(entity => (
                                <linearGradient
                                    key={entity.id}
                                    id={`gradient-${entity.id}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={colors[entity.id]}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={colors[entity.id]}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatShortDate}
                            tick={{ fontSize: 12, fill: textColor }}
                            tickLine={false}
                            axisLine={{ stroke: gridColor }}
                        />
                        <YAxis
                            tickFormatter={(value) => formatCurrencyCompact(value)}
                            tick={{ fontSize: 12, fill: textColor }}
                            tickLine={false}
                            axisLine={false}
                            width={70}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => (
                                <span className="text-sm text-neutral-600 dark:text-neutral-300">{value}</span>
                            )}
                        />
                        {entities.map(entity => (
                            <Area
                                key={entity.id}
                                type="monotone"
                                dataKey={entity.id}
                                name={entity.name}
                                stroke={colors[entity.id]}
                                fill={`url(#gradient-${entity.id})`}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 2 }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TimeSeriesChart;

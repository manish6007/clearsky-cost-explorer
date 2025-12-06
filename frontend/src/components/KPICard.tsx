import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
    loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    change,
    changeLabel,
    icon,
    loading = false,
}) => {
    const getTrendIcon = () => {
        if (change === undefined) return null;
        if (change > 0) return <TrendingUp className="w-4 h-4" />;
        if (change < 0) return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (change === undefined) return 'text-neutral-500';
        if (change > 0) return 'text-red-500'; // Cost increase is negative
        if (change < 0) return 'text-green-500'; // Cost decrease is positive
        return 'text-neutral-500';
    };

    if (loading) {
        return (
            <div className="card p-6">
                <div className="skeleton h-4 w-24 mb-3"></div>
                <div className="skeleton h-8 w-32 mb-2"></div>
                <div className="skeleton h-4 w-20"></div>
            </div>
        );
    }

    return (
        <div className="card p-6 animate-fade-in">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">{value}</p>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span className="text-sm font-medium">
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                            {changeLabel && (
                                <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-1">{changeLabel}</span>
                            )}
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KPICard;

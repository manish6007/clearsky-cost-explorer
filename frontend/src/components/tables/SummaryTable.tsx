import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';
import { DomainSummary, DOMAIN_COLORS } from '../../types';
import { exportToCSV } from '../../utils/helpers';
import { useSettings } from '../../hooks/useSettings';

interface SummaryTableProps {
    data: DomainSummary[];
    onRowClick: (domainId: string) => void;
    loading?: boolean;
}

type SortField = 'domainName' | 'totalCost' | 'percentContribution' | 'topService';
type SortDirection = 'asc' | 'desc';

export const SummaryTable: React.FC<SummaryTableProps> = ({
    data,
    onRowClick,
    loading = false,
}) => {
    const { formatCurrency } = useSettings();
    const [sortField, setSortField] = useState<SortField>('totalCost');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return sortDirection === 'asc'
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
    });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc'
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />;
    };

    const handleExport = () => {
        exportToCSV(data, 'cloud-cost-summary');
    };

    if (loading) {
        return (
            <div className="card p-6">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-12 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Cost Summary by Domain
                </h3>
                <button
                    onClick={handleExport}
                    className="btn-secondary text-sm flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <div className="table-container border-0">
                <table className="table">
                    <thead>
                        <tr>
                            <th
                                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                onClick={() => handleSort('domainName')}
                            >
                                <div className="flex items-center gap-1">
                                    Domain
                                    <SortIcon field="domainName" />
                                </div>
                            </th>
                            <th>Environments</th>
                            <th
                                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                onClick={() => handleSort('totalCost')}
                            >
                                <div className="flex items-center gap-1">
                                    Total Cost
                                    <SortIcon field="totalCost" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                onClick={() => handleSort('percentContribution')}
                            >
                                <div className="flex items-center gap-1">
                                    % Contribution
                                    <SortIcon field="percentContribution" />
                                </div>
                            </th>
                            <th
                                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                onClick={() => handleSort('topService')}
                            >
                                <div className="flex items-center gap-1">
                                    Top AWS Service
                                    <SortIcon field="topService" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                        {sortedData.map((row) => (
                            <tr
                                key={row.domainId}
                                onClick={() => onRowClick(row.domainId)}
                                className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors"
                            >
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: DOMAIN_COLORS[row.domainId] }}
                                        />
                                        <span className="font-medium text-neutral-900 dark:text-white">{row.domainName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex gap-1">
                                        {row.environments.map(env => (
                                            <span
                                                key={env}
                                                className={`badge-${env}`}
                                            >
                                                {env.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="font-mono font-medium text-neutral-900 dark:text-white">
                                    {formatCurrency(row.totalCost)}
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-500 rounded-full"
                                                style={{ width: `${row.percentContribution}%` }}
                                            />
                                        </div>
                                        <span className="text-neutral-500 dark:text-neutral-400">
                                            {row.percentContribution.toFixed(1)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="text-neutral-600 dark:text-neutral-300">{row.topService}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SummaryTable;

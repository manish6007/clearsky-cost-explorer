import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Domain, AWSService, Environment, FilterState, DOMAIN_COLORS, SERVICE_COLORS, ENVIRONMENT_COLORS } from '../../types';
import { DateRangePicker } from './DateRangePicker';
import { MultiSelect } from './MultiSelect';
import { getDefaultDateRange } from '../../utils/helpers';

interface FilterBarProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    domains: Domain[];
    services: AWSService[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    onFiltersChange,
    domains,
    services,
}) => {
    const handleDateChange = (from: string, to: string) => {
        onFiltersChange({
            ...filters,
            dateRange: { from, to },
        });
    };

    const handleDomainsChange = (domainIds: string[]) => {
        onFiltersChange({
            ...filters,
            domainIds,
        });
    };

    const handleServicesChange = (serviceIds: string[]) => {
        onFiltersChange({
            ...filters,
            serviceIds,
        });
    };

    const handleEnvironmentsChange = (environments: string[]) => {
        onFiltersChange({
            ...filters,
            environments: environments as Environment[],
        });
    };

    const handleReset = () => {
        const defaultRange = getDefaultDateRange();
        onFiltersChange({
            dateRange: defaultRange,
            domainIds: [],
            serviceIds: [],
            environments: [],
        });
    };

    const domainOptions = domains.map(d => ({
        value: d.id,
        label: d.name,
        color: DOMAIN_COLORS[d.id],
    }));

    const serviceOptions = services.map(s => ({
        value: s.id,
        label: s.name,
        color: SERVICE_COLORS[s.id],
    }));

    const environmentOptions: { value: Environment; label: string; color: string }[] = [
        { value: 'prod', label: 'Production', color: ENVIRONMENT_COLORS.prod },
        { value: 'uat', label: 'UAT', color: ENVIRONMENT_COLORS.uat },
        { value: 'dev', label: 'Development', color: ENVIRONMENT_COLORS.dev },
    ];

    const hasActiveFilters =
        filters.domainIds.length > 0 ||
        filters.serviceIds.length > 0 ||
        filters.environments.length > 0;

    return (
        <div className="sticky top-0 z-40 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-8 py-4 shadow-sm transition-colors">
            <div className="flex flex-wrap items-end gap-4">
                <DateRangePicker
                    from={filters.dateRange.from}
                    to={filters.dateRange.to}
                    onChange={handleDateChange}
                />

                <div className="min-w-[180px]">
                    <MultiSelect
                        label="Domains"
                        options={domainOptions}
                        selected={filters.domainIds}
                        onChange={handleDomainsChange}
                        placeholder="All Domains"
                    />
                </div>

                <div className="min-w-[180px]">
                    <MultiSelect
                        label="AWS Services"
                        options={serviceOptions}
                        selected={filters.serviceIds}
                        onChange={handleServicesChange}
                        placeholder="All Services"
                    />
                </div>

                <div className="min-w-[180px]">
                    <MultiSelect
                        label="Environments"
                        options={environmentOptions}
                        selected={filters.environments}
                        onChange={handleEnvironmentsChange}
                        placeholder="All Environments"
                    />
                </div>

                <button
                    onClick={handleReset}
                    className={`btn-ghost flex items-center gap-2 ${hasActiveFilters ? 'text-primary-600 dark:text-primary-400' : ''}`}
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>
            </div>
        </div>
    );
};

export default FilterBar;

import { format, subDays, parseISO } from 'date-fns';
import { CostRecord, DomainSummary, Domain, AWSService } from '../types';

// Format currency values
export function formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// Format large currency with abbreviation
export function formatCurrencyCompact(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// Get default date range (last 30 days)
export function getDefaultDateRange(): { from: string; to: string } {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    return {
        from: format(thirtyDaysAgo, 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd'),
    };
}

// Format date for display
export function formatDate(dateString: string): string {
    return format(parseISO(dateString), 'MMM d, yyyy');
}

// Format short date for charts
export function formatShortDate(dateString: string): string {
    return format(parseISO(dateString), 'MMM d');
}

// Calculate month-over-month change
export function calculateMoMChange(
    costs: CostRecord[],
    currentFrom: string,
    currentTo: string
): number {
    const currentStart = parseISO(currentFrom);
    const currentEnd = parseISO(currentTo);
    const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));

    const previousFrom = format(subDays(currentStart, daysDiff), 'yyyy-MM-dd');
    const previousTo = format(subDays(currentStart, 1), 'yyyy-MM-dd');

    const currentTotal = costs
        .filter(c => c.date >= currentFrom && c.date <= currentTo)
        .reduce((sum, c) => sum + c.costAmount, 0);

    const previousTotal = costs
        .filter(c => c.date >= previousFrom && c.date <= previousTo)
        .reduce((sum, c) => sum + c.costAmount, 0);

    if (previousTotal === 0) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
}

// Aggregate costs by domain for summary table
export function aggregateCostsByDomain(
    costs: CostRecord[],
    domains: Domain[],
    services: AWSService[]
): DomainSummary[] {
    const totalCost = costs.reduce((sum, c) => sum + c.costAmount, 0);
    const domainMap = new Map<string, Domain>();
    domains.forEach(d => domainMap.set(d.id, d));

    const serviceMap = new Map<string, AWSService>();
    services.forEach(s => serviceMap.set(s.id, s));

    const domainCosts = new Map<string, {
        total: number;
        environments: Set<string>;
        serviceBreakdown: Map<string, number>;
    }>();

    costs.forEach(cost => {
        const existing = domainCosts.get(cost.domainId) || {
            total: 0,
            environments: new Set<string>(),
            serviceBreakdown: new Map<string, number>(),
        };

        existing.total += cost.costAmount;
        existing.environments.add(cost.environment);
        existing.serviceBreakdown.set(
            cost.serviceId,
            (existing.serviceBreakdown.get(cost.serviceId) || 0) + cost.costAmount
        );

        domainCosts.set(cost.domainId, existing);
    });

    const summaries: DomainSummary[] = [];

    domainCosts.forEach((data, domainId) => {
        const domain = domainMap.get(domainId);
        if (!domain) return;

        let topService = '';
        let topServiceCost = 0;
        data.serviceBreakdown.forEach((cost, serviceId) => {
            if (cost > topServiceCost) {
                topServiceCost = cost;
                topService = serviceMap.get(serviceId)?.name || serviceId;
            }
        });

        summaries.push({
            domainId,
            domainName: domain.name,
            environments: Array.from(data.environments).sort(),
            totalCost: data.total,
            percentContribution: (data.total / totalCost) * 100,
            topService,
            topServiceCost,
        });
    });

    return summaries.sort((a, b) => b.totalCost - a.totalCost);
}

// Prepare time series data for charts
export function prepareTimeSeriesData(
    costs: CostRecord[],
    groupBy: 'domain' | 'service',
    entities: (Domain | AWSService)[]
): { date: string;[key: string]: string | number }[] {
    const dateMap = new Map<string, Record<string, number>>();

    costs.forEach(cost => {
        const key = groupBy === 'domain' ? cost.domainId : cost.serviceId;
        const existing = dateMap.get(cost.date) || {};
        existing[key] = (existing[key] || 0) + cost.costAmount;
        dateMap.set(cost.date, existing);
    });

    const sortedDates = Array.from(dateMap.keys()).sort();

    return sortedDates.map(date => {
        const values = dateMap.get(date) || {};
        const result: Record<string, string | number> = { date };
        entities.forEach(entity => {
            result[entity.id] = Math.round(values[entity.id] || 0);
        });
        return result;
    });
}

// Get top cost driver
export function getTopCostDriver(
    costs: CostRecord[],
    services: AWSService[]
): { name: string; cost: number } | null {
    const serviceCosts = new Map<string, number>();

    costs.forEach(cost => {
        serviceCosts.set(
            cost.serviceId,
            (serviceCosts.get(cost.serviceId) || 0) + cost.costAmount
        );
    });

    let topService = '';
    let topCost = 0;

    serviceCosts.forEach((cost, serviceId) => {
        if (cost > topCost) {
            topCost = cost;
            topService = serviceId;
        }
    });

    const service = services.find(s => s.id === topService);
    if (!service) return null;

    return { name: service.name, cost: topCost };
}

// Export data to CSV
export function exportToCSV(data: DomainSummary[], filename: string): void {
    const headers = ['Domain', 'Environments', 'Total Cost', '% Contribution', 'Top Service'];
    const rows = data.map(d => [
        d.domainName,
        d.environments.join(', '),
        formatCurrency(d.totalCost),
        `${d.percentContribution.toFixed(1)}%`,
        d.topService,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
}

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Layers, Cpu } from 'lucide-react';
import { PageContainer, Header } from '../components/layout';
import { FilterBar } from '../components/filters';
import { TimeSeriesChart, StackedBarChart, DonutChart } from '../components/charts';
import { SummaryTable } from '../components/tables';
import { KPICard } from '../components/KPICard';
import { fetchDomains, fetchServices, fetchCosts } from '../services/api';
import { useSettings } from '../hooks/useSettings';
import {
    Domain,
    AWSService,
    CostRecord,
    FilterState,
    PieChartDataPoint,
    SERVICE_COLORS,
} from '../types';
import {
    getDefaultDateRange,
    calculateMoMChange,
    aggregateCostsByDomain,
    prepareTimeSeriesData,
    getTopCostDriver,
} from '../utils/helpers';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { formatCurrencyCompact } = useSettings();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [services, setServices] = useState<AWSService[]>([]);
    const [costs, setCosts] = useState<CostRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({
        dateRange: getDefaultDateRange(),
        domainIds: [],
        serviceIds: [],
        environments: [],
    });

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [domainsData, servicesData] = await Promise.all([
                    fetchDomains(),
                    fetchServices(),
                ]);
                setDomains(domainsData);
                setServices(servicesData);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };
        loadData();
    }, []);

    // Load costs when filters change
    useEffect(() => {
        const loadCosts = async () => {
            setLoading(true);
            try {
                const costsData = await fetchCosts({
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                    domainIds: filters.domainIds.length > 0 ? filters.domainIds : undefined,
                    serviceIds: filters.serviceIds.length > 0 ? filters.serviceIds : undefined,
                    environments: filters.environments.length > 0 ? filters.environments : undefined,
                });
                setCosts(costsData);
            } catch (error) {
                console.error('Failed to load costs:', error);
            } finally {
                setLoading(false);
            }
        };
        loadCosts();
    }, [filters]);

    // Computed values
    const totalCost = useMemo(() =>
        costs.reduce((sum, c) => sum + c.costAmount, 0),
        [costs]
    );

    const momChange = useMemo(() =>
        calculateMoMChange(costs, filters.dateRange.from, filters.dateRange.to),
        [costs, filters.dateRange]
    );

    const activeDomains = useMemo(() => {
        const uniqueDomains = new Set(costs.map(c => c.domainId));
        return uniqueDomains.size;
    }, [costs]);

    const topCostDriver = useMemo(() =>
        getTopCostDriver(costs, services),
        [costs, services]
    );

    const domainSummaries = useMemo(() =>
        aggregateCostsByDomain(costs, domains, services),
        [costs, domains, services]
    );

    const timeSeriesData = useMemo(() =>
        prepareTimeSeriesData(costs, 'domain', domains),
        [costs, domains]
    );

    const domainChartData = useMemo(() =>
        domainSummaries.map(d => ({
            id: d.domainId,
            name: d.domainName,
            value: d.totalCost,
        })),
        [domainSummaries]
    );

    const serviceChartData = useMemo((): PieChartDataPoint[] => {
        const serviceCosts = new Map<string, number>();
        costs.forEach(c => {
            serviceCosts.set(c.serviceId, (serviceCosts.get(c.serviceId) || 0) + c.costAmount);
        });

        return services.map(s => ({
            name: s.name,
            value: serviceCosts.get(s.id) || 0,
            color: SERVICE_COLORS[s.id] || '#6366f1',
        })).filter(d => d.value > 0);
    }, [costs, services]);

    const handleRowClick = (domainId: string) => {
        navigate(`/domains/${domainId}`);
    };

    return (
        <PageContainer>
            <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
                <Header
                    title="Cost Overview Dashboard"
                    subtitle="Monitor and analyze cloud spend across ClearSky domains"
                />

                <FilterBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    domains={domains}
                    services={services}
                />

                <div className="flex-1 p-8 space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            title="Total Cloud Cost"
                            value={formatCurrencyCompact(totalCost)}
                            change={momChange}
                            changeLabel="vs last period"
                            icon={<DollarSign className="w-6 h-6" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Month-on-Month Change"
                            value={`${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}%`}
                            icon={<TrendingUp className="w-6 h-6" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Active Domains"
                            value={activeDomains.toString()}
                            icon={<Layers className="w-6 h-6" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Top Cost Driver"
                            value={topCostDriver?.name || '-'}
                            icon={<Cpu className="w-6 h-6" />}
                            loading={loading}
                        />
                    </div>

                    {/* Charts Row 1 */}
                    <TimeSeriesChart
                        data={timeSeriesData}
                        entities={domains}
                        groupBy="domain"
                        loading={loading}
                    />

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StackedBarChart
                            data={domainChartData}
                            domains={domains}
                            loading={loading}
                        />
                        <DonutChart
                            data={serviceChartData}
                            title="Cost by AWS Service"
                            loading={loading}
                        />
                    </div>

                    {/* Summary Table */}
                    <SummaryTable
                        data={domainSummaries}
                        onRowClick={handleRowClick}
                        loading={loading}
                    />
                </div>
            </div>
        </PageContainer>
    );
};

export default DashboardPage;

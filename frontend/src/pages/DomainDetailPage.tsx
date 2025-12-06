import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, User, Wallet, Server } from 'lucide-react';
import { PageContainer, Header } from '../components/layout';
import { TimeSeriesChart, DonutChart } from '../components/charts';
import { KPICard } from '../components/KPICard';
import { fetchDomains, fetchServices, fetchCosts } from '../services/api';
import { useSettings } from '../hooks/useSettings';
import {
    Domain,
    AWSService,
    CostRecord,
    PieChartDataPoint,
    SERVICE_COLORS,
    ENVIRONMENT_COLORS,
} from '../types';
import {
    getDefaultDateRange,
    prepareTimeSeriesData,
    getTopCostDriver,
} from '../utils/helpers';

export const DomainDetailPage: React.FC = () => {
    const { domainId } = useParams<{ domainId: string }>();
    const navigate = useNavigate();
    const { formatCurrencyCompact, formatCurrency } = useSettings();
    const [domain, setDomain] = useState<Domain | null>(null);
    const [services, setServices] = useState<AWSService[]>([]);
    const [costs, setCosts] = useState<CostRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [domainsData, servicesData, costsData] = await Promise.all([
                    fetchDomains(),
                    fetchServices(),
                    fetchCosts({
                        ...getDefaultDateRange(),
                        domainIds: domainId ? [domainId] : undefined,
                    }),
                ]);

                const foundDomain = domainsData.find(d => d.id === domainId);
                setDomain(foundDomain || null);
                setServices(servicesData);
                setCosts(costsData);
            } catch (error) {
                console.error('Failed to load domain data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [domainId]);

    // Computed values
    const totalCost = useMemo(() =>
        costs.reduce((sum, c) => sum + c.costAmount, 0),
        [costs]
    );

    const prodCost = useMemo(() =>
        costs.filter(c => c.environment === 'prod').reduce((sum, c) => sum + c.costAmount, 0),
        [costs]
    );

    const nonProdCost = useMemo(() => totalCost - prodCost, [totalCost, prodCost]);

    const topCostDriver = useMemo(() =>
        getTopCostDriver(costs, services),
        [costs, services]
    );

    const timeSeriesData = useMemo(() =>
        prepareTimeSeriesData(costs, 'service', services),
        [costs, services]
    );

    const environmentChartData = useMemo((): PieChartDataPoint[] => {
        const envCosts = { dev: 0, uat: 0, prod: 0 };
        costs.forEach(c => {
            envCosts[c.environment] += c.costAmount;
        });

        return [
            { name: 'Production', value: envCosts.prod, color: ENVIRONMENT_COLORS.prod },
            { name: 'UAT', value: envCosts.uat, color: ENVIRONMENT_COLORS.uat },
            { name: 'Development', value: envCosts.dev, color: ENVIRONMENT_COLORS.dev },
        ].filter(d => d.value > 0);
    }, [costs]);

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

    // Service breakdown table data
    const serviceTableData = useMemo(() => {
        const serviceCosts = new Map<string, { total: number; envBreakdown: Record<string, number> }>();

        costs.forEach(c => {
            const existing = serviceCosts.get(c.serviceId) || { total: 0, envBreakdown: {} };
            existing.total += c.costAmount;
            existing.envBreakdown[c.environment] = (existing.envBreakdown[c.environment] || 0) + c.costAmount;
            serviceCosts.set(c.serviceId, existing);
        });

        return services
            .map(s => ({
                service: s,
                ...serviceCosts.get(s.id) || { total: 0, envBreakdown: {} },
            }))
            .filter(d => d.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [costs, services]);

    if (!domain && !loading) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <p className="text-neutral-500">Domain not found</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary mt-4"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
                <Header
                    title={domain?.name || 'Loading...'}
                    subtitle="Detailed cost analysis and breakdown"
                />

                <div className="flex-1 p-8 space-y-8">
                    {/* Back button and domain info */}
                    <div className="flex items-start justify-between">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-ghost flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Domain Header Card */}
                    {domain && (
                        <div className="card p-6">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-primary-600" />
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Owner
                                        </p>
                                        <p className="font-medium text-neutral-900 dark:text-white mt-1">{domain.owner}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                            <Wallet className="w-4 h-4" />
                                            Cost Center
                                        </p>
                                        <p className="font-medium text-neutral-900 dark:text-white mt-1">{domain.costCenter}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                            <Server className="w-4 h-4" />
                                            Environments
                                        </p>
                                        <div className="flex gap-1 mt-1">
                                            {domain.environments.map(env => (
                                                <span key={env} className={`badge-${env}`}>
                                                    {env.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            title="Total Domain Cost"
                            value={formatCurrencyCompact(totalCost)}
                            loading={loading}
                        />
                        <KPICard
                            title="Production Cost"
                            value={formatCurrencyCompact(prodCost)}
                            loading={loading}
                        />
                        <KPICard
                            title="Non-Prod Cost"
                            value={formatCurrencyCompact(nonProdCost)}
                            loading={loading}
                        />
                        <KPICard
                            title="Top Service"
                            value={topCostDriver?.name || '-'}
                            loading={loading}
                        />
                    </div>

                    {/* Time Series Chart */}
                    <TimeSeriesChart
                        data={timeSeriesData}
                        entities={services}
                        groupBy="service"
                        loading={loading}
                    />

                    {/* Environment & Service Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DonutChart
                            data={environmentChartData}
                            title="Cost by Environment"
                            loading={loading}
                        />
                        <DonutChart
                            data={serviceChartData}
                            title="Cost by Service"
                            loading={loading}
                        />
                    </div>

                    {/* Service Details Table */}
                    <div className="card">
                        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Service Cost Breakdown
                            </h3>
                        </div>
                        <div className="table-container border-0">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Category</th>
                                        <th>Production</th>
                                        <th>UAT</th>
                                        <th>Development</th>
                                        <th>Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                                    {serviceTableData.map(row => (
                                        <tr key={row.service.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: SERVICE_COLORS[row.service.id] }}
                                                    />
                                                    <span className="font-medium">{row.service.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-neutral-500 dark:text-neutral-400">{row.service.category}</td>
                                            <td className="font-mono">
                                                {formatCurrency(row.envBreakdown.prod || 0)}
                                            </td>
                                            <td className="font-mono">
                                                {formatCurrency(row.envBreakdown.uat || 0)}
                                            </td>
                                            <td className="font-mono">
                                                {formatCurrency(row.envBreakdown.dev || 0)}
                                            </td>
                                            <td className="font-mono font-medium">
                                                {formatCurrency(row.total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default DomainDetailPage;

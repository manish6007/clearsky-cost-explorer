import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, Header } from '../components/layout';
import { KPICard } from '../components/KPICard';
import { SummaryTable } from '../components/tables';
import { fetchDomains, fetchServices, fetchCosts } from '../services/api';
import { useSettings } from '../hooks/useSettings';
import { Domain, AWSService, CostRecord } from '../types';
import {
    getDefaultDateRange,
    aggregateCostsByDomain,
} from '../utils/helpers';
import { Building2, DollarSign, TrendingUp, Layers } from 'lucide-react';

export const DomainsPage: React.FC = () => {
    const navigate = useNavigate();
    const { formatCurrencyCompact } = useSettings();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [services, setServices] = useState<AWSService[]>([]);
    const [costs, setCosts] = useState<CostRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const dateRange = getDefaultDateRange();
                const [domainsData, servicesData, costsData] = await Promise.all([
                    fetchDomains(),
                    fetchServices(),
                    fetchCosts({ from: dateRange.from, to: dateRange.to }),
                ]);
                setDomains(domainsData);
                setServices(servicesData);
                setCosts(costsData);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const totalCost = costs.reduce((sum, c) => sum + c.costAmount, 0);
    const domainSummaries = aggregateCostsByDomain(costs, domains, services);

    const handleRowClick = (domainId: string) => {
        navigate(`/domains/${domainId}`);
    };

    return (
        <PageContainer>
            <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
                <Header
                    title="Domains Overview"
                    subtitle="View and analyze cloud costs across all ClearSky domains"
                />

                <div className="flex-1 p-8 space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            title="Total Domains"
                            value={domains.length.toString()}
                            icon={<Building2 className="w-6 h-6" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Total Cloud Cost"
                            value={formatCurrencyCompact(totalCost)}
                            icon={<DollarSign className="w-6 h-6" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Highest Cost Domain"
                            value={domainSummaries[0]?.domainName.replace('ClearSky ', '') || '-'}
                            icon={<TrendingUp className="w-6 h-6" />}
                            loading={loading}
                        />
                        <KPICard
                            title="Active Environments"
                            value="3"
                            icon={<Layers className="w-6 h-6" />}
                            loading={loading}
                        />
                    </div>

                    {/* Domains Summary Table */}
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

export default DomainsPage;

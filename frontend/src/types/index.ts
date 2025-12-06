// Domain model representing ClearSky business domains
export interface Domain {
    id: string;
    name: string;
    owner: string;
    costCenter: string;
    environments: Environment[];
}

// AWS Service model
export interface AWSService {
    id: string;
    name: string;
    category: string;
}

// Environment types
export type Environment = 'dev' | 'uat' | 'prod';

// Cost record for a specific day, domain, service, and environment
export interface CostRecord {
    id: string;
    date: string;
    domainId: string;
    serviceId: string;
    environment: Environment;
    costAmount: number;
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

// Aggregated cost data
export interface CostSummary {
    total: number;
    byDomain: Record<string, number>;
    byService: Record<string, number>;
    byEnvironment: Record<Environment, number>;
    byDate: Record<string, number>;
}

// Filter state
export interface FilterState {
    dateRange: {
        from: string;
        to: string;
    };
    domainIds: string[];
    serviceIds: string[];
    environments: Environment[];
}

// KPI data structure
export interface KPIData {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
}

// Chart data formats
export interface TimeSeriesDataPoint {
    date: string;
    [key: string]: string | number;
}

export interface PieChartDataPoint {
    name: string;
    value: number;
    color: string;
}

// Domain summary for table
export interface DomainSummary {
    domainId: string;
    domainName: string;
    environments: string[];
    totalCost: number;
    percentContribution: number;
    topService: string;
    topServiceCost: number;
}

// Color mappings
export const DOMAIN_COLORS: Record<string, string> = {
    'clearwater-trade': '#3b82f6',
    'clearwater-settlement': '#8b5cf6',
    'clearwater-sales': '#10b981',
    'clearwater-collateral': '#f59e0b',
};

export const SERVICE_COLORS: Record<string, string> = {
    'ec2': '#ff6b35',
    'rds': '#3b82f6',
    's3': '#22c55e',
    'lambda': '#f59e0b',
    'eks': '#8b5cf6',
    'cloudwatch': '#ec4899',
};

export const ENVIRONMENT_COLORS: Record<Environment, string> = {
    'prod': '#ef4444',
    'uat': '#f59e0b',
    'dev': '#22c55e',
};

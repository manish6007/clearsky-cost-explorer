// Domain model representing Clearwater business domains
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
    date: string; // ISO date string YYYY-MM-DD
    domainId: string;
    serviceId: string;
    environment: Environment;
    costAmount: number; // USD
}

// API Query parameters for costs endpoint
export interface CostQueryParams {
    from?: string;
    to?: string;
    domainIds?: string[];
    serviceIds?: string[];
    environments?: Environment[];
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

// Aggregated cost summary
export interface CostSummary {
    totalCost: number;
    byDomain: Record<string, number>;
    byService: Record<string, number>;
    byEnvironment: Record<Environment, number>;
    dailyCosts: { date: string; cost: number }[];
}

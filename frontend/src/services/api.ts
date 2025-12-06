import {
    Domain,
    AWSService,
    CostRecord,
    ApiResponse,
    CostSummary
} from '../types';

const API_BASE_URL = '/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }
    const result: ApiResponse<T> = await response.json();
    if (!result.success) {
        throw new Error(result.error || 'Unknown error');
    }
    return result.data;
}

// Fetch all domains
export async function fetchDomains(): Promise<Domain[]> {
    return fetchApi<Domain[]>('/domains');
}

// Fetch all AWS services
export async function fetchServices(): Promise<AWSService[]> {
    return fetchApi<AWSService[]>('/services');
}

// Fetch cost records with optional filters
export async function fetchCosts(params?: {
    from?: string;
    to?: string;
    domainIds?: string[];
    serviceIds?: string[];
    environments?: string[];
}): Promise<CostRecord[]> {
    const searchParams = new URLSearchParams();

    if (params?.from) searchParams.append('from', params.from);
    if (params?.to) searchParams.append('to', params.to);
    if (params?.domainIds?.length) searchParams.append('domainIds', params.domainIds.join(','));
    if (params?.serviceIds?.length) searchParams.append('serviceIds', params.serviceIds.join(','));
    if (params?.environments?.length) searchParams.append('environments', params.environments.join(','));

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/costs?${queryString}` : '/costs';

    return fetchApi<CostRecord[]>(endpoint);
}

// Fetch aggregated cost summary
export async function fetchCostSummary(params?: {
    from?: string;
    to?: string;
    domainIds?: string[];
    serviceIds?: string[];
    environments?: string[];
}): Promise<CostSummary> {
    const searchParams = new URLSearchParams();

    if (params?.from) searchParams.append('from', params.from);
    if (params?.to) searchParams.append('to', params.to);
    if (params?.domainIds?.length) searchParams.append('domainIds', params.domainIds.join(','));
    if (params?.serviceIds?.length) searchParams.append('serviceIds', params.serviceIds.join(','));
    if (params?.environments?.length) searchParams.append('environments', params.environments.join(','));

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/costs/summary?${queryString}` : '/costs/summary';

    return fetchApi<CostSummary>(endpoint);
}

import { Domain, AWSService, CostRecord, Environment } from '../models';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CSV FILE PATHS
// ============================================================================
const DATA_DIR = path.join(__dirname, '../../data');
const DOMAINS_CSV = path.join(DATA_DIR, 'domains.csv');
const SERVICES_CSV = path.join(DATA_DIR, 'services.csv');
const COSTS_CSV = path.join(DATA_DIR, 'cost_records.csv');

// ============================================================================
// CSV PARSING UTILITIES
// ============================================================================

function parseCSV(filePath: string): Record<string, string>[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        return row;
    });
}

// ============================================================================
// LOAD DATA FROM CSV FILES
// ============================================================================

function loadDomains(): Domain[] {
    const rows = parseCSV(DOMAINS_CSV);
    return rows.map(row => ({
        id: row.id,
        name: row.name,
        owner: row.owner,
        costCenter: row.costCenter,
        environments: row.environments.split(',') as Environment[],
    }));
}

function loadServices(): AWSService[] {
    const rows = parseCSV(SERVICES_CSV);
    return rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
    }));
}

function loadCostRecords(): CostRecord[] {
    const rows = parseCSV(COSTS_CSV);
    return rows.map(row => ({
        id: row.id,
        date: row.date,
        domainId: row.domainId,
        serviceId: row.serviceId,
        environment: row.environment as Environment,
        costAmount: parseFloat(row.costAmount),
    }));
}

// ============================================================================
// EXPORT DATA FROM CSV
// ============================================================================

console.log('Loading data from CSV files...');
export const domains: Domain[] = loadDomains();
export const awsServices: AWSService[] = loadServices();
export const costRecords: CostRecord[] = loadCostRecords();
console.log(`Loaded: ${domains.length} domains, ${awsServices.length} services, ${costRecords.length} cost records`);

// ============================================================================
// DATA ACCESS HELPERS
// ============================================================================

export function filterCostRecords(params: {
    from?: string;
    to?: string;
    domainIds?: string[];
    serviceIds?: string[];
    environments?: Environment[];
}): CostRecord[] {
    return costRecords.filter((record) => {
        if (params.from && record.date < params.from) return false;
        if (params.to && record.date > params.to) return false;
        if (params.domainIds?.length && !params.domainIds.includes(record.domainId)) return false;
        if (params.serviceIds?.length && !params.serviceIds.includes(record.serviceId)) return false;
        if (params.environments?.length && !params.environments.includes(record.environment)) return false;
        return true;
    });
}

export function aggregateCosts(records: CostRecord[]): {
    total: number;
    byDomain: Record<string, number>;
    byService: Record<string, number>;
    byEnvironment: Record<Environment, number>;
    byDate: Record<string, number>;
} {
    const result = {
        total: 0,
        byDomain: {} as Record<string, number>,
        byService: {} as Record<string, number>,
        byEnvironment: { dev: 0, uat: 0, prod: 0 } as Record<Environment, number>,
        byDate: {} as Record<string, number>,
    };

    for (const record of records) {
        result.total += record.costAmount;
        result.byDomain[record.domainId] = (result.byDomain[record.domainId] || 0) + record.costAmount;
        result.byService[record.serviceId] = (result.byService[record.serviceId] || 0) + record.costAmount;
        result.byEnvironment[record.environment] += record.costAmount;
        result.byDate[record.date] = (result.byDate[record.date] || 0) + record.costAmount;
    }

    return result;
}

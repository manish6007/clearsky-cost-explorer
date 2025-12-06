import { Router, Request, Response } from 'express';
import {
    domains,
    awsServices,
    filterCostRecords,
    aggregateCosts,
    costRecords
} from '../data/mockData';
import { Environment, ApiResponse, Domain, AWSService, CostRecord } from '../models';

const router = Router();

// ============================================================================
// GET /api/domains - List all Clearwater domains
// ============================================================================
router.get('/domains', (_req: Request, res: Response) => {
    const response: ApiResponse<Domain[]> = {
        success: true,
        data: domains,
    };
    res.json(response);
});

// ============================================================================
// GET /api/services - List all AWS services
// ============================================================================
router.get('/services', (_req: Request, res: Response) => {
    const response: ApiResponse<AWSService[]> = {
        success: true,
        data: awsServices,
    };
    res.json(response);
});

// ============================================================================
// GET /api/costs - Query cost records with optional filters
// Query params: from, to, domainIds, serviceIds, environments
// ============================================================================
router.get('/costs', (req: Request, res: Response) => {
    try {
        const { from, to, domainIds, serviceIds, environments } = req.query;

        // Parse array parameters (comma-separated strings)
        const parsedDomainIds = domainIds
            ? (typeof domainIds === 'string' ? domainIds.split(',') : [])
            : undefined;
        const parsedServiceIds = serviceIds
            ? (typeof serviceIds === 'string' ? serviceIds.split(',') : [])
            : undefined;
        const parsedEnvironments = environments
            ? (typeof environments === 'string' ? environments.split(',') as Environment[] : [])
            : undefined;

        const filteredRecords = filterCostRecords({
            from: from as string | undefined,
            to: to as string | undefined,
            domainIds: parsedDomainIds,
            serviceIds: parsedServiceIds,
            environments: parsedEnvironments,
        });

        const response: ApiResponse<CostRecord[]> = {
            success: true,
            data: filteredRecords,
        };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            data: null,
            error: 'Failed to fetch cost records',
        };
        res.status(500).json(response);
    }
});

// ============================================================================
// GET /api/costs/summary - Get aggregated cost summary
// Query params: from, to, domainIds, serviceIds, environments
// ============================================================================
router.get('/costs/summary', (req: Request, res: Response) => {
    try {
        const { from, to, domainIds, serviceIds, environments } = req.query;

        const parsedDomainIds = domainIds
            ? (typeof domainIds === 'string' ? domainIds.split(',') : [])
            : undefined;
        const parsedServiceIds = serviceIds
            ? (typeof serviceIds === 'string' ? serviceIds.split(',') : [])
            : undefined;
        const parsedEnvironments = environments
            ? (typeof environments === 'string' ? environments.split(',') as Environment[] : [])
            : undefined;

        const filteredRecords = filterCostRecords({
            from: from as string | undefined,
            to: to as string | undefined,
            domainIds: parsedDomainIds,
            serviceIds: parsedServiceIds,
            environments: parsedEnvironments,
        });

        const aggregated = aggregateCosts(filteredRecords);

        const response: ApiResponse<typeof aggregated> = {
            success: true,
            data: aggregated,
        };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            data: null,
            error: 'Failed to fetch cost summary',
        };
        res.status(500).json(response);
    }
});

// ============================================================================
// GET /api/stats - Get high-level statistics
// ============================================================================
router.get('/stats', (_req: Request, res: Response) => {
    const totalRecords = costRecords.length;
    const dateRange = {
        from: costRecords[0]?.date,
        to: costRecords[costRecords.length - 1]?.date,
    };
    const totalDomains = domains.length;
    const totalServices = awsServices.length;

    res.json({
        success: true,
        data: {
            totalRecords,
            dateRange,
            totalDomains,
            totalServices,
        },
    });
});

export default router;

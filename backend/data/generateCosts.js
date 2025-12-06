// Script to generate cost records CSV
const fs = require('fs');
const path = require('path');

const domains = ['clearwater-trade', 'clearwater-settlement', 'clearwater-sales', 'clearwater-collateral'];
const services = ['ec2', 'rds', 's3', 'lambda', 'eks', 'cloudwatch'];
const environments = ['dev', 'uat', 'prod'];

// Base daily costs per domain (USD) - Trade & Settlement are highest
const domainBaseCosts = {
    'clearwater-trade': 2500,
    'clearwater-settlement': 2200,
    'clearwater-sales': 1200,
    'clearwater-collateral': 900,
};

// Service distribution weights per domain
const domainServiceWeights = {
    'clearwater-trade': { ec2: 0.35, rds: 0.25, eks: 0.20, lambda: 0.10, s3: 0.05, cloudwatch: 0.05 },
    'clearwater-settlement': { ec2: 0.30, rds: 0.30, eks: 0.15, lambda: 0.12, s3: 0.08, cloudwatch: 0.05 },
    'clearwater-sales': { ec2: 0.25, lambda: 0.30, rds: 0.15, eks: 0.10, s3: 0.12, cloudwatch: 0.08 },
    'clearwater-collateral': { s3: 0.30, rds: 0.35, ec2: 0.15, lambda: 0.08, eks: 0.07, cloudwatch: 0.05 },
};

// Environment cost multipliers (prod >> uat >> dev)
const environmentMultipliers = { prod: 0.70, uat: 0.20, dev: 0.10 };

// Growth rates per domain (monthly percentage increase)
const domainGrowthRates = {
    'clearwater-trade': 0.03,
    'clearwater-settlement': 0.025,
    'clearwater-sales': 0.015,
    'clearwater-collateral': 0.01,
};

function generateDateRange(months) {
    const dates = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const current = new Date(startDate);
    while (current <= endDate) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function addDailyVariance(baseValue, variancePercent = 0.15) {
    const variance = (Math.random() - 0.5) * 2 * variancePercent;
    return baseValue * (1 + variance);
}

function calculateGrowthFactor(date, startDate, monthlyRate) {
    const start = new Date(startDate);
    const current = new Date(date);
    const monthsDiff = (current.getFullYear() - start.getFullYear()) * 12 + (current.getMonth() - start.getMonth());
    return Math.pow(1 + monthlyRate, monthsDiff);
}

// Generate the CSV
const dates = generateDateRange(6);
const startDate = dates[0];
let recordId = 0;

let csv = 'id,date,domainId,serviceId,environment,costAmount\n';

for (const date of dates) {
    for (const domainId of domains) {
        const baseCost = domainBaseCosts[domainId];
        const growthFactor = calculateGrowthFactor(date, startDate, domainGrowthRates[domainId]);
        const adjustedBaseCost = baseCost * growthFactor;

        for (const serviceId of services) {
            const serviceWeight = domainServiceWeights[domainId][serviceId] || 0.05;

            for (const environment of environments) {
                const envMultiplier = environmentMultipliers[environment];
                const rawCost = adjustedBaseCost * serviceWeight * envMultiplier;
                const finalCost = addDailyVariance(rawCost);

                csv += `cost-${++recordId},${date},${domainId},${serviceId},${environment},${(Math.round(finalCost * 100) / 100).toFixed(2)}\n`;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'cost_records.csv'), csv);
console.log(`Generated ${recordId} cost records to cost_records.csv`);

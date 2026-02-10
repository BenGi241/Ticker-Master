// ========================================
// Financial Data FMP - Centralized Orchestrator
// Pure FMP implementation with institutional-grade calculations
// ========================================

const fmpClient = require('./utils/fmpClient');

/**
 * Calculate TTM (Trailing Twelve Months) from quarterly data
 * @param {Array} quarterlyData - Array of quarterly financial statements (sorted newest first)
 * @param {String} field - Field name to sum (e.g., 'revenue', 'netIncome')
 * @returns {Number} - TTM value
 */
function calculateTTM(quarterlyData, field) {
    if (!quarterlyData || quarterlyData.length < 4) return null;
    return quarterlyData.slice(0, 4).reduce((sum, quarter) => {
        const value = quarter[field] || 0;
        return sum + value;
    }, 0);
}

/**
 * Calculate Earnings Quality Score
 * Formula: Net Income - Operating Cash Flow
 * Negative and growing = Red Flag 🚩
 */
function calculateEarningsQuality(incomeData, cashflowData) {
    if (!incomeData || !cashflowData) return null;

    const ttmNetIncome = calculateTTM(incomeData, 'netIncome');
    const ttmOCF = calculateTTM(cashflowData, 'operatingCashFlow');

    if (ttmNetIncome === null || ttmOCF === null) return null;

    const qualityScore = ttmNetIncome - ttmOCF;
    const isRedFlag = qualityScore < 0;

    return {
        netIncome: ttmNetIncome,
        operatingCashFlow: ttmOCF,
        gap: qualityScore,
        isRedFlag,
        interpretation: isRedFlag
            ? "⚠️ Earnings quality concern - profits not converting to cash"
            : "✅ Healthy earnings quality"
    };
}

/**
 * Calculate Inventory Days
 * Formula: (Inventory / COGS) * 365
 */
function calculateInventoryDays(balanceSheet, incomeStatement) {
    if (!balanceSheet || !incomeStatement) return null;

    const latestInventory = balanceSheet[0]?.inventory || 0;
    const ttmCOGS = calculateTTM(incomeStatement, 'costOfRevenue');

    if (latestInventory === 0 || !ttmCOGS) return null;

    const inventoryDays = (latestInventory / ttmCOGS) * 365;

    // Calculate YoY change if we have historical data
    let yoyChange = null;
    if (balanceSheet.length >= 4 && incomeStatement.length >= 8) {
        const priorInventory = balanceSheet[4]?.inventory || 0;
        const priorCOGS = calculateTTM(incomeStatement.slice(4, 8), 'costOfRevenue');
        if (priorInventory && priorCOGS) {
            const priorDays = (priorInventory / priorCOGS) * 365;
            yoyChange = ((inventoryDays - priorDays) / priorDays) * 100;
        }
    }

    return {
        days: Math.round(inventoryDays),
        yoyChange: yoyChange ? Math.round(yoyChange) : null,
        isRedFlag: yoyChange && yoyChange > 20, // >20% increase = concern
        interpretation: yoyChange && yoyChange > 20
            ? "🚩 Inventory buildup - potential demand weakness"
            : "✅ Healthy inventory turnover"
    };
}

/**
 * Main orchestrator function - gets all enriched FMP data
 */
async function getEnrichedData(ticker) {
    console.log(`[FMP Orchestrator] 🚀 Gathering enriched data for ${ticker}...`);

    try {
        // Parallel fetch of all core data
        const [
            incomeQuarterly,
            balanceQuarterly,
            cashflowQuarterly,
            productSegs,
            geoSegs,
            ratiosTTM,
            keyMetricsTTM,
            profile,
            insiders,
            institutions,
            prices,
            dcf,
            estimates
        ] = await Promise.all([
            fmpClient.getIncomeStatement(ticker, 'quarterly'),
            fmpClient.getBalanceSheet(ticker, 'quarterly'),
            fmpClient.getCashFlow(ticker, 'quarterly'),
            fmpClient.getProductSegments(ticker),
            fmpClient.getGeographicSegments(ticker),
            fmpClient.getRatiosTTM(ticker),
            fmpClient.getKeyMetricsTTM(ticker),
            fmpClient.getProfile(ticker),
            fmpClient.getInsiderTrading(ticker),
            fmpClient.getInstitutionalHolders(ticker),
            fmpClient.getHistoricalPrices(ticker, 300),
            fmpClient.getDCF(ticker),
            fmpClient.getAnalystEstimates(ticker)
        ]);

        console.log(`[FMP Orchestrator] ✅ Core data fetched. Calculating derived metrics...`);

        // Calculate TTM Financials
        const ttmFinancials = {
            revenue: calculateTTM(incomeQuarterly, 'revenue'),
            grossProfit: calculateTTM(incomeQuarterly, 'grossProfit'),
            operatingIncome: calculateTTM(incomeQuarterly, 'operatingIncome'),
            netIncome: calculateTTM(incomeQuarterly, 'netIncome'),
            eps: calculateTTM(incomeQuarterly, 'eps'),
            operatingCashFlow: calculateTTM(cashflowQuarterly, 'operatingCashFlow'),
            freeCashFlow: calculateTTM(cashflowQuarterly, 'freeCashFlow'),
            totalAssets: balanceQuarterly[0]?.totalAssets || null,
            totalDebt: balanceQuarterly[0]?.totalDebt || null,
            totalEquity: balanceQuarterly[0]?.totalStockholdersEquity || null,
        };

        // Calculate Quality Metrics
        const earningsQuality = calculateEarningsQuality(incomeQuarterly, cashflowQuarterly);
        const inventoryMetrics = calculateInventoryDays(balanceQuarterly, incomeQuarterly);

        console.log(`[FMP Orchestrator] ✅ Enriched data package ready for ${ticker}`);

        return {
            // Raw Financials
            quarterlyData: {
                income: incomeQuarterly,
                balance: balanceQuarterly,
                cashflow: cashflowQuarterly
            },

            // TTM Calculated
            ttmFinancials,

            // Quality Metrics
            qualityMetrics: {
                earnings: earningsQuality,
                inventory: inventoryMetrics
            },

            // Segments
            segments: {
                product: productSegs || [],
                geographic: geoSegs || []
            },

            // Ratios & Metrics
            ratios: Array.isArray(ratiosTTM) ? ratiosTTM[0] : ratiosTTM,
            keyMetrics: Array.isArray(keyMetricsTTM) ? keyMetricsTTM[0] : keyMetricsTTM,

            // Company Profile
            profile: Array.isArray(profile) ? profile[0] : profile,

            // Governance
            insiders: insiders || [],
            institutions: institutions || [],

            // Market Data
            prices: prices?.historical || [],

            // Valuation
            dcf: Array.isArray(dcf) ? dcf[0] : dcf,
            estimates: estimates || [],

            // Metadata
            timestamp: new Date().toISOString(),
            source: 'FMP'
        };

    } catch (error) {
        console.error(`[FMP Orchestrator] ❌ Error fetching data for ${ticker}:`, error.message);
        throw error;
    }
}

module.exports = {
    getEnrichedData,
    calculateTTM,
    calculateEarningsQuality,
    calculateInventoryDays
};

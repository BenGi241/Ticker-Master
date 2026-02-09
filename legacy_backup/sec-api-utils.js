// ========================================
// SEC API Utilities
// ========================================

// Proxy service to bypass CORS (Required for SEC API)
const CORS_PROXY = "https://corsproxy.io/?";

// XBRL Tag Mappings
const XBRL_TAGS = {
      revenue: ['Revenues', 'RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet', 'SalesRevenueServicesNet', 'RegulatedAndUnregulatedOperatingRevenue'],
      netIncome: ['NetIncomeLoss', 'ProfitLoss'],
      operatingIncome: ['OperatingIncomeLoss'],
      grossProfit: ['GrossProfit'],
      eps: ['EarningsPerShareDiluted', 'EarningsPerShareBasic'],
      sharesOutstanding: ['EntityCommonStockSharesOutstanding', 'WeightedAverageNumberOfDilutedSharesOutstanding'],
      assets: ['Assets'],
      liabilities: ['Liabilities'],
      equity: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],
      cash: ['CashAndCashEquivalentsAtCarryingValue'],
      operatingCashFlow: ['NetCashProvidedByUsedInOperatingActivities'],
      investingCashFlow: ['NetCashProvidedByUsedInInvestingActivities'],
      paymentsForCapEx: ['PaymentsToAcquirePropertyPlantAndEquipment', 'PaymentsToAcquireProductiveAssets', 'PaymentsForCapitalImprovements']
};

// Helper: Find value in SEC facts
function findFactValue(facts, conceptKeys, year, quarter = null) {
      if (!facts) return 0;

      const validKey = conceptKeys.find(key => facts[key]);
      if (!validKey) return 0;

      const dataPoints = facts[validKey].units.USD || facts[validKey].units.shares || [];

      // Exact match by Frame (Most reliable for SEC data)
      const targetFrame = quarter
            ? `CY${year}Q${quarter}`
            : `CY${year}`;

      const exactMatch = dataPoints.find(dp => dp.frame === targetFrame);
      if (exactMatch) return exactMatch.val;

      // Fallback: Search by Fiscal Year (FY) and Form Type
      if (!quarter) {
            // Annual: Prefer 10-K
            const annualReport = dataPoints.find(dp =>
                  dp.fy === parseInt(year) && dp.form === '10-K'
            );
            if (annualReport) return annualReport.val;
      }

      if (quarter) {
            // Quarterly: Search by Q1, Q2, Q3, etc.
            const qReport = dataPoints.find(dp =>
                  dp.fy === parseInt(year) && dp.fp === `Q${quarter}`
            );
            if (qReport) return qReport.val;
      }

      return 0;
}

// Process SEC JSON data into chart-ready format
function processSECData(secJson, periodType) {
      const usGaap = secJson.facts?.['us-gaap'];
      if (!usGaap) return [];

      const processedData = [];
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 20;

      for (let year = currentYear; year >= startYear; year--) {
            const yearStr = year.toString();

            if (periodType === 'annual') {
                  const revenue = findFactValue(usGaap, XBRL_TAGS.revenue, yearStr);
                  const netIncome = findFactValue(usGaap, XBRL_TAGS.netIncome, yearStr);

                  // Skip empty years (e.g., if 2025 report isn't out yet)
                  if (revenue === 0 && netIncome === 0) continue;

                  const operatingIncome = findFactValue(usGaap, XBRL_TAGS.operatingIncome, yearStr);
                  let grossProfit = findFactValue(usGaap, XBRL_TAGS.grossProfit, yearStr);
                  if (grossProfit === 0 && revenue > 0) grossProfit = revenue * 0.45; // Fallback estimate

                  const assets = findFactValue(usGaap, XBRL_TAGS.assets, yearStr);
                  const liabilities = findFactValue(usGaap, XBRL_TAGS.liabilities, yearStr);
                  const equity = findFactValue(usGaap, XBRL_TAGS.equity, yearStr);
                  const eps = findFactValue(usGaap, XBRL_TAGS.eps, yearStr);
                  const shares = findFactValue(usGaap, XBRL_TAGS.sharesOutstanding, yearStr);
                  const ocf = findFactValue(usGaap, XBRL_TAGS.operatingCashFlow, yearStr);

                  // Calculate CapEx
                  const capex = findFactValue(usGaap, XBRL_TAGS.paymentsForCapEx, yearStr);

                  processedData.unshift({
                        year: yearStr,
                        revenue: revenue / 1000000,
                        grossProfit: grossProfit / 1000000,
                        operatingIncome: operatingIncome / 1000000,
                        netIncome: netIncome / 1000000,
                        eps: eps,
                        sharesOutstanding: shares / 1000000,
                        grossMargin: revenue ? (grossProfit / revenue * 100).toFixed(1) : 0,
                        operatingMargin: revenue ? (operatingIncome / revenue * 100).toFixed(1) : 0,
                        netMargin: revenue ? (netIncome / revenue * 100).toFixed(1) : 0,
                        operatingCashFlow: ocf / 1000000,
                        capex: capex / 1000000,
                        freeCashFlow: (ocf - capex) / 1000000,
                        totalAssets: assets / 1000000,
                        totalLiabilities: liabilities / 1000000,
                        totalEquity: equity / 1000000,
                        cashAndEquivalents: findFactValue(usGaap, XBRL_TAGS.cash, yearStr) / 1000000,
                        debtToEquity: equity ? (liabilities / equity).toFixed(2) : 0,
                        roe: equity ? (netIncome / equity * 100).toFixed(1) : 0,
                  });

            } else {
                  // Quarterly
                  for (let q = 1; q <= 4; q++) {
                        const revenue = findFactValue(usGaap, XBRL_TAGS.revenue, yearStr, q);
                        if (revenue === 0) continue;

                        const netIncome = findFactValue(usGaap, XBRL_TAGS.netIncome, yearStr, q);
                        const operatingIncome = findFactValue(usGaap, XBRL_TAGS.operatingIncome, yearStr, q);
                        const eps = findFactValue(usGaap, XBRL_TAGS.eps, yearStr, q);
                        const ocf = findFactValue(usGaap, XBRL_TAGS.operatingCashFlow, yearStr, q);
                        const capex = findFactValue(usGaap, XBRL_TAGS.paymentsForCapEx, yearStr, q);

                        processedData.unshift({
                              year: `${year} Q${q}`,
                              revenue: revenue / 1000000,
                              netIncome: netIncome / 1000000,
                              operatingIncome: operatingIncome / 1000000,
                              eps: eps,
                              operatingCashFlow: ocf / 1000000,
                              capex: capex / 1000000,
                              freeCashFlow: (ocf && capex) ? (ocf - capex) / 1000000 : 0,
                              totalAssets: findFactValue(usGaap, XBRL_TAGS.assets, yearStr, q) / 1000000,
                              totalLiabilities: findFactValue(usGaap, XBRL_TAGS.liabilities, yearStr, q) / 1000000,
                        });
                  }
            }
      }

      return processedData.sort((a, b) => {
            const yearA = parseInt(a.year.substring(0, 4));
            const yearB = parseInt(b.year.substring(0, 4));
            if (yearA !== yearB) return yearA - yearB;
            if (a.year.includes('Q') && b.year.includes('Q')) {
                  return a.year.localeCompare(b.year);
            }
            return 0;
      });
}

// Get CIK from Ticker
async function getCIK(ticker) {
      try {
            const response = await fetch(`/api/sec/tickers`);
            const data = await response.json();
            const tickers = Object.values(data);
            const found = tickers.find(t => t.ticker === ticker.toUpperCase());
            if (found) {
                  return found.cik_str.toString().padStart(10, '0');
            }
            return null;
      } catch (e) {
            console.error("Error fetching tickers:", e);
            return null;
      }
}

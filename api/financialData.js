// ========================================
// Financial Data API Module
// Integrates Alpha Vantage and Finnhub APIs
// ========================================

const axios = require('axios');

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../data');
const CACHE_FILE = path.join(CACHE_DIR, 'api_cache.json');

// Ensure data directory exists
if (!fs.existsSync(CACHE_DIR)) {
      try {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
      } catch (e) {
            console.warn('Unable to create cache directory:', e.message);
      }
}

let persistentCache = {};
try {
      if (fs.existsSync(CACHE_FILE)) {
            persistentCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      }
} catch (e) {
      console.warn('Failed to load persistent cache:', e.message);
}

function saveCache() {
      try {
            fs.writeFileSync(CACHE_FILE, JSON.stringify(persistentCache, null, 2));
      } catch (e) {
            console.warn('Failed to save cache:', e.message);
      }
}

const apiCache = {
      has: (key) => !!persistentCache[key],
      get: (key) => persistentCache[key],
      set: (key, value) => {
            persistentCache[key] = value;
            saveCache();
      }
};

// ========== Helper Functions ==========

function calculateGrowth(current, previous) {
      if (!previous || previous === 0) return null;
      return ((current - previous) / Math.abs(previous)) * 100;
}

function parseFinancialValue(value) {
      if (!value || value === 'None') return null;
      return parseFloat(value);
}

// ========== Alpha Vantage API Functions ==========

async function getCompanyOverview(ticker) {
      const cacheKey = `overview_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'OVERVIEW',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note || response.data.Information) {
                  throw new Error(`Alpha Vantage API limit: ${response.data?.Note || response.data?.Information || 'Unknown limit reached'}`);
            }

            if (!response.data.Symbol) {
                  console.error('Alpha Vantage Data Missing Symbol:', JSON.stringify(response.data, null, 2));
                  throw new Error(`Company not found: ${ticker}`);
            }

            const data = response.data;
            apiCache.set(cacheKey, data);
            return data;
      } catch (error) {
            if (error.response && error.response.data) {
                  console.error('Alpha Vantage Error Response:', JSON.stringify(error.response.data, null, 2));
            }
            throw new Error(`Failed to fetch company overview: ${error.message}`);
      }
}

async function getIncomeStatement(ticker) {
      const cacheKey = `income_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'INCOME_STATEMENT',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note || response.data.Information) {
                  throw new Error(`Alpha Vantage API limit: ${response.data?.Note || response.data?.Information || 'Unknown limit reached'}`);
            }

            const data = response.data.annualReports || [];
            apiCache.set(cacheKey, data);
            return data;
      } catch (error) {
            throw new Error(`Failed to fetch income statement: ${error.message}`);
      }
}

async function getBalanceSheet(ticker) {
      const cacheKey = `balance_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'BALANCE_SHEET',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note || response.data.Information) {
                  throw new Error(`Alpha Vantage API limit: ${response.data?.Note || response.data?.Information || 'Unknown limit reached'}`);
            }

            const data = response.data.annualReports || [];
            apiCache.set(cacheKey, data);
            return data;
      } catch (error) {
            throw new Error(`Failed to fetch balance sheet: ${error.message}`);
      }
}

async function getCashFlow(ticker) {
      const cacheKey = `cashflow_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'CASH_FLOW',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note || response.data.Information) {
                  throw new Error(`Alpha Vantage API limit: ${response.data?.Note || response.data?.Information || 'Unknown limit reached'}`);
            }

            const data = response.data.annualReports || [];
            apiCache.set(cacheKey, data);
            return data;
      } catch (error) {
            throw new Error(`Failed to fetch cash flow: ${error.message}`);
      }
}

async function getTechnicalIndicators(ticker) {
      const cacheKey = `technicals_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            // Get RSI (14)
            const rsiResponse = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'RSI',
                        symbol: ticker,
                        interval: 'daily',
                        time_period: 14,
                        series_type: 'close',
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            // Get MACD
            const macdResponse = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'MACD',
                        symbol: ticker,
                        interval: 'daily',
                        series_type: 'close',
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (rsiResponse.data.Note || rsiResponse.data.Information || macdResponse.data.Note || macdResponse.data.Information) {
                  throw new Error(`Alpha Vantage API limit reached in technicals`);
            }

            const rsiData = rsiResponse.data['Technical Analysis: RSI'];
            const macdData = macdResponse.data['Technical Analysis: MACD'];

            // Get latest values
            const latestRsiKey = rsiData ? Object.keys(rsiData)[0] : null;
            const latestMacdKey = macdData ? Object.keys(macdData)[0] : null;

            const result = {
                  rsi: latestRsiKey ? parseFloat(rsiData[latestRsiKey].RSI) : null,
                  macd: latestMacdKey ? {
                        macd: parseFloat(macdData[latestMacdKey].MACD),
                        signal: parseFloat(macdData[latestMacdKey].MACD_Signal),
                        histogram: parseFloat(macdData[latestMacdKey].MACD_Hist)
                  } : null,
                  timestamp: latestRsiKey || new Date().toISOString()
            };

            apiCache.set(cacheKey, result);
            return result;
      } catch (error) {
            console.warn('Technical indicators fetch failed:', error.message);
            return null;
      }
}

// ========== Finnhub API Functions ==========

async function getFinnhubProfile(ticker) {
      try {
            const response = await axios.get(`${FINNHUB_BASE}/stock/profile2`, {
                  params: {
                        symbol: ticker,
                        token: FINNHUB_KEY
                  }
            });

            return response.data;
      } catch (error) {
            console.warn('Finnhub profile fetch failed:', error.message);
            return null;
      }
}

async function getFinnhubMetrics(ticker) {
      try {
            const response = await axios.get(`${FINNHUB_BASE}/stock/metric`, {
                  params: {
                        symbol: ticker,
                        metric: 'all',
                        token: FINNHUB_KEY
                  }
            });

            return response.data;
      } catch (error) {
            console.warn('Finnhub metrics fetch failed:', error.message);
            return null;
      }
}

async function getInsiderTransactionsFinnhub(ticker) {
      try {
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 6); // Last 6 months

            const response = await axios.get(`${FINNHUB_BASE}/stock/insider-transactions`, {
                  params: {
                        symbol: ticker,
                        from: fromDate.toISOString().split('T')[0],
                        to: toDate.toISOString().split('T')[0],
                        token: FINNHUB_KEY
                  }
            });

            return response.data.data || [];
      } catch (error) {
            console.warn('Finnhub insider transactions fetch failed:', error.message);
            return [];
      }
}

// ========== Data Normalization ==========

function normalizeFinancialData(overview, incomeStatements, balanceSheets, cashFlows) {
      const financials = {
            annual: [],
            lastQuarter: null
      };

      // Process up to 5 years of data
      const years = Math.min(5, incomeStatements.length);

      for (let i = 0; i < years; i++) {
            const income = incomeStatements[i];
            const balance = balanceSheets[i];
            const cashFlow = cashFlows[i];

            const year = parseInt(income.fiscalDateEnding.substring(0, 4));
            const revenue = parseFinancialValue(income.totalRevenue) / 1e9; // Convert to billions
            const grossProfit = parseFinancialValue(income.grossProfit) / 1e9;
            const operatingIncome = parseFinancialValue(income.operatingIncome) / 1e9;
            const netIncome = parseFinancialValue(income.netIncome) / 1e9;

            const totalAssets = parseFinancialValue(balance.totalAssets) / 1e9;
            const totalLiabilities = parseFinancialValue(balance.totalLiabilities) / 1e9;
            const shareholderEquity = parseFinancialValue(balance.totalShareholderEquity) / 1e9;
            const cash = parseFinancialValue(balance.cashAndCashEquivalentsAtCarryingValue) / 1e9;

            const operatingCashFlow = parseFinancialValue(cashFlow.operatingCashflow) / 1e9;
            const capitalExpenditures = Math.abs(parseFinancialValue(cashFlow.capitalExpenditures) || 0) / 1e9;
            const freeCashFlow = operatingCashFlow - capitalExpenditures;

            // Calculate shares outstanding (in millions)
            const shares = parseFinancialValue(overview.SharesOutstanding) / 1e6;
            const eps = shares > 0 ? (netIncome * 1e9) / (shares * 1e6) : 0;

            // Calculate margins
            const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
            const operatingMargin = revenue > 0 ? (operatingIncome / revenue) * 100 : 0;
            const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

            // Calculate ratios
            const pe = parseFinancialValue(overview.PERatio) || null;
            const pb = parseFinancialValue(overview.PriceToBookRatio) || null;
            const debtToEquity = shareholderEquity > 0 ? totalLiabilities / shareholderEquity : null;
            const roe = shareholderEquity > 0 ? (netIncome / shareholderEquity) * 100 : 0;

            // Calculate ROIC (simplified)
            const investedCapital = shareholderEquity + (totalLiabilities * 0.5); // Simplified
            const roic = investedCapital > 0 ? (operatingIncome / investedCapital) * 100 : 0;

            // Calculate revenue growth
            const prevRevenue = i < years - 1 ? parseFinancialValue(incomeStatements[i + 1].totalRevenue) / 1e9 : null;
            const revenueGrowth = calculateGrowth(revenue, prevRevenue);

            financials.annual.push({
                  year,
                  revenue,
                  grossProfit,
                  operatingProfit: operatingIncome,
                  netProfit: netIncome,
                  eps,
                  shares,
                  operatingCashFlow,
                  freeCashFlow,
                  totalAssets,
                  totalLiabilities,
                  cash,
                  equity: shareholderEquity,
                  revenue_growth: revenueGrowth,
                  grossMargin,
                  operatingMargin,
                  netMargin,
                  pe,
                  pb,
                  debtToEquity,
                  roe,
                  roic
            });
      }

      // Sort by year (newest first)
      financials.annual.sort((a, b) => b.year - a.year);

      return financials;
}

// ========== Main Export Functions ==========

async function getCompanyData(ticker) {
      try {
            if (ticker === 'MOCK') {
                  console.log('Serving MOCK company data...');
                  return {
                        overview: {
                              name: "TechNova Systems",
                              ticker: "MOCK",
                              description: "TechNova is a leading provider of cloud-based enterprise software solutions.",
                              sector: "Technology",
                              industry: "Software - Infrastructure",
                              exchange: "NASDAQ",
                              currency: "USD",
                              country: "USA",
                              marketCap: 85.4,
                              employees: 12500,
                              fiscalYearEnd: "December",
                              latestQuarter: "2023-09-30",
                              peRatio: 22.5,
                              pegRatio: 1.1,
                              analystTargetPrice: 245.00,
                              fiftyTwoWeekHigh: 250.00,
                              fiftyTwoWeekLow: 140.00,
                              fiftyDayMovingAverage: 180.00,
                              twoHundredDayMovingAverage: 165.00,
                              beta: 1.2
                        },
                        financials: {
                              annual: [
                                    { year: 2023, revenue: 4.2, netProfit: 1.1, grossMargin: 65, operatingMargin: 25 },
                                    { year: 2022, revenue: 3.8, netProfit: 0.9, grossMargin: 63, operatingMargin: 22 }
                              ]
                        },
                        timestamp: new Date().toISOString()
                  };
            }

            console.log(`Fetching comprehensive data for ${ticker}...`);

            // Fetch all data in parallel
            const [overview, incomeStatements, balanceSheets, cashFlows, finnhubProfile] = await Promise.all([
                  getCompanyOverview(ticker),
                  getIncomeStatement(ticker),
                  getBalanceSheet(ticker),
                  getCashFlow(ticker),
                  getFinnhubProfile(ticker)
            ]);

            // Normalize financial data
            const financials = normalizeFinancialData(overview, incomeStatements, balanceSheets, cashFlows);

            // Build company overview
            const companyOverview = {
                  name: overview.Name,
                  ticker: overview.Symbol,
                  description: overview.Description,
                  sector: overview.Sector,
                  industry: overview.Industry,
                  exchange: overview.Exchange,
                  currency: overview.Currency,
                  country: overview.Country,
                  marketCap: parseFinancialValue(overview.MarketCapitalization) / 1e9, // In billions
                  employees: overview.FullTimeEmployees,
                  fiscalYearEnd: overview.FiscalYearEnd,
                  latestQuarter: overview.LatestQuarter,

                  // Additional data from Finnhub if available
                  logo: finnhubProfile?.logo || null,
                  weburl: finnhubProfile?.weburl || overview.OfficialSite || null,
                  phone: finnhubProfile?.phone || null,

                  // Key metrics
                  peRatio: parseFinancialValue(overview.PERatio),
                  pegRatio: parseFinancialValue(overview.PEGRatio),
                  bookValue: parseFinancialValue(overview.BookValue),
                  dividendPerShare: parseFinancialValue(overview.DividendPerShare),
                  dividendYield: parseFinancialValue(overview.DividendYield),
                  eps: parseFinancialValue(overview.EPS),
                  revenuePerShareTTM: parseFinancialValue(overview.RevenuePerShareTTM),
                  profitMargin: parseFinancialValue(overview.ProfitMargin),
                  operatingMarginTTM: parseFinancialValue(overview.OperatingMarginTTM),
                  returnOnAssetsTTM: parseFinancialValue(overview.ReturnOnAssetsTTM),
                  returnOnEquityTTM: parseFinancialValue(overview.ReturnOnEquityTTM),
                  revenueTTM: parseFinancialValue(overview.RevenueTTM) / 1e9,
                  grossProfitTTM: parseFinancialValue(overview.GrossProfitTTM) / 1e9,

                  // Analyst targets
                  analystTargetPrice: parseFinancialValue(overview.AnalystTargetPrice),

                  // Trading info
                  fiftyTwoWeekHigh: parseFinancialValue(overview['52WeekHigh']),
                  fiftyTwoWeekLow: parseFinancialValue(overview['52WeekLow']),
                  fiftyDayMovingAverage: parseFinancialValue(overview['50DayMovingAverage']),
                  twoHundredDayMovingAverage: parseFinancialValue(overview['200DayMovingAverage']),

                  // Beta
                  beta: parseFinancialValue(overview.Beta)
            };

            return {
                  overview: companyOverview,
                  financials,
                  timestamp: new Date().toISOString()
            };

      } catch (error) {
            throw new Error(`Failed to fetch company data: ${error.message}`);
      }
}

async function getQuote(ticker) {
      const cacheKey = `quote_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            if (ticker === 'MOCK') {
                  return {
                        symbol: "MOCK",
                        price: 185.50,
                        change: 5.50,
                        changePercent: 3.06,
                        volume: 1500000,
                        latestTradingDay: new Date().toISOString().split('T')[0],
                        previousClose: 180.00
                  };
            }

            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'GLOBAL_QUOTE',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note || response.data.Information) {
                  // Create a mock quote if limit reached but we have other data, 
                  // or throw specific error
                  throw new Error(`Alpha Vantage API limit: ${response.data?.Note || response.data?.Information || 'Unknown limit reached'}`);
            }

            const quote = response.data['Global Quote'];

            if (!quote || !quote['01. symbol']) {
                  throw new Error(`Quote not found for ${ticker}`);
            }

            const result = {
                  symbol: quote['01. symbol'],
                  price: parseFloat(quote['05. price']),
                  change: parseFloat(quote['09. change']),
                  changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                  volume: parseInt(quote['06. volume']),
                  latestTradingDay: quote['07. latest trading day'],
                  previousClose: parseFloat(quote['08. previous close'])
            };

            apiCache.set(cacheKey, result);
            return result;
      } catch (error) {
            console.error(`Error in getQuote for ${ticker}:`, error.message);
            throw error;
      }
}


async function getInsiderTransactions(ticker) {
      try {
            const transactions = await getInsiderTransactionsFinnhub(ticker);

            // Format and sort transactions
            const formatted = transactions
                  .map(t => ({
                        name: t.name,
                        position: t.position || 'Insider',
                        transactionDate: t.transactionDate,
                        transactionCode: t.transactionCode,
                        transactionPrice: t.transactionPrice,
                        shares: t.share,
                        value: (t.transactionPrice * t.share) / 1e6, // In millions
                        type: t.transactionCode === 'P' ? 'Buy' : t.transactionCode === 'S' ? 'Sell' : 'Other'
                  }))
                  .filter(t => t.type === 'Buy' || t.type === 'Sell')
                  .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
                  .slice(0, 10); // Top 10 recent transactions

            return {
                  transactions: formatted,
                  timestamp: new Date().toISOString()
            };

      } catch (error) {
            throw new Error(`Failed to fetch insider transactions: ${error.message}`);
      }
}

// ========== Advanced Financial Metrics (Institutional Grade) ==========

/**
 * Calculate P/EGY Ratio (PE / (Growth + Dividend Yield))
 * Lower is better; < 1.5 generally considered attractive
 */
async function getPEGY(ticker) {
      const cacheKey = `pegy_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const overview = await getCompanyOverview(ticker);
            const earnings = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'EARNINGS',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            const pe = parseFloat(overview.PERatio);
            const dividendYield = parseFloat(overview.DividendYield) * 100 || 0; // Convert to %

            // Calculate growth from quarterly earnings
            const quarterlyEarnings = earnings.data.quarterlyEarnings || [];
            if (quarterlyEarnings.length >= 5) {
                  const latestEPS = parseFloat(quarterlyEarnings[0].reportedEPS);
                  const yearAgoEPS = parseFloat(quarterlyEarnings[4].reportedEPS);
                  const growthRate = ((latestEPS - yearAgoEPS) / Math.abs(yearAgoEPS)) * 100;

                  const pegy = pe / (growthRate + dividendYield);

                  const result = {
                        pegy: pegy,
                        pe: pe,
                        growthRate: growthRate,
                        dividendYield: dividendYield,
                        interpretation: pegy < 1.5 ? 'Attractive' : pegy < 2 ? 'Fair' : 'Expensive'
                  };

                  apiCache.set(cacheKey, result);
                  return result;
            }

            return null;
      } catch (error) {
            console.error(`Error calculating P/EGY for ${ticker}:`, error.message);
            return null;
      }
}

/**
 * Calculate Net Debt to Enterprise Value trend over N years
 * Target: < 30% for healthy balance sheet
 */
async function getNetDebtToEVTrend(ticker, years = 5) {
      const cacheKey = `netdebt_ev_${ticker}_${years}y`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const balanceSheets = await getBalanceSheet(ticker);
            const overview = await getCompanyOverview(ticker);
            const marketCap = parseFloat(overview.MarketCapitalization);

            const trend = balanceSheets.slice(0, years).map(bs => {
                  const totalDebt = (parseFloat(bs.shortTermDebt) || 0) + (parseFloat(bs.longTermDebt) || 0);
                  const cash = parseFloat(bs.cashAndCashEquivalents) || 0;
                  const netDebt = totalDebt - cash;
                  const ev = marketCap + netDebt;
                  const ratio = (netDebt / ev) * 100;

                  return {
                        fiscalDate: bs.fiscalDateEnding,
                        netDebt: Math.round(netDebt / 1e6), // In millions
                        ev: Math.round(ev / 1e6),
                        ratio: ratio.toFixed(2),
                        healthy: ratio < 30
                  };
            });

            const result = {
                  trend: trend,
                  current: trend[0],
                  average: (trend.reduce((sum, t) => sum + parseFloat(t.ratio), 0) / trend.length).toFixed(2),
                  improving: trend.length >= 2 && parseFloat(trend[0].ratio) < parseFloat(trend[1].ratio)
            };

            apiCache.set(cacheKey, result);
            return result;
      } catch (error) {
            console.error(`Error calculating Net Debt/EV for ${ticker}:`, error.message);
            return null;
      }
}

/**
 * Calculate EV/Sales and EV/FCF trends over N years
 */
async function getEVMultiplesTrend(ticker, years = 5) {
      const cacheKey = `ev_multiples_${ticker}_${years}y`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const [incomeStatements, cashFlows, balanceSheets, overview] = await Promise.all([
                  getIncomeStatement(ticker),
                  getCashFlow(ticker),
                  getBalanceSheet(ticker),
                  getCompanyOverview(ticker)
            ]);

            const marketCap = parseFloat(overview.MarketCapitalization);

            const trend = incomeStatements.slice(0, years).map((is, idx) => {
                  const cf = cashFlows[idx];
                  const bs = balanceSheets[idx];

                  const totalDebt = (parseFloat(bs.shortTermDebt) || 0) + (parseFloat(bs.longTermDebt) || 0);
                  const cash = parseFloat(bs.cashAndCashEquivalents) || 0;
                  const netDebt = totalDebt - cash;
                  const ev = marketCap + netDebt;

                  const revenue = parseFloat(is.totalRevenue);
                  const fcf = parseFloat(cf.operatingCashflow) - Math.abs(parseFloat(cf.capitalExpenditures) || 0);

                  return {
                        fiscalDate: is.fiscalDateEnding,
                        evToSales: (ev / revenue).toFixed(2),
                        evToFCF: fcf > 0 ? (ev / fcf).toFixed(2) : 'N/A',
                        revenue: Math.round(revenue / 1e6),
                        fcf: Math.round(fcf / 1e6)
                  };
            });

            apiCache.set(cacheKey, { trend });
            return { trend };
      } catch (error) {
            console.error(`Error calculating EV multiples for ${ticker}:`, error.message);
            return null;
      }
}

/**
 * Calculate ROIC (Return on Invested Capital)
 * NOPAT / Invested Capital
 */
async function getROIC(ticker) {
      const cacheKey = `roic_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const [incomeStatements, balanceSheets] = await Promise.all([
                  getIncomeStatement(ticker),
                  getBalanceSheet(ticker)
            ]);

            const latest = incomeStatements[0];
            const latestBS = balanceSheets[0];

            // NOPAT = Operating Income * (1 - Tax Rate)
            const operatingIncome = parseFloat(latest.operatingIncome);
            const incomeTax = parseFloat(latest.incomeTaxExpense) || 0;
            const incomeBeforeTax = parseFloat(latest.incomeBeforeTax);
            const taxRate = incomeBeforeTax > 0 ? incomeTax / incomeBeforeTax : 0.21; // Default to 21% if unavailable

            const nopat = operatingIncome * (1 - taxRate);

            // Invested Capital = Total Debt + Total Equity - Cash
            const totalDebt = (parseFloat(latestBS.shortTermDebt) || 0) + (parseFloat(latestBS.longTermDebt) || 0);
            const totalEquity = parseFloat(latestBS.totalShareholderEquity);
            const cash = parseFloat(latestBS.cashAndCashEquivalents) || 0;
            const investedCapital = totalDebt + totalEquity - cash;

            const roic = (nopat / investedCapital) * 100;

            const result = {
                  roic: roic.toFixed(2),
                  nopat: Math.round(nopat / 1e6),
                  investedCapital: Math.round(investedCapital / 1e6),
                  interpretation: roic > 15 ? 'Excellent' : roic > 10 ? 'Good' : 'Needs Improvement'
            };

            apiCache.set(cacheKey, result);
            return result;
      } catch (error) {
            console.error(`Error calculating ROIC for ${ticker}:`, error.message);
            return null;
      }
}

/**
 * Calculate Economic Spread (ROIC - WACC)
 * Positive = Value creation, Negative = Value destruction
 */
async function getEconomicSpread(ticker) {
      const cacheKey = `economic_spread_${ticker}`;
      if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

      try {
            const roicData = await getROIC(ticker);
            if (!roicData) return null;

            // Simplified WACC calculation (in practice, needs market data)
            // Using typical WACC of 8-10% for large cap US stocks
            const estimatedWACC = 9.0; // This should be calculated properly with market data

            const roic = parseFloat(roicData.roic);
            const spread = roic - estimatedWACC;

            const result = {
                  economicSpread: spread.toFixed(2),
                  roic: roicData.roic,
                  wacc: estimatedWACC.toFixed(2),
                  valueCreation: spread > 0,
                  interpretation: spread > 10 ? 'Strong Value Creator' :
                        spread > 5 ? 'Value Creator' :
                              spread > 0 ? 'Marginal Value Creator' :
                                    'Value Destroyer'
            };

            apiCache.set(cacheKey, result);
            return result;
      } catch (error) {
            console.error(`Error calculating Economic Spread for ${ticker}:`, error.message);
            return null;
      }
}

module.exports = {
      getCompanyData,
      getQuote,
      getInsiderTransactions,
      getTechnicalIndicators,
      // Advanced metrics
      getPEGY,
      getNetDebtToEVTrend,
      getEVMultiplesTrend,
      getROIC,
      getEconomicSpread
};

// ========================================
// Financial Data API Module
// Integrates Alpha Vantage and Finnhub APIs
// ========================================

const axios = require('axios');

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

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
      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'OVERVIEW',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note) {
                  throw new Error('API rate limit exceeded. Please try again later.');
            }

            if (!response.data.Symbol) {
                  throw new Error(`Company not found: ${ticker}`);
            }

            return response.data;
      } catch (error) {
            throw new Error(`Failed to fetch company overview: ${error.message}`);
      }
}

async function getIncomeStatement(ticker) {
      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'INCOME_STATEMENT',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note) {
                  throw new Error('API rate limit exceeded');
            }

            return response.data.annualReports || [];
      } catch (error) {
            throw new Error(`Failed to fetch income statement: ${error.message}`);
      }
}

async function getBalanceSheet(ticker) {
      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'BALANCE_SHEET',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note) {
                  throw new Error('API rate limit exceeded');
            }

            return response.data.annualReports || [];
      } catch (error) {
            throw new Error(`Failed to fetch balance sheet: ${error.message}`);
      }
}

async function getCashFlow(ticker) {
      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'CASH_FLOW',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note) {
                  throw new Error('API rate limit exceeded');
            }

            return response.data.annualReports || [];
      } catch (error) {
            throw new Error(`Failed to fetch cash flow: ${error.message}`);
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
      try {
            const response = await axios.get(ALPHA_VANTAGE_BASE, {
                  params: {
                        function: 'GLOBAL_QUOTE',
                        symbol: ticker,
                        apikey: ALPHA_VANTAGE_KEY
                  }
            });

            if (!response.data || response.data.Note) {
                  throw new Error('API rate limit exceeded');
            }

            const quote = response.data['Global Quote'];

            if (!quote || !quote['01. symbol']) {
                  throw new Error(`Quote not found for ${ticker}`);
            }

            return {
                  symbol: quote['01. symbol'],
                  price: parseFloat(quote['05. price']),
                  change: parseFloat(quote['09. change']),
                  changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
                  volume: parseInt(quote['06. volume']),
                  latestTradingDay: quote['07. latest trading day'],
                  previousClose: parseFloat(quote['08. previous close']),
                  open: parseFloat(quote['02. open']),
                  high: parseFloat(quote['03. high']),
                  low: parseFloat(quote['04. low']),
                  timestamp: new Date().toISOString()
            };

      } catch (error) {
            throw new Error(`Failed to fetch quote: ${error.message}`);
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

module.exports = {
      getCompanyData,
      getQuote,
      getInsiderTransactions
};

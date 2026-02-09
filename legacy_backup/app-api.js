// ========================================
// API Integration for Real-Time Company Analysis
// This file handles all API calls and dynamic data loading
// ========================================

const API_BASE_URL = 'http://localhost:3000/api';

// Global state
let currentTicker = null;
let currentCompanyData = null;

// SEC Dashboard State
let secData = [];
let secPeriod = 'annual';
let activeSecTab = 'income';
let secChart = null;
let visibleMetrics = {};

const secConfigs = {
      income: {
            title: "Income Statement",
            metrics: [
                  { key: 'revenue', label: 'Revenue', type: 'bar', color: '#3b82f6', axis: 'left', suffix: 'M$' },
                  { key: 'grossProfit', label: 'Gross Profit', type: 'bar', color: '#10b981', axis: 'left', suffix: 'M$' },
                  { key: 'operatingIncome', label: 'Operating Income', type: 'bar', color: '#f59e0b', axis: 'left', suffix: 'M$' },
                  { key: 'netIncome', label: 'Net Income', type: 'bar', color: '#6366f1', axis: 'left', suffix: 'M$' },
                  { key: 'eps', label: 'EPS', type: 'line', color: '#8b5cf6', axis: 'right', suffix: '$' },
                  { key: 'sharesOutstanding', label: 'Shares', type: 'line', color: '#64748b', axis: 'right', suffix: 'M' },
                  { key: 'grossMargin', label: 'Gross Margin', type: 'line', color: '#059669', axis: 'right', suffix: '%' },
                  { key: 'operatingMargin', label: 'Operating Margin', type: 'line', color: '#d97706', axis: 'right', suffix: '%' },
                  { key: 'netMargin', label: 'Net Margin', type: 'line', color: '#4f46e5', axis: 'right', suffix: '%' },
            ],
            defaults: ['revenue', 'netIncome', 'eps']
      },
      cashflow: {
            title: "Cash Flow",
            metrics: [
                  { key: 'operatingCashFlow', label: 'Operating Cash Flow', type: 'bar', color: '#10b981', axis: 'left', suffix: 'M$' },
                  { key: 'capex', label: 'CapEx', type: 'bar', color: '#f59e0b', axis: 'left', suffix: 'M$' },
                  { key: 'freeCashFlow', label: 'Free Cash Flow', type: 'bar', color: '#ef4444', axis: 'left', suffix: 'M$' },
            ],
            defaults: ['operatingCashFlow', 'capex', 'freeCashFlow']
      },
      balance: {
            title: "Balance Sheet",
            metrics: [
                  { key: 'totalAssets', label: 'Total Assets', type: 'line', fill: true, color: '#94a3b8', axis: 'left', suffix: 'M$' },
                  { key: 'totalLiabilities', label: 'Total Liabilities', type: 'bar', color: '#ef4444', axis: 'left', suffix: 'M$' },
                  { key: 'totalEquity', label: 'Total Equity', type: 'bar', color: '#10b981', axis: 'left', suffix: 'M$' },
                  { key: 'cashAndEquivalents', label: 'Cash & Eq.', type: 'bar', color: '#3b82f6', axis: 'right', suffix: 'M$' },
            ],
            defaults: ['totalAssets', 'totalLiabilities', 'totalEquity']
      },
      ratios: {
            title: "Financial Ratios",
            metrics: [
                  { key: 'roe', label: 'ROE', type: 'line', color: '#8b5cf6', axis: 'right', suffix: '%' },
                  { key: 'debtToEquity', label: 'Debt/Equity', type: 'bar', color: '#f97316', axis: 'right', suffix: 'x' },
            ],
            defaults: ['roe', 'debtToEquity']
      }
};

// ========== Page Initialization ==========

// Ensure loading overlay and error message are hidden on page load
document.addEventListener('DOMContentLoaded', function () {
      hideLoading();
      hideError();
      console.log('API integration initialized. Ready to analyze companies!');
});

// ========== Loading & Error Management ==========

function showLoading(step = 'Initializing...', progress = 0) {
      const overlay = document.getElementById('loadingOverlay');
      const stepEl = document.getElementById('loadingStep');
      const progressEl = document.getElementById('loadingProgress');

      overlay.classList.remove('hidden');
      if (stepEl) stepEl.textContent = step;
      if (progressEl) progressEl.style.width = `${progress}%`;
}

function hideLoading() {
      const overlay = document.getElementById('loadingOverlay');
      overlay.classList.add('hidden');
}

function showError(title, message) {
      const errorDiv = document.getElementById('errorMessage');
      const titleEl = document.getElementById('errorTitle');
      const textEl = document.getElementById('errorText');

      titleEl.textContent = title;
      textEl.textContent = message;
      errorDiv.classList.remove('hidden');

      // Auto-hide after 10 seconds
      setTimeout(() => {
            hideError();
      }, 10000);
}

function hideError() {
      const errorDiv = document.getElementById('errorMessage');
      errorDiv.classList.add('hidden');
}

// ========== API Client Functions ==========

async function fetchCompanyData(ticker) {
      try {
            const response = await fetch(`${API_BASE_URL}/company/${ticker}`);

            if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error || 'Failed to fetch company data');
            }

            return await response.json();
      } catch (error) {
            console.error('Error fetching company data:', error);
            throw error;
      }
}

async function fetchQuote(ticker) {
      try {
            const response = await fetch(`${API_BASE_URL}/quote/${ticker}`);

            if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error || 'Failed to fetch quote');
            }

            return await response.json();
      } catch (error) {
            console.error('Error fetching quote:', error);
            throw error;
      }
}

async function fetchNews(ticker) {
      try {
            const response = await fetch(`${API_BASE_URL}/news/${ticker}?limit=20`);

            if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error || 'Failed to fetch news');
            }

            return await response.json();
      } catch (error) {
            console.error('Error fetching news:', error);
            // Return empty news if API fails
            return {
                  articles: [],
                  sentiment: { score: 0, label: 'Neutral', positive: 0, negative: 0, neutral: 0 }
            };
      }
}

async function fetchInsiders(ticker) {
      try {
            const response = await fetch(`${API_BASE_URL}/insiders/${ticker}`);

            if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error || 'Failed to fetch insider data');
            }

            return await response.json();
      } catch (error) {
            console.error('Error fetching insiders:', error);
            return { transactions: [] };
      }
}

async function fetchAIAnalysis(ticker, financialData, newsData) {
      try {
            const response = await fetch(`${API_BASE_URL}/analyze/full/${ticker}`, {
                  method: 'POST',
                  headers: {
                        'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                        financialData,
                        newsData
                  })
            });

            if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error || 'Failed to generate AI analysis');
            }

            return await response.json();
      } catch (error) {
            console.error('Error fetching AI analysis:', error);
            throw error;
      }
}

// ========== Search Functionality ==========

async function searchCompany() {
      const input = document.getElementById('searchInput');
      const ticker = input.value.trim().toUpperCase();

      if (!ticker) {
            showError('Invalid Input', 'Please enter a ticker symbol');
            return;
      }

      currentTicker = ticker;

      try {
            showLoading('Fetching company data...', 10);

            // Fetch all data in parallel (with error handling)
            const results = await Promise.allSettled([
                  fetchCompanyData(ticker),
                  fetchQuote(ticker),
                  fetchNews(ticker),
                  fetchInsiders(ticker)
            ]);

            const companyData = results[0].status === 'fulfilled' ? results[0].value : { overview: { name: ticker, ticker: ticker } };
            const quote = results[1].status === 'fulfilled' ? results[1].value : { price: 0, changePercent: 0 };
            const newsData = results[2].status === 'fulfilled' ? results[2].value : { articles: [], sentiment: { score: 0, label: 'Neutral' } };
            const insiderData = results[3].status === 'fulfilled' ? results[3].value : { transactions: [] };

            // Log errors if any
            results.forEach((res, index) => {
                  if (res.status === 'rejected') {
                        console.warn(`API call ${index} failed:`, res.reason);
                  }
            });

            showLoading('Generating AI insights...', 40);

            // Generate AI analysis
            const aiAnalysis = await fetchAIAnalysis(ticker, companyData, newsData);

            showLoading('Populating dashboard...', 70);

            // Store data globally
            currentCompanyData = {
                  ...companyData,
                  quote,
                  news: newsData,
                  insiders: insiderData,
                  ai: aiAnalysis
            };

            // Populate all sections
            populateAllSections(currentCompanyData);

            showLoading('Complete!', 100);

            // Hide loading and scroll to overview
            setTimeout(() => {
                  hideLoading();
                  document.getElementById('overview').scrollIntoView({ behavior: 'smooth' });
            }, 500);

      } catch (error) {
            hideLoading();
            showError('Analysis Failed', error.message || 'Unable to analyze company. Please check the ticker symbol and try again.');
      }
}

function searchExample(ticker) {
      document.getElementById('searchInput').value = ticker;
      searchCompany();
}

function handleSearchKeypress(event) {
      if (event.key === 'Enter') {
            searchCompany();
      }
}

// ========== Data Population Functions ==========

function populateAllSections(data) {
      populateCompanyOverview(data);
      populateFinancials(data);
      populateRevenue(data);
      populateManagement(data);
      populateCompetitive(data);
      populateSentiment(data);
      populateForecasts(data);
      populateValuation(data);
      populateStakeholders(data);
      populateRecommendation(data);
      populateTechnical(data);
}

function populateCompanyOverview(data) {
      const { overview, quote, ai } = data;

      // Update company name and logo
      document.getElementById('companyName').textContent = overview.name;
      document.getElementById('companyTagline').textContent = `${overview.sector} | ${overview.industry}`;
      document.getElementById('companyLogo').textContent = overview.ticker;

      // Update explanation
      const explanationEl = document.getElementById('companyExplanation');
      explanationEl.textContent = overview.description || 'Company description not available.';

      // Update hero stats
      const heroStats = document.getElementById('heroStats');
      heroStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Market Cap</div>
      <div class="stat-value">$${overview.marketCap?.toFixed(1)}B</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Current Price</div>
      <div class="stat-value text-${quote.changePercent >= 0 ? 'success' : 'danger'}">
        $${quote.price?.toFixed(2)}
      </div>
      <div class="metric-change ${quote.changePercent >= 0 ? 'positive' : 'negative'}">
        ${quote.changePercent >= 0 ? '⬆️' : '⬇️'} ${Math.abs(quote.changePercent).toFixed(2)}%
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">P/E Ratio</div>
      <div class="stat-value">${overview.peRatio?.toFixed(1) || 'N/A'}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Revenue (TTM)</div>
      <div class="stat-value">$${overview.revenueTTM?.toFixed(1)}B</div>
    </div>
  `;

      // Update business model (simplified)
      document.getElementById('businessModelDesc').textContent =
            `${overview.name} operates in the ${overview.sector} sector, focusing on ${overview.industry}.`;

      // If AI analysis has competitive data, use it for advantages
      if (ai?.competitive?.advantages) {
            const advantagesDiv = document.getElementById('advantages');
            advantagesDiv.innerHTML = ai.competitive.advantages.map(adv => `
      <div class="expandable">
        <div class="expandable-header" onclick="toggleExpandable(this)">
          <span class="expandable-title">${adv.title || adv}</span>
          <span class="expandable-icon">▼</span>
        </div>
        <div class="expandable-content">
          <div class="expandable-body">
            ${adv.description || 'Competitive advantage in the market.'}
          </div>
        </div>
      </div>
    `).join('');
      }
}

async function populateFinancials(data) {
      const { overview } = data;
      const ticker = overview.ticker;

      // Initialize visible metrics if empty
      if (Object.keys(visibleMetrics).length === 0) {
            Object.keys(secConfigs).forEach(tab => {
                  secConfigs[tab].metrics.forEach(m => {
                        if (secConfigs[tab].defaults.includes(m.key)) {
                              visibleMetrics[m.key] = true;
                        }
                  });
            });
      }

      try {
            // Show loading state in chart area
            const chartWrapper = document.querySelector('#financials .chart-wrapper');
            if (chartWrapper) chartWrapper.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center">Fetching SEC Data...</p>';

            const cik = await getCIK(ticker);
            if (!cik) throw new Error("Ticker not found in SEC database");

            const url = `/api/sec/facts/${cik}`;

            const response = await fetch(url);

            if (!response.ok) throw new Error(`SEC API Error: ${response.status}`);

            const json = await response.json();
            console.log("SEC JSON received:", !!json, "Facts keys:", json.facts ? Object.keys(json.facts) : 'No facts');

            const processed = processSECData(json, secPeriod);
            console.log("SEC Data processed, length:", processed.length);

            if (processed.length === 0) {
                  console.warn("No processed data found. Raw JSON sample:", JSON.stringify(json).substring(0, 200));
                  throw new Error("No data found for this company");
            }

            secData = processed;
            console.log("Calling renderSECDashboard with data:", secData[0]);
            renderSECDashboard();

      } catch (err) {
            console.error("SEC Data Fetch Error:", err);
            const chartWrapper = document.querySelector('#financials .chart-wrapper');
            if (chartWrapper) chartWrapper.innerHTML = `<div class="error-message">Failed to load SEC data: ${err.message}</div>`;
      }
}

function renderSECDashboard() {
      // 1. Update Tabs
      document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeSecTab);
            btn.classList.toggle('btn-primary', btn.dataset.tab === activeSecTab);
            btn.classList.toggle('btn-secondary', btn.dataset.tab !== activeSecTab);
      });

      // 2. Update Metric Toggles
      const config = secConfigs[activeSecTab];
      const togglesContainer = document.getElementById('metricToggles');
      togglesContainer.innerHTML = config.metrics.map(m => `
        <button class="btn btn-xs ${visibleMetrics[m.key] ? 'btn-dark' : 'btn-outline'}" 
                onclick="toggleSecMetric('${m.key}')"
                style="border-color: ${m.color}; color: ${visibleMetrics[m.key] ? 'white' : m.color}; background-color: ${visibleMetrics[m.key] ? m.color : 'transparent'}">
            ${visibleMetrics[m.key] ? '👁️' : '👁️‍🗨️'} ${m.label}
        </button>
    `).join('');

      // 3. Update Chart
      updateSECChart();

      // 4. Update Growth Summary
      const summaryContainer = document.getElementById('growthSummary');
      const lastPoint = secData[0]; // Most recent
      const prevPoint = secData[1]; // Previous

      if (lastPoint && prevPoint) {
            summaryContainer.innerHTML = config.metrics
                  .filter(m => visibleMetrics[m.key])
                  .map(m => {
                        const current = lastPoint[m.key] || 0;
                        const prev = prevPoint[m.key] || 0;
                        const growth = prev !== 0 ? ((current - prev) / Math.abs(prev)) * 100 : 0;
                        const isPositive = growth > 0;
                        const colorClass = isPositive ? 'text-success' : 'text-danger';
                        const arrow = isPositive ? '⬆️' : '⬇️';

                        return `
                <div class="card" style="padding: var(--spacing-sm);">
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${m.label}</div>
                    <div style="font-size: 1.25rem; font-weight: 700;">
                        ${current.toLocaleString(undefined, { maximumFractionDigits: 1 })}${m.suffix.replace('M', '')}
                    </div>
                    <div class="${colorClass}" style="font-size: 0.75rem; font-weight: 600;">
                        ${arrow} ${Math.abs(growth).toFixed(1)}%
                    </div>
                </div>`;
                  }).join('');
      }
}

function updateSECChart() {
      const ctx = document.getElementById('secFinancialChart');
      if (!ctx) return;

      // Destroy existing chart
      if (secChart) {
            secChart.destroy();
      }

      // Filter data based on range (simplified for now: last 10 points)
      const chartData = [...secData].reverse().slice(-10); // Show last 10 periods
      const config = secConfigs[activeSecTab];

      const datasets = config.metrics
            .filter(m => visibleMetrics[m.key])
            .map(m => ({
                  label: m.label,
                  data: chartData.map(d => d[m.key]),
                  type: m.type === 'area' ? 'line' : m.type,
                  backgroundColor: m.type === 'line' || m.type === 'area' ? m.color + '20' : m.color + 'CC', // Transparent for lines
                  borderColor: m.color,
                  borderWidth: 2,
                  fill: m.type === 'area',
                  yAxisID: m.axis,
                  tension: 0.3
            }));

      secChart = new Chart(ctx, {
            type: 'bar', // Default type, mixed chart
            data: {
                  labels: chartData.map(d => d.year),
                  datasets: datasets
            },
            options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                        mode: 'index',
                        intersect: false,
                  },
                  scales: {
                        x: {
                              grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        left: {
                              type: 'linear',
                              display: true,
                              position: 'left',
                              grid: { color: 'rgba(0,0,0,0.05)' },
                              ticks: { callback: (val) => val >= 1000 ? (val / 1000).toFixed(1) + 'B' : val }
                        },
                        right: {
                              type: 'linear',
                              display: datasets.some(d => d.yAxisID === 'right'),
                              position: 'right',
                              grid: { drawOnChartArea: false }
                        }
                  },
                  plugins: {
                        tooltip: {
                              callbacks: {
                                    label: (ctx) => {
                                          const m = config.metrics.find(metric => metric.label === ctx.dataset.label);
                                          return `${ctx.dataset.label}: ${ctx.raw.toLocaleString()}${m ? m.suffix.replace('M', '') : ''}`;
                                    }
                              }
                        }
                  }
            }
      });
}

// Interactive Functions for SEC Dashboard
function switchFinancialTab(tab) {
      activeSecTab = tab;
      renderSECDashboard();
}

function setPeriod(period) {
      secPeriod = period;

      // Update buttons
      document.getElementById('btn-annual').className = `btn btn-sm ${period === 'annual' ? 'btn-primary' : 'btn-secondary'}`;
      document.getElementById('btn-quarter').className = `btn btn-sm ${period === 'quarter' ? 'btn-primary' : 'btn-secondary'}`;

      // Re-fetch/Process data
      // Since we have the raw JSON in memory? No, processSECData takes raw JSON.
      // We need to re-fetch or store raw JSON. 
      // Optimization: Store raw JSON in a variable.
      // For now, let's just re-call populateFinancials if we have currentCompanyData
      if (currentCompanyData) {
            populateFinancials(currentCompanyData);
      }
}

function toggleSecMetric(key) {
      visibleMetrics[key] = !visibleMetrics[key];
      renderSECDashboard();
}

function populateRevenue(data) {
      // Simplified - would need more detailed revenue breakdown from API
      console.log('Revenue data populated from financials');
}

function populateManagement(data) {
      const { ai } = data;

      if (ai?.management) {
            const leadershipDiv = document.getElementById('leadershipQualities');
            const qualities = ai.management.leadershipQuality || {};

            leadershipDiv.innerHTML = Object.entries(qualities).map(([key, value]) => `
      <div style="margin-bottom: var(--spacing-md);">
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
          <span style="text-transform: capitalize;">${key.replace(/([A-Z])/g, ' $1')}</span>
          <span><strong>${value}%</strong></span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${value}%;"></div>
        </div>
      </div>
    `).join('');
      }
}

function populateCompetitive(data) {
      const { ai } = data;

      if (ai?.competitive) {
            // Update market opportunity
            if (ai.competitive.marketSize) {
                  const { tam, sam, som, growth } = ai.competitive.marketSize;
                  // Update TAM/SAM/SOM display (elements already in HTML)
            }

            // Update opportunities and threats
            if (ai.competitive.opportunities) {
                  const oppDiv = document.getElementById('opportunities');
                  oppDiv.innerHTML = ai.competitive.opportunities.map(opp => `
        <p>🚀 ${opp.opportunity || opp}</p>
      `).join('');
            }

            if (ai.competitive.threats) {
                  const threatsDiv = document.getElementById('threats');
                  threatsDiv.innerHTML = ai.competitive.threats.map(threat => `
        <p>⚠️ ${threat.threat || threat}</p>
      `).join('');
            }
      }
}

function populateSentiment(data) {
      const { news } = data;

      if (news && news.sentiment) {
            const sentiment = news.sentiment;
            document.getElementById('ratingsSummary').innerHTML = `
      <p style="text-align: center; margin-top: var(--spacing-md);">
        <strong>Sentiment: ${sentiment.label}</strong><br>
        <span class="text-${sentiment.score > 0 ? 'success' : sentiment.score < 0 ? 'danger' : 'muted'}">
          Score: ${sentiment.score.toFixed(1)}
        </span>
      </p>
    `;
      }
}

function populateForecasts(data) {
      const { ai } = data;

      if (ai?.forecasts) {
            // Forecasts will be handled by existing chart logic
            console.log('Forecasts data available:', ai.forecasts);
      }
}

function populateValuation(data) {
      const { ai, quote } = data;

      if (ai?.valuation) {
            const dcf = ai.valuation.dcf;
            const currentPrice = quote.price;

            document.getElementById('fairValueDisplay').innerHTML = `
      <div style="margin-bottom: var(--spacing-lg);">
        <div style="font-size: 1rem; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Current Price</div>
        <div style="font-size: 3rem; font-weight: 700; color: var(--text-primary);">$${currentPrice.toFixed(2)}</div>
      </div>
      <div>
        <div style="font-size: 1rem; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Fair Value (Base Case)</div>
        <div style="font-size: 3rem; font-weight: 700; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          $${dcf.base.fairValue.toFixed(2)}
        </div>
        <div class="badge ${dcf.base.upside >= 0 ? 'badge-success' : 'badge-danger'}" style="margin-top: var(--spacing-sm);">
          ${dcf.base.upside >= 0 ? '⬆️' : '⬇️'} ${Math.abs(dcf.base.upside).toFixed(1)}% ${dcf.base.upside >= 0 ? 'Upside' : 'Downside'}
        </div>
      </div>
    `;

            // Update scenario cards
            ['base', 'bull', 'bear'].forEach(scenario => {
                  const scenarioData = dcf[scenario];
                  const div = document.getElementById(`${scenario}Valuation`);
                  if (div && scenarioData) {
                        div.innerHTML = `
          <div class="metric-card">
            <div class="metric-label">Fair Value</div>
            <div class="metric-value">$${scenarioData.fairValue.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">WACC</div>
            <div class="metric-value">${scenarioData.wacc.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Terminal Growth</div>
            <div class="metric-value">${scenarioData.terminalGrowth.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Upside</div>
            <div class="metric-value text-${scenarioData.upside >= 0 ? 'success' : 'danger'}">
              ${scenarioData.upside.toFixed(1)}%
            </div>
          </div>
        `;
                  }
            });
      }
}

function populateStakeholders(data) {
      const { insiders } = data;

      if (insiders && insiders.transactions) {
            const transactionsDiv = document.getElementById('insiderTransactions');
            transactionsDiv.innerHTML = insiders.transactions.slice(0, 5).map(t => `
      <div style="padding: var(--spacing-sm); border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; justify-content: space-between;">
          <strong>${t.name}</strong>
          <span class="badge ${t.type === 'Buy' ? 'badge-success' : 'badge-danger'}">
            ${t.type}
          </span>
        </div>
        <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: var(--spacing-xs);">
          ${new Date(t.transactionDate).toLocaleDateString()} | ${t.shares.toLocaleString()} shares @ $${t.transactionPrice.toFixed(2)}
        </div>
      </div>
    `).join('') || '<p>No recent insider transactions</p>';
      }
}

function populateRecommendation(data) {
      const { ai } = data;

      if (ai?.recommendation) {
            const rec = ai.recommendation;

            document.getElementById('finalRating').innerHTML = `
      <div class="badge badge-${rec.rating.includes('Buy') ? 'success' : rec.rating === 'Hold' ? 'warning' : 'danger'}" 
           style="font-size: 2rem; padding: 1rem 2rem;">
        ${rec.rating}
      </div>
      <div style="margin-top: var(--spacing-sm); color: var(--text-muted);">
        Confidence: ${rec.confidence}%
      </div>
    `;

            // Top reasons to buy
            if (rec.topReasonsToBuy) {
                  const reasonsDiv = document.getElementById('topReasons');
                  reasonsDiv.innerHTML = rec.topReasonsToBuy.map(reason => `
        <div class="card">
          <div style="font-size: 2rem; margin-bottom: var(--spacing-sm);">${reason.icon || '🚀'}</div>
          <h4>${reason.title}</h4>
          <p>${reason.description}</p>
        </div>
      `).join('');
            }

            // Top risks
            if (rec.topRisks) {
                  const risksDiv = document.getElementById('topRisks');
                  risksDiv.innerHTML = rec.topRisks.map(risk => `
        <div class="card">
          <div style="font-size: 2rem; margin-bottom: var(--spacing-sm);">${risk.icon || '⚠️'}</div>
          <h4>${risk.title}</h4>
          <p>${risk.description}</p>
          <div class="badge badge-${risk.severity === 'High' ? 'danger' : risk.severity === 'Medium' ? 'warning' : 'info'}">
            ${risk.severity} Risk
          </div>
        </div>
      `).join('');
            }
      }
}

function populateTechnical(data) {
      const { quote } = data;

      // Update current price display
      const priceCards = document.querySelectorAll('#technical .stat-value');
      if (priceCards[0]) {
            priceCards[0].textContent = `$${quote.price.toFixed(2)}`;
      }
}

// Helper function for expandable sections
function toggleExpandable(header) {
      const expandable = header.parentElement;
      expandable.classList.toggle('active');
}

// Sidebar toggle function
function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const mainContent = document.querySelector('.main-content');
      const headerBar = document.getElementById('headerBar');
      const hamburger = document.getElementById('hamburgerMenu');

      sidebar.classList.toggle('closed');
      mainContent.classList.toggle('sidebar-closed');
      headerBar.classList.toggle('sidebar-closed');
      hamburger.classList.toggle('active');
}

console.log('API integration loaded. Ready to analyze companies!');

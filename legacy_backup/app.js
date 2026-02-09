// ========================================
// AI-Powered Fundamental Analysis Platform
// Main Application Logic
// ========================================

// Global variables
let currentScenario = 'base';
let currentExplanation = 'simple';
let charts = {};

// ========== Initialize Application ==========
// DISABLED: Auto-initialization commented out to allow API-driven data loading
// Uncomment the lines below if you want to show demo data on page load
/*
document.addEventListener('DOMContentLoaded', function () {
      initializeApp();
});
*/

function initializeApp() {
      // Populate all sections
      populateOverview();
      populateRevenue();
      populateFinancials();
      populateManagement();
      populateCompetitive();
      populateSentiment();
      populateForecasts();
      populateValuation();
      populateStakeholders();
      populateRecommendation();
      populateTechnical();

      // Initialize charts
      initializeCharts();

      console.log('✅ Application initialized successfully');
}

// ========== Section 1: Company Overview ==========
function populateOverview() {
      const { overview } = companyData;

      // Basic info
      document.getElementById('companyLogo').textContent = overview.logo;
      document.getElementById('companyName').textContent = overview.name;
      document.getElementById('companyTagline').textContent = overview.tagline;
      document.getElementById('companyExplanation').textContent = overview.simpleExplanation;

      // Hero stats
      const heroStats = document.getElementById('heroStats');
      heroStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Market Cap</div>
      <div class="stat-value">${overview.marketCap}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Founded</div>
      <div class="stat-value">${overview.founded}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Employees</div>
      <div class="stat-value">${overview.employees}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Headquarters</div>
      <div class="stat-value">${overview.headquarters}</div>
    </div>
  `;

      // Business model
      document.getElementById('businessModelDesc').textContent = overview.businessModel.description;
      const streamsHTML = overview.businessModel.streams.map(stream => `
    <div style="margin-bottom: var(--spacing-sm);">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
        <span style="font-weight: 600;">${stream.name}</span>
        <span>${stream.percentage}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${stream.percentage}%"></div>
      </div>
      <p style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem;">${stream.description}</p>
    </div>
  `).join('');
      document.getElementById('businessStreams').innerHTML = streamsHTML;

      // Business segments
      const segmentsHTML = overview.segments.map(segment => `
    <div style="text-align: center; padding: var(--spacing-sm);">
      <div style="font-size: 2rem; margin-bottom: var(--spacing-xs);">${segment.icon}</div>
      <div style="font-weight: 600; margin-bottom: 0.25rem;">${segment.name}</div>
      <div style="font-size: 0.875rem; color: var(--text-muted);">${segment.description}</div>
    </div>
  `).join('');
      document.getElementById('businessSegments').innerHTML = segmentsHTML;

      // Advantages
      const advantagesHTML = overview.advantages.map(adv => `
    <div class="expandable" onclick="toggleExpandable(this)">
      <div class="expandable-header">
        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
          <span style="font-size: 1.5rem;">${adv.icon}</span>
          <span class="expandable-title">${adv.title}</span>
        </div>
        <span class="expandable-icon">▼</span>
      </div>
      <div class="expandable-content">
        <div class="expandable-body">${adv.description}</div>
      </div>
    </div>
  `).join('');
      document.getElementById('advantages').innerHTML = advantagesHTML;

      // Challenges
      const challengesHTML = overview.challenges.map(challenge => {
            const severityColor = challenge.severity === 'high' ? 'danger' : challenge.severity === 'medium' ? 'warning' : 'info';
            return `
      <div class="expandable" onclick="toggleExpandable(this)">
        <div class="expandable-header">
          <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
            <span class="badge badge-${severityColor}">${challenge.severity}</span>
            <span class="expandable-title">${challenge.title}</span>
          </div>
          <span class="expandable-icon">▼</span>
        </div>
        <div class="expandable-content">
          <div class="expandable-body">${challenge.description}</div>
        </div>
      </div>
    `;
      }).join('');
      document.getElementById('challenges').innerHTML = challengesHTML;
}

// ========== Section 2: Revenue Breakdown ==========
function populateRevenue() {
      const { revenueBreakdown } = companyData;

      // Populate revenue table
      const tbody = document.getElementById('revenueTableBody');
      tbody.innerHTML = revenueBreakdown.bySegment.map(segment => {
            const growth = ((segment.data[4].value / segment.data[0].value - 1) * 100).toFixed(1);
            const arrow = growth > 0 ? '⬆️' : '⬇️';
            const colorClass = growth > 0 ? 'text-success' : 'text-danger';

            return `
      <tr>
        <td style="font-weight: 600;">${segment.segment}</td>
        <td>$${segment.data[0].value}B</td>
        <td>$${segment.data[1].value}B</td>
        <td>$${segment.data[2].value}B</td>
        <td>$${segment.data[3].value}B</td>
        <td>$${segment.data[4].value}B</td>
        <td class="${colorClass}">${arrow} ${growth}%</td>
      </tr>
    `;
      }).join('');
}

// ========== Section 3: Financial Analysis ==========
function populateFinancials() {
      const { financials } = companyData;

      // Populate financial table
      const tbody = document.getElementById('financialTableBody');
      const metrics = [
            { label: 'Revenue ($B)', key: 'revenue', format: 'currency' },
            { label: 'Gross Profit ($B)', key: 'grossProfit', format: 'currency' },
            { label: 'Operating Profit ($B)', key: 'operatingProfit', format: 'currency' },
            { label: 'Net Profit ($B)', key: 'netProfit', format: 'currency' },
            { label: 'EPS ($)', key: 'eps', format: 'decimal' },
            { label: 'Shares (M)', key: 'shares', format: 'number' },
            { label: 'Operating Cash Flow ($B)', key: 'operatingCashFlow', format: 'currency' },
            { label: 'Free Cash Flow ($B)', key: 'freeCashFlow', format: 'currency' },
            { label: 'Gross Margin (%)', key: 'grossMargin', format: 'percent' },
            { label: 'Operating Margin (%)', key: 'operatingMargin', format: 'percent' },
            { label: 'Net Margin (%)', key: 'netMargin', format: 'percent' },
            { label: 'P/E Ratio', key: 'pe', format: 'decimal' },
            { label: 'P/B Ratio', key: 'pb', format: 'decimal' },
            { label: 'Debt/Equity', key: 'debtToEquity', format: 'decimal' },
            { label: 'ROE (%)', key: 'roe', format: 'percent' },
            { label: 'ROIC (%)', key: 'roic', format: 'percent' }
      ];

      tbody.innerHTML = metrics.map(metric => {
            const values = financials.annual.map(year => formatValue(year[metric.key], metric.format));
            const lastQ = financials.lastQuarter[metric.key] ? formatValue(financials.lastQuarter[metric.key], metric.format) : 'N/A';

            return `
      <tr>
        <td style="font-weight: 600;">${metric.label}</td>
        ${values.map(v => `<td>${v}</td>`).join('')}
        <td>${lastQ}</td>
      </tr>
    `;
      }).join('');

      // Populate criteria checklist
      const criteriaGrid = document.getElementById('criteriaGrid');
      const criteria = [
            { label: 'Revenue Growth', threshold: '>12%', current: financials.criteria.revenueGrowth.current, met: financials.criteria.revenueGrowth.met },
            { label: 'Share Dilution', threshold: '<2%', current: financials.criteria.sharesGrowth.current, met: financials.criteria.sharesGrowth.met },
            { label: 'Net Cash/FCF', threshold: '<5x', current: financials.criteria.netCashToFCF.current, met: financials.criteria.netCashToFCF.met },
            { label: 'FCF Growth', threshold: '>15%', current: financials.criteria.fcfGrowth.current, met: financials.criteria.fcfGrowth.met },
            { label: 'ROIC', threshold: '>15%', current: financials.criteria.roic.current, met: financials.criteria.roic.met },
            { label: 'EPS Growth', threshold: '>15%', current: financials.criteria.epsGrowth.current, met: financials.criteria.epsGrowth.met }
      ];

      criteriaGrid.innerHTML = criteria.map(c => `
    <div class="card" style="text-align: center;">
      <div style="font-size: 2rem; margin-bottom: var(--spacing-xs);">
        ${c.met ? '✅' : '❌'}
      </div>
      <div style="font-weight: 600; margin-bottom: 0.25rem;">${c.label}</div>
      <div style="font-size: 0.875rem; color: var(--text-muted);">Target: ${c.threshold}</div>
      <div style="font-size: 1.25rem; font-weight: 700; margin-top: var(--spacing-xs); color: ${c.met ? 'var(--success)' : 'var(--danger)'};">
        ${typeof c.current === 'number' ? c.current.toFixed(1) : c.current}${c.label.includes('Growth') || c.label.includes('ROIC') ? '%' : c.label.includes('Dilution') ? '%' : 'x'}
      </div>
    </div>
  `).join('');
}

// ========== Section 4: Management Team ==========
function populateManagement() {
      const { management } = companyData;

      // Populate executives
      const executivesGrid = document.getElementById('executivesGrid');
      executivesGrid.innerHTML = management.executives.map(exec => `
    <div class="card card-glass">
      <div style="display: flex; gap: var(--spacing-md); align-items: start;">
        <div style="font-size: 4rem;">${exec.photo}</div>
        <div style="flex: 1;">
          <h3 style="margin-bottom: 0.25rem;">${exec.name}</h3>
          <div style="color: var(--accent-primary); font-weight: 600; margin-bottom: var(--spacing-sm);">${exec.role}</div>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-sm);">${exec.background}</p>
          <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap; margin-bottom: var(--spacing-sm);">
            ${exec.expertise.map(e => `<span class="badge badge-info">${e}</span>`).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
            <span>Tenure: <strong>${exec.tenure}</strong></span>
            <span>Ownership: <strong>${exec.ownership}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

      // Leadership qualities
      const qualities = document.getElementById('leadershipQualities');
      const qualityData = [
            { label: 'Innovation Focus', value: management.leadershipStyle.innovation },
            { label: 'ESG Commitment', value: management.leadershipStyle.esgFocus },
            { label: 'Risk Management', value: management.leadershipStyle.riskManagement },
            { label: 'Transparency', value: management.leadershipStyle.transparency }
      ];

      qualities.innerHTML = qualityData.map(q => `
    <div style="margin-bottom: var(--spacing-md);">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="font-weight: 600;">${q.label}</span>
        <span style="color: var(--success);">${q.value}/100</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${q.value}%"></div>
      </div>
    </div>
  `).join('');
}

// ========== Section 5: Competitive Landscape ==========
function populateCompetitive() {
      const { competitive } = companyData;

      // Populate competitor table
      const tbody = document.getElementById('competitorTableBody');
      tbody.innerHTML = competitive.competitors.map((comp, index) => {
            const isCompany = index === 0;
            const rowClass = isCompany ? 'style="background: rgba(79, 70, 229, 0.1);"' : '';

            return `
      <tr ${rowClass}>
        <td style="font-weight: 600;">${comp.name}</td>
        <td>$${comp.revenue}B</td>
        <td>${comp.netMargin}%</td>
        <td>$${comp.marketCap}B</td>
        <td>$${comp.fcf}B</td>
        <td>${comp.pe}</td>
        <td class="${comp.epsGrowth > 30 ? 'text-success' : ''}">${comp.epsGrowth}%</td>
      </tr>
    `;
      }).join('');

      // Opportunities
      const opportunities = document.getElementById('opportunities');
      opportunities.innerHTML = competitive.opportunities.map(opp => `
    <div style="display: flex; align-items: start; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);">
      <span style="color: var(--success); font-size: 1.25rem;">✓</span>
      <span>${opp}</span>
    </div>
  `).join('');

      // Threats
      const threats = document.getElementById('threats');
      threats.innerHTML = competitive.threats.map(threat => `
    <div style="display: flex; align-items: start; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);">
      <span style="color: var(--danger); font-size: 1.25rem;">⚠</span>
      <span>${threat}</span>
    </div>
  `).join('');
}

// ========== Section 6: Market Sentiment ==========
function populateSentiment() {
      const { sentiment } = companyData;

      // Ratings summary
      const total = sentiment.analystRatings.strongBuy + sentiment.analystRatings.buy +
            sentiment.analystRatings.hold + sentiment.analystRatings.sell +
            sentiment.analystRatings.strongSell;

      const ratingsSummary = document.getElementById('ratingsSummary');
      ratingsSummary.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 2rem; font-weight: 700; color: var(--success); margin-bottom: var(--spacing-sm);">
        ${((sentiment.analystRatings.strongBuy + sentiment.analystRatings.buy) / total * 100).toFixed(0)}% Buy Rating
      </div>
      <div style="color: var(--text-muted);">Based on ${total} analyst ratings</div>
    </div>
  `;

      // Price target gauge
      const priceTargetGauge = document.getElementById('priceTargetGauge');
      const upside = ((sentiment.priceTargets.consensus / sentiment.priceTargets.current - 1) * 100).toFixed(1);

      priceTargetGauge.innerHTML = `
    <div style="margin-bottom: var(--spacing-lg);">
      <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-sm);">Current Price</div>
      <div style="font-size: 2.5rem; font-weight: 700;">$${sentiment.priceTargets.current}</div>
    </div>
    <div style="margin-bottom: var(--spacing-lg);">
      <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-sm);">Consensus Target</div>
      <div style="font-size: 2.5rem; font-weight: 700; color: var(--success);">$${sentiment.priceTargets.consensus}</div>
      <div style="font-size: 1.125rem; color: var(--success); margin-top: var(--spacing-xs);">
        ⬆️ ${upside}% Upside
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; padding: var(--spacing-md); background: rgba(79, 70, 229, 0.05); border-radius: var(--radius-md);">
      <div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Low</div>
        <div style="font-weight: 700;">$${sentiment.priceTargets.low}</div>
      </div>
      <div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">High</div>
        <div style="font-weight: 700;">$${sentiment.priceTargets.high}</div>
      </div>
    </div>
  `;

      // Bull/Bear arguments
      const bullishArgs = document.getElementById('bullishArgs');
      bullishArgs.innerHTML = sentiment.bullishArguments.map(arg => `
    <li style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm); align-items: start;">
      <span style="color: var(--success); font-size: 1.25rem;">✓</span>
      <span>${arg}</span>
    </li>
  `).join('');

      const bearishArgs = document.getElementById('bearishArgs');
      bearishArgs.innerHTML = sentiment.bearishArguments.map(arg => `
    <li style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm); align-items: start;">
      <span style="color: var(--danger); font-size: 1.25rem;">⚠</span>
      <span>${arg}</span>
    </li>
  `).join('');
}

// ========== Section 7: Forecasts ==========
function populateForecasts() {
      const { forecasts } = companyData;

      // Macro trends
      const macroTrends = document.getElementById('macroTrends');
      macroTrends.innerHTML = forecasts.macroTrends.map(trend => {
            const impactColor = trend.impact.includes('Positive') ? 'success' : trend.impact === 'Neutral' ? 'warning' : 'danger';
            return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-sm); background: rgba(79, 70, 229, 0.05); border-radius: var(--radius-sm); margin-bottom: var(--spacing-sm);">
        <div>
          <div style="font-weight: 600;">${trend.trend}</div>
          <div style="font-size: 0.875rem; color: var(--text-muted);">Confidence: ${trend.confidence}%</div>
        </div>
        <span class="badge badge-${impactColor}">${trend.impact}</span>
      </div>
    `;
      }).join('');

      // Risk heatmap
      const riskHeatmap = document.getElementById('riskHeatmap');
      riskHeatmap.innerHTML = forecasts.risks.map(risk => {
            const severity = risk.probability === 'High' && risk.impact === 'High' ? 'danger' :
                  risk.probability === 'Low' && risk.impact === 'Low' ? 'success' : 'warning';
            return `
      <div style="padding: var(--spacing-sm); background: rgba(79, 70, 229, 0.05); border-radius: var(--radius-sm); border-left: 3px solid var(--${severity}); margin-bottom: var(--spacing-sm);">
        <div style="font-weight: 600; margin-bottom: 0.25rem;">${risk.risk}</div>
        <div style="display: flex; gap: var(--spacing-sm); font-size: 0.875rem;">
          <span class="badge badge-${severity}">P: ${risk.probability}</span>
          <span class="badge badge-${severity}">I: ${risk.impact}</span>
        </div>
      </div>
    `;
      }).join('');
}

// ========== Section 8: Valuation ==========
function populateValuation() {
      const { valuation } = companyData;

      // Fair value display
      const fairValueDisplay = document.getElementById('fairValueDisplay');
      const baseUpside = valuation.dcf.base.upside;
      const upsideColor = baseUpside > 0 ? 'success' : 'danger';

      fairValueDisplay.innerHTML = `
    <div style="margin-bottom: var(--spacing-lg);">
      <div style="font-size: 1rem; color: var(--text-muted); margin-bottom: var(--spacing-sm);">Current Stock Price</div>
      <div style="font-size: 3rem; font-weight: 700;">$${valuation.currentPrice}</div>
    </div>
    <div style="margin-bottom: var(--spacing-lg);">
      <div style="font-size: 1rem; color: var(--text-muted); margin-bottom: var(--spacing-sm);">Fair Value (Base Case)</div>
      <div style="font-size: 3.5rem; font-weight: 700; color: var(--${upsideColor});">$${valuation.dcf.base.fairValue}</div>
      <div style="font-size: 1.5rem; color: var(--${upsideColor}); margin-top: var(--spacing-sm);">
        ${baseUpside > 0 ? '⬆️' : '⬇️'} ${Math.abs(baseUpside).toFixed(1)}% ${baseUpside > 0 ? 'Upside' : 'Downside'}
      </div>
    </div>
    <div style="display: flex; justify-content: center; gap: var(--spacing-xl); padding: var(--spacing-lg); background: rgba(79, 70, 229, 0.05); border-radius: var(--radius-md);">
      <div style="text-align: center;">
        <div style="font-size: 0.875rem; color: var(--text-muted);">Bear Case</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">$${valuation.dcf.bear.fairValue}</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 0.875rem; color: var(--text-muted);">Bull Case</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">$${valuation.dcf.bull.fairValue}</div>
      </div>
    </div>
  `;

      // Valuation scenarios
      const scenarios = ['base', 'bull', 'bear'];
      scenarios.forEach(scenario => {
            const data = valuation.dcf[scenario];
            const element = document.getElementById(`${scenario}Valuation`);
            const upsideColor = data.upside > 0 ? 'success' : 'danger';

            element.innerHTML = `
      <div style="margin-bottom: var(--spacing-sm);">
        <div style="font-size: 0.875rem; color: var(--text-muted);">Fair Value</div>
        <div style="font-size: 2rem; font-weight: 700; color: var(--${upsideColor});">$${data.fairValue}</div>
      </div>
      <div style="margin-bottom: var(--spacing-sm);">
        <div style="font-size: 0.875rem; color: var(--text-muted);">WACC</div>
        <div style="font-weight: 600;">${data.wacc}%</div>
      </div>
      <div style="margin-bottom: var(--spacing-sm);">
        <div style="font-size: 0.875rem; color: var(--text-muted);">Terminal Growth</div>
        <div style="font-weight: 600;">${data.terminalGrowth}%</div>
      </div>
      <div>
        <div style="font-size: 0.875rem; color: var(--text-muted);">Upside/Downside</div>
        <div style="font-weight: 700; color: var(--${upsideColor});">${data.upside > 0 ? '+' : ''}${data.upside.toFixed(1)}%</div>
      </div>
    `;
      });

      // Sensitivity table
      const sensitivityBody = document.getElementById('sensitivityTableBody');
      const waccRange = valuation.sensitivityAnalysis.waccRange;
      const values = valuation.sensitivityAnalysis.values;

      sensitivityBody.innerHTML = waccRange.map((wacc, i) => `
    <tr>
      <td style="font-weight: 600;">${wacc}%</td>
      ${values[i].map(val => {
            const diff = ((val / valuation.currentPrice - 1) * 100);
            const color = diff > 20 ? 'var(--success)' : diff < -10 ? 'var(--danger)' : 'var(--text-secondary)';
            return `<td style="color: ${color}; font-weight: 600;">$${val}</td>`;
      }).join('')}
    </tr>
  `).join('');
}

// ========== Section 9: Stakeholders ==========
function populateStakeholders() {
      const { stakeholders } = companyData;

      // Notable investors
      const notableInvestors = document.getElementById('notableInvestors');
      notableInvestors.innerHTML = stakeholders.notableInvestors.map(investor => `
    <div class="card card-glass" style="text-align: center;">
      <div style="font-size: 3rem; margin-bottom: var(--spacing-sm);">${investor.logo}</div>
      <h4 style="margin-bottom: 0.25rem;">${investor.name}</h4>
      <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-sm);">${investor.type}</div>
      <div style="font-size: 1.75rem; font-weight: 700; color: var(--accent-primary);">${investor.ownership}%</div>
      <div style="font-size: 0.875rem; color: var(--text-muted);">Ownership</div>
    </div>
  `).join('');

      // Insider transactions
      const insiderTransactions = document.getElementById('insiderTransactions');
      insiderTransactions.innerHTML = stakeholders.insiderTransactions.map(txn => {
            const typeColor = txn.type === 'Buy' ? 'success' : 'danger';
            return `
      <div style="padding: var(--spacing-sm); background: rgba(79, 70, 229, 0.05); border-radius: var(--radius-sm); margin-bottom: var(--spacing-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <span style="font-weight: 600;">${txn.person}</span>
          <span class="badge badge-${typeColor}">${txn.type}</span>
        </div>
        <div style="font-size: 0.875rem; color: var(--text-muted);">
          ${txn.shares.toLocaleString()} shares @ $${txn.price} • ${txn.date}
        </div>
        <div style="font-weight: 600; margin-top: 0.25rem;">Total: $${txn.value}M</div>
      </div>
    `;
      }).join('');
}

// ========== Section 10: Recommendation ==========
function populateRecommendation() {
      const { recommendation } = companyData;

      // Final rating
      const finalRating = document.getElementById('finalRating');
      const ratingColors = {
            'Strong Buy': 'success',
            'Buy': 'success',
            'Hold': 'warning',
            'Sell': 'danger'
      };
      const ratingColor = ratingColors[recommendation.rating];

      finalRating.innerHTML = `
    <div style="display: inline-block; padding: var(--spacing-lg) var(--spacing-xl); background: var(--gradient-${ratingColor}); border-radius: var(--radius-lg); margin-bottom: var(--spacing-md);">
      <div style="font-size: 1rem; color: white; opacity: 0.9; margin-bottom: var(--spacing-xs);">Investment Rating</div>
      <div style="font-size: 3rem; font-weight: 700; color: white;">${recommendation.rating}</div>
      <div style="font-size: 1rem; color: white; opacity: 0.9; margin-top: var(--spacing-xs);">Confidence: ${recommendation.confidence}%</div>
    </div>
  `;

      // Time horizon analysis
      const timeHorizonAnalysis = document.getElementById('timeHorizonAnalysis');
      const horizons = [
            { label: 'Short Term (0-1Y)', key: 'shortTerm' },
            { label: 'Mid Term (1-3Y)', key: 'midTerm' },
            { label: 'Long Term (3-5Y)', key: 'longTerm' }
      ];

      timeHorizonAnalysis.innerHTML = horizons.map(h => {
            const data = recommendation.timeHorizon[h.key];
            const outlookColor = data.outlook.includes('Positive') || data.outlook.includes('Excellent') ? 'success' :
                  data.outlook === 'Neutral' ? 'warning' : 'danger';
            return `
      <div class="card">
        <h4 style="margin-bottom: var(--spacing-sm);">${h.label}</h4>
        <div class="badge badge-${outlookColor}" style="margin-bottom: var(--spacing-sm);">${data.outlook}</div>
        <p style="font-size: 0.875rem; color: var(--text-muted);">${data.rationale}</p>
      </div>
    `;
      }).join('');

      // Top reasons to buy
      const topReasons = document.getElementById('topReasons');
      topReasons.innerHTML = recommendation.topReasonsToBuy.map(reason => `
    <div class="card card-glass" style="margin-bottom: var(--spacing-md);">
      <div style="font-size: 2.5rem; margin-bottom: var(--spacing-sm);">${reason.icon}</div>
      <h4 style="margin-bottom: var(--spacing-sm);">${reason.title}</h4>
      <p style="color: var(--text-secondary);">${reason.description}</p>
    </div>
  `).join('');

      // Top risks
      const topRisks = document.getElementById('topRisks');
      topRisks.innerHTML = recommendation.topRisks.map(risk => {
            const severityColor = risk.severity === 'High' ? 'danger' : risk.severity === 'Medium' ? 'warning' : 'info';
            return `
      <div class="card card-glass" style="margin-bottom: var(--spacing-md);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-sm);">
          <div style="font-size: 2.5rem;">${risk.icon}</div>
          <span class="badge badge-${severityColor}">${risk.severity}</span>
        </div>
        <h4 style="margin-bottom: var(--spacing-sm);">${risk.title}</h4>
        <p style="color: var(--text-secondary);">${risk.description}</p>
      </div>
    `;
      }).join('');

      // Catalysts
      const catalysts = document.getElementById('catalysts');
      catalysts.innerHTML = recommendation.catalysts.map(catalyst => {
            const impactColor = catalyst.impact === 'Very High' ? 'success' : catalyst.impact === 'High' ? 'info' : 'warning';
            return `
      <div class="card">
        <h4 style="margin-bottom: var(--spacing-sm);">${catalyst.catalyst}</h4>
        <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm);">
          <span class="badge badge-${impactColor}">Impact: ${catalyst.impact}</span>
          <span class="badge badge-info">${catalyst.timeframe}</span>
        </div>
      </div>
    `;
      }).join('');
}

// ========== Section 11: Technical Analysis ==========
function populateTechnical() {
      const { technical } = companyData;

      // Technical indicators
      const technicalIndicators = document.getElementById('technicalIndicators');
      technicalIndicators.innerHTML = `
    <div style="margin-bottom: var(--spacing-sm);">
      <div style="display: flex; justify-content: space-between;">
        <span>RSI (14)</span>
        <span style="font-weight: 700; color: ${technical.indicators.rsi > 70 ? 'var(--danger)' : technical.indicators.rsi < 30 ? 'var(--success)' : 'var(--text-primary)'};">${technical.indicators.rsi}</span>
      </div>
    </div>
    <div style="margin-bottom: var(--spacing-sm);">
      <div style="display: flex; justify-content: space-between;">
        <span>MACD</span>
        <span style="font-weight: 700; color: ${technical.indicators.macd.histogram > 0 ? 'var(--success)' : 'var(--danger)'};">${technical.indicators.macd.value.toFixed(2)}</span>
      </div>
    </div>
    <div style="margin-bottom: var(--spacing-sm);">
      <div style="display: flex; justify-content: space-between;">
        <span>50-Day MA</span>
        <span style="font-weight: 700;">$${technical.indicators.movingAverages.ma50}</span>
      </div>
    </div>
    <div style="margin-bottom: var(--spacing-sm);">
      <div style="display: flex; justify-content: space-between;">
        <span>200-Day MA</span>
        <span style="font-weight: 700;">$${technical.indicators.movingAverages.ma200}</span>
      </div>
    </div>
    <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid rgba(255,255,255,0.1);">
      <div style="text-align: center;">
        <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: var(--spacing-xs);">Technical Rating</div>
        <div class="badge badge-success" style="font-size: 1rem; padding: 0.5rem 1rem;">${technical.technicalRating}</div>
      </div>
    </div>
  `;

      // Support levels
      const supportLevels = document.getElementById('supportLevels');
      supportLevels.innerHTML = technical.supportLevels.map((level, i) => `
    <div style="padding: var(--spacing-sm); background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-sm); margin-bottom: var(--spacing-sm); border-left: 3px solid var(--success);">
      <div style="font-size: 0.875rem; color: var(--text-muted);">Support ${i + 1}</div>
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--success);">$${level}</div>
    </div>
  `).join('');

      // Resistance levels
      const resistanceLevels = document.getElementById('resistanceLevels');
      resistanceLevels.innerHTML = technical.resistanceLevels.map((level, i) => `
    <div style="padding: var(--spacing-sm); background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-sm); margin-bottom: var(--spacing-sm); border-left: 3px solid var(--danger);">
      <div style="font-size: 0.875rem; color: var(--text-muted);">Resistance ${i + 1}</div>
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">$${level}</div>
    </div>
  `).join('');
}

// ========== Chart Initialization ==========
function initializeCharts() {
      initMarketShareChart();
      initRevenueChart();
      initFinancialCharts();
      initOwnershipChart();
      initCompetitiveChart();
      initRatingsChart();
      initForecastChart();
      initOwnershipBreakdownChart();
      initTechnicalChart();
}

function initMarketShareChart() {
      const ctx = document.getElementById('marketShareChart');
      const { competitors } = companyData.overview;

      charts.marketShare = new Chart(ctx, {
            type: 'doughnut',
            data: {
                  labels: competitors.map(c => c.name),
                  datasets: [{
                        data: competitors.map(c => c.marketShare),
                        backgroundColor: [
                              'rgba(79, 70, 229, 0.8)',
                              'rgba(124, 58, 237, 0.8)',
                              'rgba(6, 182, 212, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(148, 163, 184, 0.5)'
                        ],
                        borderColor: 'rgba(10, 14, 39, 1)',
                        borderWidth: 2
                  }]
            },
            options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                        legend: {
                              position: 'bottom',
                              labels: { color: '#f8fafc', padding: 15, font: { size: 12 } }
                        },
                        tooltip: {
                              callbacks: {
                                    label: (context) => `${context.label}: ${context.parsed}%`
                              }
                        }
                  }
            }
      });
}

function initRevenueChart() {
      const ctx = document.getElementById('revenueChart');
      const { bySegment } = companyData.revenueBreakdown;

      const years = [2020, 2021, 2022, 2023, 2024];
      const datasets = bySegment.map((segment, index) => ({
            label: segment.segment,
            data: segment.data.map(d => d.value),
            backgroundColor: [
                  'rgba(79, 70, 229, 0.8)',
                  'rgba(124, 58, 237, 0.8)',
                  'rgba(6, 182, 212, 0.8)',
                  'rgba(16, 185, 129, 0.8)'
            ][index],
            borderColor: 'rgba(10, 14, 39, 1)',
            borderWidth: 1
      }));

      charts.revenue = new Chart(ctx, {
            type: 'bar',
            data: {
                  labels: years,
                  datasets: datasets
            },
            options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                        x: {
                              stacked: true,
                              ticks: { color: '#cbd5e1' },
                              grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        y: {
                              stacked: true,
                              ticks: {
                                    color: '#cbd5e1',
                                    callback: (value) => '$' + value + 'B'
                              },
                              grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        }
                  },
                  plugins: {
                        legend: {
                              position: 'top',
                              labels: { color: '#f8fafc', padding: 15 }
                        },
                        tooltip: {
                              callbacks: {
                                    label: (context) => `${context.dataset.label}: $${context.parsed.y}B`
                              }
                        }
                  }
            }
      });
}

function initFinancialCharts() {
      const { annual } = companyData.financials;
      const years = annual.map(y => y.year);

      // EPS Chart
      const epsCtx = document.getElementById('epsChart');
      charts.eps = new Chart(epsCtx, {
            type: 'line',
            data: {
                  labels: years,
                  datasets: [{
                        label: 'EPS',
                        data: annual.map(y => y.eps),
                        borderColor: 'rgba(79, 70, 229, 1)',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3
                  }]
            },
            options: getLineChartOptions('$')
      });

      // FCF Chart
      const fcfCtx = document.getElementById('fcfChart');
      charts.fcf = new Chart(fcfCtx, {
            type: 'line',
            data: {
                  labels: years,
                  datasets: [{
                        label: 'Free Cash Flow',
                        data: annual.map(y => y.freeCashFlow),
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3
                  }]
            },
            options: getLineChartOptions('$', 'B')
      });

      // ROIC Chart
      const roicCtx = document.getElementById('roicChart');
      charts.roic = new Chart(roicCtx, {
            type: 'line',
            data: {
                  labels: years,
                  datasets: [{
                        label: 'ROIC',
                        data: annual.map(y => y.roic),
                        borderColor: 'rgba(124, 58, 237, 1)',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3
                  }]
            },
            options: getLineChartOptions('', '%')
      });
}

function initOwnershipChart() {
      const ctx = document.getElementById('ownershipChart');
      const { management } = companyData;

      charts.ownership = new Chart(ctx, {
            type: 'doughnut',
            data: {
                  labels: ['Insider Ownership', 'Institutional', 'Other'],
                  datasets: [{
                        data: [management.insiderOwnership, 68.5, 14.8],
                        backgroundColor: [
                              'rgba(79, 70, 229, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(148, 163, 184, 0.5)'
                        ],
                        borderColor: 'rgba(10, 14, 39, 1)',
                        borderWidth: 2
                  }]
            },
            options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                        legend: {
                              position: 'bottom',
                              labels: { color: '#f8fafc', padding: 15 }
                        },
                        tooltip: {
                              callbacks: {
                                    label: (context) => `${context.label}: ${context.parsed}%`
                              }
                        }
                  }
            }
      });
}

function initCompetitiveChart() {
      const ctx = document.getElementById('competitiveChart');
      const { competitors } = companyData.competitive;

      charts.competitive = new Chart(ctx, {
            type: 'radar',
            data: {
                  labels: ['Revenue', 'Profitability', 'Growth', 'Valuation', 'Cash Flow'],
                  datasets: competitors.slice(0, 3).map((comp, index) => ({
                        label: comp.name,
                        data: [
                              Math.min(comp.revenue / 100 * 100, 100),
                              comp.netMargin / 40 * 100,
                              comp.epsGrowth,
                              100 - (comp.pe / 50 * 100),
                              Math.min(comp.fcf / 25 * 100, 100)
                        ],
                        borderColor: [
                              'rgba(79, 70, 229, 1)',
                              'rgba(16, 185, 129, 1)',
                              'rgba(239, 68, 68, 1)'
                        ][index],
                        backgroundColor: [
                              'rgba(79, 70, 229, 0.2)',
                              'rgba(16, 185, 129, 0.2)',
                              'rgba(239, 68, 68, 0.2)'
                        ][index],
                        borderWidth: 2
                  }))
            },
            options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                        r: {
                              ticks: {
                                    color: '#cbd5e1',
                                    backdropColor: 'transparent'
                              },
                              grid: { color: 'rgba(255, 255, 255, 0.1)' },
                              pointLabels: { color: '#f8fafc' }
                        }
                  },
                  plugins: {
                        legend: {
                              position: 'bottom',
                              labels: { color: '#f8fafc', padding: 15 }
                        }
                  }
            }
      });
}

function initRatingsChart() {
      const ctx = document.getElementById('ratingsChart');
      const { analystRatings } = companyData.sentiment;

      charts.ratings = new Chart(ctx, {
            type: 'bar',
            data: {
                  labels: ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'],
                  datasets: [{
                        data: [
                              analystRatings.strongBuy,
                              analystRatings.buy,
                              analystRatings.hold,
                              analystRatings.sell,
                              analystRatings.strongSell
                        ],
                        backgroundColor: [
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(6, 182, 212, 0.8)',
                              'rgba(245, 158, 11, 0.8)',
                              'rgba(239, 68, 68, 0.8)',
                              'rgba(127, 29, 29, 0.8)'
                        ],
                        borderColor: 'rgba(10, 14, 39, 1)',
                        borderWidth: 1
                  }]
            },
            options: {
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                        x: {
                              ticks: { color: '#cbd5e1' },
                              grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        y: {
                              ticks: { color: '#cbd5e1' },
                              grid: { display: false }
                        }
                  },
                  plugins: {
                        legend: { display: false },
                        tooltip: {
                              callbacks: {
                                    label: (context) => `${context.parsed.x} analysts`
                              }
                        }
                  }
            }
      });
}

function initForecastChart() {
      const ctx = document.getElementById('forecastChart');
      const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
      const { scenarios } = companyData.forecasts;

      charts.forecast = new Chart(ctx, {
            type: 'line',
            data: {
                  labels: years,
                  datasets: [{
                        label: 'Base Case',
                        data: scenarios.base.revenue,
                        borderColor: 'rgba(79, 70, 229, 1)',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3
                  }]
            },
            options: getLineChartOptions('$', 'B')
      });
}

function initOwnershipBreakdownChart() {
      const ctx = document.getElementById('ownershipBreakdownChart');
      const { stakeholders } = companyData;

      charts.ownershipBreakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                  labels: ['Institutional', 'Insider', 'Retail'],
                  datasets: [{
                        data: [
                              stakeholders.institutionalOwnership,
                              stakeholders.insiderOwnership,
                              stakeholders.retailOwnership
                        ],
                        backgroundColor: [
                              'rgba(79, 70, 229, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(6, 182, 212, 0.8)'
                        ],
                        borderColor: 'rgba(10, 14, 39, 1)',
                        borderWidth: 2
                  }]
            },
            options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                        legend: {
                              position: 'bottom',
                              labels: { color: '#f8fafc', padding: 15 }
                        },
                        tooltip: {
                              callbacks: {
                                    label: (context) => `${context.label}: ${context.parsed}%`
                              }
                        }
                  }
            }
      });
}

function initTechnicalChart() {
      const ctx = document.getElementById('technicalChart');

      // Generate mock price data
      const dates = [];
      const prices = [];
      let basePrice = 180;

      for (let i = 0; i < 252; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (252 - i));
            dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            basePrice += (Math.random() - 0.45) * 5;
            prices.push(basePrice);
      }

      charts.technical = new Chart(ctx, {
            type: 'line',
            data: {
                  labels: dates,
                  datasets: [{
                        label: 'Stock Price',
                        data: prices,
                        borderColor: 'rgba(79, 70, 229, 1)',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.1,
                        borderWidth: 2
                  }]
            },
            options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                        x: {
                              ticks: {
                                    color: '#cbd5e1',
                                    maxTicksLimit: 12
                              },
                              grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        },
                        y: {
                              ticks: {
                                    color: '#cbd5e1',
                                    callback: (value) => '$' + value.toFixed(0)
                              },
                              grid: { color: 'rgba(255, 255, 255, 0.05)' }
                        }
                  },
                  plugins: {
                        legend: {
                              labels: { color: '#f8fafc' }
                        }
                  }
            }
      });
}

// ========== Helper Functions ==========
function getLineChartOptions(prefix = '', suffix = '') {
      return {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                  x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  },
                  y: {
                        ticks: {
                              color: '#cbd5e1',
                              callback: (value) => prefix + value + suffix
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  }
            },
            plugins: {
                  legend: {
                        labels: { color: '#f8fafc' }
                  }
            }
      };
}

function formatValue(value, format) {
      if (value === null || value === undefined) return 'N/A';

      switch (format) {
            case 'currency':
                  return '$' + value.toFixed(2) + 'B';
            case 'decimal':
                  return value.toFixed(2);
            case 'percent':
                  return value.toFixed(1) + '%';
            case 'number':
                  return value.toLocaleString();
            default:
                  return value;
      }
}

// ========== Interactive Functions ==========
function toggleExplanation() {
      const toggle = document.getElementById('explanationToggle');
      const explanation = document.getElementById('companyExplanation');

      toggle.classList.toggle('active');
      currentExplanation = currentExplanation === 'simple' ? 'expert' : 'simple';

      explanation.textContent = currentExplanation === 'simple'
            ? companyData.overview.simpleExplanation
            : companyData.overview.expertExplanation;
}

function toggleExpandable(element) {
      element.classList.toggle('active');
}

function filterRevenue(type) {
      // Update button states
      document.querySelectorAll('#revenue .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
      });
      event.target.classList.remove('btn-secondary');
      event.target.classList.add('btn-primary');

      console.log('Filter revenue by:', type);
}

function sortTable(tableId, columnIndex) {
      const table = document.getElementById(tableId);
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));

      rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.replace(/[^0-9.-]/g, '');
            const bValue = b.cells[columnIndex].textContent.replace(/[^0-9.-]/g, '');
            return parseFloat(bValue) - parseFloat(aValue);
      });

      rows.forEach(row => tbody.appendChild(row));
}

function switchScenario(scenario) {
      currentScenario = scenario;

      // Update button states
      ['base', 'bull', 'bear'].forEach(s => {
            const btn = document.getElementById(s + 'Scenario');
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
      });

      const activeBtn = document.getElementById(scenario + 'Scenario');
      activeBtn.classList.remove('btn-secondary');
      activeBtn.classList.add('btn-primary');

      // Update chart
      const { scenarios } = companyData.forecasts;
      const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

      charts.forecast.data.datasets[0].data = scenarios[scenario].revenue;
      charts.forecast.data.datasets[0].label = scenario.charAt(0).toUpperCase() + scenario.slice(1) + ' Case';

      const colors = {
            base: 'rgba(79, 70, 229, 1)',
            bull: 'rgba(16, 185, 129, 1)',
            bear: 'rgba(239, 68, 68, 1)'
      };

      charts.forecast.data.datasets[0].borderColor = colors[scenario];
      charts.forecast.data.datasets[0].backgroundColor = colors[scenario].replace('1)', '0.1)');
      charts.forecast.update();
}

function toggleIndicator(indicator) {
      console.log('Toggle indicator:', indicator);
}

function exportPDF() {
      alert('PDF export functionality would be implemented here using a library like jsPDF or html2pdf.js');
}

console.log('📊 AI Fundamental Analysis Platform - Ready!');

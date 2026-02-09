// ========================================
// Efficiency Officer Agent
// Analyzes capital efficiency, ROIC, and investment quality
// ========================================

const BaseAgent = require('./baseAgent');
const financialDataAPI = require('../financialData');

class EfficiencyOfficer extends BaseAgent {
    constructor() {
        super('Efficiency Officer', 'gemini-1.5-flash-latest');
    }

    async analyze(ticker, companyData) {
        try {
            console.log(`[Efficiency Officer] Analyzing capital efficiency for ${ticker}...`);

            // Gather efficiency metrics
            const [roicData, economicSpread, netDebtEV, evMultiples] = await Promise.all([
                financialDataAPI.getROIC(ticker),
                financialDataAPI.getEconomicSpread(ticker),
                financialDataAPI.getNetDebtToEVTrend(ticker, 5),
                financialDataAPI.getEVMultiplesTrend(ticker, 5)
            ]);

            const prompt = `You are an Efficiency & Quality Control Analyst at a top-tier investment firm.
Your task is to evaluate capital efficiency and write NARRATIVE ANALYSIS for each quality metric.

**Company:** ${ticker}
**Data:**
- ROIC: ${roicData?.roic || 'N/A'}%
- Economic Spread: ${economicSpread?.economicSpread || 'N/A'}%
- Net Debt/EV: ${netDebtEV?.current?.ratio || 'N/A'}%

**CRITICAL: NARRATIVE-DRIVEN CHECKLIST**
For EACH checklist item, you must provide:
1. The boolean status (pass/fail)
2. A 2-3 sentence narrative explaining:
   - What the data shows
   - Why it matters for capital efficiency
   - What it reveals about management quality

**MANDATORY ANALYSIS:**
Write a dedicated 4-5 sentence "Capital Efficiency Narrative" that synthesizes:
- Overall ROIC quality and trend
- Economic spread (ROIC minus cost of capital)
- Whether the company creates or destroys shareholder value
- Management's capital allocation track record

**Checklist Criteria:**
1. Revenue Growth > 12% (or >6% stable)
2. ROIC > 15%
3. FCF Growth > 15%
4. EPS Growth > 15% (faster than revenue)
5. Share Dilution < 2%
6. Net Debt / FCF < 5x

Return ONLY valid JSON in this exact format:
{
  "checklist": [
      { 
        "item": "Rev Growth > 12%", 
        "status": true/false,
        "narrative": "<2-3 sentences: What does the data show? Why does this matter? What does it reveal about the business?>"
      },
      { 
        "item": "ROIC > 15%", 
        "status": true/false,
        "narrative": "<2-3 sentences explaining ROIC quality and capital efficiency>"
      },
      { 
        "item": "FCF Growth > 15%", 
        "status": true/false,
        "narrative": "<2-3 sentences on free cash flow generation quality>"
      },
      { 
        "item": "EPS Growth > 15%", 
        "status": true/false,
        "narrative": "<2-3 sentences analyzing earnings growth vs revenue growth>"
      },
      { 
        "item": "Share Dilution < 2%", 
        "status": true/false,
        "narrative": "<2-3 sentences on shareholder dilution impact>"
      },
      { 
        "item": "Net Debt/FCF < 5x", 
        "status": true/false,
        "narrative": "<2-3 sentences on leverage and financial health>"
      }
  ],
  "capitalEfficiencyNarrative": "<4-5 sentence paragraph synthesizing ROIC, economic spread, and value creation. Explain whether management is a good capital allocator.>",
  "overallVerdict": "Excellent|Good|Moderate|Poor",
  "investorInsight": "<2-3 sentences: What is the efficiency verdict and what should investors watch?>"
}`;

            const result = await this.generate(prompt);

            // Ensure investorInsight exists
            if (!result.investorInsight && result.insight) {
                result.investorInsight = result.insight;
            }

            // Ensure capitalEfficiencyNarrative exists
            if (!result.capitalEfficiencyNarrative) {
                result.capitalEfficiencyNarrative = this.generateDefaultEfficiencyNarrative(roicData, economicSpread);
            }

            return result;

        } catch (error) {
            console.error(`[Efficiency Officer] Error:`, error.message);
            return {
                checklist: [],
                capitalEfficiencyNarrative: "Capital efficiency analysis unavailable due to insufficient data.",
                overallVerdict: "Insufficient Data",
                investorInsight: "Efficiency analysis unavailable due to insufficient data."
            };
        }
    }

    buildScorecard(roicData, economicSpread, netDebtEV, companyData) {
        const roic = parseFloat(roicData?.roic || 0);
        const spread = parseFloat(economicSpread?.economicSpread || 0);
        const netDebtRatio = parseFloat(netDebtEV?.current?.ratio || 100);

        return {
            positiveROIC: roic > 10 ? "✔️" : "❌",
            valueCreation: spread > 0 ? "✔️" : "❌",
            healthyLeverage: netDebtRatio < 30 ? "✔️" : "❌",
            improvingEfficiency: netDebtEV?.improving ? "✔️" : "❌"
        };
    }

    formatScorecard(scorecard) {
        return `- Positive ROIC (>10%): ${scorecard.positiveROIC}
- Economic Value Creation: ${scorecard.valueCreation}
- Healthy Leverage (<30%): ${scorecard.healthyLeverage}
- Improving Efficiency Trend: ${scorecard.improvingEfficiency}`;
    }

    generateDefaultEfficiencyNarrative(roicData, economicSpread) {
        const roic = parseFloat(roicData?.roic || 0);
        const spread = parseFloat(economicSpread?.economicSpread || 0);

        if (spread > 10) {
            return `The company demonstrates exceptional capital efficiency with ROIC of ${roic}% generating an economic spread of ${spread}%. This substantial value creation above the cost of capital indicates a durable competitive moat and superior management execution.`;
        } else if (spread > 0) {
            return `The company achieves positive economic value creation with ROIC of ${roic}% exceeding its cost of capital by ${spread}%. While this indicates acceptable capital allocation, the modest spread suggests limited pricing power or competitive advantages.`;
        } else {
            return `The company is destroying shareholder value with ROIC of ${roic}% falling short of its cost of capital. This negative economic spread of ${spread}% is a critical red flag indicating either structural competitive disadvantages or poor capital allocation decisions by management.`;
        }
    }
}

module.exports = new EfficiencyOfficer();

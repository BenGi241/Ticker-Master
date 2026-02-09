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

            const prompt = `You are an Efficiency & Quality Control Analyst.
Your task is to rigorously evaluate the company against a strict "Investment Checklist".

**Company:** ${ticker}
**Data:**
- ROIC: ${roicData?.roic || 'N/A'}%
- Economic Spread: ${economicSpread?.economicSpread || 'N/A'}%
- Net Debt/EV: ${netDebtEV?.current?.ratio || 'N/A'}%
- Growth: (Derive from context if available)

**Task:**
Complete the following Boolean Checklist. If data is missing for a specific item, make a conservative estimate or set to false.

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
      { "item": "Rev Growth > 12%", "status": true/false },
      { "item": "ROIC > 15%", "status": true/false },
      { "item": "FCF Growth > 15%", "status": true/false },
      { "item": "EPS Growth > 15%", "status": true/false },
      { "item": "Share Dilution < 2%", "status": true/false },
      { "item": "Net Debt/FCF < 5x", "status": true/false }
  ],
  "insight": "Investor Insight: [Pass/Fail summary on 'Quality Company' standards]"
}`;

            const result = await this.generateContent(prompt);

            // Ensure Hebrew insight exists
            if (!result.hebrewInsight && result.insight) {
                result.hebrewInsight = result.insight; // Use the generated insight
            }
            // Fallback if model didn't return insight key or hebrewInsight
            if (!result.hebrewInsight) {
                result.hebrewInsight = `תובנה למשקיע: ${this.generateDefaultInsight(roicData, economicSpread)}`;
            }

            return result;

        } catch (error) {
            console.error(`[Efficiency Officer] Error:`, error.message);
            return {
                checklist: [],
                insight: "Efficiency analysis unavailable due to insufficient data.",
                hebrewInsight: "תובנה למשקיע: נתונים חסרים לניתוח יעילות הון"
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

    generateDefaultInsight(roicData, economicSpread) {
        const roic = parseFloat(roicData?.roic || 0);
        const spread = parseFloat(economicSpread?.economicSpread || 0);

        if (spread > 10) {
            return "החברה יוצרת ערך כלכלי משמעותי - אינדיקציה חזקה לחפיר תחרותי בר קיימא";
        } else if (spread > 0) {
            return "החברה מצליחה להכות את עלות ההון, אך המרווח הכלכלי מתון - יש לעקוב אחר מגמות";
        } else {
            return "החברה משמידה ערך כלכלי - סימן אזהרה משמעותי למשקיעים";
        }
    }
}

module.exports = new EfficiencyOfficer();

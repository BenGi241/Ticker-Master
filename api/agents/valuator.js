// ========================================
// Valuator Agent
// Performs DCF analysis, P/EGY calculations, and price target synthesis
// ========================================

const BaseAgent = require('./baseAgent');
const financialDataAPI = require('../financialData');

class Valuator extends BaseAgent {
    constructor() {
        super('Valuator', 'gemini-1.5-pro-latest'); // Use pro model for complex valuation
    }

    async analyze(ticker, companyData, efficiencyData, revenueData) {
        try {
            console.log(`[Valuator] Performing valuation analysis for ${ticker}...`);

            // Gather valuation metrics
            const [pegyData, financials, quote] = await Promise.all([
                financialDataAPI.getPEGY(ticker),
                Promise.resolve(companyData.financials || {}),
                financialDataAPI.getQuote(ticker).catch(() => null)
            ]);

            const currentPrice = quote?.price || parseFloat(companyData.overview?.['50DayMovingAverage']) || null;
            const analystTarget = parseFloat(companyData.overview?.analystTargetPrice) || null;

            const prompt = `You are a Valuation Specialist at a leading investment firm. Your task is to determine the intrinsic value of ${ticker}.

**Current Market Data:**
- **Current Price:** $${currentPrice || 'N/A'}
- **Analyst Consensus Target:** $${analystTarget || 'N/A'}
- **Market Cap:** $${(parseFloat(companyData.overview?.MarketCapitalization) / 1e9).toFixed(2) || 'N/A'}B
- **PE Ratio:** ${companyData.overview?.PERatio || 'N/A'}

**P/EGY Analysis:**
- **P/EGY Ratio:** ${pegyData?.pegy?.toFixed(2) || 'N/A'} (${pegyData?.interpretation || 'N/A'})
- **Growth Rate:** ${pegyData?.growthRate?.toFixed(1) || 'N/A'}%
- **Dividend Yield:** ${pegyData?.dividendYield?.toFixed(2) || 'N/A'}%
- **Interpretation:** P/EGY < 1.5 is attractive, < 2 is fair, > 2 is expensive

**Efficiency Metrics (from Efficiency Officer):**
- **ROIC:** ${efficiencyData?.scorecard?.positiveROIC === '✔️' ? 'Strong' : 'Weak'}
- **Economic Spread:** ${efficiencyData?.scorecard?.valueCreation === '✔️' ? 'Positive' : 'Negative'}

**Revenue Growth (from Revenue Analyst):**
${revenueData?.analysis?.substring(0, 200) || 'N/A'}

**Task:**
Provide a **concise valuation assessment** (300-350 words) covering:

1. **DCF Scenarios** (Conceptual):
   - **Base Case:** Assume moderate growth continuation
   - **Bull Case:** Best-case scenario (strong execution + favorable market)
   - **Bear Case:** Conservative scenario (headwinds + competition)
   - Provide estimated intrinsic value range (e.g., $150-$220)

2. **P/EGY Interpretation:**
   - Is the current P/EGY ratio justified by growth quality?
   - How does it compare to sector peers?

3. **Valuation Gap:**
   - Current Price vs. Your Fair Value estimate
   - Upside/Downside % potential

4. **Analyst Consensus Check:**
   - Does Wall Street consensus align with your view?
   - Any major discrepancies to note?

**Critical Requirements:**
- If DCF data is incomplete, state: "DCF מוגבל בשל נתונים חסרים - נדרש אומדן אנליסטי"
- Use ONLY provided data - NO external assumptions
- End with: "**תובנה למשקיע:** [Hebrew actionable insight about valuation]"
- Be skeptical of overly optimistic growth projections

Return ONLY valid JSON in this exact format:
{
  "dcf": {
    "baseCase": 185,
    "bullCase": 220,
    "bearCase": 150,
    "methodology": "Brief explanation of assumptions"
  },
  "pegyAnalysis": "Your P/EGY interpretation...",
  "valuationGap": "+12.5%",
  "recommendation": "Undervalued | Fairly Valued | Overvalued",
  "targetPrice": 190,
  "hebrewInsight": "תובנה למשקיע: Your Hebrew insight..."
}`;

            const result = await this.generateContent(prompt);

            // Ensure Hebrew insight exists
            if (!result.hebrewInsight || !result.hebrewInsight.includes('תובנה למשקיע')) {
                result.hebrewInsight = `תובנה למשקיע: ${this.generateDefaultInsight(pegyData, currentPrice, analystTarget)}`;
            }

            // Calculate actual gap if possible
            if (currentPrice && result.targetPrice) {
                const gap = ((result.targetPrice - currentPrice) / currentPrice) * 100;
                result.valuationGap = `${gap > 0 ? '+' : ''}${gap.toFixed(1)}%`;
            }

            return result;

        } catch (error) {
            console.error(`[Valuator] Error:`, error.message);
            return {
                dcf: { baseCase: null, bullCase: null, bearCase: null, methodology: "Insufficient data" },
                pegyAnalysis: "P/EGY analysis unavailable",
                valuationGap: "N/A",
                recommendation: "Insufficient Data",
                targetPrice: null,
                hebrewInsight: "תובנה למשקיע: נתוני שווי חסרים - יש לבצע מחקר נוסף"
            };
        }
    }

    generateDefaultInsight(pegyData, currentPrice, analystTarget) {
        const pegy = pegyData?.pegy || null;

        if (!pegy) {
            return "נתוני הערכת שווי חלקיים - מומלץ להמתין לדוחות רבעוניים נוספים";
        }

        if (pegy < 1.5) {
            return `יחס P/EGY של ${pegy.toFixed(2)} מעיד על הזדמנות השקעה אטרקטיבית בשילוב צמיחה ודיבידנד`;
        } else if (pegy < 2) {
            return `שווי הוגן - יחס P/EGY של ${pegy.toFixed(2)} מצביע על תמחור סביר של הצמיחה המצופה`;
        } else {
            return `יחס P/EGY גבוה (${pegy.toFixed(2)}) - יש לבחון האם הצמיחה המשתמעת בתמחור ריאלית`;
        }
    }
}

module.exports = new Valuator();

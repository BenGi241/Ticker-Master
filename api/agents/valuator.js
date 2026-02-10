// ========================================
// Valuator Agent
// Performs DCF analysis, P/EGY calculations, and price target synthesis
// ========================================

const BaseAgent = require('./baseAgent');
const fmpClient = require('../utils/fmpClient');

class Valuator extends BaseAgent {
    constructor() {
        super('Valuator', 'gemini-1.5-pro-latest'); // Use pro model for complex valuation
    }

    async analyze(ticker, companyData, efficiencyData, revenueData) {
        try {
            console.log(`[Valuator] Performing valuation analysis for ${ticker}...`);

            // Gather valuation metrics
            const [dcfData, metrics, peers] = await Promise.all([
                fmpClient.getDCF(ticker),
                fmpClient.getKeyMetrics(ticker),
                fmpClient.getPeers(ticker)
            ]);

            const currentPrice = dcfData?.['Stock Price'] || parseFloat(companyData.overview?.price) || null;
            const analystTarget = parseFloat(companyData.overview?.analystTargetPrice) || null;

            // Calculate P/EGY (Price / Earnings Growth + Yield)
            // PEGY = PE / (Earnings Growth Rate + Dividend Yield)
            const pe = metrics?.peRatioTTM || parseFloat(companyData.overview?.peRatio) || 0;
            const dividendYield = metrics?.dividendYieldPercentageTTM || 0; // In percent, e.g. 1.5

            // Estimate growth rate from DCF or revenue growth
            // This is a simplification; in a real app we'd use analyst consensus growth
            const growthRate = 12.0; // Placeholder assumption or derived from revenueData

            const pegyDenominator = growthRate + dividendYield;
            const pegy = (pe && pegyDenominator > 0) ? (pe / pegyDenominator) : null;

            const pegyData = {
                pegy,
                growthRate,
                dividendYield,
                interpretation: pegy < 1 ? "Undervalued" : (pegy < 2 ? "Fair Value" : "Overvalued")
            };

            const prompt = `You are a Valuation Specialist at a leading investment firm. Your task is to determine the intrinsic value of ${ticker}.

**Current Market Data:**
- **Current Price:** $${currentPrice || 'N/A'}
- **Analyst Consensus Target:** $${analystTarget || 'N/A'}
- **Market Cap:** $${(parseFloat(companyData.overview?.MarketCapitalization) / 1e9).toFixed(2) || 'N/A'}B
- **PE Ratio:** ${pe || 'N/A'}
- **DCF Value (FMP):** $${dcfData?.dcf || 'N/A'}

**P/EGY Analysis:**
- **P/EGY Ratio:** ${pegy?.toFixed(2) || 'N/A'}
- **Growth Rate (Est):** ${growthRate}%
- **Dividend Yield:** ${dividendYield.toFixed(2)}%
- **Interpretation:** P/EGY < 1.5 is attractive, < 2 is fair, > 2 is expensive

**Efficiency Metrics:**
- **ROIC:** ${efficiencyData?.scorecard?.positiveROIC === '✔️' ? 'Strong' : 'Weak'}
- **Economic Spread:** ${efficiencyData?.scorecard?.valueCreation === '✔️' ? 'Positive' : 'Negative'}

**Revenue Growth:**
${revenueData?.analysis?.substring(0, 200) || 'N/A'}

**Task:**
Provide a **comprehensive narrative valuation assessment** (350-450 words) that avoids generic lists.

1. **DCF Rationale (The "Why"):**
   - Explain the narrative behind your **Base, Bull, and Bear** cases.
   - What specific operational improvements or market shifts drive the Bull case?
   - What structural risks create the Bear case floor?
   - Justify the estimated intrinsic value range.

2. **P/EGY Interpretation & Growth Quality:**
   - Is the current P/EGY ratio justified by the ROIC and Revenue Growth quality?
   - How does this multiple compare to the historical median and peer group?

3. **Valuation Gap & Margin of Safety:**
   - Clearly state the gap between Current Price and Fair Value.
   - Describe whether this gap provides a sufficient "Margin of Safety".

4. **Sentiment & Consensus Check:**
   - Narrative analysis of where you differ from Wall Street consensus.

**Critical Requirements:**
- Use dense, analytical paragraphs. NO bullet points.
- End with: "**תובנה למשקיע:** [Strategic Hebrew actionable insight about the entry price and valuation risk]"

Return ONLY valid JSON in this exact format:
{
  "dcf": {
    "baseCase": <number>,
    "bullCase": <number>,
    "bearCase": <number>,
    "narrative": "<3-4 sentence paragraph justifying the DCF range>",
    "methodology": "Brief explanation of WACC and Terminal Growth drivers"
  },
  "pegyAnalysis": {
    "data": {
        "ratio": ${pegy || 0},
        "growth": ${growthRate},
        "yield": ${dividendYield}
    },
    "narrative": "<3-4 sentence paragraph interpreting the P/EGY>"
  },
  "valuationGap": {
    "percent": "+12.5%",
    "narrative": "<2-3 sentences explaining the margin of safety>"
  },
  "recommendation": "Undervalued | Fairly Valued | Overvalued",
  "targetPrice": <number>,
  "hebrewInsight": "תובנה למשקיע: Your Hebrew insight..."
}`;

            const result = await this.generate(prompt);

            // Ensure Hebrew insight exists
            if (!result.hebrewInsight || !result.hebrewInsight.includes('תובנה למשקיע')) {
                result.hebrewInsight = `תובנה למשקיע: ${this.generateDefaultInsight(pegyData, currentPrice, analystTarget)}`;
            }

            // Calculate actual gap
            if (currentPrice && result.targetPrice) {
                const gap = ((result.targetPrice - currentPrice) / currentPrice) * 100;
                result.valuationGap = `${gap > 0 ? '+' : ''}${gap.toFixed(1)}%`;
            }

            return result;

        } catch (error) {
            console.error(`[Valuator] Error: `, error.message);
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
            return `יחס P / EGY של ${pegy.toFixed(2)} מעיד על הזדמנות השקעה אטרקטיבית בשילוב צמיחה ודיבידנד`;
        } else if (pegy < 2) {
            return `שווי הוגן - יחס P / EGY של ${pegy.toFixed(2)} מצביע על תמחור סביר של הצמיחה המצופה`;
        } else {
            return `יחס P / EGY גבוה(${pegy.toFixed(2)}) - יש לבחון האם הצמיחה המשתמעת בתמחור ריאלית`;
        }
    }
}

module.exports = new Valuator();

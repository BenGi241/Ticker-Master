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
Provide a **comprehensive narrative valuation assessment** (350-450 words) that avoids generic lists.

1. **DCF Rationale (The "Why"):**
   - Explain the narrative behind your **Base, Bull, and Bear** cases.
   - What specific operational improvements or market shifts drive the Bull case?
   - What structural risks create the Bear case floor?
   - Justify the estimated intrinsic value range (e.g., $150-$220) in the context of the company's moat.

2. **P/EGY Interpretation & Growth Quality:**
   - Is the current P/EGY ratio justified by the ROIC and Revenue Growth quality findings from Tier 1/2?
   - Explain the connection between capital efficiency and the valuation multiple.
   - How does this multiple compare to the historical median and peer group?

3. **Valuation Gap & Margin of Safety:**
   - Clearly state the gap between Current Price and Fair Value.
   - Describe whether this gap provides a sufficient "Margin of Safety" for institutional investors.

4. **Sentiment & Consensus Check:**
   - Narrative analysis of where you differ from Wall Street consensus.
   - Are you more skeptical of margins or more optimistic about growth than the Street?

**Critical Requirements:**
- Use dense, analytical paragraphs. NO bullet points.
- If DCF data is incomplete, explain specifically WHAT is missing and how it impacts the range.
- Use transition words to connect efficiency findings to valuation multiples.
- End with: "**תובנה למשקיע:** [Strategic Hebrew actionable insight about the entry price and valuation risk]"

Return ONLY valid JSON in this exact format:
{
  "dcf": {
    "baseCase": 185,
    "bullCase": 220,
    "bearCase": 150,
    "narrative": "<3-4 sentence paragraph justifying the DCF range and case assumptions>",
    "methodology": "Brief explanation of WACC and Terminal Growth drivers"
  },
  "pegyAnalysis": {
    "data": {
        "ratio": <number>,
        "growth": <number>,
        "yield": <number>
    },
    "narrative": "<3-4 sentence paragraph interpreting the P/EGY in context of growth quality>"
  },
  "valuationGap": {
    "percent": "+12.5%",
    "narrative": "<2-3 sentences explaining the margin of safety at current levels>"
  },
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

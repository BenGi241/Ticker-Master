const BaseAgent = require('./baseAgent');

class RevenueAnalystAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Revenue & Strategy Analyst.
Your task is to deconstruct a company's revenue streams and assess their quality.

# MANDATORY ANALYSIS FRAMEWORK:
1. **Quarterly Summary:** Key top-line metrics (Rev, Gross Profit, Operating Income) for the *latest distinct quarter*.
2. **Segment Deep Dive:**
   - Breakdown by Product/Division AND Geography.
   - **Quality of Growth:** Is it Volume (Demand) or Price (Inflation)?
   - **Trend Analysis:** Compare Current YoY vs Previous Quarter vs 5-Year CAGR. Use ⬆️/⬇️.
   - **Margins:** Which segment is the profit engine? Is it growing?
3. **Macro & Pricing Power:** Impact of FX, Inflation. Can they pass costs?

Tone: Analytical, skeptical. Focus on *sustainability* of the growth.

Respond ONLY with valid JSON.`;
    super('Revenue Analyst', systemPrompt);
  }

  analyze(ticker, companyOverview, financials, newsData) {
    const userPrompt = `Analyze revenue for ${ticker}.
Financials: ${JSON.stringify(financials, null, 2)}

**REQUIREMENTS:**
1.  **Sustainability:** Write 3 paragraphs analyzing if growth is sustainable. Distinguish between organic (Volume/Price) vs inorganic (M&A).
2.  **Tables:** Create a Quarterly Summary table with ⬆️/⬇️ arrows.
3.  **Pricing Power:** explicitly analyze if they can pass inflation costs to customers.

Provide JSON output matches the schema.`;
    return this.generate(userPrompt);
  }
}

module.exports = new RevenueAnalystAgent();

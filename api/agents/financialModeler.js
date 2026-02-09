const BaseAgent = require('./baseAgent');

class FinancialModelerAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Senior Financial Modeler at a top-tier investment bank. 
Your task is to build TTM (Trailing Twelve Months) tables and analyze financial quality.

# MANDATORY ANALYSIS FRAMEWORK:
1. **Timeframe:** Focus on TTM vs Previous Year (YoY) and Previous Quarter (QoQ).
2. **Quality Checks:** 
   - Compare Free Cash Flow (FCF) to Net Income. If FCF < Net Income consistently = RED FLAG (Earnings Quality).
   - Working Capital trends (Inventory efficiency).
   - Stock-Based Compensation (SBC) impact on "Real" margins.
3. **Structure:** Output data for the 3 key statements + ROIC analysis.

Tone: Extremely skeptical. Assume companies try to hide things. Use arrows (⬆️/⬇️) to denote trends.

Respond ONLY with valid JSON.`;
    super('Financial Modeler', systemPrompt);
  }

  async analyze(ticker, financialData) {
    const userPrompt = `Analyze financials for ${ticker}.
Data: ${JSON.stringify(financialData, null, 2)}

**REQUIREMENTS:**
1.  **3 Anomalies:** Identify the top 3 anomalies in the TTM data. Dedicate a paragraph to explaining each.
2.  **Quality Check:** detailed comparison of FCF vs Net Income.
3.  **Trend:** Use ⬆️/⬇️ arrows for all metrics.

Provide JSON output.`;
    return this.generate(userPrompt);
  }
}

module.exports = new FinancialModelerAgent();

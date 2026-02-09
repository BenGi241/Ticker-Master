const BaseAgent = require('./baseAgent');

class ManagementAnalystAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Management & Corporate Governance Analyst.
Your task is to judge the quality of the leadership and their capital allocation decisions.

# MANDATORY ANALYSIS FRAMEWORK:
1. **Skin in the Game:** Does the CEO hold shares? Recent Insider Buying vs Selling.
2. **Capital Allocation:** R&D vs M&A vs Buybacks vs Dividends. Did previous M&A destroy value?
3. **Governance:** Check for excessive dilution or "Empire Building".

Tone: Critical, skeptical.

Respond ONLY with valid JSON.`;
    super('Management Analyst', systemPrompt);
  }

  async analyze(ticker, insiderData, companyOverview) {
    const userPrompt = `Analyze management at ${ticker} (${companyOverview.name}).
Insider Data: ${JSON.stringify(insiderData, null, 2)}
Overview: ${companyOverview.description}

Provide analysis in JSON format with these specific keys:
{
  "skinInGame": {
      "ownership": "High/Low",
      "insiderTrends": "Net Buying/Selling",
      "details": "Specific trades or holdings."
  },
  "capitalAllocation": {
      "rating": "Good/Poor",
      "analysis": "Did they waste money on bad acquisitions or buybacks at highs?"
  },
  "insight": "Investor Insight: [Verdict on alignment with shareholders]"
}`;
    return await this.generate(userPrompt);
  }
}

module.exports = new ManagementAnalystAgent();

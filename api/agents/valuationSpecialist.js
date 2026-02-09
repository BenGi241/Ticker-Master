const BaseAgent = require('./baseAgent');

class ValuationSpecialistAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Valuation Specialist. 
Your task is to determine the intrinsic value of a company using multiple methodologies.

# MANDATORY ANALYSIS FRAMEWORK:
1. **DCF:** Create 3 Scenarios (Base, Bear, Bull). Explicitly state WACC and Terminal Growth.
2. **Multiples:** Compare P/E, PEG, and P/EGY (Price / Earnings+Growth+Yield).
3. **Consensus:** Analyze price targets gaps (Current vs Target).

Tone: Conservative, disciplined. Demand a wide "Margin of Safety".

Respond ONLY with valid JSON.`;
    super('Valuation Specialist', systemPrompt);
  }

  async analyze(ticker, financialData, marketData) {
    const userPrompt = `Analyze valuation for ${ticker}.
Market Price: ${marketData.price}
Financials: ${JSON.stringify(financialData, null, 2)}

Provide valuation in JSON format with these specific keys:
{
  "dcf": {
    "scenarios": {
        "base": {"value": 150, "upside": 10, "wacc": 9.5, "tg": 2.5},
        "bull": {"value": 200, "upside": 45, "wacc": 8.5, "tg": 3.0},
        "bear": {"value": 110, "upside": -20, "wacc": 11.0, "tg": 2.0}
    },
    "sensitivity": "Brief text relating WACC changes to value."
  },
  "multiples": {
    "pe": 25,
    "peg": 1.2,
    "pegy": 1.1,
    "sectorAveragePe": 20,
    "verdict": "Overvalued/Undervalued"
  },
  "consensus": {
      "averageTarget": 160,
      "gap": "+15%"
  },
  "insight": "Investor Insight: [Verdict on entry price and margin of safety]"
}`;
    return await this.generate(userPrompt);
  }
}

module.exports = new ValuationSpecialistAgent();

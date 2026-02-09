const BaseAgent = require('./baseAgent');

class ValuationSpecialistAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Valuation Specialist at a leading investment firm. 
Your task is to determine intrinsic value using multiple methodologies with NARRATIVE EXPLANATIONS.

# CRITICAL: EXPLAIN YOUR ASSUMPTIONS
Do NOT just output DCF values. For every assumption (WACC, Terminal Growth, Growth Rate), you must explain:
1. **Rationale:** Why did you choose this number?
2. **Sensitivity:** How does changing this assumption affect the valuation?
3. **Risk Assessment:** What could make this assumption wrong?

# MANDATORY ANALYSIS FRAMEWORK:
1. **DCF Analysis:** 
   - Create 3 Scenarios (Base, Bear, Bull)
   - Write 3-4 sentence paragraph for EACH scenario explaining:
     * Key assumptions (WACC, terminal growth, revenue CAGR)
     * Why these assumptions are reasonable
     * What would need to happen for this scenario to play out
   
2. **Assumption Justification:**
   - Write 2-3 sentences explaining your WACC calculation
   - Write 2-3 sentences defending your terminal growth rate
   - Explicit mention of margin of safety

3. **Multiples Analysis:**
   - Compare P/E, PEG, P/EGY ratios
   - Write 2-3 sentences explaining if the stock is cheap/expensive relative to peers
   - Justify premium/discount with moat or growth quality

4. **Consensus Check:**
   - Analyze analyst price target gaps
   - Write 2-3 sentences on whether Street is too bullish/bearish

# OUTPUT REQUIREMENTS:
- Each DCF scenario must have data + narrative paragraph
- Write dedicated "Margin of Safety" paragraph
- End with "Investor Insight" on valuation verdict

Tone: Conservative, disciplined. Demand a wide "Margin of Safety".

Respond ONLY with valid JSON.`;
    super('Valuation Specialist', systemPrompt);
  }

  async analyze(ticker, financialData, marketData) {
    const userPrompt = `Analyze valuation for ${ticker}.
Market Price: ${marketData.price}
Financials: ${JSON.stringify(financialData, null, 2)}

**CRITICAL: NARRATIVE-DRIVEN VALUATION**
For each DCF scenario and assumption, explain WHY you chose those numbers.

**ANALYSIS TASKS:**
1. **DCF Scenarios:**
   For EACH scenario (Base, Bull, Bear), write a 3-4 sentence narrative:
   - State the key assumptions (WACC, terminal growth, revenue CAGR)
   - Explain why these assumptions are reasonable given the business model
   - Describe what would need to happen for this scenario to materialize

2. **Assumption Deep Dive:**
   - Write 2-3 sentences justifying your WACC calculation
   - Write 2-3 sentences defending your terminal growth rate choice
   - Write 2-3 sentences on margin of safety at current price

3. **Multiples Analysis:**
   - Calculate P/E, PEG, P/EGY
   - Write 2-3 sentences: Is the stock cheap or expensive vs sector?
   - Explain if any premium/discount is justified by moat strength

4. **Consensus Comparison:**
   - Compare your target to Wall Street consensus
   - Write 2-3 sentences: Is the Street too optimistic or pessimistic? Why?

**OUTPUT SCHEMA (STRICT):**
{
  "dcf": {
    "scenarios": {
        "base": {
          "value": <number>, 
          "upside": "<%>", 
          "wacc": <percent>, 
          "terminalGrowth": <percent>,
          "narrative": "<3-4 sentence paragraph explaining this scenario's assumptions and likelihood>"
        },
        "bull": {
          "value": <number>, 
          "upside": "<%>", 
          "wacc": <percent>, 
          "terminalGrowth": <percent>,
          "narrative": "<3-4 sentence paragraph explaining best-case assumptions>"
        },
        "bear": {
          "value": <number>, 
          "upside": "<%>", 
          "wacc": <percent>, 
          "terminalGrowth": <percent>,
          "narrative": "<3-4 sentence paragraph explaining worst-case assumptions>"
        }
    },
    "assumptionJustification": {
      "waccNarrative": "<2-3 sentences on why this WACC is appropriate>",
      "terminalGrowthNarrative": "<2-3 sentences on terminal growth assumptions>",
      "marginOfSafety": "<2-3 sentences on safety margin at current price>"
    }
  },
  "multiples": {
    "data": {
      "pe": <number>,
      "peg": <number>,
      "pegy": <number>,
      "sectorAveragePe": <number>
    },
    "narrative": "<2-3 sentences: Is valuation rich or cheap vs peers? Is premium/discount justified?>",
    "verdict": "Overvalued|Fairly Valued|Undervalued"
  },
  "consensus": {
    "averageTarget": <number>,
    "gap": "<%>",
    "narrative": "<2-3 sentences comparing your view to Street consensus. Are analysts too bullish/bearish?>"
  },
  "investorInsight": "<2-3 sentences: What is the valuation verdict? Entry price recommendation? Risk/reward assessment?>"
}`;
    return await this.generate(userPrompt);
  }
}

module.exports = new ValuationSpecialistAgent();

const BaseAgent = require('./baseAgent');

class EditorQAagent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Senior Equity Analyst at a premier Wall Street firm.
Your task is to synthesize specialized analyst outputs into a high-density "Initiation of Coverage" report for the Investment Committee.

## CORE DIRECTIVES:
1. **Audience:** Institutional Investment Committee. No fluff. No "AI enthusiasm."
2. **NARRATIVE DENSITY:** You must write in dense, analytical paragraphs. 
3. **SO WHAT? RULE:** Never state a metric without its implication. 
   - *Bad:* "ROIC is 50%."
   - *Better:* "At 50%, the ROIC demonstrates exceptional capital efficiency, suggesting that the company's moat allows it to reinvest retained earnings at rates disproportionately higher than its cost of capital."
4. **NO BULLET POINTS:** You are FORBIDDEN from using bullet points for analysis or summaries. Bullet points are ONLY for specific data lists (like the Checklist items) or tabular data. Everything else must be cohesive prose.
5. **TRANSITIONS:** Use sharp connective tissue between sections (e.g., "The operational efficiency discussed above provides the necessary cushion for the valuation multiples we explore below...").

## REPORT STRUCTURE (JSON Output):
Generate a valid JSON object with the following keys. Every section must be a narrative deep-dive.

{
  "header": { "ticker": "...", "companyName": "...", "rating": "Buy/Hold/Sell", "targetPrice": 00.0, "currentPrice": 00.0, "upside": "+X%", "marketCap": "XB" },
  
  "executiveSummary": {
    "coreThesis": "A 5-7 sentence narrative synthesizing what they do, their moat, and why the market is currently mispricing the stock. Focus on the 'Operational Punchline'.",
    "trigger": "Immediate catalyst that will close the valuation gap (Earnings/Product/Macro).",
    "insight": "Investor Insight: [Sharp single-paragraph takeaway]"
  },
  
  "revenueQuality": {
    "narrative": "A dense narrative (2 paragraphs) deconstructing growth quality. Is it volume or price? Is the segment growth sustainable? Use the Revenue Analyst's insights to prove pricing power.",
    "segmentTable": "ASCII Table of segments with growth and margins.",
    "insight": "Investor Insight: [Takeaway on revenue sustainability]"
  },

  "financialHealth": {
    "narrative": "A dense prose analysis of the balance sheet and cash flow quality. Discuss FCF vs Net Income and ROIC. Explain WHY the numbers look the way they do based on the Modeler's red flags.",
    "insight": "Investor Insight: [Verdict on earnings quality]"
  },

  "checklist": {
    "criteria": [ { "item": "...", "status": true, "narrative": "Brief context" } ],
    "insight": "Investor Insight: [Pass/Fail summary]"
  },

  "competitiveMoat": {
    "narrative": "A 2-paragraph argument for the durability of the moat. Link network effects or switching costs to the stable NOPAT margins. Use the Moat Analyst's proof points.",
    "insight": "Investor Insight: [Conclusion on long-term terminal value]"
  },

  "valuation": {
    "narrative": "A 2-paragraph synthesis of the DCF and P/EGY analysis. Explain the 'Margin of Safety'. Why is this valuation justified or unjustified?",
    "scenarios": { "base": 0, "bull": 0, "bear": 0 },
    "insight": "Investor Insight: [Actionable timing guidance]"
  },

  "technicalSignals": {
    "narrative": "Prose description of price action and sentiment alignment. Does the chart support the fundamental thesis?",
    "insight": "Investor Insight: [Timing verdict]"
  },

  "conclusion": {
    "punchline": "A single, powerful analytical paragraph summarizing the risk/reward ratio.",
    "instruction": "Action Required: [Specific instruction, e.g., 'Accumulate aggressively below $X.']"
  }
}

Respond ONLY with valid JSON.`;
    super('Editor QA', systemPrompt);
  }

  async generateThesis(ticker, agentOutputs) {
    const userPrompt = `Ticker: ${ticker}
RAW NARRATIVE OUTPUTS FROM SPECIALISTS:
${JSON.stringify(agentOutputs, null, 2)}

TASK:
Develop the "Core Investment Thesis" for this company. 
1. **Identify the Operational Punchline:** What is the one thing the market is missing?
2. **Define the Tone:** Bullish/Skeptical/Neutral based on quality.
3. **Establish the "Hook":** A 1-paragraph summary that will guide all subsequent report sections.

RETURN ONLY THE THESIS PARAGRAPH.`;
    return this.generate(userPrompt);
  }

  async generateSection(ticker, sectionName, thesis, agentOutputs) {
    const userPrompt = `Ticker: ${ticker}
GLOBAL INVESTMENT THESIS: ${thesis}

RAW NARRATIVE OUTPUTS:
${JSON.stringify(agentOutputs, null, 2)}

TASK:
Write the **${sectionName}** chapter of this Initiation of Coverage report.

CRITICAL INSTRUCTIONS:
1. **Density:** Write 2-3 substantial paragraphs (400-600 words for this section).
2. **Alignment:** Ensure the analysis supports the Global Thesis.
3. **Depth:** Use the specialist data to explain the "Why" behind the "What".
4. **Style:** NO bullet points for analysis. Use sophisticated transitions.
5. **So What?:** Every fact must have an investor consequence.

**CHAPTER TEMPLATES:**
- If "Executive Summary": Focus on the business model and thesis.
- If "Revenue Quality": Deconstruct segment drivers and pricing power.
- If "Financial Health": Probe ROIC, FCF quality, and balance sheet risk.
- If "Competitive Moat": Prove durability with structural advantages.
- If "Valuation": Synthesize DCF/PEGY into a margin of safety argument.

GENERATE ONLY THE NARRATIVE CONTENT FOR THIS SECTION (as text or partial JSON as requested).`;
    return this.generate(userPrompt);
  }

  async finalizeReport(ticker, agentOutputs) {
    // This method is now legacy or can be a convenience wrapper for one-shot if needed,
    // but the Orchestrator will call generateThesis/generateSection instead.
    return this.generateThesis(ticker, agentOutputs);
  }
}

module.exports = new EditorQAagent();

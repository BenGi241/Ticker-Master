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
    // Section-specific templates with detailed guidance
    const sectionTemplates = {
      'Executive Summary & Business Strategy': {
        wordTarget: '500-700',
        focus: 'Business model, competitive positioning, and core investment thesis',
        structure: `
1. Opening paragraph: What does this company do? (Plain English, no jargon)
2. Second paragraph: How do they make money? What's their moat?
3. Third paragraph: Why is the market mispricing this? What's the catalyst?`,
        antiPatterns: [
          'Do NOT use generic phrases like "leading provider" without proof',
          'Do NOT list products without explaining WHY they matter to revenue',
          'Do NOT state the thesis without connecting it to operational reality'
        ],
        dataFocus: ['moatAnalyst', 'revenueAnalyst', 'valuator']
      },
      'Revenue Quality & Segment Deconstruction': {
        wordTarget: '400-600',
        focus: 'Segment-level revenue drivers, pricing power, and growth sustainability',
        structure: `
1. Opening: Deconstruct total revenue into segments. Which segments are growing and why?
2. Middle: Is growth driven by volume or price? Prove pricing power with data.
3. Closing: Is this growth sustainable? What are the macro headwinds/tailwinds?`,
        antiPatterns: [
          'Do NOT just list segment percentages without explaining IMPLICATIONS',
          'Do NOT ignore the difference between organic and inorganic growth',
          'Do NOT skip the "So What?" - connect growth quality to valuation'
        ],
        dataFocus: ['revenueAnalyst', 'financialModeler']
      },
      'Financial Health & Capital Efficiency': {
        wordTarget: '500-700',
        focus: 'ROIC, FCF quality, balance sheet strength, and capital allocation',
        structure: `
1. Opening: Start with ROIC. What does it tell us about capital efficiency?
2. Middle: Analyze FCF vs Net Income. Are earnings real cash or accounting fiction?
3. Closing: Balance sheet health. Debt levels, interest coverage, financial flexibility.`,
        antiPatterns: [
          'Do NOT state "ROIC is X%" without explaining WHY and what it means for reinvestment',
          'Do NOT ignore red flags from the Financial Modeler',
          'Do NOT skip the connection between ROIC and moat durability'
        ],
        dataFocus: ['financialModeler', 'efficiencyOfficer']
      },
      'Competitive Moat & Long-Term Durability': {
        wordTarget: '400-600',
        focus: 'Structural advantages, moat type, and long-term defensibility',
        structure: `
1. Opening: What type of moat does this company have? (Network effects, switching costs, scale, intangibles)
2. Middle: Prove it with data. How does the moat show up in margins, customer retention, or pricing power?
3. Closing: Is the moat widening or narrowing? What threatens it?`,
        antiPatterns: [
          'Do NOT claim a moat exists without quantitative proof',
          'Do NOT confuse temporary competitive advantages with durable moats',
          'Do NOT ignore threats to the moat (disruption, regulation, competition)'
        ],
        dataFocus: ['moatAnalyst', 'efficiencyOfficer']
      },
      'Valuation, DCF Scenarios & Margin of Safety': {
        wordTarget: '500-700',
        focus: 'DCF analysis, scenario planning, and margin of safety assessment',
        structure: `
1. Opening: Present the DCF base case. What are the key assumptions (growth, margins, WACC)?
2. Middle: Scenario analysis. What happens in bull/bear cases? What's the range of outcomes?
3. Closing: Margin of safety. At current price, what's the risk/reward? Is there a margin for error?`,
        antiPatterns: [
          'Do NOT present a target price without explaining the assumptions behind it',
          'Do NOT ignore the Valuator\'s scenario analysis',
          'Do NOT skip the "margin of safety" concept - this is critical for risk management'
        ],
        dataFocus: ['valuator', 'valuationSpecialist']
      },
      'Technical Analysis & Market Sentiment': {
        wordTarget: '300-500',
        focus: 'Price action, technical indicators, and sentiment alignment with fundamentals',
        structure: `
1. Opening: What is the chart telling us? Trend, support/resistance, momentum.
2. Middle: Do technical signals align with the fundamental thesis?
3. Closing: Timing verdict. Is this a good entry point or should we wait?`,
        antiPatterns: [
          'Do NOT just list indicator values without interpretation',
          'Do NOT ignore divergences between technicals and fundamentals',
          'Do NOT make timing calls without acknowledging uncertainty'
        ],
        dataFocus: ['technicalAnalyst']
      },
      'Final Conclusion & Actionable Recommendation': {
        wordTarget: '300-400',
        focus: 'Risk/reward synthesis and specific action instruction',
        structure: `
1. Single powerful paragraph: Synthesize the entire analysis into a risk/reward statement.
2. Action instruction: Be specific. "Accumulate below $X" or "Wait for Y catalyst" or "Avoid until Z improves".`,
        antiPatterns: [
          'Do NOT be vague. "Buy" is not enough - give specific guidance',
          'Do NOT ignore the risks. Acknowledge what could go wrong',
          'Do NOT write multiple paragraphs - this should be ONE punchy conclusion'
        ],
        dataFocus: ['valuator', 'all']
      }
    };

    const template = sectionTemplates[sectionName] || {
      wordTarget: '400-600',
      focus: 'Comprehensive analysis',
      structure: 'Write 2-3 analytical paragraphs',
      antiPatterns: ['Avoid bullet points', 'Explain implications'],
      dataFocus: ['all']
    };

    // Filter relevant agent outputs to reduce token usage
    const relevantOutputs = this._filterRelevantContext(agentOutputs, template.dataFocus);

    const userPrompt = `Ticker: ${ticker}
GLOBAL INVESTMENT THESIS: ${thesis}

RELEVANT SPECIALIST OUTPUTS:
${JSON.stringify(relevantOutputs, null, 2)}

═══════════════════════════════════════════════════════════════
TASK: Write the **${sectionName}** chapter
═══════════════════════════════════════════════════════════════

📊 SECTION FOCUS: ${template.focus}

📏 TARGET LENGTH: ${template.wordTarget} words (2-3 substantial paragraphs)

🏗️ RECOMMENDED STRUCTURE:
${template.structure}

⚠️ ANTI-PATTERNS TO AVOID:
${template.antiPatterns.map((ap, i) => `${i + 1}. ${ap}`).join('\n')}

═══════════════════════════════════════════════════════════════
CRITICAL RULES (NON-NEGOTIABLE):
═══════════════════════════════════════════════════════════════

1. **NO BULLET POINTS** for analysis. Only use bullets for data lists (if absolutely necessary).
2. **SO WHAT? RULE**: Every metric MUST be followed by its investor implication.
   - ❌ BAD: "ROIC is 50%"
   - ✅ GOOD: "At 50%, the ROIC demonstrates exceptional capital efficiency, suggesting the company's moat allows it to reinvest retained earnings at rates disproportionately higher than its cost of capital."

3. **DENSE PROSE**: Write like a Wall Street analyst, not a blog post. Sophisticated, analytical, skeptical.

4. **TRANSITIONS**: Connect ideas smoothly. Use phrases like:
   - "This operational efficiency provides the necessary cushion for..."
   - "However, this strength is offset by..."
   - "More importantly, the data reveals..."

5. **ALIGNMENT**: Every sentence should support or challenge the Global Thesis.

6. **DEPTH OVER BREADTH**: Better to deeply analyze 2 key points than superficially mention 10.

═══════════════════════════════════════════════════════════════

GENERATE ONLY THE NARRATIVE CONTENT FOR THIS SECTION (plain text, dense paragraphs).
Do NOT include section headers or titles - just the analytical prose.`;

    return this.generate(userPrompt);
  }

  _filterRelevantContext(agentOutputs, dataFocus) {
    if (dataFocus.includes('all')) {
      return agentOutputs;
    }

    const filtered = {};
    for (const agent of dataFocus) {
      if (agentOutputs[agent]) {
        // Shallow copy to avoid mutating the original
        const data = { ...agentOutputs[agent] };

        // Optimization: Remove extremely large raw data chunks if not the main focus
        // e.g., if we are the Moat Analyst, we don't need the full Financial Modeler's transaction history
        if (agent === 'financialModeler' && !dataFocus.includes('financialModeler')) {
          delete data.rawData;
          delete data.fullTranscripts;
        }

        filtered[agent] = data;
      }
    }
    return filtered;
  }

  async finalizeReport(ticker, agentOutputs) {
    // This method is now legacy or can be a convenience wrapper for one-shot if needed,
    // but the Orchestrator will call generateThesis/generateSection instead.
    return this.generateThesis(ticker, agentOutputs);
  }
}

module.exports = new EditorQAagent();

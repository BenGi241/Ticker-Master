const BaseAgent = require('./baseAgent');

class RevenueAnalystAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Revenue & Strategy Analyst at a leading investment firm.
Your task is to deconstruct revenue streams and write narrative analysis on growth quality and sustainability.

# CRITICAL: NARRATIVE-FIRST ANALYSIS
Do NOT just calculate growth rates. For every revenue segment and metric, you must explain:
1. **Growth Driver:** Is it Volume (unit sales), Price (pricing power), or M&A (inorganic)?
2. **Sustainability:** Is this growth repeatable or one-time? What are the structural tailwinds/headwinds?
3. **Margin Implication:** Does this revenue stream improve or dilute overall profitability?

# MANDATORY ANALYSIS FRAMEWORK:
1. **Quarterly Summary:** Key top-line metrics (Rev, Gross Profit, Operating Income) for the *latest distinct quarter*.
2. **Segment Deep Dive:**
   - Breakdown by Product/Division AND Geography.
   - **Quality of Growth:** Write detailed paragraphs analyzing if it's Volume (Demand) or Price (Inflation).
   - **Trend Analysis:** Compare Current YoY vs Previous Quarter vs 5-Year CAGR. Use ⬆️/⬇️ in data, but explain trends in narrative.
   - **Margins:** Which segment is the profit engine? Is it growing? Write analysis, not just numbers.
3. **Macro & Pricing Power:** Impact of FX, Inflation. Can they pass costs to customers? Provide evidence.

# OUTPUT REQUIREMENTS:
- For each segment, provide data object + 3-5 sentence narrative following "Rule of 3"
- Write a dedicated "Growth Quality" paragraph (4-5 sentences) analyzing sustainability
- Write a "Pricing Power" paragraph with concrete evidence
- End with "Investor Insight" synthesizing the revenue outlook

Tone: Analytical, skeptical. Focus on *sustainability* of the growth, not just the headline number.

Respond ONLY with valid JSON.`;
    super('Revenue Analyst', systemPrompt);
  }

  async analyze(ticker, companyData) {
    // Handle both FMP (profile) and legacy (overview) structures
    const overview = companyData.profile || companyData.overview;
    const financials = companyData.ttmFinancials || companyData.financials;
    const segments = companyData.segments;
    const quarterlyData = companyData.quarterlyData;

    // Build enhanced segments context from FMP v4 data
    let segmentsContext = "";
    if (segments && (segments.product?.length > 0 || segments.geographic?.length > 0)) {
      segmentsContext = `
PROVEN REVENUE SEGMENTATION (FMP Institutional Data):
Product Segments: ${JSON.stringify(segments.product?.slice(0, 5), null, 2)}
Geographic Segments: ${JSON.stringify(segments.geographic?.slice(0, 5), null, 2)}
`;
    } else {
      segmentsContext = `
NOTE: Detailed segment data unavailable. Perform aggregate revenue analysis.
`;
    }

    // Build quarterly trend context
    let quarterlyContext = "";
    if (quarterlyData && quarterlyData.income) {
      quarterlyContext = `
QUARTERLY TRENDS (Last 8 Quarters):
${JSON.stringify(quarterlyData.income.slice(0, 8).map(q => ({
        date: q.date,
        revenue: q.revenue,
        grossProfit: q.grossProfit,
        operatingIncome: q.operatingIncome
      })), null, 2)}
`;
    }

    const userPrompt = `Ticker: ${ticker}
Company: ${overview?.name || overview?.companyName || 'Unknown'}
${segmentsContext}
${quarterlyContext}
TTM Financial Summary:
${JSON.stringify(financials, null, 2)}

**CRITICAL: NARRATIVE-DRIVEN ANALYSIS**
Apply the "Rule of 3" to every segment:
- Context: What is the growth rate?
- Cause: What's driving it (Volume vs Price vs Mix)?
- Consequence: Is this sustainable or temporary?

**ANALYSIS TASKS:**
1. **Segment Analysis:**
   For each major revenue segment, write:
   - 3-5 sentence narrative explaining the growth driver
   - Whether it's high-quality (organic, volume-driven) or low-quality (price inflation, one-time)
   - Margin implications

2. **Growth Sustainability:**
   Write a dedicated 4-5 sentence paragraph analyzing:
   - Is current growth sustainable based on market structure?
   - Organic (Volume/Price) vs Inorganic (M&A)?
   - Compare current growth to 3-year average

3. **Pricing Power Analysis:**
   Write 3-4 sentences with CONCRETE EVIDENCE:
   - Can they pass inflation costs to customers?
   - Evidence from gross margin trends
   - Competitive positioning that enables/prevents pricing power

**OUTPUT SCHEMA (STRICT):**
{
  "segments": [
    {
      "name": "<Segment name>",
      "data": {
        "revenue": "<amount>",
        "growth": "<YoY %>",
        "weight": "<% of total>",
        "margin": "<gross margin %>"
      },
      "narrative": "<3-5 sentence paragraph: What drives this segment's growth? Volume or price? Quality assessment. Margin trajectory.>",
      "growthQuality": "High|Moderate|Low",
      "sustainability": "Strong|Moderate|Weak"
    }
  ],
  "overallGrowthAnalysis": {
    "data": {
      "totalRevenue": "<amount>",
      "yoyGrowth": "<%>",
      "qoqGrowth": "<%>",
      "cagr3yr": "<%>"
    },
    "narrative": "<4-5 sentence paragraph analyzing growth sustainability. Address: Is it organic? Structural tailwinds? One-time factors?>",
    "verdict": "Sustainable|Mixed|Concerning"
  },
  "pricingPower": {
    "assessment": "Strong|Moderate|Weak",
    "narrative": "<3-4 sentence paragraph with EVIDENCE from gross margins, competitive positioning, and ability to pass through cost inflation>",
    "evidence": ["<Specific data point 1>", "<Specific data point 2>"]
  },
  "macroImpact": {
    "fx": "<Impact description>",
    "inflation": "<Impact description>",
    "narrative": "<2-3 sentences on headwinds/tailwinds>"
  },
  "investorInsight": "<2-3 sentence synthesis: What is the quality of revenue growth and what should investors watch?>"
}

Use ⬆️/⬇️ in 'data' fields for trends, but write full trend explanations in 'narrative' fields.`;
    return this.generate(userPrompt);
  }
}

module.exports = new RevenueAnalystAgent();

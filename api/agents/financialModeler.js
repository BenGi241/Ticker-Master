const BaseAgent = require('./baseAgent');

class FinancialModelerAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Senior Financial Modeler at a top-tier investment bank. 
Your task is to analyze financial quality and write narrative analysis, NOT just calculate numbers.

# CRITICAL: THE "RULE OF 3" FOR EVERY FINDING
For every major metric or anomaly you identify, you MUST write analysis following this structure:
1. **Context:** What happened? (The fact/data point)
2. **Cause:** Why did it happen? (The underlying driver)
3. **Consequence:** What does it mean for investors? (The implication/risk)

# MANDATORY ANALYSIS FRAMEWORK:
1. **Timeframe:** Focus on TTM vs Previous Year (YoY) and Previous Quarter (QoQ).
2. **Quality Checks:** 
   - Compare Free Cash Flow (FCF) to Net Income. If FCF < Net Income consistently = RED FLAG (Earnings Quality).
   - Working Capital trends (Inventory efficiency).
   - Stock-Based Compensation (SBC) impact on "Real" margins.
3. **Narrative Depth:** Write 3-5 sentence paragraphs explaining the implications of your findings. No bullet points for analysis.

# OUTPUT REQUIREMENTS:
- For each finding, provide BOTH the data AND a narrative explanation
- Use arrows (⬆️/⬇️) in data fields, but write out trend explanations in narratives
- End with an "Investor Insight" that synthesizes the financial quality verdict

Tone: Extremely skeptical. Assume companies try to hide things. Write like you're presenting to an Investment Committee.

Respond ONLY with valid JSON.`;
    super('Financial Modeler', systemPrompt);
  }

  async analyze(ticker, financialData) {
    const userPrompt = `Analyze financials for ${ticker}.
Data: ${JSON.stringify(financialData, null, 2)}

**CRITICAL REQUIREMENTS:**
For EACH major finding, apply the "Rule of 3":
- Context (what happened)
- Cause (why it happened) 
- Consequence (what it means for investors)

**ANALYSIS TASKS:**
1. **Financial Quality Assessment:** 
   - Compare Free Cash Flow to Net Income
   - If FCF < Net Income, explain the gap (SBC, working capital, deferred revenue, etc.)
   - Write 3-5 sentences analyzing earnings quality implications

2. **Top 3 Anomalies:**
   - Identify unusual patterns in the data
   - For each anomaly, write a dedicated paragraph (4-5 sentences) explaining:
     * What the data shows
     * Why this pattern exists
     * Whether it's a red flag or normal business cycle

3. **Working Capital Analysis:**
   - Analyze inventory, receivables, payables trends
   - Explain efficiency or inefficiency in capital deployment

**OUTPUT SCHEMA (STRICT):**
{
  "financialQuality": {
    "data": {
      "fcf": <number>,
      "netIncome": <number>,
      "gap": <number>,
      "gapPercent": "<percentage>"
    },
    "narrative": "<3-5 sentence paragraph analyzing the FCF/NI relationship and what it reveals about earnings quality>",
    "verdict": "Strong|Moderate|Weak",
    "riskLevel": "Low|Moderate|High"
  },
  "anomalies": [
    {
      "title": "<Concise title>",
      "data": { <relevant metrics> },
      "narrative": "<4-5 sentence paragraph following Rule of 3: Context → Cause → Consequence>",
      "severity": "Critical|Moderate|Minor"
    }
  ],
  "workingCapital": {
    "data": { <inventory, receivables, payables metrics> },
    "narrative": "<3-4 sentences on capital efficiency>",
    "trend": "Improving|Stable|Deteriorating"
  },
  "investorInsight": "<2-3 sentence synthesis: What is the overall financial quality verdict and what should investors watch?>"
}

Use ⬆️/⬇️ arrows in the 'data' objects, but write full explanations in 'narrative' fields.`;
    return this.generate(userPrompt);
  }
}

module.exports = new FinancialModelerAgent();

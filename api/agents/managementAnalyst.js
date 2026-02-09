const BaseAgent = require('./baseAgent');

class ManagementAnalystAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Management & Corporate Governance Analyst at a top-tier investment firm.
Your task is to judge leadership quality and capital allocation with NARRATIVE ANALYSIS.

# CRITICAL: WRITE PARAGRAPHS, NOT LISTS
Do NOT list insider transactions or allocation decisions. Write coherent narratives that:
1. **Assess Alignment:** Does management have skin in the game? What does their behavior reveal?
2. **Evaluate Track Record:** Have they created or destroyed shareholder value through capital allocation?
3. **Identify Red Flags:** Empire building, excessive dilution, poor M&A decisions?

# MANDATORY ANALYSIS FRAMEWORK:
1. **Skin in the Game:** 
   - Write 3-4 sentence paragraph analyzing:
     * CEO/Executive share ownership levels
     * Recent insider buying vs selling patterns
     * What this reveals about confidence in the business

2. **Capital Allocation:**
   - Write 3-4 sentence paragraph evaluating:
     * Historical use of cash (R&D, M&A, buybacks, dividends)
     * Quality of past M&A (did it create value?)
     * Share buyback timing (buying high or low?)

3. **Governance Red Flags:**
   - Write 2-3 sentences on any concerns:
     * Excessive dilution through stock compensation
     * Empire building tendencies
     * Board independence issues

# OUTPUT REQUIREMENTS:
- Main analysis sections must be paragraphs, not bullet points
- Provide specific examples and dates when available
- End with "Investor Insight" on management quality

Tone: Critical, skeptical. Focus on shareholder alignment.

Respond ONLY with valid JSON.`;
    super('Management Analyst', systemPrompt);
  }

  async analyze(ticker, companyData, newsData) {
    const { overview, insiderData, transcript } = companyData;

    let sourceMaterial = "";
    if (transcript) {
      sourceMaterial = `
LATEST EARNINGS CALL TRANSCRIPT (Management Narrative):
Quarter: ${transcript.quarter}, Year: ${transcript.year}
Content: ${transcript.content.substring(0, 15000)}... [TRUNCATED]
`;
    } else {
      sourceMaterial = `RECENT NEWS CONTEXT: ${JSON.stringify(newsData?.slice(0, 5), null, 2)}`;
    }

    const userPrompt = `Ticker: ${ticker}
Company: ${overview.name}

${sourceMaterial}
Insider Data: ${JSON.stringify(insiderData, null, 2)}
Overview: ${overview.description}

**CRITICAL: PARAGRAPH-BASED ANALYSIS**
Write cohesive narratives, not bullet point lists.

**ANALYSIS TASKS:**
1. **Skin in the Game Assessment:**
   Write a 3-4 sentence paragraph analyzing:
   - CEO and executive share ownership percentages
   - Recent insider trading patterns (net buying or selling?)
   - What this reveals about management confidence in the business

2. **Capital Allocation Evaluation:**
   Write a 3-4 sentence paragraph evaluating:
   - Historical cash deployment (R&D, M&A, buybacks, dividends)
   - Quality of past M&A decisions (value creation or destruction?)
   - Share buyback timing and effectiveness

3. **Governance Analysis:**
   Write 2-3 sentences identifying any red flags:
   - Excessive stock-based compensation/dilution
   - Empire building or wasteful spending
   - Board independence concerns

**OUTPUT SCHEMA (STRICT):**
{
  "skinInGame": {
      "ownership": "High|Moderate|Low",
      "insiderActivity": "Net Buying|Net Selling|Neutral",
      "narrative": "<3-4 sentence paragraph analyzing ownership levels, recent trades, and what it reveals about confidence>"
  },
  "capitalAllocation": {
      "rating": "Excellent|Good|Poor",
      "narrative": "<3-4 sentence paragraph evaluating historical capital deployment and M&A track record>",
      "evidence": ["<Specific example 1>", "<Specific example 2>"]
  },
  "governance": {
      "concerns": ["<Red flag 1>", "<Red flag 2>"],
      "narrative": "<2-3 sentences on governance quality and shareholder alignment issues>"
  },
  "investorInsight": "<2-3 sentences: What is the management quality verdict? Should investors be confident in this team?>"
}`;
    return await this.generate(userPrompt);
  }
}

module.exports = new ManagementAnalystAgent();

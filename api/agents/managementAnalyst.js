// ========================================
// Management Analyst Agent
// Analyzes leadership quality, capital allocation, and insider activity
// ========================================

const BaseAgent = require('./baseAgent');
const fmpClient = require('../utils/fmpClient');

class ManagementAnalystAgent extends BaseAgent {
  constructor() {
    super('Management Analyst', 'gemini-1.5-flash-latest');
  }

  async analyze(ticker, companyData, newsData) {
    // We can use the passed companyData, but let's fetch specific management data 
    // to ensure we have the latest transcripts and insider trading info directly from FMP

    // Fetch insider transactions and transcript if not already sufficient
    const [insiderData, transcript] = await Promise.all([
      fmpClient.getInsiderTrading(ticker),
      fmpClient.getEarningsTranscript(ticker)
    ]);

    const { overview } = companyData;

    let sourceMaterial = "";
    if (transcript) {
      sourceMaterial = `
LATEST EARNINGS CALL TRANSCRIPT (Management Narrative):
Quarter: ${transcript.quarter}, Year: ${transcript.year}
Content: ${transcript.content ? transcript.content.substring(0, 15000) : "Content unavailable"}... [TRUNCATED]
`;
    } else {
      sourceMaterial = `RECENT NEWS CONTEXT: ${JSON.stringify(newsData?.slice(0, 5) || [], null, 2)}`;
    }

    // Process insider data for the prompt
    // Latest 5 transactions
    const recentInsider = insiderData ? insiderData.slice(0, 5) : [];

    const userPrompt = `Ticker: ${ticker}
Company: ${overview.name}

${sourceMaterial}
Insider Data (Latest Transactions): 
${JSON.stringify(recentInsider, null, 2)}

Overview: ${overview.description}

**CRITICAL: PARAGRAPH-BASED ANALYSIS**
Write cohesive narratives, not bullet point lists.

**ANALYSIS TASKS:**
1. **Skin in the Game Assessment:**
   Write a 3-4 sentence paragraph analyzing:
   - Recent insider trading patterns (net buying or selling?)
   - What this reveals about management confidence in the business

2. **Capital Allocation Evaluation:**
   Write a 3-4 sentence paragraph evaluating:
   - Historical cash deployment based on your knowledge (R&D, M&A, buybacks, dividends)
   - Quality of past decisions (value creation or destruction?)

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
      "narrative": "<3-4 sentence paragraph analyzing recent trades and what it reveals about confidence>"
  },
  "capitalAllocation": {
      "rating": "Excellent|Good|Poor",
      "narrative": "<3-4 sentence paragraph evaluating historical capital deployment and M&A track record>",
      "evidence": ["<Specific example 1>", "<Specific example 2>"]
  },
  "governance": {
      "concerns": ["<Red flag 1 if any>", "<Red flag 2 if any>"],
      "narrative": "<2-3 sentences on governance quality and shareholder alignment issues>"
  },
  "investorInsight": "<2-3 sentences: What is the management quality verdict? Should investors be confident in this team?>"
}`;
    return await this.generate(userPrompt);
  }
}

module.exports = new ManagementAnalystAgent();

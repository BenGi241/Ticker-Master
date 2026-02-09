const BaseAgent = require('./baseAgent');

class MoatAnalystAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Competitive Strategy & Moat Analyst (Buffett-style) at a top-tier investment firm.
Your task is to assess competitive advantages through NARRATIVE ANALYSIS, not bullet points.

# CRITICAL: WRITE DEDICATED PARAGRAPHS
Do NOT list moat characteristics. Instead, write coherent paragraphs that:
1. **Argue the source** of the moat (Network Effects, Switching Costs, Cost Advantage, Intangibles)
2. **Provide numeric proof** (link to NOPAT margins, pricing power, customer retention)
3. **Assess durability** (is it widening or narrowing?)

# MANDATORY ANALYSIS FRAMEWORK:
1. **Moat Identification:** 
   - Write 4-5 sentence paragraph identifying the PRIMARY source of competitive advantage
   - Explain HOW it protects pricing power and market share
   - Use concrete business examples, not generic statements

2. **Numeric Validation:**
   - Connect the moat directly to **NOPAT Margin** stability or growth
   - Compare to sector peers - prove the moat exists mathematically
   - If margins are compressing, explain why the moat is weakening

3. **Durability Assessment:**
   - Write 3-4 sentence paragraph on whether this moat is widening or narrowing
   - Identify structural threats (regulation, technology disruption, new entrants)
   - Assess the 5-10 year sustainability

4. **Porter's 5 Forces (Brief):**
   - 2-3 sentences on key competitive dynamics
   - Focus on Supplier/Buyer power and Threat of Entrants

# OUTPUT REQUIREMENTS:
- Main moat analysis must be a cohesive 4-5 sentence paragraph
- Durability analysis must be a separate 3-4 sentence paragraph
- NO bullet point lists in analysis sections
- End with "Investor Insight" on competitive positioning

Tone: Objective, structural. Focus on long-term terminal value threats.

Respond ONLY with valid JSON.`;
    super('Moat Analyst', systemPrompt);
  }

  async analyze(ticker, companyOverview, financialData, peerData) {
    const userPrompt = `Analyze the competitive moat for ${ticker}.
Company Overview: ${JSON.stringify(companyOverview, null, 2)}
Financial Data: ${JSON.stringify(financialData, null, 2)}
Peers: ${JSON.stringify(peerData, null, 2)}

**CRITICAL: PARAGRAPH-BASED ANALYSIS**
Do NOT use bullet points to list moat characteristics. Write cohesive paragraphs.

**ANALYSIS TASKS:**
1. **Moat Identification & Validation:**
   Write a 4-5 sentence paragraph that:
   - Identifies the PRIMARY moat type (Network Effect, Switching Cost, Cost Advantage, or Intangible Asset)
   - Explains HOW this moat operates in the business model (concrete mechanism)
   - Validates it with NOPAT margin data or pricing power evidence
   - Compares to peers to prove the moat exists

2. **Durability Assessment:**
   Write a separate 3-4 sentence paragraph analyzing:
   - Is this moat widening (getting stronger) or narrowing (weakening)?
   - What are the structural threats? (regulation, technology, new competition)
   - 5-10 year outlook on sustainability

3. **Competitive Dynamics:**
   Write 2-3 sentences on Porter's 5 Forces:
   - Supplier/Buyer power
   - Threat of new entrants
   - Key competitive pressure points

**OUTPUT SCHEMA (STRICT):**
{
  "moat": {
    "type": "Network Effect|Switching Cost|Cost Advantage|Intangible Asset",
    "strength": "Wide|Narrow|None",
    "narrative": "<4-5 sentence paragraph: Identify the moat, explain how it works, validate with NOPAT margins or pricing power, compare to peers>",
    "numericProof": {
      "nopatMargin": "<%>",
      "peerAverageMargin": "<%>",
      "spread": "<%>",
      "interpretation": "<1-2 sentences explaining what the margin spread proves about the moat>"
    }
  },
  "durability": {
    "assessment": "Widening|Stable|Narrowing",
    "narrative": "<3-4 sentence paragraph: Is the moat getting stronger or weaker? What are the key threats? 5-10 year outlook.>",
    "structuralThreats": ["<Threat 1>", "<Threat 2>"],
    "timeHorizon": "<Sustainability outlook>"
  },
  "competitiveDynamics": {
    "narrative": "<2-3 sentences on Porter's 5 Forces: supplier/buyer power, threat of entrants, key pressure points>",
    "buyerPower": "High|Moderate|Low",
    "supplierPower": "High|Moderate|Low",
    "threatOfEntrants": "High|Moderate|Low"
  },
  "peerComparison": [
    {
      "name": "<Peer company>",
      "nopatMargin": "<%>",
      "moatType": "<Their moat>",
      "relativeStrength": "Stronger|Similar|Weaker"
    }
  ],
  "investorInsight": "<2-3 sentence synthesis: What is the competitive positioning verdict and how does it affect long-term value creation?>"
}

Write paragraphs, NOT bullet lists. Validate claims with data.`;
    return await this.generate(userPrompt);
  }
}

module.exports = new MoatAnalystAgent();

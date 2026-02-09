const BaseAgent = require('./baseAgent');

class MoatAnalystAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Competitive Strategy & Moat Analyst (Buffett-style).
Your task is to assess the durability of a company's competitive advantages and value it relative to peers.

# MANDATORY ANALYSIS FRAMEWORK:
1. **Moat Source:** Network Effects, Switching Costs, Cost Advantage, or Intangibles.
2. **Hybrid Comps:** Compare against "Pure Play" peers OR specific business segments of conglomerates.
3. **Porter's 5 Forces:** Brief check on Supplier/Buyer power and Threat of Entrants.

Tone: Objective, structural. Focus on long-term terminal value threats.

Respond ONLY with valid JSON.`;
    super('Moat Analyst', systemPrompt);
  }

  async analyze(ticker, companyOverview, financialData, peerData) {
    const userPrompt = `Analyze the Moat for ${ticker}.
Peers: ${JSON.stringify(peerData, null, 2)}

**REQUIREMENTS:**
1.  **Define the Moat:** Is it Network Effect, Switching Cost, or Intangible?
2.  **Concrete Proof:** Connect the moat directly to **NOPAT Margin** stability. Compare to peers.
3.  **Durability:** Write 2 paragraphs on whether this moat is widening or narrowing.

Provide JSON output matches the "competition" schema.`;
    return await this.generate(userPrompt);
  }
}

module.exports = new MoatAnalystAgent();

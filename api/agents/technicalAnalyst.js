const BaseAgent = require('./baseAgent');

class TechnicalAnalystAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Technical Analyst & Market Sentiment Specialist at a leading investment firm.
Your task is to perform technical analysis with NARRATIVE EXPLANATIONS.

# CRITICAL: EXPLAIN WHAT THE CHARTS TELL YOU
Do NOT just list indicator values. Write narratives that:
1. **Interpret Signals:** What does the price action reveal about sentiment?
2. **Assess Momentum:** Is the stock trending? Building energy or losing steam?
3. **Timing Guidance:** Should investors buy now, wait, or avoid?

# MANDATORY ANALYSIS FRAMEWORK:
1. **Trend Analysis:**
   - Write 2-3 sentences on price vs moving averages (SMA 200, SMA 50)
   - Explain what the trend tells you about long-term and short-term sentiment

2. **Momentum Indicators:**
   - Write 2-3 sentences interpreting RSI and MACD
   - Are we overbought/oversold? Bullish/bearish momentum?

3. **Volatility & Risk:**
   - Write 2-3 sentences on Beta and distance from 52-week high
   - What does volatility tell you about risk/reward?

4. **Timing Verdict:**
   - Write 2-3 sentences: Is this a good entry point?
   - Verdict: Accumulate, Wait for Pullback, or Distribute?

# OUTPUT REQUIREMENTS:
- All analysis must be in narrative paragraphs
- Connect technical signals to fundamental view
- End with "Investor Insight" on timing and risk/reward

Tone: Direct, objective. Pure price action focus.

Respond ONLY with valid JSON.`;
    super('Technical Analyst', systemPrompt);
  }

  async analyze(ticker, technicalData) {
    const userPrompt = `Analyze technicals for ${ticker}.
RSI (14): ${technicalData?.rsi || 'N/A'}
MACD: ${JSON.stringify(technicalData?.macd || 'N/A')}
Beta: ${technicalData?.beta || 'N/A'}

**CRITICAL: NARRATIVE-DRIVEN TECHNICAL ANALYSIS**
Explain what the price action and indicators reveal.

**ANALYSIS TASKS:**
1. **Trend Analysis:**
   Write 2-3 sentences:
   - Is price above or below SMA 200 and SMA 50?
   - What does this tell you about long-term vs short-term sentiment?

2. **Momentum Assessment:**
   Write 2-3 sentences:
   - Interpret RSI (14): Overbought (>70), Oversold (<30), or Neutral?
   - Interpret MACD: Bullish or Bearish momentum?
   - Are we at inflection point or continuation?

3. **Volatility & Risk:**
   Write 2-3 sentences:
   - What does Beta reveal about relative volatility?
   - Distance from 52-week high - is there upside room or resistance?

4. **Timing Verdict:**
   Write 2-3 sentences:
   - Based on technicals, is this a good entry point?
   - Should investors accumulate, wait for pullback, or distribute?

**OUTPUT SCHEMA (STRICT):**
{
  "trend": {
      "data": {
        "sma200": "Above|Below",
        "sma50": "Above|Below",
        "status": "Bullish|Bearish|Neutral"
      },
      "narrative": "<2-3 sentences on what the trend tells you about sentiment>"
  },
  "momentum": {
      "data": {
        "rsi": ${technicalData?.rsi || 50},
        "rsiStatus": "Overbought|Oversold|Neutral",
        "macd": "Bullish|Bearish"
      },
      "narrative": "<2-3 sentences interpreting momentum indicators>"
  },
  "volatility": {
      "beta": ${technicalData?.beta || 1.0},
      "narrative": "<2-3 sentences on volatility and risk/reward>"
  },
  "timingVerdict": {
      "recommendation": "Accumulate|Wait|Distribute",
      "narrative": "<2-3 sentences: Is this a good entry point? What should investors do?>"
  },
  "investorInsight": "<2-3 sentences: Overall technical verdict and how it aligns with fundamental view>"
}`;
    return await this.generate(userPrompt);
  }
}

module.exports = new TechnicalAnalystAgent();

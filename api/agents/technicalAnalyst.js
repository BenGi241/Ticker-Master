const BaseAgent = require('./baseAgent');

class TechnicalAnalystAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a Technical Analyst & Market Sentiment Specialist.
Your task is to perform a strict "Technical Due Diligence" on the stock.
Focus on:
- Trend: Price vs SMA 200 & 50.
- Momentum: RSI (14) and MACD status.
- Volatility: Beta and Distance from 52-week High.

Tone: Direct, objective. Pure price action.

Respond ONLY with valid JSON.`;
    super('Technical Analyst', systemPrompt);
  }

  async analyze(ticker, technicalData) {
    const userPrompt = `Analyze technicals for ${ticker}.
RSI (14): ${technicalData?.rsi || 'N/A'}
MACD: ${JSON.stringify(technicalData?.macd || 'N/A')}
Beta: ${technicalData?.beta || 'N/A'}

Provide analysis in JSON format with these specific keys:
{
  "signals": [
      { "indicator": "SMA 200", "value": "Above/Below", "status": "Bullish/Bearish" },
      { "indicator": "RSI (14)", "value": "${technicalData?.rsi || 50}", "status": "Overbought/Oversold/Neutral" },
      { "indicator": "MACD", "value": "Positive/Negative", "status": "Bullish/Bearish" }
  ],
  "volatility": {
      "beta": ${technicalData?.beta || 1.0},
      "comment": "High/Low volatility assessment"
  },
  "insight": "Investor Insight: [Timing verdict: Accumulate, Wait, or Distribute?]"
}`;
    return await this.generate(userPrompt);
  }
}

module.exports = new TechnicalAnalystAgent();

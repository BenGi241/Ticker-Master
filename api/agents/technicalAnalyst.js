// ========================================
// Technical Analyst Agent
// Analyzes market sentiment, trends, and momentum
// ========================================

const BaseAgent = require('./baseAgent');
const technicalCalc = require('../utils/technicalCalculator');

class TechnicalAnalystAgent extends BaseAgent {
   constructor() {
      super('Technical Analyst', 'gemini-1.5-flash-latest');
   }

   async analyze(ticker, technicalData) {
      // technicalData is passed from Orchestrator (fetched via financialDataFMP.js -> fmpClient)
      // It contains: { rsi, sma50, sma200 }
      // Note: FMP returns an array of objects for indicators. financialDataFMP.js extracts the first object (latest).

      // We need to safely access the values.
      // FMP Indicator Object Structure example: { date: '2023-11-01', rsi: 55.4, ... } or { sma: 150.2 }

      // Handle FMP prices structure or legacy indicators
      let rsiVal = 'N/A';
      let sma50Val = 'N/A';
      let sma200Val = 'N/A';
      let currentPrice = 'N/A';
      let trendStatus = "Neutral";

      if (technicalData.prices && technicalData.prices.length > 0) {
         // FMP structure - calculate indicators client-side
         const prices = technicalData.prices;
         currentPrice = prices[0]?.close || prices[0]?.adjClose || 'N/A';

         // Calculate indicators
         rsiVal = technicalCalc.calculateRSI(prices, 14);
         sma50Val = technicalCalc.calculateSMA(prices, 50);
         sma200Val = technicalCalc.calculateSMA(prices, 200);

         // Determine trend
         if (sma50Val !== null && sma200Val !== null) {
            trendStatus = sma50Val > sma200Val ? "Golden Cross / Bullish" : "Death Cross / Bearish";
         }
      } else {
         // Legacy structure - use pre-calculated values
         rsiVal = technicalData?.rsi?.rsi || technicalData?.rsi || 'N/A';
         sma50Val = technicalData?.sma50?.sma || technicalData?.sma50 || 'N/A';
         sma200Val = technicalData?.sma200?.sma || technicalData?.sma200 || 'N/A';

         if (sma50Val !== 'N/A' && sma200Val !== 'N/A') {
            trendStatus = sma50Val > sma200Val ? "Golden Cross / Bullish" : "Death Cross / Bearish";
         }
      }

      const userPrompt = `Analyze technicals for ${ticker}.
Current Price: ${currentPrice}
RSI (14): ${rsiVal}
SMA (50): ${sma50Val}
SMA (200): ${sma200Val}
Trend Status: ${trendStatus}

**CRITICAL: NARRATIVE-DRIVEN TECHNICAL ANALYSIS**
Explain what the price action and indicators reveal.

**ANALYSIS TASKS:**
1. **Trend Analysis:**
   Write 2-3 sentences:
   - Is price trend bullish or bearish based on Moving Averages?
   - What does this tell you about long-term vs short-term sentiment?

2. **Momentum Assessment:**
   Write 2-3 sentences:
   - Interpret RSI (14): Overbought (>70), Oversold (<30), or Neutral?
   - Are we at a potential reversal point?

3. **Volatility & Risk:**
   Write 2-3 sentences:
   - Based on the indicators, is volatility high or stable?
   - Where is the risk/reward skewed?

4. **Timing Verdict:**
   Write 2-3 sentences:
   - Based on technicals, is this a good entry point?
   - Should investors accumulate, wait for pullback, or distribute?

**OUTPUT SCHEMA (STRICT):**
{
  "trend": {
      "data": {
        "smaStatus": "${trendStatus}",
        "status": "Bullish|Bearish|Neutral"
      },
      "narrative": "<2-3 sentences on what the trend tells you about sentiment>"
  },
  "momentum": {
      "data": {
        "rsi": ${typeof rsiVal === 'number' ? rsiVal : 50},
        "rsiStatus": "Overbought|Oversold|Neutral"
      },
      "narrative": "<2-3 sentences interpreting momentum indicators>"
  },
  "volatility": {
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

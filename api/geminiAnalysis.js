// ========================================
// Gemini AI Analysis Module
// Generates AI-powered investment analysis
// ========================================

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ========== Gemini AI Functions ==========

async function generateAnalysis(prompt) {
      try {
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return text;
      } catch (error) {
            throw new Error(`Gemini API error: ${error.message}`);
      }
}

// ========== Section-Specific Analysis Functions ==========

async function generateBusinessInsights(ticker, companyName, financialData, newsData) {
      const prompt = `You are a senior equity analyst. Create a comprehensive business analysis for ${companyName} (${ticker}).

Company Data:
- Sector: ${financialData.overview.sector}
- Industry: ${financialData.overview.industry}
- Market Cap: $${(financialData.overview.marketCap / 1000000000).toFixed(1)}B
- Annual Revenue: $${financialData.financials.annual[0]?.revenue?.toFixed(1)}B
- Net Margin: ${(financialData.financials.annual[0]?.netMargin || 0).toFixed(1)}%
- Description: ${financialData.overview.description}

Create a comprehensive analysis in the following JSON format:
{
  "eli10": "A very simple explanation of what the company does, at a level a 10-year-old would understand. 2-3 simple sentences.",
  "businessModel": {
    "description": "Detailed explanation of how the company actually makes money",
    "revenueStreams": [
      {"source": "Revenue source 1", "percentage": 45, "description": "Brief description"},
      {"source": "Revenue source 2", "percentage": 35, "description": "Brief description"}
    ],
    "keyMetrics": {
      "profitability": "Profitability analysis",
      "scalability": "Scalability analysis",
      "sustainability": "Business model sustainability analysis"
    }
  },
  "mainOperations": {
    "businessAreas": [
      {"area": "Business area 1", "importance": "High/Medium/Low", "description": "Detailed description"}
    ],
    "targetCustomers": [
      {"segment": "Customer segment", "description": "Description", "contribution": "Revenue contribution"}
    ],
    "geographicMarkets": [
      {"region": "Geographic region", "revenue": 45, "growth": "Growth in region"}
    ]
  },
  "marketPosition": {
    "marketShare": "Estimated market share percentage",
    "marketShareDescription": "Explanation of market position",
    "mainCompetitors": [
      {
        "name": "Competitor name",
        "ticker": "TICK",
        "marketShare": 25,
        "strengths": ["Strength 1", "Strength 2"],
        "comparison": "Comparison to our company"
      }
    ],
    "competitivePosition": "Overall competitive position analysis"
  },
  "competitiveAdvantages": [
    {
      "advantage": "Competitive advantage",
      "description": "Detailed explanation",
      "strength": "High/Medium/Low",
      "sustainability": "Is it sustainable long-term"
    }
  ],
  "partnerships": [
    {
      "partner": "Business partner",
      "type": "Type of partnership",
      "impact": "Impact on business"
    }
  ],
  "weaknesses": [
    {
      "weakness": "Business weakness",
      "description": "Explanation",
      "severity": "High/Medium/Low",
      "mitigation": "Is the company addressing this"
    }
  ],
  "challenges": [
    {
      "challenge": "Main challenge",
      "description": "Detailed explanation",
      "timeframe": "Timeframe",
      "impact": "Potential impact"
    }
  ]
}

Important: Respond ONLY with valid JSON, no additional text. Use English for all content.`;

      try {
            const response = await generateAnalysis(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response from Gemini');
      } catch (error) {
            console.error('Error parsing business insights:', error.message);
            // Return fallback structure
            return {
                  eli10: "Analysis not available at this time",
                  businessModel: {
                        description: "Information not available",
                        revenueStreams: [],
                        keyMetrics: {
                              profitability: "Not available",
                              scalability: "Not available",
                              sustainability: "Not available"
                        }
                  },
                  mainOperations: {
                        businessAreas: [],
                        targetCustomers: [],
                        geographicMarkets: []
                  },
                  marketPosition: {
                        marketShare: "Unknown",
                        marketShareDescription: "Information not available",
                        mainCompetitors: [],
                        competitivePosition: "Information not available"
                  },
                  competitiveAdvantages: [],
                  partnerships: [],
                  weaknesses: [],
                  challenges: []
            };
      }
}

async function analyzeCompetitiveLandscape(ticker, companyName, financialData, newsData) {
      const prompt = `You are a senior equity analyst. Analyze the competitive landscape for ${companyName} (${ticker}).

Company Overview:
- Sector: ${financialData.overview.sector}
- Industry: ${financialData.overview.industry}
- Market Cap: $${financialData.overview.marketCap}B
- Latest Revenue: $${financialData.financials.annual[0]?.revenue}B

Recent News Sentiment: ${newsData.sentiment?.label || 'Neutral'}

Provide a comprehensive competitive analysis in JSON format:
{
  "competitors": [
    {"name": "Company Name", "ticker": "TICK", "marketShare": 15, "strengths": ["strength1", "strength2"], "weaknesses": ["weakness1"]}
  ],
  "advantages": [
    {"title": "Advantage Title", "description": "Detailed description", "strength": "High/Medium/Low"}
  ],
  "threats": [
    {"threat": "Threat description", "severity": "High/Medium/Low"}
  ],
  "opportunities": [
    {"opportunity": "Opportunity description", "potential": "High/Medium/Low"}
  ],
  "marketPosition": "Overall market position analysis",
  "marketSize": {
    "tam": 1200,
    "sam": 450,
    "som": 95,
    "growth": 22.5
  }
}

Respond ONLY with valid JSON, no additional text.`;

      try {
            const response = await generateAnalysis(prompt);
            // Try to parse JSON, handle potential formatting issues
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response from Gemini');
      } catch (error) {
            console.error('Error parsing competitive analysis:', error.message);
            // Return fallback structure
            return {
                  competitors: [],
                  advantages: [],
                  threats: [],
                  opportunities: [],
                  marketPosition: 'Analysis unavailable',
                  marketSize: { tam: 0, sam: 0, som: 0, growth: 0 }
            };
      }
}

async function analyzeManagement(ticker, companyName, financialData) {
      const prompt = `You are a senior equity analyst. Analyze the management team and corporate governance for ${companyName} (${ticker}).

Company Performance:
- ROE: ${financialData.financials.annual[0]?.roe?.toFixed(1)}%
- ROIC: ${financialData.financials.annual[0]?.roic?.toFixed(1)}%
- Revenue Growth: ${financialData.financials.annual[0]?.revenue_growth?.toFixed(1)}%

Provide management analysis in JSON format:
{
  "leadershipQuality": {
    "innovation": 85,
    "esgFocus": 75,
    "riskManagement": 80,
    "transparency": 90
  },
  "strengths": ["Leadership strength 1", "Leadership strength 2"],
  "concerns": ["Concern 1", "Concern 2"],
  "overallAssessment": "Overall management quality assessment"
}

Respond ONLY with valid JSON.`;

      try {
            const response = await generateAnalysis(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response');
      } catch (error) {
            console.error('Error parsing management analysis:', error.message);
            return {
                  leadershipQuality: { innovation: 70, esgFocus: 70, riskManagement: 70, transparency: 70 },
                  strengths: [],
                  concerns: [],
                  overallAssessment: 'Analysis unavailable'
            };
      }
}

async function generateForecasts(ticker, companyName, financialData, newsData) {
      const currentRevenue = financialData.financials.annual[0]?.revenue || 0;
      const revenueGrowth = financialData.financials.annual[0]?.revenue_growth || 0;
      const netMargin = financialData.financials.annual[0]?.netMargin || 0;

      const prompt = `You are a senior equity analyst. Generate revenue and profitability forecasts for ${companyName} (${ticker}) from 2025 to 2030.

Current Metrics:
- 2024 Revenue: $${currentRevenue.toFixed(1)}B
- Recent Growth Rate: ${revenueGrowth.toFixed(1)}%
- Net Margin: ${netMargin.toFixed(1)}%
- Sector: ${financialData.overview.sector}
- Market Sentiment: ${newsData.sentiment?.label || 'Neutral'}

Generate three scenarios (Base, Bull, Bear) with realistic assumptions. Provide in JSON format:
{
  "scenarios": {
    "base": {
      "revenue": [10.5, 12.3, 14.5, 16.8, 19.2, 21.8, 24.5],
      "netMargin": [28.0, 28.5, 29.0, 29.5, 30.0, 30.5, 31.0],
      "assumptions": "Key assumptions for base case"
    },
    "bull": {
      "revenue": [11.2, 14.1, 17.8, 22.3, 27.9, 34.8, 43.5],
      "netMargin": [28.5, 29.5, 30.5, 31.5, 32.5, 33.5, 34.5],
      "assumptions": "Key assumptions for bull case"
    },
    "bear": {
      "revenue": [9.8, 10.5, 11.2, 11.9, 12.7, 13.5, 14.4],
      "netMargin": [27.0, 26.5, 26.0, 25.5, 25.0, 24.5, 24.0],
      "assumptions": "Key assumptions for bear case"
    }
  },
  "risks": [
    {"risk": "Risk description", "probability": "High/Medium/Low", "impact": "High/Medium/Low"}
  ],
  "opportunities": [
    {"opportunity": "Opportunity description", "probability": "High/Medium/Low", "impact": "High/Medium/Low"}
  ]
}

Respond ONLY with valid JSON.`;

      try {
            const response = await generateAnalysis(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response');
      } catch (error) {
            console.error('Error parsing forecasts:', error.message);
            // Generate simple linear forecasts as fallback
            const baseGrowth = Math.min(revenueGrowth, 25) / 100;
            const years = [2025, 2026, 2027, 2028, 2029, 2030];

            return {
                  scenarios: {
                        base: {
                              revenue: years.map((_, i) => currentRevenue * Math.pow(1 + baseGrowth, i + 1)),
                              netMargin: years.map(() => netMargin),
                              assumptions: 'Automated forecast based on historical growth'
                        },
                        bull: {
                              revenue: years.map((_, i) => currentRevenue * Math.pow(1 + baseGrowth * 1.5, i + 1)),
                              netMargin: years.map((_, i) => netMargin + i * 0.5),
                              assumptions: 'Optimistic scenario with accelerated growth'
                        },
                        bear: {
                              revenue: years.map((_, i) => currentRevenue * Math.pow(1 + baseGrowth * 0.5, i + 1)),
                              netMargin: years.map((_, i) => Math.max(netMargin - i * 0.5, 15)),
                              assumptions: 'Conservative scenario with slower growth'
                        }
                  },
                  risks: [],
                  opportunities: []
            };
      }
}

async function generateValuation(ticker, companyName, financialData, forecasts) {
      const currentPrice = financialData.overview.analystTargetPrice || 100;
      const fcf = financialData.financials.annual[0]?.freeCashFlow || 0;

      const prompt = `You are a senior equity analyst. Generate a DCF valuation for ${companyName} (${ticker}).

Current Metrics:
- Free Cash Flow: $${fcf.toFixed(2)}B
- Market Cap: $${financialData.overview.marketCap}B
- Beta: ${financialData.overview.beta}
- Sector: ${financialData.overview.sector}

Provide DCF valuation in JSON format:
{
  "dcf": {
    "base": {
      "wacc": 9.5,
      "terminalGrowth": 3.0,
      "fairValue": 295,
      "upside": 19.4
    },
    "bull": {
      "wacc": 8.5,
      "terminalGrowth": 3.5,
      "fairValue": 425,
      "upside": 72.1
    },
    "bear": {
      "wacc": 11.0,
      "terminalGrowth": 2.5,
      "fairValue": 185,
      "upside": -25.1
    }
  },
  "assumptions": "Key DCF assumptions and methodology"
}

Respond ONLY with valid JSON.`;

      try {
            const response = await generateAnalysis(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response');
      } catch (error) {
            console.error('Error parsing valuation:', error.message);
            // Simple valuation fallback
            const fairValue = currentPrice * 1.2;
            return {
                  dcf: {
                        base: {
                              wacc: 9.5,
                              terminalGrowth: 3.0,
                              fairValue: fairValue,
                              upside: 20.0
                        },
                        bull: {
                              wacc: 8.5,
                              terminalGrowth: 3.5,
                              fairValue: fairValue * 1.4,
                              upside: 40.0
                        },
                        bear: {
                              wacc: 11.0,
                              terminalGrowth: 2.5,
                              fairValue: fairValue * 0.8,
                              upside: -20.0
                        }
                  },
                  assumptions: 'Simplified valuation model'
            };
      }
}

async function generateRecommendation(ticker, companyName, financialData, newsData, forecasts, valuation) {
      const prompt = `You are a senior equity analyst. Generate a final investment recommendation for ${companyName} (${ticker}).

Key Metrics:
- Revenue Growth: ${financialData.financials.annual[0]?.revenue_growth?.toFixed(1)}%
- Net Margin: ${financialData.financials.annual[0]?.netMargin?.toFixed(1)}%
- ROIC: ${financialData.financials.annual[0]?.roic?.toFixed(1)}%
- Fair Value Upside: ${valuation.dcf.base.upside?.toFixed(1)}%
- News Sentiment: ${newsData.sentiment?.label || 'Neutral'}

Provide recommendation in JSON format:
{
  "rating": "Strong Buy/Buy/Hold/Sell/Strong Sell",
  "confidence": 85,
  "timeHorizon": {
    "shortTerm": {"outlook": "Positive/Neutral/Negative", "rationale": "Reason"},
    "midTerm": {"outlook": "Positive/Neutral/Negative", "rationale": "Reason"},
    "longTerm": {"outlook": "Positive/Neutral/Negative", "rationale": "Reason"}
  },
  "topReasonsToBuy": [
    {"title": "Reason 1", "description": "Detailed explanation", "icon": "🚀"}
  ],
  "topRisks": [
    {"title": "Risk 1", "description": "Detailed explanation", "severity": "High/Medium/Low", "icon": "⚠️"}
  ],
  "catalysts": [
    {"catalyst": "Catalyst description", "impact": "High/Medium/Low", "timeframe": "Timeframe"}
  ]
}

Respond ONLY with valid JSON.`;

      try {
            const response = await generateAnalysis(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Invalid JSON response');
      } catch (error) {
            console.error('Error parsing recommendation:', error.message);
            return {
                  rating: 'Hold',
                  confidence: 50,
                  timeHorizon: {
                        shortTerm: { outlook: 'Neutral', rationale: 'Analysis unavailable' },
                        midTerm: { outlook: 'Neutral', rationale: 'Analysis unavailable' },
                        longTerm: { outlook: 'Neutral', rationale: 'Analysis unavailable' }
                  },
                  topReasonsToBuy: [],
                  topRisks: [],
                  catalysts: []
            };
      }
}

// ========== Main Export Functions ==========

async function analyzeSection(ticker, section, financialData, newsData) {
      const companyName = financialData.overview.name;

      switch (section) {
            case 'business':
                  return await generateBusinessInsights(ticker, companyName, financialData, newsData);

            case 'competitive':
                  return await analyzeCompetitiveLandscape(ticker, companyName, financialData, newsData);

            case 'management':
                  return await analyzeManagement(ticker, companyName, financialData);

            case 'forecasts':
                  return await generateForecasts(ticker, companyName, financialData, newsData);

            case 'valuation':
                  const forecasts = await generateForecasts(ticker, companyName, financialData, newsData);
                  return await generateValuation(ticker, companyName, financialData, forecasts);

            case 'recommendation':
                  const allForecasts = await generateForecasts(ticker, companyName, financialData, newsData);
                  const allValuation = await generateValuation(ticker, companyName, financialData, allForecasts);
                  return await generateRecommendation(ticker, companyName, financialData, newsData, allForecasts, allValuation);

            default:
                  throw new Error(`Unknown section: ${section}`);
      }
}

async function analyzeCompany(ticker, financialData, newsData) {
      const companyName = financialData.overview.name;

      console.log(`Generating full AI analysis for ${companyName}...`);

      // Generate all analyses in parallel
      const [competitive, management, forecasts] = await Promise.all([
            analyzeCompetitiveLandscape(ticker, companyName, financialData, newsData),
            analyzeManagement(ticker, companyName, financialData),
            generateForecasts(ticker, companyName, financialData, newsData)
      ]);

      // Generate valuation and recommendation (depend on forecasts)
      const valuation = await generateValuation(ticker, companyName, financialData, forecasts);
      const recommendation = await generateRecommendation(ticker, companyName, financialData, newsData, forecasts, valuation);

      return {
            competitive,
            management,
            forecasts,
            valuation,
            recommendation,
            timestamp: new Date().toISOString()
      };
}

module.exports = {
      analyzeSection,
      analyzeCompany
};

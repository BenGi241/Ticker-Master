// ========================================
// AI-Powered Fundamental Analysis Platform
// Company Data Management System
// ========================================

// Company Data Structure - Easily replaceable for different companies
const companyData = {
      // ========== Company Overview ==========
      overview: {
            name: "TechVision Inc.",
            ticker: "TCHV",
            logo: "🚀",
            tagline: "Revolutionizing Cloud Infrastructure for the AI Era",
            simpleExplanation: "TechVision makes the computer systems that help other companies store and process huge amounts of data in the cloud. Think of them as the builders of giant digital warehouses where businesses keep all their information safe and accessible from anywhere in the world.",
            expertExplanation: "TechVision Inc. is a leading provider of enterprise cloud infrastructure solutions, specializing in scalable, AI-optimized data center architecture and edge computing platforms. The company operates a hybrid SaaS/infrastructure model with recurring revenue streams from platform subscriptions and usage-based pricing.",
            founded: "2015",
            headquarters: "San Francisco, CA",
            employees: "12,500",
            marketCap: "$45.2B",

            businessModel: {
                  description: "Multi-stream revenue model combining subscription services, usage-based pricing, and professional services",
                  streams: [
                        { name: "Platform Subscriptions", percentage: 65, description: "Monthly/annual cloud platform access fees" },
                        { name: "Usage-Based Services", percentage: 25, description: "Pay-per-use compute and storage" },
                        { name: "Professional Services", percentage: 10, description: "Implementation and consulting" }
                  ]
            },

            segments: [
                  { name: "Enterprise Cloud", icon: "☁️", description: "Large-scale cloud infrastructure for Fortune 500" },
                  { name: "AI/ML Platform", icon: "🤖", description: "Specialized compute for AI workloads" },
                  { name: "Edge Computing", icon: "📡", description: "Distributed computing at network edge" },
                  { name: "Data Analytics", icon: "📊", description: "Real-time analytics and BI tools" }
            ],

            markets: [
                  { region: "North America", percentage: 55, growth: 18 },
                  { region: "Europe", percentage: 25, growth: 22 },
                  { region: "Asia Pacific", percentage: 15, growth: 35 },
                  { region: "Rest of World", percentage: 5, growth: 28 }
            ],

            competitors: [
                  { name: "Amazon Web Services", marketShare: 32, logo: "AWS" },
                  { name: "Microsoft Azure", marketShare: 22, logo: "MSFT" },
                  { name: "Google Cloud", marketShare: 11, logo: "GOOG" },
                  { name: "TechVision Inc.", marketShare: 8, logo: "TCHV" },
                  { name: "Others", marketShare: 27, logo: "..." }
            ],

            advantages: [
                  { title: "AI-Optimized Infrastructure", description: "Purpose-built hardware for ML workloads", icon: "⚡" },
                  { title: "Superior Performance", description: "40% faster than competitors on AI benchmarks", icon: "🎯" },
                  { title: "Strong Customer Retention", description: "98% annual retention rate", icon: "🔒" },
                  { title: "Innovation Pipeline", description: "15% of revenue invested in R&D", icon: "🔬" }
            ],

            challenges: [
                  { title: "Intense Competition", description: "Competing against tech giants with deeper pockets", severity: "high" },
                  { title: "Margin Pressure", description: "Price competition affecting profitability", severity: "medium" },
                  { title: "Talent Acquisition", description: "High demand for specialized AI engineers", severity: "medium" }
            ]
      },

      // ========== Financial Data (5 Years + Last Quarter) ==========
      financials: {
            annual: [
                  {
                        year: 2020,
                        revenue: 2.1,
                        grossProfit: 1.26,
                        operatingProfit: 0.42,
                        netProfit: 0.32,
                        eps: 1.28,
                        shares: 250,
                        operatingCashFlow: 0.55,
                        freeCashFlow: 0.38,
                        totalAssets: 4.2,
                        totalLiabilities: 1.8,
                        cash: 1.2,
                        equity: 2.4,
                        revenue_growth: null,
                        grossMargin: 60.0,
                        operatingMargin: 20.0,
                        netMargin: 15.2,
                        pe: 35.2,
                        pb: 5.8,
                        debtToEquity: 0.25,
                        roe: 13.3,
                        roic: 11.5
                  },
                  {
                        year: 2021,
                        revenue: 3.2,
                        grossProfit: 2.08,
                        operatingProfit: 0.77,
                        netProfit: 0.58,
                        eps: 2.28,
                        shares: 254,
                        operatingCashFlow: 0.92,
                        freeCashFlow: 0.68,
                        totalAssets: 5.8,
                        totalLiabilities: 2.1,
                        cash: 1.8,
                        equity: 3.7,
                        revenue_growth: 52.4,
                        grossMargin: 65.0,
                        operatingMargin: 24.1,
                        netMargin: 18.1,
                        pe: 32.8,
                        pb: 6.2,
                        debtToEquity: 0.18,
                        roe: 15.7,
                        roic: 14.2
                  },
                  {
                        year: 2022,
                        revenue: 4.8,
                        grossProfit: 3.26,
                        operatingProfit: 1.34,
                        netProfit: 1.01,
                        eps: 3.92,
                        shares: 258,
                        operatingCashFlow: 1.52,
                        freeCashFlow: 1.18,
                        totalAssets: 8.2,
                        totalLiabilities: 2.8,
                        cash: 2.6,
                        equity: 5.4,
                        revenue_growth: 50.0,
                        grossMargin: 67.9,
                        operatingMargin: 27.9,
                        netMargin: 21.0,
                        pe: 28.5,
                        pb: 5.9,
                        debtToEquity: 0.15,
                        roe: 18.7,
                        roic: 17.3
                  },
                  {
                        year: 2023,
                        revenue: 6.9,
                        grossProfit: 4.83,
                        operatingProfit: 2.14,
                        netProfit: 1.62,
                        eps: 6.18,
                        shares: 262,
                        operatingCashFlow: 2.35,
                        freeCashFlow: 1.89,
                        totalAssets: 11.8,
                        totalLiabilities: 3.5,
                        cash: 3.8,
                        equity: 8.3,
                        revenue_growth: 43.8,
                        grossMargin: 70.0,
                        operatingMargin: 31.0,
                        netMargin: 23.5,
                        pe: 26.2,
                        pb: 5.4,
                        debtToEquity: 0.12,
                        roe: 19.5,
                        roic: 19.8
                  },
                  {
                        year: 2024,
                        revenue: 9.8,
                        grossProfit: 7.05,
                        operatingProfit: 3.43,
                        netProfit: 2.65,
                        eps: 9.96,
                        shares: 266,
                        operatingCashFlow: 3.72,
                        freeCashFlow: 3.12,
                        totalAssets: 16.2,
                        totalLiabilities: 4.2,
                        cash: 5.4,
                        equity: 12.0,
                        revenue_growth: 42.0,
                        grossMargin: 71.9,
                        operatingMargin: 35.0,
                        netMargin: 27.0,
                        pe: 24.8,
                        pb: 4.9,
                        debtToEquity: 0.10,
                        roe: 22.1,
                        roic: 23.5
                  }
            ],

            lastQuarter: {
                  period: "Q3 2024",
                  revenue: 2.6,
                  grossProfit: 1.90,
                  operatingProfit: 0.94,
                  netProfit: 0.73,
                  eps: 2.74,
                  revenue_growth: 38.5,
                  grossMargin: 73.1,
                  operatingMargin: 36.2,
                  netMargin: 28.1
            },

            // Investment Criteria Benchmarks
            criteria: {
                  revenueGrowth: { threshold: 12, current: 42.0, met: true },
                  sharesGrowth: { threshold: 2, current: 1.5, met: true },
                  netCashToFCF: { threshold: 5, current: 1.7, met: true },
                  fcfGrowth: { threshold: 15, current: 65.1, met: true },
                  roic: { threshold: 15, current: 23.5, met: true },
                  epsGrowth: { threshold: 15, current: 61.2, met: true }
            }
      },

      // ========== Revenue Breakdown ==========
      revenueBreakdown: {
            bySegment: [
                  {
                        segment: "Enterprise Cloud",
                        data: [
                              { year: 2020, value: 1.05 },
                              { year: 2021, value: 1.60 },
                              { year: 2022, value: 2.40 },
                              { year: 2023, value: 3.45 },
                              { year: 2024, value: 4.90 }
                        ]
                  },
                  {
                        segment: "AI/ML Platform",
                        data: [
                              { year: 2020, value: 0.42 },
                              { year: 2021, value: 0.80 },
                              { year: 2022, value: 1.44 },
                              { year: 2023, value: 2.07 },
                              { year: 2024, value: 3.14 }
                        ]
                  },
                  {
                        segment: "Edge Computing",
                        data: [
                              { year: 2020, value: 0.42 },
                              { year: 2021, value: 0.64 },
                              { year: 2022, value: 0.72 },
                              { year: 2023, value: 0.97 },
                              { year: 2024, value: 1.27 }
                        ]
                  },
                  {
                        segment: "Data Analytics",
                        data: [
                              { year: 2020, value: 0.21 },
                              { year: 2021, value: 0.16 },
                              { year: 2022, value: 0.24 },
                              { year: 2023, value: 0.41 },
                              { year: 2024, value: 0.49 }
                        ]
                  }
            ]
      },

      // ========== Management Team ==========
      management: {
            executives: [
                  {
                        name: "Sarah Chen",
                        role: "CEO & Co-Founder",
                        photo: "👩‍💼",
                        background: "Former VP of Engineering at Google Cloud, Stanford CS PhD",
                        expertise: ["Cloud Architecture", "AI/ML", "Strategic Vision"],
                        tenure: "9 years",
                        ownership: 8.5
                  },
                  {
                        name: "Michael Rodriguez",
                        role: "CFO",
                        photo: "👨‍💼",
                        background: "Ex-Goldman Sachs, Harvard MBA, CPA",
                        expertise: ["Financial Strategy", "M&A", "Investor Relations"],
                        tenure: "5 years",
                        ownership: 2.1
                  },
                  {
                        name: "Dr. Aisha Patel",
                        role: "CTO",
                        photo: "👩‍🔬",
                        background: "MIT PhD in Distributed Systems, ex-Microsoft Research",
                        expertise: ["System Architecture", "R&D", "Innovation"],
                        tenure: "7 years",
                        ownership: 4.3
                  },
                  {
                        name: "James O'Brien",
                        role: "COO",
                        photo: "👨‍💻",
                        background: "20 years at AWS, Operations Excellence",
                        expertise: ["Operations", "Scaling", "Efficiency"],
                        tenure: "4 years",
                        ownership: 1.8
                  }
            ],

            boardMembers: [
                  { name: "Robert Johnson", role: "Chairman", background: "Former CEO of Oracle" },
                  { name: "Lisa Wang", role: "Independent Director", background: "Partner at Sequoia Capital" },
                  { name: "David Martinez", role: "Independent Director", background: "Ex-CTO of IBM" }
            ],

            leadershipStyle: {
                  innovation: 95,
                  esgFocus: 82,
                  riskManagement: 88,
                  transparency: 90
            },

            insiderOwnership: 16.7,
            marketSentiment: "Very Positive - Strong technical leadership with proven track record"
      },

      // ========== Competitive Landscape ==========
      competitive: {
            competitors: [
                  {
                        name: "TechVision Inc.",
                        ticker: "TCHV",
                        revenue: 9.8,
                        netMargin: 27.0,
                        marketCap: 45.2,
                        fcf: 3.12,
                        pe: 24.8,
                        epsGrowth: 61.2,
                        strengths: ["AI Optimization", "Innovation", "Growth"],
                        weaknesses: ["Scale", "Market Share"]
                  },
                  {
                        name: "Amazon AWS",
                        ticker: "AMZN",
                        revenue: 85.0,
                        netMargin: 24.0,
                        marketCap: 380.0,
                        fcf: 22.5,
                        pe: 28.5,
                        epsGrowth: 15.2,
                        strengths: ["Scale", "Ecosystem", "Market Leader"],
                        weaknesses: ["Slower Growth", "Complexity"]
                  },
                  {
                        name: "Microsoft Azure",
                        ticker: "MSFT",
                        revenue: 72.0,
                        netMargin: 26.5,
                        marketCap: 420.0,
                        fcf: 20.8,
                        pe: 32.2,
                        epsGrowth: 18.5,
                        strengths: ["Enterprise Relations", "Integration"],
                        weaknesses: ["Legacy Systems", "Bureaucracy"]
                  },
                  {
                        name: "Google Cloud",
                        ticker: "GOOG",
                        revenue: 32.0,
                        netMargin: 8.5,
                        marketCap: 180.0,
                        fcf: 2.8,
                        pe: 45.2,
                        epsGrowth: 28.3,
                        strengths: ["AI/ML Expertise", "Data Analytics"],
                        weaknesses: ["Profitability", "Enterprise Trust"]
                  }
            ],

            marketSize: {
                  tam: 1200,
                  sam: 450,
                  som: 95,
                  growth3Year: 22.5
            },

            threats: [
                  "Price competition from hyperscalers",
                  "Rapid technological change",
                  "Customer concentration risk"
            ],

            opportunities: [
                  "AI workload explosion driving demand",
                  "Edge computing adoption accelerating",
                  "Enterprise digital transformation",
                  "Potential strategic acquisitions"
            ]
      },

      // ========== Market Sentiment ==========
      sentiment: {
            analystRatings: {
                  strongBuy: 12,
                  buy: 8,
                  hold: 3,
                  sell: 1,
                  strongSell: 0
            },

            priceTargets: {
                  current: 247,
                  consensus: 295,
                  high: 380,
                  low: 220
            },

            bullishArguments: [
                  "AI boom driving unprecedented demand for specialized infrastructure",
                  "Superior technology with 40% performance advantage",
                  "Exceptional growth rates (42% revenue, 61% EPS)",
                  "Expanding margins demonstrate operational leverage",
                  "Strong customer retention (98%) indicates product-market fit",
                  "Management team with proven execution track record"
            ],

            bearishArguments: [
                  "Competing against tech giants with significantly more resources",
                  "Valuation premium to peers despite smaller scale",
                  "Customer concentration in top 10 clients",
                  "Potential economic slowdown could reduce IT spending",
                  "Rapid technological change requires constant innovation",
                  "Margin pressure from competitive pricing"
            ]
      },

      // ========== Forecasts to 2030 ==========
      forecasts: {
            scenarios: {
                  base: {
                        revenue: [9.8, 13.5, 18.2, 24.1, 31.5, 40.2, 50.5],
                        netMargin: [27.0, 28.5, 30.0, 31.5, 32.5, 33.0, 33.5],
                        fcf: [3.12, 4.45, 6.38, 8.92, 11.98, 15.67, 20.12]
                  },
                  bull: {
                        revenue: [9.8, 14.7, 21.3, 30.2, 42.1, 57.8, 78.2],
                        netMargin: [27.0, 29.5, 32.0, 34.0, 35.5, 36.5, 37.0],
                        fcf: [3.12, 5.12, 8.15, 12.48, 18.52, 26.38, 36.95]
                  },
                  bear: {
                        revenue: [9.8, 11.8, 13.5, 15.2, 17.1, 19.0, 21.2],
                        netMargin: [27.0, 26.0, 25.5, 25.0, 24.5, 24.0, 24.0],
                        fcf: [3.12, 3.52, 3.98, 4.42, 4.88, 5.32, 5.95]
                  }
            },

            macroTrends: [
                  { trend: "AI/ML Adoption", impact: "Very Positive", confidence: 95 },
                  { trend: "Cloud Migration", impact: "Positive", confidence: 88 },
                  { trend: "Edge Computing Growth", impact: "Positive", confidence: 82 },
                  { trend: "Data Privacy Regulations", impact: "Neutral", confidence: 70 }
            ],

            risks: [
                  { risk: "Competitive Pressure", probability: "High", impact: "High" },
                  { risk: "Economic Recession", probability: "Medium", impact: "High" },
                  { risk: "Technology Disruption", probability: "Medium", impact: "Medium" },
                  { risk: "Key Customer Loss", probability: "Low", impact: "High" },
                  { risk: "Regulatory Changes", probability: "Medium", impact: "Low" }
            ],

            opportunities: [
                  { opportunity: "AI Workload Explosion", probability: "Very High", impact: "Very High" },
                  { opportunity: "Strategic Acquisitions", probability: "High", impact: "High" },
                  { opportunity: "New Market Entry", probability: "Medium", impact: "High" },
                  { opportunity: "Product Innovation", probability: "High", impact: "Medium" }
            ]
      },

      // ========== Valuation (DCF) ==========
      valuation: {
            currentPrice: 247,

            dcf: {
                  base: {
                        wacc: 9.5,
                        terminalGrowth: 3.0,
                        fairValue: 295,
                        upside: 19.4
                  },
                  bull: {
                        wacc: 8.5,
                        terminalGrowth: 3.5,
                        fairValue: 425,
                        upside: 72.1
                  },
                  bear: {
                        wacc: 11.0,
                        terminalGrowth: 2.5,
                        fairValue: 185,
                        upside: -25.1
                  }
            },

            sensitivityAnalysis: {
                  waccRange: [7.5, 8.5, 9.5, 10.5, 11.5],
                  growthRange: [2.0, 2.5, 3.0, 3.5, 4.0],
                  // Matrix of fair values based on WACC and terminal growth combinations
                  values: [
                        [385, 410, 438, 470, 506],
                        [340, 362, 387, 415, 446],
                        [302, 322, 344, 368, 395],
                        [271, 288, 307, 328, 352],
                        [244, 260, 277, 296, 317]
                  ]
            }
      },

      // ========== Stakeholders & Investors ==========
      stakeholders: {
            notableInvestors: [
                  { name: "Vanguard Group", type: "Institutional", ownership: 8.2, logo: "🏛️" },
                  { name: "BlackRock", type: "Institutional", ownership: 7.5, logo: "🏛️" },
                  { name: "Sequoia Capital", type: "VC", ownership: 12.3, logo: "🌲" },
                  { name: "Cathie Wood (ARK)", type: "Active", ownership: 3.8, logo: "📈" },
                  { name: "Tiger Global", type: "Hedge Fund", ownership: 5.2, logo: "🐯" }
            ],

            insiderTransactions: [
                  { date: "2024-10-15", person: "Sarah Chen (CEO)", type: "Buy", shares: 50000, price: 235, value: 11.75 },
                  { date: "2024-09-20", person: "Michael Rodriguez (CFO)", type: "Buy", shares: 20000, price: 228, value: 4.56 },
                  { date: "2024-08-10", person: "Dr. Aisha Patel (CTO)", type: "Sell", shares: 15000, price: 242, value: 3.63 },
                  { date: "2024-07-05", person: "James O'Brien (COO)", type: "Buy", shares: 10000, price: 218, value: 2.18 }
            ],

            institutionalOwnership: 68.5,
            retailOwnership: 14.8,
            insiderOwnership: 16.7
      },

      // ========== Final Recommendation ==========
      recommendation: {
            rating: "Strong Buy",
            confidence: 85,

            timeHorizon: {
                  shortTerm: { outlook: "Positive", rationale: "Strong Q3 results, AI momentum" },
                  midTerm: { outlook: "Very Positive", rationale: "Market share gains, margin expansion" },
                  longTerm: { outlook: "Excellent", rationale: "Structural AI tailwinds, innovation pipeline" }
            },

            catalysts: [
                  { catalyst: "AI Infrastructure Demand", impact: "Very High", timeframe: "Ongoing" },
                  { catalyst: "Margin Expansion", impact: "High", timeframe: "2-3 years" },
                  { catalyst: "Strategic Partnerships", impact: "High", timeframe: "1-2 years" },
                  { catalyst: "Market Share Gains", impact: "Medium", timeframe: "Ongoing" }
            ],

            topReasonsToBuy: [
                  {
                        title: "AI Megatrend Beneficiary",
                        description: "Perfectly positioned to capitalize on explosive AI infrastructure demand with purpose-built solutions",
                        icon: "🚀"
                  },
                  {
                        title: "Exceptional Growth Profile",
                        description: "42% revenue growth, 61% EPS growth with expanding margins - rare combination at this scale",
                        icon: "📈"
                  },
                  {
                        title: "Strong Competitive Moat",
                        description: "40% performance advantage, 98% retention rate, and continuous innovation create sustainable edge",
                        icon: "🏰"
                  }
            ],

            topRisks: [
                  {
                        title: "Competitive Intensity",
                        description: "Facing well-funded tech giants with deep pockets and existing customer relationships",
                        icon: "⚔️",
                        severity: "High"
                  },
                  {
                        title: "Valuation Premium",
                        description: "Trading at premium multiples - vulnerable to multiple compression if growth slows",
                        icon: "💰",
                        severity: "Medium"
                  },
                  {
                        title: "Execution Risk",
                        description: "Maintaining innovation pace and operational excellence critical as company scales",
                        icon: "⚠️",
                        severity: "Medium"
                  }
            ]
      },

      // ========== Technical Analysis ==========
      technical: {
            currentPrice: 247,
            trend: "Uptrend",

            supportLevels: [235, 220, 205],
            resistanceLevels: [255, 270, 290],

            performance: {
                  oneYear: 45.2,
                  threeYear: 185.3,
                  fiveYear: 420.5
            },

            indicators: {
                  rsi: 62,
                  macd: { value: 5.2, signal: 3.8, histogram: 1.4 },
                  movingAverages: {
                        ma50: 238,
                        ma200: 215
                  }
            },

            technicalRating: "Buy",
            momentum: "Strong"
      }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
      module.exports = companyData;
}

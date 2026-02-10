// ========================================
// Analyst Orchestrator Module
// Coordinates the 8-agent system
// ========================================

const financialDataAPI = require('./financialData');  // Legacy fallback
const financialDataFMP = require('./financialDataFMP');  // NEW: Primary FMP data source
const newsDataAPI = require('./newsData');


// Import Agents
const financialModeler = require('./agents/financialModeler');
const revenueAnalyst = require('./agents/revenueAnalyst');
const valuationSpecialist = require('./agents/valuationSpecialist');
const moatAnalyst = require('./agents/moatAnalyst');
const technicalAnalyst = require('./agents/technicalAnalyst');
const managementAnalyst = require('./agents/managementAnalyst');
const efficiencyOfficer = require('./agents/efficiencyOfficer'); // NEW
const valuator = require('./agents/valuator'); // NEW
const editorQA = require('./agents/editorQA');

async function generateFullReport(ticker) {
    if (ticker === 'MOCK') {
        console.log(`[Orchestrator] Serving MOCK institutional data...`);
        try {
            const mockData = require('./data/mockInstitutionalData.json');
            return {
                ...mockData,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error("Failed to load mock data:", error.message);
        }
    }

    console.log(`[Orchestrator] Starting multi-agent analysis for ${ticker}...`);

    try {
        // Step 1: Data Gathering (Data Collector role)
        console.log(`[Orchestrator] 📂 Gathering enriched FMP data for ${ticker}...`);

        let companyData;
        let newsData;

        // Try FMP enriched data first
        try {
            companyData = await financialDataFMP.getEnrichedData(ticker);
            console.log(`[Orchestrator] ✅ FMP enriched data complete (source: ${companyData.source})`);
        } catch (fmpError) {
            console.warn(`[Orchestrator] ⚠️ FMP fetch failed, falling back to legacy APIs:`, fmpError.message);
            // Fallback to legacy data sources
            companyData = await financialDataAPI.getCompanyData(ticker);
            console.log(`[Orchestrator] ✅ Legacy data complete (source: ${companyData.source || 'Legacy'})`);
        }

        // Fetch news in parallel (still uses NewsAPI/legacy)
        newsData = await newsDataAPI.getNews(ticker);

        if (!companyData || (!companyData.profile && !companyData.overview)) {
            console.error(`[Orchestrator] ❌ Missing critical company data for ${ticker}. Aborting report generation.`);
            throw new Error(`Critical data missing (Overview/Financials). This usually happens when API limits are hit.`);
        }

        // Normalize data structure (FMP uses 'profile', legacy uses 'overview')
        const overview = companyData.profile || companyData.overview;
        const financials = companyData.ttmFinancials || companyData.financials;

        // Extract technical indicators from FMP prices or legacy data
        const technicalData = companyData.prices ? {
            prices: companyData.prices,
            source: 'FMP'
        } : {
            // Legacy structure - will be handled by technical analyst
            rsi: null,
            sma50: null,
            sma200: null
        };

        // Step 2: Tiered Analyst Execution
        // Tier 1: Data analysis agents (run in parallel)
        console.log(`[Orchestrator] 🚀 Tier 1: Executing Data Analysis Agents...`);

        const tier1Results = await Promise.allSettled([
            financialModeler.analyze(ticker, companyData),
            revenueAnalyst.analyze(ticker, companyData),
            moatAnalyst.analyze(ticker, overview, companyData, []) // Peers can be added later
        ]);
        console.log(`[Orchestrator] ✅ Tier 1 complete.`);

        // Tier 2: Analysis agents (depend on Tier 1, run in parallel)
        console.log(`[Orchestrator] 🚀 Tier 2: Executing Strategic Analysis Agents...`);

        const tier2Results = await Promise.allSettled([
            efficiencyOfficer.analyze(ticker, companyData), // Uses ROIC from keyMetrics
            valuationSpecialist.analyze(ticker, companyData, {
                price: overview.price || overview.analystTargetPrice
            }),
            managementAnalyst.analyze(ticker, companyData, newsData),
            technicalAnalyst.analyze(ticker, technicalData)
        ]);
        console.log(`[Orchestrator] ✅ Tier 2 complete.`);

        // Tier 3: Valuator (depends on Tier 1 + Tier 2 data)
        console.log(`[Orchestrator] 🚀 Tier 3: Executing Valuation Synthesis...`);

        const efficiencyData = tier2Results[0].status === 'fulfilled' ? tier2Results[0].value : null;
        const revenueData = tier1Results[1].status === 'fulfilled' ? tier1Results[1].value : null;

        const valuatorResult = await valuator.analyze(ticker, companyData, efficiencyData, revenueData).catch(err => {
            console.error(`[Valuator] ❌ Failed:`, err.message);
            return { error: 'Valuation analysis failed' };
        });
        console.log(`[Orchestrator] ✅ Tier 3 complete.`);

        // Map all results
        const agentOutputs = {
            financialModeler: tier1Results[0].status === 'fulfilled' ? tier1Results[0].value : { error: 'Analysis failed' },
            revenueAnalyst: tier1Results[1].status === 'fulfilled' ? tier1Results[1].value : { error: 'Analysis failed' },
            moatAnalyst: tier1Results[2].status === 'fulfilled' ? tier1Results[2].value : { error: 'Analysis failed' },
            efficiencyOfficer: tier2Results[0].status === 'fulfilled' ? tier2Results[0].value : { error: 'Analysis failed' }, // NEW
            valuationSpecialist: tier2Results[1].status === 'fulfilled' ? tier2Results[1].value : { error: 'Analysis failed' },
            managementAnalyst: tier2Results[2].status === 'fulfilled' ? tier2Results[2].value : { error: 'Analysis failed' },
            technicalAnalyst: tier2Results[3].status === 'fulfilled' ? tier2Results[3].value : { error: 'Analysis failed' },
            valuator: valuatorResult // NEW
        };

        // Step 3: Final Synthesis (Iterative Editor & QA Master)
        console.log(`[Orchestrator] 📝 Synthesizing final report iteratively...`);

        // 1. Generate Global Thesis
        const thesis = await editorQA.generateThesis(ticker, agentOutputs);

        // 2. Define Report Structure
        const sections = [
            { id: 'executiveSummary', name: 'Executive Summary & Business Strategy' },
            { id: 'revenueAnalysis', name: 'Revenue Quality & Segment Deconstruction' },
            { id: 'financials', name: 'Financial Health & Capital Efficiency' },
            { id: 'competition', name: 'Competitive Moat & Long-Term Durability' },
            { id: 'management', name: 'Management & Governance' },
            { id: 'checklist', name: 'Investment Checklist' },
            { id: 'valuation', name: 'Valuation, DCF Scenarios & Margin of Safety' },
            { id: 'technical', name: 'Technical Analysis & Market Sentiment' },
            { id: 'conclusion', name: 'Final Conclusion & Actionable Recommendation' }
        ];

        const reportContent = {
            thesis: thesis,
            sections: {}
        };

        // 3. Generate all sections in parallel with retry logic
        console.log(`[Orchestrator] 🚀 Starting parallel section generation (${sections.length} sections)...`);

        const sectionGenerationPromises = sections.map(async (section, index) => {
            // Stagger starts by 2.5 seconds each to avoid hitting API rate limits/quotas (increased for reliability)
            await new Promise(resolve => setTimeout(resolve, index * 2500));

            const sectionStartTime = Date.now();
            let attempts = 0;
            const maxRetries = 2;
            let content = null;

            console.log(`[Orchestrator] 📝 Starting section: ${section.name}...`);

            while (attempts <= maxRetries && !content) {
                attempts++;
                try {
                    if (attempts > 1) {
                        console.log(`[Orchestrator] ⚠️  Retry attempt ${attempts}/${maxRetries} for section: ${section.name}`);
                    }

                    content = await editorQA.generateSection(ticker, section.name, thesis, agentOutputs);

                    if (!content || content.trim().length < 100) {
                        throw new Error(`Section content too short (${content?.length || 0} chars)`);
                    }

                    const duration = ((Date.now() - sectionStartTime) / 1000).toFixed(2);
                    const wordCount = content.split(/\s+/).length;

                    console.log(`[Orchestrator] ✅ Section "${section.name}" completed in ${duration}s (${wordCount} words)`);

                    return {
                        sectionId: section.id,
                        content: content,
                        metrics: {
                            section: section.name,
                            duration: duration,
                            wordCount: wordCount,
                            attempts: attempts,
                            success: true
                        }
                    };

                } catch (err) {
                    console.error(`[Orchestrator] ❌ Error generating section "${section.name}" (attempt ${attempts}):`, err.message);

                    if (attempts > maxRetries) {
                        content = `[Section generation failed after ${maxRetries} retries. Error: ${err.message}]\n\nPossible cause: API limit reached or safety filter. Please regenerate this report in 1-2 minutes.`;

                        console.error(`[Orchestrator] 🚨 CRITICAL: Section "${section.name}" failed permanently.`);

                        return {
                            sectionId: section.id,
                            content: content,
                            metrics: {
                                section: section.name,
                                duration: ((Date.now() - sectionStartTime) / 1000).toFixed(2),
                                wordCount: 0,
                                attempts: attempts,
                                success: false,
                                error: err.message
                            }
                        };
                    } else {
                        const waitTime = Math.pow(2, attempts) * 1000;
                        console.log(`[Orchestrator] ⏳ Waiting ${waitTime}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                }
            }
        });

        // Wait for all sections to complete in parallel
        const parallelStartTime = Date.now();
        const sectionResults = await Promise.allSettled(sectionGenerationPromises);
        const parallelDuration = ((Date.now() - parallelStartTime) / 1000).toFixed(2);

        console.log(`[Orchestrator] ⚡ All sections completed in ${parallelDuration}s (parallel execution)`);

        // Process results
        const sectionMetrics = [];
        sectionResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                const { sectionId, content, metrics } = result.value;
                reportContent.sections[sectionId] = content;
                sectionMetrics.push(metrics);
            } else {
                const section = sections[index];
                console.error(`[Orchestrator] 🚨 Section "${section.name}" promise rejected:`, result.reason);
                reportContent.sections[section.id] = `[Section generation failed: ${result.reason?.message || 'Unknown error'}]`;
                sectionMetrics.push({
                    section: section.name,
                    duration: '0',
                    wordCount: 0,
                    attempts: 0,
                    success: false,
                    error: result.reason?.message || 'Promise rejected'
                });
            }
        });

        const totalGenerationTime = sectionMetrics.reduce((sum, m) => sum + parseFloat(m.duration), 0).toFixed(2);
        const totalWords = sectionMetrics.reduce((sum, m) => sum + m.wordCount, 0);

        console.log(`[Orchestrator] 🎉 Report generation complete!`);
        console.log(`[Orchestrator] 📈 Total time: ${totalGenerationTime}s | Total words: ${totalWords}`);
        console.log(`[Orchestrator] 📊 Section breakdown:`, sectionMetrics);

        // 4. Assemble high-level headers
        const currentPrice = parseFloat(overview.analystTargetPrice) || 0;
        const targetPrice = agentOutputs.valuator?.targetPrice || 0;
        const upside = currentPrice > 0 ? `${(((targetPrice - currentPrice) / currentPrice) * 100).toFixed(1)}%` : "0%";

        console.log(`[Orchestrator] 🎯 Target Price: ${targetPrice}, Current: ${currentPrice}, Upside: ${upside}`);

        const result = {
            header: {
                ticker: ticker,
                companyName: overview.Name || ticker,
                rating: agentOutputs.valuator?.recommendation || "Hold",
                targetPrice: targetPrice,
                currentPrice: currentPrice,
                upside: upside,
                marketCap: `${(parseFloat(overview.MarketCapitalization) / 1e9).toFixed(2)}B`
            },
            ...reportContent.sections, // Spread sections (executiveSummary, etc) to top level
            thesis: reportContent.thesis,
            sections: reportContent.sections, // Keep for legacy/deep-dive access
            rawAgentOutputs: agentOutputs,
            metadata: {
                timestamp: new Date().toISOString(),
                generationTime: totalGenerationTime,
                totalWords: totalWords,
                sectionMetrics: sectionMetrics,
                parallelExecutionTime: parallelDuration
            }
        };

        console.log(`[Orchestrator] 📤 Final Report Keys:`, Object.keys(result));
        return result;

    } catch (error) {
        console.error(`[Orchestrator] Critical Error:`, error.message);
        throw error;
    }
}

module.exports = {
    generateFullReport
};

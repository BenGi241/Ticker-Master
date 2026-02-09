// ========================================
// Analyst Orchestrator Module
// Coordinates the 8-agent system
// ========================================

const financialDataAPI = require('./financialData');
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
        // Gather all necessary data in parallel to feed the agents
        const [companyData, newsData, insiderData, technicalData] = await Promise.all([
            financialDataAPI.getCompanyData(ticker),
            newsDataAPI.getNews(ticker),
            financialDataAPI.getInsiderTransactions(ticker),
            financialDataAPI.getTechnicalIndicators(ticker)
        ]);

        const { overview, financials } = companyData;

        // Step 2: Tiered Analyst Execution
        // Tier 1: Data analysis agents (run in parallel)
        console.log(`[Orchestrator] Tier 1: Data gathering agents...`);

        const tier1Results = await Promise.allSettled([
            financialModeler.analyze(ticker, companyData),
            revenueAnalyst.analyze(ticker, overview, financials, newsData),
            moatAnalyst.analyze(ticker, overview, companyData, []) // Peers can be added later
        ]);

        // Tier 2: Analysis agents (depend on Tier 1, run in parallel)
        console.log(`[Orchestrator] Tier 2: Analysis agents...`);

        const tier2Results = await Promise.allSettled([
            efficiencyOfficer.analyze(ticker, companyData), // NEW: Uses ROIC data
            valuationSpecialist.analyze(ticker, companyData, { price: overview.analystTargetPrice }),
            managementAnalyst.analyze(ticker, insiderData, overview),
            technicalAnalyst.analyze(ticker, technicalData)
        ]);

        // Tier 3: Valuator (depends on Tier 1 + Tier 2 data)
        console.log(`[Orchestrator] Tier 3: Valuation synthesis...`);

        const efficiencyData = tier2Results[0].status === 'fulfilled' ? tier2Results[0].value : null;
        const revenueData = tier1Results[1].status === 'fulfilled' ? tier1Results[1].value : null;

        const valuatorResult = await valuator.analyze(ticker, companyData, efficiencyData, revenueData).catch(err => {
            console.error(`[Valuator] Failed:`, err.message);
            return { error: 'Valuation analysis failed' };
        });

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
        console.log(`[Orchestrator] Synthesizing final report iteratively...`);

        // 1. Generate Global Thesis
        const thesis = await editorQA.generateThesis(ticker, agentOutputs);

        // 2. Define Report Structure
        const sections = [
            { id: 'executiveSummary', name: 'Executive Summary & Business Strategy' },
            { id: 'revenueQuality', name: 'Revenue Quality & Segment Deconstruction' },
            { id: 'financialHealth', name: 'Financial Health & Capital Efficiency' },
            { id: 'competitiveMoat', name: 'Competitive Moat & Long-Term Durability' },
            { id: 'valuation', name: 'Valuation, DCF Scenarios & Margin of Safety' },
            { id: 'technicalSignals', name: 'Technical Analysis & Market Sentiment' },
            { id: 'conclusion', name: 'Final Conclusion & Actionable Recommendation' }
        ];

        const reportContent = {
            thesis: thesis,
            sections: {}
        };

        // 3. Generate each section in sequence to maintain focus and depth
        for (const section of sections) {
            console.log(`[Orchestrator] Generating section: ${section.name}...`);
            const content = await editorQA.generateSection(ticker, section.name, thesis, agentOutputs);
            reportContent.sections[section.id] = content;
        }

        // 4. Assemble high-level headers
        const header = {
            ticker: ticker,
            companyName: overview.Name || ticker,
            rating: agentOutputs.valuator?.recommendation || "Hold",
            targetPrice: agentOutputs.valuator?.targetPrice || 0,
            currentPrice: overview.analystTargetPrice || 0, // Fallback
            marketCap: `${(parseFloat(overview.MarketCapitalization) / 1e9).toFixed(2)}B`
        };

        return {
            header,
            ...reportContent,
            rawAgentOutputs: agentOutputs,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error(`[Orchestrator] Critical Error:`, error.message);
        throw error;
    }
}

module.exports = {
    generateFullReport
};

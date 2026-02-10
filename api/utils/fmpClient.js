const axios = require('axios');

const FMP_KEY = process.env.FMP_API_KEY;
const FMP_BASE = 'https://financialmodelingprep.com/api/v3';

/**
 * fmpClient Utility
 * Provides centralized access to Financial Modeling Prep API
 */
const fmpClient = {
    async _fetch(endpoint, params = {}) {
        if (!FMP_KEY) {
            console.warn(`[FMP] API Key missing for endpoint: ${endpoint}`);
            return null;
        }

        try {
            console.log(`[FMP] 📡 Fetching: ${endpoint}...`);
            const response = await axios.get(`${FMP_BASE}/${endpoint}`, {
                params: { ...params, apikey: FMP_KEY }
            });
            console.log(`[FMP] ✅ Received: ${endpoint}`);
            return response.data;
        } catch (error) {
            console.error(`[FMP] ❌ API Error (${endpoint}):`, error.message);
            return null;
        }
    },

    async getKeyMetrics(ticker) {
        console.log(`[fmpClient] 📊 Getting key metrics for ${ticker}`);
        return this._fetch(`key-metrics/${ticker}`, { limit: 5 });
    },

    async getRatios(ticker) {
        console.log(`[fmpClient] 📈 Getting financial ratios for ${ticker}`);
        return this._fetch(`ratios/${ticker}`, { limit: 5 });
    },

    async getEnterpriseValue(ticker) {
        console.log(`[fmpClient] 💰 Getting enterprise value for ${ticker}`);
        return this._fetch(`enterprise-values/${ticker}`, { limit: 5 });
    },

    async getDCF(ticker) {
        console.log(`[fmpClient] 💎 Getting DCF valuation for ${ticker}`);
        return this._fetch(`discounted-cash-flow/${ticker}`);
    },

    async getInsiderTrading(ticker) {
        console.log(`[fmpClient] 🕵️ Getting insider trading for ${ticker}`);
        return this._fetch(`insider-trading/${ticker}`, { limit: 20 });
    },

    async getTranscript(ticker) {
        console.log(`[fmpClient] 🎙️ Getting latest earnings transcript for ${ticker}`);
        const result = await this._fetch(`earning_call_transcript/${ticker}`, { limit: 1 });
        return result && result[0];
    },

    async getInstitutionalHolders(ticker) {
        console.log(`[fmpClient] 🏦 Getting institutional holders for ${ticker}`);
        return this._fetch(`institutional-holder/${ticker}`);
    },

    async getPeerGroups(ticker) {
        console.log(`[fmpClient] 👥 Getting peer groups for ${ticker}`);
        return this._fetch(`stock_peers`, { symbol: ticker });
    },

    async getIncomeStatement(ticker, period = 'annual') {
        console.log(`[fmpClient] 📄 Getting income statement for ${ticker}`);
        return this._fetch(`income-statement/${ticker}`, { period, limit: 5 });
    },

    async getBalanceSheet(ticker, period = 'annual') {
        console.log(`[fmpClient] 📄 Getting balance sheet for ${ticker}`);
        return this._fetch(`balance-sheet-statement/${ticker}`, { period, limit: 5 });
    },

    async getCashFlow(ticker, period = 'annual') {
        console.log(`[fmpClient] 📄 Getting cash flow statement for ${ticker}`);
        return this._fetch(`cash-flow-statement/${ticker}`, { period, limit: 5 });
    },

    async getIndicator(ticker, indicator, period = 14) {
        console.log(`[fmpClient] 📉 Getting technical indicator (${indicator}) for ${ticker}`);
        const v4Base = 'https://financialmodelingprep.com/api/v4';
        try {
            console.log(`[FMP] 📡 Fetching Technical: ${indicator}...`);
            const response = await axios.get(`${v4Base}/technical_indicator/daily/${ticker}`, {
                params: { type: indicator, period, apikey: FMP_KEY }
            });
            console.log(`[FMP] ✅ Received Technical: ${indicator}`);
            return response.data;
        } catch (error) {
            console.error(`[FMP] ❌ Technical Indicator Error (${indicator}):`, error.message);
            return null;
        }
    },

    async getRatiosTTM(ticker) {
        console.log(`[fmpClient] 📊 Getting TTM ratios for ${ticker}`);
        return this._fetch(`ratios-ttm/${ticker}`);
    },

    async getKeyMetricsTTM(ticker) {
        console.log(`[fmpClient] 🔑 Getting TTM key metrics for ${ticker}`);
        return this._fetch(`key-metrics-ttm/${ticker}`);
    },

    async getAnalystEstimates(ticker) {
        console.log(`[fmpClient] 🔮 Getting analyst estimates for ${ticker}`);
        return this._fetch(`analyst-estimates/${ticker}`);
    },

    async getTreasuryRates(from, to) {
        console.log(`[fmpClient] 🏦 Getting treasury rates from ${from} to ${to}`);
        return this._fetch(`treasury`, { from, to });
    },

    async getHistoricalPrices(ticker, days = 300) {
        console.log(`[fmpClient] 📈 Getting ${days} days of historical prices for ${ticker}`);
        return this._fetch(`historical-price-full/${ticker}`, { timeseries: days });
    },

    async getProductSegments(ticker) {
        console.log(`[fmpClient] 🧩 Getting product segmentation for ${ticker}`);
        const v4Base = 'https://financialmodelingprep.com/api/v4';
        try {
            console.log(`[FMP] 📡 Fetching product segments...`);
            const response = await axios.get(`${v4Base}/revenue-product-segmentation`, {
                params: { symbol: ticker, structure: 'flat', apikey: FMP_KEY }
            });
            console.log(`[FMP] ✅ Received product segments`);
            return response.data;
        } catch (error) {
            console.error(`[FMP] ❌ Product Segments Error:`, error.message);
            return null;
        }
    },

    async getGeographicSegments(ticker) {
        console.log(`[fmpClient] 🌍 Getting geographic segmentation for ${ticker}`);
        const v4Base = 'https://financialmodelingprep.com/api/v4';
        try {
            console.log(`[FMP] 📡 Fetching geographic segments...`);
            const response = await axios.get(`${v4Base}/revenue-geographic-segmentation`, {
                params: { symbol: ticker, structure: 'flat', apikey: FMP_KEY }
            });
            console.log(`[FMP] ✅ Received geographic segments`);
            return response.data;
        } catch (error) {
            console.error(`[FMP] ❌ Geographic Segments Error:`, error.message);
            return null;
        }
    }
};

module.exports = fmpClient;

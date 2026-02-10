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
            const response = await axios.get(`${FMP_BASE}/${endpoint}`, {
                params: { ...params, apikey: FMP_KEY }
            });
            return response.data;
        } catch (error) {
            console.error(`[FMP] API Error (${endpoint}):`, error.message);
            return null;
        }
    },

    async getKeyMetrics(ticker) {
        return this._fetch(`key-metrics/${ticker}`, { limit: 5 });
    },

    async getRatios(ticker) {
        return this._fetch(`ratios/${ticker}`, { limit: 5 });
    },

    async getEnterpriseValue(ticker) {
        return this._fetch(`enterprise-values/${ticker}`, { limit: 5 });
    },

    async getDCF(ticker) {
        return this._fetch(`discounted-cash-flow/${ticker}`);
    },

    async getInsiderTrading(ticker) {
        return this._fetch(`insider-trading/${ticker}`, { limit: 20 });
    },

    async getTranscript(ticker) {
        const result = await this._fetch(`earning_call_transcript/${ticker}`, { limit: 1 });
        return result && result[0];
    },

    async getInstitutionalHolders(ticker) {
        return this._fetch(`institutional-holder/${ticker}`);
    },

    async getPeerGroups(ticker) {
        return this._fetch(`stock_peers`, { symbol: ticker });
    },

    async getIncomeStatement(ticker, period = 'annual') {
        return this._fetch(`income-statement/${ticker}`, { period, limit: 5 });
    },

    async getBalanceSheet(ticker, period = 'annual') {
        return this._fetch(`balance-sheet-statement/${ticker}`, { period, limit: 5 });
    },

    async getCashFlow(ticker, period = 'annual') {
        return this._fetch(`cash-flow-statement/${ticker}`, { period, limit: 5 });
    },

    async getIndicator(ticker, indicator, period = 14) {
        const v4Base = 'https://financialmodelingprep.com/api/v4';
        try {
            const response = await axios.get(`${v4Base}/technical_indicator/daily/${ticker}`, {
                params: { type: indicator, period, apikey: FMP_KEY }
            });
            return response.data;
        } catch (error) {
            console.error(`[FMP] Technical Indicator Error (${indicator}):`, error.message);
            return null;
        }
    }
};

module.exports = fmpClient;

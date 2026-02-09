import axios from 'axios';

const api = axios.create({
      baseURL: '/api'
});

export const fetchCompanyData = async (ticker) => {
      const response = await api.get(`/company/${ticker}`);
      return response.data;
};

export const fetchQuote = async (ticker) => {
      const response = await api.get(`/quote/${ticker}`);
      return response.data;
};

export const fetchNews = async (ticker) => {
      const response = await api.get(`/news/${ticker}?limit=20`);
      return response.data;
};

export const fetchInsiders = async (ticker) => {
      const response = await api.get(`/insiders/${ticker}`);
      return response.data;
};

export const fetchAIAnalysis = async (ticker) => {
      const response = await api.post(`/analyze/full/${ticker}`);
      return response.data;
};

export const analyzeSection = async (ticker, section, financialData, newsData) => {
      const response = await api.post(`/analyze/${ticker}`, {
            section,
            financialData,
            newsData
      });
      return response.data;
};

export const fetchSECData = async (cik) => {
      const response = await api.get(`/sec/facts/${cik}`);
      return response.data;
};

export const analyzeCompany = async (ticker) => {
      // 1. Fetch AI Analysis (Critical)
      let aiAnalysis = null;
      try {
            aiAnalysis = await fetchAIAnalysis(ticker);
      } catch (error) {
            console.error("AI Analysis failed:", error);
            aiAnalysis = { error: "AI Analysis unavailable", details: error.response?.data?.error || error.message };
      }

      // 2. Fetch Company Data (Critical)
      let companyData = null;
      try {
            companyData = await fetchCompanyData(ticker);
      } catch (error) {
            console.error("Company Data fetch failed:", error);
            companyData = { name: ticker, description: "Data unavailable" };
      }

      // 3. Fetch Quote (Non-Critical, often hits limits)
      let quote = null;
      try {
            quote = await fetchQuote(ticker);
      } catch (error) {
            console.warn("Quote fetch failed:", error);
            quote = { error: "Quote unavailable", details: error.response?.data?.error || error.message };
      }

      // If everything failed, throw error to UI
      if (!aiAnalysis && !companyData && !quote) {
            throw new Error("All data sources failed. Please check ticker or try again later.");
      }

      return {
            ...companyData,
            quote,
            ai: aiAnalysis,
            timestamp: new Date().toISOString()
      };
};


export default {
      fetchCompanyData,
      fetchQuote,
      fetchNews,
      fetchInsiders,
      fetchAIAnalysis,
      analyzeSection,
      fetchSECData,
      analyzeCompany
};

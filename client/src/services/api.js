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

export const fetchAIAnalysis = async (ticker, financialData, newsData) => {
      const response = await api.post(`/analyze/full/${ticker}`, {
            financialData,
            newsData
      });
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
      // Fetch all data in parallel (with error handling)
      const results = await Promise.allSettled([
            fetchCompanyData(ticker),
            fetchQuote(ticker),
            fetchNews(ticker),
            fetchInsiders(ticker)
      ]);

      const companyData = results[0].status === 'fulfilled' ? results[0].value : { overview: { name: ticker, ticker: ticker } };
      const quote = results[1].status === 'fulfilled' ? results[1].value : { price: 0, changePercent: 0 };
      const newsData = results[2].status === 'fulfilled' ? results[2].value : { articles: [], sentiment: { score: 0, label: 'Neutral' } };
      const insiderData = results[3].status === 'fulfilled' ? results[3].value : { transactions: [] };

      // Log errors if any
      results.forEach((res, index) => {
            if (res.status === 'rejected') {
                  console.warn(`API call ${index} failed:`, res.reason);
            }
      });

      // Generate AI analysis (if company data is available)
      let aiAnalysis = {};
      try {
            if (results[0].status === 'fulfilled') {
                  aiAnalysis = await fetchAIAnalysis(ticker, companyData, newsData);
            }
      } catch (e) {
            console.error("AI Analysis failed:", e);
      }

      return {
            ...companyData,
            quote,
            news: newsData,
            insiders: insiderData,
            ai: aiAnalysis
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

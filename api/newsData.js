// ========================================
// News Data API Module
// Integrates NewsAPI for company news
// ========================================

const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = 'https://newsapi.org/v2';

// ========== News API Functions ==========

async function getNews(ticker, options = {}) {
      try {
            const { limit = 20, sources } = options;

            // Get company name for better search results
            // In production, you'd fetch this from your company data
            const searchQuery = ticker;

            // Build sources parameter
            let sourcesParam = null;
            if (sources && sources !== 'all') {
                  // Map friendly names to NewsAPI source IDs
                  const sourceMap = {
                        'wsj': 'the-wall-street-journal',
                        'yahoo': 'yahoo-finance', // Note: May not be available in free tier
                        'bloomberg': 'bloomberg',
                        'cnbc': 'cnbc',
                        'reuters': 'reuters',
                        'ft': 'financial-times'
                  };

                  const sourceList = sources.split(',').map(s => sourceMap[s.trim()] || s.trim());
                  sourcesParam = sourceList.join(',');
            }

            // Calculate date range (last 30 days)
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 30);

            const params = {
                  q: searchQuery,
                  from: fromDate.toISOString().split('T')[0],
                  to: toDate.toISOString().split('T')[0],
                  language: 'en',
                  sortBy: 'relevancy',
                  pageSize: Math.min(limit, 100), // NewsAPI max is 100
                  apiKey: NEWS_API_KEY
            };

            if (sourcesParam) {
                  params.sources = sourcesParam;
                  delete params.q; // Can't use both sources and q parameters
            }

            const response = await axios.get(`${NEWS_API_BASE}/everything`, { params });

            if (response.data.status !== 'ok') {
                  throw new Error(response.data.message || 'Failed to fetch news');
            }

            // Format articles
            const articles = response.data.articles.map(article => ({
                  title: article.title,
                  description: article.description,
                  url: article.url,
                  source: article.source.name,
                  author: article.author,
                  publishedAt: article.publishedAt,
                  urlToImage: article.urlToImage,
                  content: article.content
            }));

            // Simple sentiment analysis based on keywords
            const sentimentKeywords = {
                  positive: ['growth', 'profit', 'gain', 'surge', 'beat', 'exceed', 'strong', 'bullish', 'upgrade', 'buy', 'outperform'],
                  negative: ['loss', 'decline', 'fall', 'drop', 'miss', 'weak', 'bearish', 'downgrade', 'sell', 'underperform', 'concern']
            };

            let positiveCount = 0;
            let negativeCount = 0;

            articles.forEach(article => {
                  const text = `${article.title} ${article.description}`.toLowerCase();

                  sentimentKeywords.positive.forEach(keyword => {
                        if (text.includes(keyword)) positiveCount++;
                  });

                  sentimentKeywords.negative.forEach(keyword => {
                        if (text.includes(keyword)) negativeCount++;
                  });
            });

            const totalSentiment = positiveCount + negativeCount;
            const sentimentScore = totalSentiment > 0
                  ? ((positiveCount - negativeCount) / totalSentiment) * 100
                  : 0;

            return {
                  articles,
                  totalResults: response.data.totalResults,
                  sentiment: {
                        score: sentimentScore,
                        positive: positiveCount,
                        negative: negativeCount,
                        neutral: articles.length - positiveCount - negativeCount,
                        label: sentimentScore > 20 ? 'Positive' : sentimentScore < -20 ? 'Negative' : 'Neutral'
                  },
                  timestamp: new Date().toISOString()
            };

      } catch (error) {
            // Handle rate limiting gracefully
            if (error.response?.status === 429) {
                  throw new Error('News API rate limit exceeded. Please try again later.');
            }

            // Handle missing API key
            if (error.response?.status === 401) {
                  console.warn('News API key not configured or invalid');
                  return {
                        articles: [],
                        totalResults: 0,
                        sentiment: { score: 0, positive: 0, negative: 0, neutral: 0, label: 'Neutral' },
                        error: 'News API not configured',
                        timestamp: new Date().toISOString()
                  };
            }

            throw new Error(`Failed to fetch news: ${error.message}`);
      }
}

// Alternative: Fetch news from multiple sources (fallback)
async function getNewsMultiSource(ticker, companyName) {
      try {
            // This is a fallback that could scrape or use alternative APIs
            // For now, we'll return empty with a note
            console.warn('Multi-source news fetching not implemented yet');

            return {
                  articles: [],
                  totalResults: 0,
                  sentiment: { score: 0, positive: 0, negative: 0, neutral: 0, label: 'Neutral' },
                  note: 'Using primary news source only',
                  timestamp: new Date().toISOString()
            };
      } catch (error) {
            throw new Error(`Failed to fetch multi-source news: ${error.message}`);
      }
}

module.exports = {
      getNews,
      getNewsMultiSource
};

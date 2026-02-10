// ========================================
// Express Server for Financial Analysis API
// ========================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const axios = require('axios');

// Import API modules
const financialDataAPI = require('./api/financialData');
const newsDataAPI = require('./api/newsData');
const geminiAnalysisAPI = require('./api/geminiAnalysis');
const analystOrchestrator = require('./api/analystOrchestrator');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize cache
const cache = new NodeCache({
      stdTTL: 3600, // Default 1 hour
      checkperiod: 120 // Check for expired keys every 2 minutes
});

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/dist')));

// Logging middleware
app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
});

// ========== API Routes ==========

// Health check
app.get('/api/health', (req, res) => {
      res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            cache: {
                  keys: cache.keys().length,
                  stats: cache.getStats()
            }
      });
});

// Get company overview and financial data
app.get('/api/company/:ticker', async (req, res) => {
      try {
            const { ticker } = req.params;
            const cacheKey = `company:${ticker.toUpperCase()}`;

            // Check cache
            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                  console.log(`Cache hit for ${cacheKey}`);
                  return res.json({ ...cachedData, cached: true });
            }

            console.log(`Fetching company data for ${ticker}...`);
            const data = await financialDataAPI.getCompanyData(ticker);

            // Store in cache
            cache.set(cacheKey, data, parseInt(process.env.CACHE_FINANCIAL_DATA) || 3600);

            res.json({ ...data, cached: false });
      } catch (error) {
            console.error('Error fetching company data:', error.message);

            // Check for API limits
            const isLimit = error.message.includes('API limit');
            const statusCode = isLimit ? 429 : (error.response?.status || 500);

            res.status(statusCode).json({
                  error: error.message,
                  details: error.response?.data || (isLimit ? 'Alpha Vantage API rate limit reached. Please try again in 1 minute.' : 'Failed to fetch company data')
            });
      }
});

// Get real-time quote
app.get('/api/quote/:ticker', async (req, res) => {
      try {
            const { ticker } = req.params;
            const cacheKey = `quote:${ticker.toUpperCase()}`;

            // Check cache (shorter TTL for quotes)
            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                  console.log(`Cache hit for ${cacheKey}`);
                  return res.json({ ...cachedData, cached: true });
            }

            console.log(`Fetching quote for ${ticker}...`);
            const data = await financialDataAPI.getQuote(ticker);

            // Store in cache with shorter TTL
            cache.set(cacheKey, data, parseInt(process.env.CACHE_QUOTE_DATA) || 300);

            res.json({ ...data, cached: false });
      } catch (error) {
            console.error('Error fetching quote:', error.message);

            // Check for API limits
            const isLimit = error.message.includes('API limit');
            const statusCode = isLimit ? 429 : (error.response?.status || 500);

            res.status(statusCode).json({
                  error: error.message,
                  details: isLimit ? 'Alpha Vantage API rate limit reached. Please try again in 1 minute.' : 'Failed to fetch quote data'
            });
      }
});

// Get insider transactions
app.get('/api/insiders/:ticker', async (req, res) => {
      try {
            const { ticker } = req.params;
            const cacheKey = `insiders:${ticker.toUpperCase()}`;

            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                  return res.json({ ...cachedData, cached: true });
            }

            console.log(`Fetching insider data for ${ticker}...`);
            const data = await financialDataAPI.getInsiderTransactions(ticker);

            cache.set(cacheKey, data, parseInt(process.env.CACHE_FINANCIAL_DATA) || 3600);

            res.json({ ...data, cached: false });
      } catch (error) {
            console.error('Error fetching insider data:', error.message);
            res.status(500).json({
                  error: error.message,
                  details: 'Failed to fetch insider transaction data'
            });
      }
});

// Get news articles
app.get('/api/news/:ticker', async (req, res) => {
      try {
            const { ticker } = req.params;
            const { limit = 20, sources } = req.query;
            const cacheKey = `news:${ticker.toUpperCase()}:${limit}:${sources || 'all'}`;

            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                  console.log(`Cache hit for ${cacheKey}`);
                  return res.json({ ...cachedData, cached: true });
            }

            console.log(`Fetching news for ${ticker}...`);
            const data = await newsDataAPI.getNews(ticker, { limit, sources });

            cache.set(cacheKey, data, parseInt(process.env.CACHE_NEWS_DATA) || 900);

            res.json({ ...data, cached: false });
      } catch (error) {
            console.error('Error fetching news:', error.message);
            res.status(500).json({
                  error: error.message,
                  details: 'Failed to fetch news data'
            });
      }
});

// Generate AI analysis for specific section
app.post('/api/analyze/:ticker', async (req, res) => {
      try {
            const { ticker } = req.params;
            const { section, financialData, newsData } = req.body;

            if (!section) {
                  return res.status(400).json({ error: 'Section parameter required' });
            }

            const cacheKey = `analysis:${ticker.toUpperCase()}:${section}`;

            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                  console.log(`Cache hit for ${cacheKey}`);
                  return res.json({ ...cachedData, cached: true });
            }

            console.log(`Generating AI analysis for ${ticker} - ${section}...`);
            const data = await geminiAnalysisAPI.analyzeSection(ticker, section, financialData, newsData);

            cache.set(cacheKey, data, parseInt(process.env.CACHE_AI_ANALYSIS) || 7200);

            res.json({ ...data, cached: false });
      } catch (error) {
            console.error('Error generating analysis:', error.message);
            res.status(500).json({
                  error: error.message,
                  details: 'Failed to generate AI analysis'
            });
      }
});

// Generate full AI analysis for all sections (Multi-Agent System)
app.post('/api/analyze/full/:ticker', async (req, res) => {
      try {
            const { ticker } = req.params;
            const cacheKey = `analysis:${ticker.toUpperCase()}:full_v2`;

            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                  console.log(`Cache hit for ${cacheKey}`);
                  return res.json({ ...cachedData, cached: true });
            }

            const data = await analystOrchestrator.generateFullReport(ticker);

            cache.set(cacheKey, data, parseInt(process.env.CACHE_AI_ANALYSIS) || 7200);

            res.json({ ...data, cached: false });
      } catch (error) {
            console.error('Error generating full analysis:', error.message);
            res.status(500).json({
                  error: error.message,
                  details: 'Failed to generate full multi-agent AI analysis'
            });
      }
});

// Clear cache endpoint (for development)
app.post('/api/cache/clear', (req, res) => {
      const { ticker, type } = req.body;

      if (ticker) {
            const pattern = `${type || '*'}:${ticker.toUpperCase()}`;
            const keys = cache.keys().filter(key => key.includes(pattern));
            cache.del(keys);
            res.json({ message: `Cleared ${keys.length} cache entries for ${ticker}`, keys });
      } else {
            cache.flushAll();
            res.json({ message: 'All cache cleared' });
      }
});

// ========== SEC API Proxy Routes ==========

// Get SEC Tickers
app.get('/api/sec/tickers', async (req, res) => {
      try {
            const cacheKey = 'sec:tickers';
            const cachedData = cache.get(cacheKey);
            if (cachedData) return res.json(cachedData);

            const response = await axios.get('https://www.sec.gov/files/company_tickers.json', {
                  headers: { 'User-Agent': 'FinancialAnalystApp/1.0 (financial.analyst@example.com)' }
            });

            cache.set(cacheKey, response.data, 86400); // Cache for 24 hours
            res.json(response.data);
      } catch (error) {
            console.error('Error fetching SEC tickers:', error.message);
            res.status(500).json({ error: 'Failed to fetch SEC tickers' });
      }
});

// Get SEC Company Facts
app.get('/api/sec/facts/:cik', async (req, res) => {
      try {
            const { cik } = req.params;
            const cacheKey = `sec:facts:${cik}`;
            const cachedData = cache.get(cacheKey);
            if (cachedData) return res.json(cachedData);

            const response = await axios.get(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
                  headers: { 'User-Agent': 'FinancialAnalystApp/1.0 (financial.analyst@example.com)' }
            });

            cache.set(cacheKey, response.data, 3600); // Cache for 1 hour
            res.json(response.data);
      } catch (error) {
            console.error(`Error fetching SEC facts for ${req.params.cik}:`, error.message);
            res.status(500).json({ error: 'Failed to fetch SEC company facts' });
      }
});

// Error handling middleware
app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
            error: 'Internal server error',
            message: err.message
      });
});

// 404 handler for API routes
app.use('/api', (req, res) => {
      res.status(404).json({
            error: 'Not found',
            path: req.path
      });
});

// For all other routes, serve index.html
app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║  Financial Analysis API Server                         ║
║  Running on: http://localhost:${PORT}                     ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  Cache enabled: ${cache.keys().length} keys                            ║
╚════════════════════════════════════════════════════════╝
  `);

      // Check for API keys
      const requiredKeys = ['ALPHA_VANTAGE_API_KEY', 'GEMINI_API_KEY'];
      const missingKeys = requiredKeys.filter(key => !process.env[key]);

      if (missingKeys.length > 0) {
            console.warn('\n⚠️  WARNING: Missing API keys:');
            missingKeys.forEach(key => console.warn(`   - ${key}`));
            console.warn('   Please add them to your .env file\n');
      } else {
            console.log('✅ All required API keys configured\n');
      }
});

module.exports = app;

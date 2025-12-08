# API Setup Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- API keys for the following services (all have free tiers)

## 🔑 Getting Your API Keys

### 1. Alpha Vantage (Financial Data)
1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter your email
3. Click "GET FREE API KEY"
4. Copy your API key
5. **Free Tier**: 25 requests/day, 5 requests/minute

### 2. Finnhub (Supplementary Financial Data)
1. Visit: https://finnhub.io/register
2. Sign up with email
3. Verify your email
4. Go to Dashboard → API Keys
5. Copy your API key
6. **Free Tier**: 60 calls/minute

### 3. NewsAPI (News Articles)
1. Visit: https://newsapi.org/register
2. Sign up with email
3. Verify your email
4. Copy your API key from the dashboard
5. **Free Tier**: 100 requests/day (developer plan)

### 4. Google Gemini API (AI Analysis)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy your API key
6. **Free Tier**: 60 requests/minute

## ⚙️ Installation Steps

### 1. Install Dependencies

```bash
cd "/Users/bengilad/Desktop/Programming/Military form AI/Financial Analyst"
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `axios` - HTTP client for API requests
- `node-cache` - In-memory caching
- `@google/generative-ai` - Gemini AI SDK

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# API Keys
ALPHA_VANTAGE_API_KEY=your_actual_alpha_vantage_key
FINNHUB_API_KEY=your_actual_finnhub_key
NEWS_API_KEY=your_actual_news_api_key
GEMINI_API_KEY=your_actual_gemini_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Cache Configuration (in seconds)
CACHE_FINANCIAL_DATA=3600
CACHE_NEWS_DATA=900
CACHE_AI_ANALYSIS=7200
CACHE_QUOTE_DATA=300
```

### 3. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:

```
╔════════════════════════════════════════════════════════╗
║  Financial Analysis API Server                         ║
║  Running on: http://localhost:3000                     ║
║  Environment: development                              ║
║  Cache enabled: 0 keys                                 ║
╚════════════════════════════════════════════════════════╝

✅ All required API keys configured
```

### 4. Open the Frontend

In a **separate terminal**, serve the frontend:

```bash
cd "/Users/bengilad/Desktop/Programming/Military form AI/Financial Analyst"
python3 -m http.server 8000
```

Then open your browser to: http://localhost:8000

## 🧪 Testing the API

### Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

### Test Company Data

```bash
curl http://localhost:3000/api/company/AAPL
```

### Test Quote Data

```bash
curl http://localhost:3000/api/quote/AAPL
```

### Test News Data

```bash
curl http://localhost:3000/api/news/AAPL
```

## ⚠️ Troubleshooting

### "API rate limit exceeded"
- **Alpha Vantage**: Limited to 25 requests/day on free tier
- **Solution**: Wait 24 hours or upgrade to premium tier
- **Workaround**: Use caching (already implemented)

### "News API key not configured"
- **Cause**: Missing or invalid NEWS_API_KEY
- **Solution**: Check your `.env` file and verify the API key

### "Gemini API error"
- **Cause**: Invalid API key or quota exceeded
- **Solution**: Verify your Gemini API key and check quotas in Google Cloud Console

### "Company not found"
- **Cause**: Invalid ticker symbol
- **Solution**: Use valid ticker symbols (e.g., AAPL, MSFT, GOOGL)

### Port 3000 already in use
- **Solution**: Change PORT in `.env` file to another port (e.g., 3001)

## 📊 API Rate Limits Summary

| Service | Free Tier Limit | Caching Duration |
|---------|----------------|------------------|
| Alpha Vantage | 25 req/day | 1 hour |
| Finnhub | 60 req/min | 1 hour |
| NewsAPI | 100 req/day | 15 minutes |
| Gemini AI | 60 req/min | 2 hours |

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure API keys
3. ✅ Start backend server
4. ⏭️ Update frontend to use API (next step)
5. ⏭️ Test with real company data

## 💡 Tips

- **Cache is your friend**: The backend caches API responses to minimize API calls
- **Start with popular stocks**: AAPL, MSFT, GOOGL, TSLA have the most data
- **Monitor your usage**: Check API dashboards to avoid hitting rate limits
- **Development mode**: Use `npm run dev` for auto-reload during development

## 🔒 Security Notes

- **Never commit `.env`**: The `.gitignore` file already excludes it
- **Keep API keys secret**: Don't share them publicly
- **Use environment variables**: Never hardcode API keys in your code

---

**Need Help?** Check the API documentation:
- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [Finnhub Docs](https://finnhub.io/docs/api)
- [NewsAPI Docs](https://newsapi.org/docs)
- [Gemini API Docs](https://ai.google.dev/docs)

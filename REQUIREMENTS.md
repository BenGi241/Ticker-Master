# 📊 Ticker-Master Requirements Documentation

## Project Overview

**Ticker-Master** is an AI-Powered Financial Analysis Platform that combines real-time stock data, news analysis, and AI-driven insights using Google's Gemini API.

### Architecture

- **Backend**: Node.js + Express REST API
- **Frontend**: React + Vite (SPA)
- **AI Engine**: Google Gemini AI
- **Data Sources**: Alpha Vantage, Finnhub, NewsAPI, SEC.gov

---

## 🔧 System Requirements

### Development Environment

| Component | Requirement |
|-----------|-------------|
| **Node.js** | v14.0.0 or higher (v20+ recommended) |
| **npm** | v6.0.0 or higher |
| **Docker** | v20.10+ (optional, for containerized deployment) |
| **Docker Compose** | v2.0+ (optional) |
| **Operating System** | Windows, macOS, or Linux |
| **RAM** | 4GB minimum, 8GB recommended |
| **Disk Space** | 2GB minimum |

### Production Environment

| Component | Requirement |
|-----------|-------------|
| **Node.js Runtime** | v20 LTS (Alpine Linux in Docker) |
| **Memory** | 512MB minimum, 1GB recommended |
| **CPU** | 1 vCPU minimum |
| **Network** | Outbound HTTPS access required |

---

## 📦 Backend Dependencies

### Production Dependencies

```json
{
  "express": "^4.18.2",              // Web server framework
  "cors": "^2.8.5",                  // Cross-Origin Resource Sharing
  "dotenv": "^16.3.1",               // Environment variable management
  "axios": "^1.6.2",                 // HTTP client for API requests
  "node-cache": "^5.1.2",            // In-memory caching
  "@google/generative-ai": "^0.1.3"  // Google Gemini AI SDK
}
```

### Development Dependencies

```json
{
  "nodemon": "^3.0.2"  // Auto-restart on file changes
}
```

### Backend Total Size
- **Production**: ~50MB (node_modules)
- **Development**: ~55MB (with dev dependencies)

---

## 🎨 Frontend Dependencies

### Production Dependencies

```json
{
  "axios": "^1.13.2",               // HTTP client
  "chart.js": "^4.5.1",             // Chart visualization
  "framer-motion": "^12.23.24",     // Animation library
  "lucide-react": "^0.554.0",       // Icon library
  "react": "^19.2.0",               // React framework
  "react-chartjs-2": "^5.3.1",      // Chart.js React wrapper
  "react-dom": "^19.2.0"            // React DOM renderer
}
```

### Development Dependencies

```json
{
  "@eslint/js": "^9.39.1",
  "@types/react": "^19.2.5",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^5.1.1",
  "eslint": "^9.39.1",
  "eslint-plugin-react-hooks": "^7.0.1",
  "eslint-plugin-react-refresh": "^0.4.24",
  "globals": "^16.5.0",
  "vite": "^7.2.4"
}
```

### Frontend Total Size
- **Build Output**: ~500KB (minified + gzipped)
- **Development**: ~300MB (node_modules)

---

## 🔑 Required API Keys

All API keys have **FREE tiers** available:

| Service | Purpose | Free Tier Limit | Cost to Upgrade |
|---------|---------|----------------|-----------------|
| **Alpha Vantage** | Stock quotes, company data | 25 req/day | $50/month (500 req/day) |
| **Finnhub** | Supplementary financial data | 60 req/min | $0 (free tier sufficient) |
| **NewsAPI** | Financial news articles | 100 req/day | $449/month (business plan) |
| **Google Gemini** | AI-powered analysis | 60 req/min | Free (rate limits apply) |

### API Key Setup Links

1. **Alpha Vantage**: https://www.alphavantage.co/support/#api-key
2. **Finnhub**: https://finnhub.io/register
3. **NewsAPI**: https://newsapi.org/register
4. **Google Gemini**: https://makersuite.google.com/app/apikey

---

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# Required API Keys
ALPHA_VANTAGE_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here

# Optional API Keys (features degraded without them)
FINNHUB_API_KEY=your_key_here
NEWS_API_KEY=your_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# Cache Configuration (seconds)
CACHE_FINANCIAL_DATA=3600   # 1 hour
CACHE_NEWS_DATA=900         # 15 minutes
CACHE_AI_ANALYSIS=7200      # 2 hours
CACHE_QUOTE_DATA=300        # 5 minutes
```

---

## 🌐 Network Requirements

### Outbound HTTPS Access Required

The application makes requests to:

| Domain | Purpose | Port |
|--------|---------|------|
| `www.alphavantage.co` | Stock data | 443 |
| `finnhub.io` | Financial data | 443 |
| `newsapi.org` | News articles | 443 |
| `generativelanguage.googleapis.com` | Gemini AI | 443 |
| `www.sec.gov` | SEC filings | 443 |
| `data.sec.gov` | SEC XBRL data | 443 |

### Firewall Rules

If behind a corporate firewall, ensure outbound HTTPS (port 443) is allowed to the above domains.

---

## 🐳 Docker Requirements

### Docker Images

**Production Build:**
```
Base Image: node:20-alpine
Image Size: ~200MB
Build Time: ~3-5 minutes
Runtime Memory: ~100MB
```

**Development Build:**
```
Base Image: node:20-alpine
Image Size: ~500MB
Build Time: ~5-7 minutes
Runtime Memory: ~300MB
```

### Docker Compose Services

- **ticker-master**: Production service (port 3000)
- **ticker-master-dev**: Development service (ports 3000, 5173)

---

## 📊 Performance Characteristics

### Response Times (cached)

| Endpoint | Response Time |
|----------|---------------|
| `/api/health` | <5ms |
| `/api/quote/:ticker` | <10ms |
| `/api/company/:ticker` | <20ms |
| `/api/news/:ticker` | <30ms |
| `/api/analyze/:ticker` | <50ms |

### Response Times (uncached)

| Endpoint | Response Time |
|----------|---------------|
| `/api/quote/:ticker` | 200-500ms |
| `/api/company/:ticker` | 500-1000ms |
| `/api/news/:ticker` | 300-800ms |
| `/api/analyze/:ticker` | 2000-5000ms |

### Cache Hit Rates (typical)

- Financial Data: 85-90%
- News Data: 60-70%
- AI Analysis: 75-85%
- Quotes: 50-60%

---

## 🔒 Security Requirements

### API Key Security

✅ **DO:**
- Store API keys in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in code
- Rotate keys periodically

❌ **DON'T:**
- Commit API keys to git
- Hardcode keys in source code
- Share keys publicly
- Use production keys in development

### Docker Security

- ✅ Runs as non-root user (nodejs:1001)
- ✅ Minimal Alpine Linux base
- ✅ No unnecessary packages
- ✅ Read-only filesystem (where possible)

---

## 📝 Installation Methods

### 1. Local Development (No Docker)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install

# Setup environment
copy .env.example .env
# Edit .env with your API keys

# Start backend (terminal 1)
npm run dev

# Start frontend (terminal 2)
cd client && npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

### 2. Docker Production

```bash
# Setup environment
copy .env.example .env
# Edit .env with your API keys

# Build and run
docker-compose up -d
```

**Access:**
- Application: http://localhost:3000

---

### 3. Docker Development

```bash
# Setup environment
copy .env.example .env

# Build and run dev mode
docker-compose --profile dev up ticker-master-dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 🧪 Testing Requirements

### Manual Testing

Test endpoints with curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Get company data
curl http://localhost:3000/api/company/AAPL

# Get quote
curl http://localhost:3000/api/quote/MSFT

# Get news
curl http://localhost:3000/api/news/GOOGL
```

### Expected Test Data

Recommended test tickers (most data available):
- `AAPL` - Apple Inc.
- `MSFT` - Microsoft Corporation
- `GOOGL` - Alphabet Inc.
- `TSLA` - Tesla Inc.
- `AMZN` - Amazon.com Inc.

---

## 📈 Scalability Considerations

### Current Architecture
- Single instance
- In-memory caching
- No database required
- Stateless design

### Scaling Options

**Horizontal Scaling:**
- Load balancer → Multiple containers
- Shared Redis cache (replace node-cache)
- Session-less architecture makes this easy

**Vertical Scaling:**
- Increase container memory
- Adjust cache sizes
- Optimize API requests

---

## 🎯 Feature Requirements

| Feature | Status | Dependencies |
|---------|--------|--------------|
| Real-time stock quotes | ✅ Working | Alpha Vantage API |
| Company fundamentals | ✅ Working | Alpha Vantage API |
| Financial news | ✅ Working | NewsAPI |
| Insider trading data | ✅ Working | Finnhub API |
| AI analysis | ✅ Working | Gemini API |
| SEC filings | ✅ Working | SEC.gov public API |
| Response caching | ✅ Working | node-cache |
| Health monitoring | ✅ Working | Built-in |

---

## 📚 Documentation Files

- **API_SETUP.md** - Detailed API key setup guide
- **DOCKER_QUICK_START.md** - Docker usage guide
- **REQUIREMENTS.md** - This file
- **.env.example** - Environment variable template
- **README.md** - Project overview (if exists)

---

## 🆘 Support & Resources

### External Documentation
- [Alpha Vantage API Docs](https://www.alphavantage.co/documentation/)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [NewsAPI Docs](https://newsapi.org/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

**Last Updated:** January 2026  
**Version:** 1.0.0

# Wall Street Analyst – Automated Equity Research Reports

**Generate professional-grade Initiation of Coverage reports for any US-listed stock ticker in 3–8 minutes — powered by real SEC filings, earnings transcripts, and financial APIs.**

##  Goal & Vision

This project aims to democratize high-quality equity research.  
It produces detailed, skeptical, Wall Street-style analyst reports (similar to those from Goldman Sachs, Morgan Stanley, JPMorgan) completely automatically — using only official, verifiable sources (no Seeking Alpha, no blogs, no rumors).

The reports follow a strict, professional structure including:
- Executive summary & investment thesis
- Revenue segment analysis (YoY/QoQ/5-yr CAGR)
- TTM financial deep dive (3-statement tables with arrows)
- ROIC / FCF / working capital quality
- Competitive comps & economic moat
- DCF valuation + sensitivity
- Technical health check (RSI, MACD, moving averages, short interest)
- Management & capital allocation
- Final recommendation (Strong Buy / Buy / Hold / Sell)

All with a critical, risk-first tone — exactly as top-tier funds demand.

##  How It Works (High-Level Architecture)

Multi-agent system with 8 specialized agents running in parallel:

1. **Data Collector** → pulls from SEC EDGAR, Finnhub, Alpha Vantage, yfinance  
2. **Financial Modeler** → builds TTM tables, ROIC, FCF vs Net Income  
3. **Revenue & Segment Analyst** → segment breakdown, pricing power, macro exposure  
4. **Valuation Specialist** → DCF scenarios, PEG, intrinsic value proxies  
5. **Competitive & Moat Analyst** → peers table, premium/discount justification  
6. **Technical Analyst** → RSI, MACD, SMA, beta, short interest scorecard  
7. **Management & Capital Allocation** → insider ownership, recent trades, buybacks  
8. **Final Editor & QA Master** → enforces structure, skeptical tone, format checks

Agents communicate via structured JSON → final PDF/Word report generated.

##  Tech Stack

- **Frontend**      Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui  
- **Backend**       FastAPI (Python) or Node.js (async orchestration)  
- **LLMs**          Claude 3.5 Sonnet / Gemini 2.5 Pro / Grok-4 (via APIs)  
- **Data Sources**  SEC EDGAR, Finnhub (free tier), Alpha Vantage, yfinance  
- **Parallelism**   asyncio + Promise.allSettled + Redis caching  
- **PDF/Word**      WeasyPrint / Puppeteer + python-docx  
- **Deployment**    Vercel (frontend) + Render / Railway / Fly.io (backend)

## Current Status (February 2026)

**Work in progress – not production-ready yet**

- Core data pipeline (Agent 1) is functional  
- Parallel consolidation & final scoring logic implemented  
- Still building out Agents 2–7 and PDF styling  
- Rate-limit handling, full error recovery, and UI dashboard in progress  
- Expect first complete end-to-end report generation within the next few weeks

This project is actively being developed. Contributions, feedback, and bug reports are very welcome!

##  How to Run (once more complete)

```bash
# 1. Clone repo
git clone https://github.com/yourusername/wall-street-analyst.git
cd wall-street-analyst

# 2. Install dependencies
npm install          # or pnpm / yarn
pip install -r requirements.txt   # for FastAPI backend

# 3. Set environment variables (.env)
cp .env.example .env
# Add your Finnhub, Anthropic / Google / xAI API keys

# 4. Start dev servers
npm run dev          # Next.js frontend
uvicorn main:app --reload   # or your FastAPI command
```

# Disclaimer
This is not financial advice.
Reports are generated automatically and may contain errors. Always do your own research and consult licensed professionals before making investment decisions.

Work in progress
The project is still under active development and not yet feature-complete or production-hardened.
I'm sharing it publicly to document the journey and invite feedback — but it's not finished.
(If you're viewing this on my resume/portfolio — yes, this is a serious side project I'm actively building in 2026.)

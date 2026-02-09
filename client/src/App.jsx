import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Overview from './components/Dashboard/Overview';
import BusinessInsights from './components/Dashboard/BusinessInsights';
import Financials from './components/Dashboard/Financials';
import AnalystReport from './components/Dashboard/AnalystReport';
import './chartConfig';
import { analyzeCompany } from './services/api';

function App() {
  const [ticker, setTicker] = useState('');
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'analyst'

  const handleSearch = async (searchTicker) => {
    if (!searchTicker) return;
    setLoading(true);
    setError(null);
    setTicker(searchTicker);

    try {
      const data = await analyzeCompany(searchTicker);
      setCompanyData(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to analyze company. Please check the ticker and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`} style={{ marginLeft: sidebarOpen ? '260px' : '0', transition: 'margin-left 0.3s' }}>
        <Header
          onSearch={handleSearch}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          loading={loading}
        />

        {error && (
          <div className="container mt-4">
            <div className="card border-danger p-4 text-danger">
              {error}
            </div>
          </div>
        )}

        {companyData && (
          <div className="container mt-4 mb-8">
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setView('dashboard')}
                className={`btn ${view === 'dashboard' ? 'btn-primary' : 'bg-white/5 text-muted'}`}
              >
                Core Dashboard
              </button>
              <button
                onClick={() => setView('analyst')}
                className={`btn ${view === 'analyst' ? 'btn-primary' : 'bg-white/5 text-muted'}`}
              >
                Wall Street Analyst Report
              </button>
            </div>

            {view === 'dashboard' ? (
              <>
                <Overview data={companyData} />
                <section className="section">
                  <div className="container">
                    <BusinessInsights
                      ticker={companyData.overview?.ticker || ticker}
                      financialData={companyData}
                      newsData={companyData.news}
                    />
                  </div>
                </section>
                <Financials ticker={companyData.overview.ticker} />
              </>
            ) : (
              <AnalystReport report={companyData.ai} />
            )}
          </div>
        )}

        {!companyData && !loading && !error && (
          <div className="container section text-center">
            <div className="hero">
              <div className="hero-content justify-center">
                <div>
                  <h1>AI-Powered Analysis</h1>
                  <p className="text-xl text-muted">Enter a ticker symbol above to generate a comprehensive financial report.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

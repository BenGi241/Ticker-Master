import React, { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import '../../chartConfig';
import { getCIK, processSECData } from '../../utils/secUtils';
import { fetchSECData } from '../../services/api';
import { Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

const secConfigs = {
      income: {
            title: "Income Statement",
            metrics: [
                  { key: 'revenue', label: 'Revenue', type: 'bar', color: '#3b82f6', axis: 'y', suffix: 'M$' },
                  { key: 'grossProfit', label: 'Gross Profit', type: 'bar', color: '#10b981', axis: 'y', suffix: 'M$' },
                  { key: 'operatingIncome', label: 'Operating Income', type: 'bar', color: '#f59e0b', axis: 'y', suffix: 'M$' },
                  { key: 'netIncome', label: 'Net Income', type: 'bar', color: '#6366f1', axis: 'y', suffix: 'M$' },
                  { key: 'eps', label: 'EPS', type: 'line', color: '#8b5cf6', axis: 'y1', suffix: '$' },
                  { key: 'sharesOutstanding', label: 'Shares', type: 'line', color: '#64748b', axis: 'y1', suffix: 'M' },
                  { key: 'grossMargin', label: 'Gross Margin', type: 'line', color: '#059669', axis: 'y1', suffix: '%' },
                  { key: 'operatingMargin', label: 'Operating Margin', type: 'line', color: '#d97706', axis: 'y1', suffix: '%' },
                  { key: 'netMargin', label: 'Net Margin', type: 'line', color: '#4f46e5', axis: 'y1', suffix: '%' },
            ],
            defaults: ['revenue', 'netIncome', 'eps']
      },
      cashflow: {
            title: "Cash Flow",
            metrics: [
                  { key: 'operatingCashFlow', label: 'Operating Cash Flow', type: 'bar', color: '#10b981', axis: 'y', suffix: 'M$' },
                  { key: 'capex', label: 'CapEx', type: 'bar', color: '#f59e0b', axis: 'y', suffix: 'M$' },
                  { key: 'freeCashFlow', label: 'Free Cash Flow', type: 'bar', color: '#ef4444', axis: 'y', suffix: 'M$' },
            ],
            defaults: ['operatingCashFlow', 'capex', 'freeCashFlow']
      },
      balance: {
            title: "Balance Sheet",
            metrics: [
                  { key: 'totalAssets', label: 'Total Assets', type: 'line', fill: true, color: '#94a3b8', axis: 'y', suffix: 'M$' },
                  { key: 'totalLiabilities', label: 'Total Liabilities', type: 'bar', color: '#ef4444', axis: 'y', suffix: 'M$' },
                  { key: 'totalEquity', label: 'Total Equity', type: 'bar', color: '#10b981', axis: 'y', suffix: 'M$' },
                  { key: 'cashAndEquivalents', label: 'Cash & Eq.', type: 'bar', color: '#3b82f6', axis: 'y1', suffix: 'M$' },
            ],
            defaults: ['totalAssets', 'totalLiabilities', 'totalEquity']
      },
      ratios: {
            title: "Financial Ratios",
            metrics: [
                  { key: 'roe', label: 'ROE', type: 'line', color: '#8b5cf6', axis: 'y1', suffix: '%' },
                  { key: 'debtToEquity', label: 'Debt/Equity', type: 'bar', color: '#f97316', axis: 'y1', suffix: 'x' },
            ],
            defaults: ['roe', 'debtToEquity']
      }
};

const Financials = ({ ticker }) => {
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [secData, setSecData] = useState([]);
      const [period, setPeriod] = useState('annual');
      const [activeTab, setActiveTab] = useState('income');
      const [visibleMetrics, setVisibleMetrics] = useState({});
      const [startYear, setStartYear] = useState(null);
      const [endYear, setEndYear] = useState(null);
      const [availableYears, setAvailableYears] = useState([]);

      // Initialize defaults
      useEffect(() => {
            const defaults = {};
            Object.keys(secConfigs).forEach(tab => {
                  secConfigs[tab].metrics.forEach(m => {
                        if (secConfigs[tab].defaults.includes(m.key)) {
                              defaults[m.key] = true;
                        }
                  });
            });
            setVisibleMetrics(defaults);
      }, []);

      useEffect(() => {
            if (!ticker) return;

            const loadData = async () => {
                  setLoading(true);
                  setError(null);
                  try {
                        const cik = await getCIK(ticker);
                        if (!cik) throw new Error("Ticker not found in SEC database");

                        const json = await fetchSECData(cik);
                        const processed = processSECData(json, period);

                        if (processed.length === 0) throw new Error("No data found for this company");
                        setSecData(processed);
                  } catch (err) {
                        console.error("SEC Data Load Error:", err);
                        setError(err.message);
                  } finally {
                        setLoading(false);
                  }
            };

            loadData();
      }, [ticker, period]);

      // Extract available years and set defaults
      useEffect(() => {
            if (secData.length > 0) {
                  const years = secData.map(d => {
                        const year = parseInt(d.year.substring(0, 4));
                        return year;
                  }).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);

                  setAvailableYears(years);
                  if (!startYear && years.length > 0) setStartYear(years[0]);
                  if (!endYear && years.length > 0) setEndYear(years[years.length - 1]);
            }
      }, [secData]);

      const toggleMetric = (key) => {
            setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
      };

      // Filter data by year range and prepare for chart (Left-to-Right: oldest to newest)
      const filteredData = secData.filter(d => {
            const year = parseInt(d.year.substring(0, 4));
            return year >= (startYear || 0) && year <= (endYear || 9999);
      });

      const chartData = {
            labels: filteredData.map(d => d.year),
            datasets: secConfigs[activeTab].metrics
                  .filter(m => visibleMetrics[m.key])
                  .map(m => ({
                        label: m.label,
                        data: filteredData.map(d => d[m.key]),
                        type: m.type === 'area' ? 'line' : m.type,
                        backgroundColor: m.type === 'line' || m.type === 'area' ? m.color + '20' : m.color + 'CC',
                        borderColor: m.color,
                        borderWidth: 2.5,
                        fill: m.type === 'area',
                        yAxisID: m.axis,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: m.color,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                  }))
      };

      const options = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                  x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                              color: '#cbd5e1',
                              font: { size: 12, weight: '500' }
                        }
                  },
                  y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                              color: '#cbd5e1',
                              font: { size: 11 },
                              callback: (val) => val >= 1000 ? (val / 1000).toFixed(1) + 'B' : val
                        }
                  },
                  y1: {
                        type: 'linear',
                        display: chartData.datasets.some(d => d.yAxisID === 'y1'),
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: {
                              color: '#cbd5e1',
                              font: { size: 11 }
                        }
                  }
            },
            plugins: {
                  legend: {
                        labels: {
                              color: '#f8fafc',
                              font: { size: 13, weight: '600' },
                              padding: 15,
                              usePointStyle: true,
                              pointStyle: 'circle'
                        },
                        position: 'top'
                  },
                  tooltip: {
                        backgroundColor: 'rgba(10, 14, 39, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(79, 70, 229, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                              label: (ctx) => {
                                    const m = secConfigs[activeTab].metrics.find(metric => metric.label === ctx.dataset.label);
                                    return `${ctx.dataset.label}: ${ctx.raw.toLocaleString()}${m ? m.suffix.replace('M', '') : ''}`;
                              }
                        }
                  }
            }
      };

      // Growth Summary
      const lastPoint = secData[0];
      const prevPoint = secData[1];

      return (
            <section id="financials" className="section" style={{ background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.03) 0%, transparent 100%)' }}>
                  <div className="container">
                        <div className="section-header">
                              <h2 className="section-title">📊 Financial Analysis (SEC Data)</h2>
                              <p className="section-subtitle">Real-time verified data from SEC EDGAR (10-K/10-Q)</p>
                        </div>

                        {/* Controls */}
                        <div className="card card-glass mb-6" style={{
                              padding: '1.5rem',
                              background: 'rgba(26, 33, 66, 0.4)',
                              borderColor: 'rgba(79, 70, 229, 0.2)'
                        }}>
                              <div className="flex justify-between items-center flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                          <span className="text-muted text-sm font-semibold" style={{ letterSpacing: '0.05em' }}>PERIOD:</span>
                                          <div className="btn-group m-0">
                                                <button
                                                      className={`btn btn-sm ${period === 'annual' ? 'btn-primary' : 'btn-secondary'}`}
                                                      onClick={() => setPeriod('annual')}
                                                      style={{ minWidth: '100px' }}
                                                >
                                                      📅 Annual
                                                </button>
                                                <button
                                                      className={`btn btn-sm ${period === 'quarter' ? 'btn-primary' : 'btn-secondary'}`}
                                                      onClick={() => setPeriod('quarter')}
                                                      style={{ minWidth: '100px' }}
                                                >
                                                      📊 Quarterly
                                                </button>
                                          </div>
                                    </div>

                                    {availableYears.length > 0 && (
                                          <div className="flex items-center gap-3">
                                                <span className="text-muted text-sm font-semibold" style={{ letterSpacing: '0.05em' }}>YEAR RANGE:</span>
                                                <select
                                                      className="form-select"
                                                      value={startYear || ''}
                                                      onChange={(e) => setStartYear(parseInt(e.target.value))}
                                                      style={{
                                                            padding: '0.5rem 0.75rem',
                                                            background: 'rgba(26, 33, 66, 0.6)',
                                                            border: '1px solid rgba(79, 70, 229, 0.3)',
                                                            borderRadius: '0.5rem',
                                                            color: 'white',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                      }}
                                                >
                                                      {availableYears.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                      ))}
                                                </select>
                                                <span className="text-muted text-sm">to</span>
                                                <select
                                                      className="form-select"
                                                      value={endYear || ''}
                                                      onChange={(e) => setEndYear(parseInt(e.target.value))}
                                                      style={{
                                                            padding: '0.5rem 0.75rem',
                                                            background: 'rgba(26, 33, 66, 0.6)',
                                                            border: '1px solid rgba(79, 70, 229, 0.3)',
                                                            borderRadius: '0.5rem',
                                                            color: 'white',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                      }}
                                                >
                                                      {availableYears.map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                      ))}
                                                </select>
                                          </div>
                                    )}
                              </div>
                        </div>

                        {/* Tabs */}
                        <div className="tabs-container">
                              <div className="tabs-header" style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    marginBottom: '1.5rem',
                                    flexWrap: 'wrap'
                              }}>
                                    {Object.keys(secConfigs).map(tab => (
                                          <button
                                                key={tab}
                                                className={`btn tab-btn ${activeTab === tab ? 'active' : 'btn-secondary'}`}
                                                onClick={() => setActiveTab(tab)}
                                                style={{
                                                      flex: '1',
                                                      minWidth: '150px',
                                                      padding: '0.875rem 1.5rem',
                                                      fontSize: '0.95rem',
                                                      fontWeight: '600',
                                                      transition: 'all 0.3s ease'
                                                }}
                                          >
                                                {secConfigs[tab].title}
                                          </button>
                                    ))}
                              </div>

                              <div className="tabs-content">
                                    {/* Metric Toggles */}
                                    <div className="card card-glass mb-4" style={{
                                          padding: '1.25rem',
                                          background: 'rgba(26, 33, 66, 0.3)'
                                    }}>
                                          <div className="text-xs text-muted mb-3 font-semibold" style={{ letterSpacing: '0.05em' }}>
                                                SELECT METRICS TO DISPLAY:
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                                {secConfigs[activeTab].metrics.map(m => (
                                                      <button
                                                            key={m.key}
                                                            className={`btn btn-xs flex items-center gap-1 ${visibleMetrics[m.key] ? 'btn-dark' : 'btn-outline'}`}
                                                            onClick={() => toggleMetric(m.key)}
                                                            style={{
                                                                  borderColor: m.color,
                                                                  color: visibleMetrics[m.key] ? 'white' : m.color,
                                                                  backgroundColor: visibleMetrics[m.key] ? m.color : 'transparent',
                                                                  padding: '0.5rem 1rem',
                                                                  fontSize: '0.85rem',
                                                                  fontWeight: '600',
                                                                  transition: 'all 0.2s ease',
                                                                  boxShadow: visibleMetrics[m.key] ? `0 0 12px ${m.color}40` : 'none'
                                                            }}
                                                      >
                                                            {visibleMetrics[m.key] ? <Eye size={14} /> : <EyeOff size={14} />}
                                                            {m.label}
                                                      </button>
                                                ))}
                                          </div>
                                    </div>

                                    {/* Chart */}
                                    <div className="card card-glass mb-6" style={{
                                          background: 'rgba(26, 33, 66, 0.5)',
                                          borderColor: 'rgba(79, 70, 229, 0.2)',
                                          overflow: 'hidden'
                                    }}>
                                          <div className="card-body" style={{ padding: '2rem' }}>
                                                <div className="chart-wrapper" style={{ height: '450px' }}>
                                                      {loading ? (
                                                            <div className="flex flex-col items-center justify-center h-full">
                                                                  <div className="loading-spinner"></div>
                                                                  <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching SEC Data...</p>
                                                            </div>
                                                      ) : error ? (
                                                            <div className="flex items-center justify-center h-full text-danger" style={{ fontSize: '1.1rem' }}>
                                                                  ⚠️ {error}
                                                            </div>
                                                      ) : (
                                                            <Chart type='bar' data={chartData} options={options} />
                                                      )}
                                                </div>
                                          </div>
                                    </div>

                                    {/* Growth Summary */}
                                    {!loading && !error && lastPoint && prevPoint && (
                                          <div>
                                                <div className="text-sm text-muted mb-3 font-semibold" style={{ letterSpacing: '0.05em' }}>
                                                      📈 PERIOD-OVER-PERIOD GROWTH
                                                </div>
                                                <div className="grid grid-4 gap-4">
                                                      {secConfigs[activeTab].metrics
                                                            .filter(m => visibleMetrics[m.key])
                                                            .map(m => {
                                                                  const current = lastPoint[m.key] || 0;
                                                                  const prev = prevPoint[m.key] || 0;
                                                                  const growth = prev !== 0 ? ((current - prev) / Math.abs(prev)) * 100 : 0;
                                                                  const isPositive = growth > 0;

                                                                  return (
                                                                        <div
                                                                              key={m.key}
                                                                              className="card"
                                                                              style={{
                                                                                    padding: '1.25rem',
                                                                                    background: 'rgba(26, 33, 66, 0.6)',
                                                                                    borderColor: `${m.color}30`,
                                                                                    borderLeft: `4px solid ${m.color}`,
                                                                                    transition: 'all 0.3s ease'
                                                                              }}
                                                                        >
                                                                              <div className="text-xs text-muted mb-2" style={{
                                                                                    fontWeight: '600',
                                                                                    letterSpacing: '0.05em',
                                                                                    textTransform: 'uppercase'
                                                                              }}>
                                                                                    {m.label}
                                                                              </div>
                                                                              <div className="text-2xl font-bold mb-2" style={{ color: m.color }}>
                                                                                    {current.toLocaleString(undefined, { maximumFractionDigits: 1 })}{m.suffix.replace('M', '')}
                                                                              </div>
                                                                              <div className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-success' : 'text-danger'}`}>
                                                                                    {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                                                                    {Math.abs(growth).toFixed(1)}%
                                                                              </div>
                                                                        </div>
                                                                  );
                                                            })}
                                                </div>
                                          </div>
                                    )}
                              </div>
                        </div>
                  </div>
            </section>
      );
};

export default Financials;

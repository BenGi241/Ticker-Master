import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Award, Globe, Layers, ChevronDown, ChevronUp } from 'lucide-react';

const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
            opacity: 1,
            transition: {
                  staggerChildren: 0.1
            }
      }
};

const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100 }
      }
};

const MetricCard = ({ label, value, subtext, trend, prefix = '', suffix = '', icon: Icon, color = 'blue' }) => (
      <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
            className="card p-5 relative overflow-hidden group"
            style={{ borderTop: `3px solid var(--${color === 'blue' ? 'info' : color === 'green' ? 'success' : color === 'orange' ? 'warning' : 'accent-secondary'})` }}
      >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 group-hover:scale-125 duration-500">
                  {Icon && <Icon size={64} />}
            </div>

            <div className="relative z-10">
                  <div className="text-sm text-muted mb-2 font-medium tracking-wide uppercase flex items-center gap-2">
                        {Icon && <Icon size={14} className={`text-${color}-400`} />}
                        {label}
                  </div>
                  <div className="text-2xl font-bold flex items-center gap-1 text-white">
                        {prefix}{value}{suffix}
                  </div>
                  {(subtext || trend) && (
                        <div className={`text-xs mt-2 flex items-center gap-1 font-medium ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-muted'}`}>
                              {trend === 'up' && <TrendingUp size={12} />}
                              {trend === 'down' && <TrendingDown size={12} />}
                              {subtext}
                        </div>
                  )}
            </div>
      </motion.div>
);

const Badge = ({ icon: Icon, text, type = 'blue' }) => (
      <span className={`badge badge-${type}`}>
            {Icon && <Icon size={12} />}
            {text}
      </span>
);

const Overview = ({ data }) => {
      // Add null checks to prevent crashes
      if (!data || !data.overview || !data.quote) {
            return (
                  <section id="overview" className="section pt-8">
                        <div className="container">
                              <div className="card p-8 text-center">
                                    <div className="text-muted">Loading company data...</div>
                              </div>
                        </div>
                  </section>
            );
      }

      const { overview, quote } = data;
      const [showFullDesc, setShowFullDesc] = useState(false);

      const isPositive = quote?.changePercent >= 0;

      return (
            <section id="overview" className="section pt-8">
                  <div className="container">
                        {/* Hero Section */}
                        <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.6 }}
                              className="card card-glass mb-8 overflow-hidden relative"
                        >
                              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>

                              <div className="card-body relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between gap-8">

                                          {/* Company Info */}
                                          <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-6">
                                                      <motion.div
                                                            whileHover={{ scale: 1.05, rotate: 5 }}
                                                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/20 border border-white/10"
                                                      >
                                                            {overview.ticker}
                                                      </motion.div>
                                                      <div>
                                                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                                                                  {overview.name}
                                                            </h1>
                                                            <div className="flex flex-wrap gap-2">
                                                                  <Badge icon={Layers} text={overview.sector} type="blue" />
                                                                  <Badge icon={Activity} text={overview.industry} type="indigo" />
                                                                  <Badge icon={Globe} text={overview.exchange} type="purple" />
                                                            </div>
                                                      </div>
                                                </div>

                                                <div className="prose prose-invert max-w-3xl">
                                                      <motion.div
                                                            animate={{ height: showFullDesc ? 'auto' : '80px' }}
                                                            className="overflow-hidden relative"
                                                      >
                                                            <p className="text-secondary leading-relaxed text-lg">
                                                                  {overview.description}
                                                            </p>
                                                            {!showFullDesc && (
                                                                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[var(--card-bg)] to-transparent"></div>
                                                            )}
                                                      </motion.div>
                                                      {overview?.description?.length > 200 && (
                                                            <button
                                                                  onClick={() => setShowFullDesc(!showFullDesc)}
                                                                  className="text-primary text-sm font-medium hover:text-primary-light mt-2 focus:outline-none flex items-center gap-1 transition-colors"
                                                            >
                                                                  {showFullDesc ? (
                                                                        <>Show Less <ChevronUp size={14} /></>
                                                                  ) : (
                                                                        <>Read More <ChevronDown size={14} /></>
                                                                  )}
                                                            </button>
                                                      )}
                                                </div>
                                          </div>

                                          {/* Price Card */}
                                          <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="flex-shrink-0 min-w-[280px]"
                                          >
                                                <div className="bg-glass-gradient rounded-2xl p-6 border border-white/10 shadow-xl backdrop-blur-md">
                                                      <div className="flex items-center justify-between mb-4">
                                                            <span className="text-sm text-muted font-medium uppercase tracking-wider">Current Price</span>
                                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                                  Live Market
                                                            </span>
                                                      </div>
                                                      <div className="text-5xl font-bold text-white mb-2 tracking-tighter">
                                                            ${quote.price?.toFixed(2)}
                                                      </div>
                                                      <div className={`flex items-center gap-3 text-base font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                                                            <span className={`flex items-center px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                                  {isPositive ? <TrendingUp size={18} className="mr-1.5" /> : <TrendingDown size={18} className="mr-1.5" />}
                                                                  {Math.abs(quote.change).toFixed(2)}
                                                            </span>
                                                            <span className="opacity-80">({Math.abs(quote.changePercent).toFixed(2)}%)</span>
                                                      </div>
                                                      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-xs text-muted font-medium">
                                                            <span>Vol: {(quote.volume / 1000000).toFixed(1)}M</span>
                                                            <span>Prev: ${quote.previousClose?.toFixed(2)}</span>
                                                      </div>
                                                </div>
                                          </motion.div>
                                    </div>
                              </div>
                        </motion.div>

                        {/* Metrics Grid */}
                        <motion.div
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                        >
                              {/* Valuation */}
                              <MetricCard
                                    label="Market Cap"
                                    value={overview?.marketCap?.toFixed(1) || '0.0'}
                                    suffix="B"
                                    prefix="$"
                                    icon={DollarSign}
                                    color="blue"
                                    subtext={`P/E: ${overview?.peRatio || 'N/A'}`}
                              />

                              {/* Performance */}
                              <MetricCard
                                    label="52W High"
                                    value={overview?.fiftyTwoWeekHigh || 'N/A'}
                                    prefix="$"
                                    icon={Activity}
                                    color="indigo"
                                    subtext={`Low: $${overview?.fiftyTwoWeekLow || 'N/A'}`}
                              />

                              {/* Dividends */}
                              <MetricCard
                                    label="Dividend Yield"
                                    value={overview?.dividendYield ? (overview.dividendYield * 100).toFixed(2) : '0.00'}
                                    suffix="%"
                                    icon={Award}
                                    color="purple"
                                    subtext={`EPS: $${overview?.eps || 'N/A'}`}
                              />

                              {/* Profitability */}
                              <MetricCard
                                    label="Profit Margin"
                                    value={overview?.profitMargin ? (overview.profitMargin * 100).toFixed(1) : '0.0'}
                                    suffix="%"
                                    icon={TrendingUp}
                                    color="green"
                                    trend={overview?.profitMargin > 0 ? 'up' : 'down'}
                                    subtext={`Beta: ${overview?.beta || 'N/A'}`}
                              />
                        </motion.div>
                  </div>
            </section>
      );
};

export default Overview;

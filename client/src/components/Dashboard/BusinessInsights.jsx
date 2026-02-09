import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
      Building2, TrendingUp, Users, Globe2, Target,
      Award, AlertTriangle, Lightbulb, ChevronDown, ChevronUp,
      Briefcase, PieChart, MapPin, Handshake
} from 'lucide-react';
import api from '../../services/api';

const SectionCard = ({ title, icon: Icon, children, defaultOpen = false }) => {
      const [isOpen, setIsOpen] = useState(defaultOpen);

      return (
            <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card mb-6"
            >
                  <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full card-body flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                        <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                                    <Icon size={20} className="text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-white">{title}</h3>
                        </div>
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  <AnimatePresence>
                        {isOpen && (
                              <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                              >
                                    <div className="card-body border-t border-white/10 pt-6">
                                          {children}
                                    </div>
                              </motion.div>
                        )}
                  </AnimatePresence>
            </motion.div>
      );
};

const Badge = ({ text, color = 'blue' }) => (
      <span className={`badge badge-${color} text-xs`}>{text}</span>
);

const BusinessInsights = ({ ticker, financialData, newsData }) => {
      const [insights, setInsights] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
            const fetchInsights = async () => {
                  try {
                        setLoading(true);
                        const data = await api.analyzeSection(ticker, 'business', financialData, newsData);
                        setInsights(data);
                        setError(null);
                  } catch (err) {
                        console.error('Error fetching business insights:', err);
                        setError('Unable to load business insights at this time');
                  } finally {
                        setLoading(false);
                  }
            };

            if (ticker && financialData && newsData) {
                  fetchInsights();
            }
      }, [ticker, financialData, newsData]);

      if (loading) {
            return (
                  <div className="card p-8 text-center">
                        <div className="animate-pulse">
                              <div className="text-muted">Loading business insights...</div>
                        </div>
                  </div>
            );
      }

      if (error) {
            return (
                  <div className="card p-8 text-center">
                        <div className="text-danger">{error}</div>
                  </div>
            );
      }

      if (!insights) return null;

      return (
            <div className="space-y-6">
                  {/* ELI10 - Simple Explanation */}
                  <SectionCard title="What Does the Company Do?" icon={Building2} defaultOpen={true}>
                        <div className="prose prose-invert max-w-none">
                              <p className="text-lg text-secondary leading-relaxed">
                                    {insights.eli10}
                              </p>
                        </div>
                  </SectionCard>

                  {/* Business Model */}
                  <SectionCard title="Business Model" icon={Briefcase}>
                        <div className="space-y-6">
                              <p className="text-secondary leading-relaxed">
                                    {insights.businessModel?.description}
                              </p>

                              {insights.businessModel?.revenueStreams?.length > 0 && (
                                    <div>
                                          <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">
                                                Revenue Streams
                                          </h4>
                                          <div className="grid gap-3">
                                                {insights.businessModel.revenueStreams.map((stream, idx) => (
                                                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                            <div className="flex items-center justify-between mb-2">
                                                                  <span className="font-semibold text-white">{stream.source}</span>
                                                                  <Badge text={`${stream.percentage}%`} color="blue" />
                                                            </div>
                                                            <p className="text-sm text-muted">{stream.description}</p>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {insights.businessModel?.keyMetrics && (
                                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                                          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-lg p-4 border border-blue-500/20">
                                                <div className="text-xs text-muted mb-1">Profitability</div>
                                                <div className="text-sm text-white">{insights.businessModel.keyMetrics?.profitability}</div>
                                          </div>
                                          <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-lg p-4 border border-purple-500/20">
                                                <div className="text-xs text-muted mb-1">Scalability</div>
                                                <div className="text-sm text-white">{insights.businessModel.keyMetrics?.scalability}</div>
                                          </div>
                                          <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-lg p-4 border border-green-500/20">
                                                <div className="text-xs text-muted mb-1">Sustainability</div>
                                                <div className="text-sm text-white">{insights.businessModel.keyMetrics?.sustainability}</div>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </SectionCard>

                  {/* Main Operations */}
                  <SectionCard title="Operations & Markets" icon={Globe2}>
                        <div className="space-y-6">
                              {/* Business Areas */}
                              {insights.mainOperations?.businessAreas?.length > 0 && (
                                    <div>
                                          <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide flex items-center gap-2">
                                                <Target size={14} />
                                                Main Business Areas
                                          </h4>
                                          <div className="grid gap-3">
                                                {insights.mainOperations.businessAreas.map((area, idx) => (
                                                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                  <span className="font-semibold text-white">{area.area}</span>
                                                                  <Badge
                                                                        text={area.importance}
                                                                        color={area.importance === 'High' ? 'green' : area.importance === 'Medium' ? 'blue' : 'gray'}
                                                                  />
                                                            </div>
                                                            <p className="text-sm text-muted">{area.description}</p>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {/* Target Customers */}
                              {insights.mainOperations?.targetCustomers?.length > 0 && (
                                    <div>
                                          <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide flex items-center gap-2">
                                                <Users size={14} />
                                                Target Customers
                                          </h4>
                                          <div className="grid gap-3">
                                                {insights.mainOperations.targetCustomers.map((customer, idx) => (
                                                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                            <div className="font-semibold text-white mb-1">{customer.segment}</div>
                                                            <p className="text-sm text-muted mb-2">{customer.description}</p>
                                                            <div className="text-xs text-primary">{customer.contribution}</div>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              )}

                              {/* Geographic Markets */}
                              {insights.mainOperations?.geographicMarkets?.length > 0 && (
                                    <div>
                                          <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide flex items-center gap-2">
                                                <MapPin size={14} />
                                                Geographic Markets
                                          </h4>
                                          <div className="grid gap-3">
                                                {insights.mainOperations.geographicMarkets.map((market, idx) => (
                                                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                            <div className="flex items-center justify-between mb-2">
                                                                  <span className="font-semibold text-white">{market.region}</span>
                                                                  <Badge text={`${market.revenue}% of revenue`} color="indigo" />
                                                            </div>
                                                            <p className="text-sm text-muted">{market.growth}</p>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              )}
                        </div>
                  </SectionCard>

                  {/* Market Position & Competitors */}
                  <SectionCard title="Market Position & Competitors" icon={PieChart}>
                        <div className="space-y-6">
                              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-lg p-6 border border-blue-500/20">
                                    <div className="text-sm text-muted mb-2">Market Share</div>
                                    <div className="text-2xl font-bold text-white mb-3">{insights.marketPosition?.marketShare}</div>
                                    <p className="text-sm text-secondary">{insights.marketPosition?.marketShareDescription}</p>
                              </div>

                              {insights.marketPosition?.mainCompetitors?.length > 0 && (
                                    <div>
                                          <h4 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">
                                                Main Competitors
                                          </h4>
                                          <div className="grid gap-4">
                                                {insights.marketPosition.mainCompetitors.map((competitor, idx) => (
                                                      <div key={idx} className="bg-white/5 rounded-lg p-5 border border-white/10">
                                                            <div className="flex items-center justify-between mb-3">
                                                                  <div>
                                                                        <div className="font-bold text-white text-lg">{competitor.name}</div>
                                                                        <div className="text-sm text-muted">{competitor.ticker}</div>
                                                                  </div>
                                                                  <Badge text={`${competitor.marketShare}% market share`} color="purple" />
                                                            </div>
                                                            {competitor.strengths?.length > 0 && (
                                                                  <div className="mb-3">
                                                                        <div className="text-xs text-success mb-1">Strengths:</div>
                                                                        <div className="flex flex-wrap gap-1">
                                                                              {competitor.strengths.map((strength, sidx) => (
                                                                                    <span key={sidx} className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">
                                                                                          {strength}
                                                                                    </span>
                                                                              ))}
                                                                        </div>
                                                                  </div>
                                                            )}
                                                            <p className="text-sm text-muted">{competitor.comparison}</p>
                                                      </div>
                                                ))}
                                          </div>
                                    </div>
                              )}

                              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-sm font-semibold text-white mb-2">Overall Competitive Position</div>
                                    <p className="text-sm text-secondary">{insights.marketPosition?.competitivePosition}</p>
                              </div>
                        </div>
                  </SectionCard>

                  {/* Competitive Advantages */}
                  {insights.competitiveAdvantages?.length > 0 && (
                        <SectionCard title="Competitive Advantages" icon={Award}>
                              <div className="grid gap-4">
                                    {insights.competitiveAdvantages.map((advantage, idx) => (
                                          <div key={idx} className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-lg p-5 border border-green-500/20">
                                                <div className="flex items-center justify-between mb-3">
                                                      <h4 className="font-bold text-white text-lg">{advantage.advantage}</h4>
                                                      <div className="flex gap-2">
                                                            <Badge
                                                                  text={advantage.strength}
                                                                  color={advantage.strength === 'High' ? 'green' : advantage.strength === 'Medium' ? 'blue' : 'gray'}
                                                            />
                                                      </div>
                                                </div>
                                                <p className="text-sm text-secondary mb-2">{advantage.description}</p>
                                                <div className="text-xs text-muted italic">{advantage.sustainability}</div>
                                          </div>
                                    ))}
                              </div>
                        </SectionCard>
                  )}

                  {/* Partnerships */}
                  {insights.partnerships?.length > 0 && (
                        <SectionCard title="Partnerships" icon={Handshake}>
                              <div className="grid gap-3">
                                    {insights.partnerships.map((partnership, idx) => (
                                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                      <span className="font-semibold text-white">{partnership.partner}</span>
                                                      <Badge text={partnership.type} color="indigo" />
                                                </div>
                                                <p className="text-sm text-muted">{partnership.impact}</p>
                                          </div>
                                    ))}
                              </div>
                        </SectionCard>
                  )}

                  {/* Weaknesses */}
                  {insights.weaknesses?.length > 0 && (
                        <SectionCard title="Business Weaknesses" icon={AlertTriangle}>
                              <div className="grid gap-4">
                                    {insights.weaknesses.map((weakness, idx) => (
                                          <div key={idx} className="bg-gradient-to-br from-orange-600/10 to-red-600/10 rounded-lg p-5 border border-orange-500/20">
                                                <div className="flex items-center justify-between mb-3">
                                                      <h4 className="font-bold text-white">{weakness.weakness}</h4>
                                                      <Badge
                                                            text={weakness.severity}
                                                            color={weakness.severity === 'High' ? 'danger' : weakness.severity === 'Medium' ? 'warning' : 'gray'}
                                                      />
                                                </div>
                                                <p className="text-sm text-secondary mb-2">{weakness.description}</p>
                                                <div className="text-xs text-muted italic">{weakness.mitigation}</div>
                                          </div>
                                    ))}
                              </div>
                        </SectionCard>
                  )}

                  {/* Challenges */}
                  {insights.challenges?.length > 0 && (
                        <SectionCard title="Main Challenges" icon={Lightbulb}>
                              <div className="grid gap-4">
                                    {insights.challenges.map((challenge, idx) => (
                                          <div key={idx} className="bg-white/5 rounded-lg p-5 border border-white/10">
                                                <h4 className="font-bold text-white mb-2">{challenge.challenge}</h4>
                                                <p className="text-sm text-secondary mb-3">{challenge.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted">
                                                      <span>⏱️ {challenge.timeframe}</span>
                                                      <span>📊 {challenge.impact}</span>
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        </SectionCard>
                  )}
            </div>
      );
};

export default BusinessInsights;

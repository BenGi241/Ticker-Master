import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, TrendingUp, BarChart3, Shield, Activity,
    Users, AlertCircle, Quote, Star, ArrowUpRight, ArrowDownRight,
    CheckCircle2, XCircle, Brain, Target, Layers, Gavel, Scale
} from 'lucide-react';

// --- Sub-Components ---

const SectionCard = ({ title, icon: Icon, children, insight, color = "indigo" }) => (
    <div className={`card mb-8 overflow-hidden border border-white/10 hover:border-${color}-500/30 transition-colors`}>
        <div className={`bg-gradient-to-r from-${color}-500/10 to-transparent p-4 border-b border-white/10 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
                    <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-white tracking-widest uppercase">{title}</h3>
            </div>
        </div>
        <div className="card-body p-6">
            <div className="space-y-6">
                {children}
            </div>

            {/* Investor Insight Footer */}
            {insight && (
                <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex items-start gap-3 bg-slate-900/50 p-4 rounded-r-lg border-l-4 border-indigo-500">
                        <Brain size={20} className="text-indigo-400 mt-1 shrink-0" />
                        <div>
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                                Investor Insight
                            </span>
                            <p className="text-white text-md font-medium leading-relaxed">
                                {typeof insight === 'string' ? insight.replace(/Investor Insight:|תובנה למשקיע:/gi, '').trim() : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const ExecutiveSummary = ({ data }) => {
    if (typeof data === 'string') {
        return (
            <div className="prose prose-invert max-w-none">
                <p className="text-white text-lg leading-relaxed font-light whitespace-pre-wrap">{data}</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                {/* Business Profile */}
                <div>
                    <h4 className="text-xs text-muted uppercase tracking-wider mb-2">Business Profile</h4>
                    <p className="text-white text-lg leading-relaxed font-light">
                        {data?.plainEnglish || data?.businessStory}
                    </p>
                </div>

                {/* Revenue Model */}
                {data?.revenueModel && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <h4 className="text-xs text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Activity size={14} /> Revenue Generation
                        </h4>
                        <p className="text-secondary text-sm">{data.revenueModel}</p>
                    </div>
                )}

                {/* Moat Analysis */}
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h4 className="text-xs text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Shield size={14} /> Strategic Moat
                    </h4>
                    {typeof data?.moat === 'object' ? (
                        <div className="space-y-2">
                            <div className="font-bold text-white text-sm">{data.moat.type}</div>
                            <p className="text-secondary text-sm">{data.moat.analysis}</p>
                            {data.moat.proof && (
                                <div className="mt-2 text-xs font-mono text-emerald-400 border-l-2 border-emerald-500 pl-2">
                                    {data.moat.proof}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-secondary text-sm">{data?.moat}</p>
                    )}
                </div>
            </div>

            {/* Investment Thesis */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 rounded-xl border border-indigo-500/30 flex flex-col justify-between">
                <div>
                    <h4 className="text-xs text-indigo-300 uppercase tracking-widest mb-4">Investment Thesis</h4>
                    {typeof data?.thesis === 'object' ? (
                        <div className="space-y-4">
                            <div className="text-lg font-bold text-white">{data.thesis.recommendation}</div>
                            <p className="text-secondary text-sm italic">"{data.thesis.reason}"</p>
                            <div className="bg-white/10 p-2 rounded text-xs">
                                <span className="text-indigo-300 font-bold">Trigger:</span> {data.thesis.trigger}
                            </div>
                        </div>
                    ) : (
                        <p className="text-white font-medium italic leading-relaxed">"{data?.thesis}"</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const RevenueMatrix = ({ data }) => {
    if (typeof data === 'string') {
        return (
            <div className="prose prose-invert max-w-none">
                <p className="text-secondary leading-relaxed whitespace-pre-wrap">{data}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted uppercase bg-white/5">
                    <tr>
                        <th className="p-3 rounded-tl-lg">Segment</th>
                        <th className="p-3">Revenue</th>
                        <th className="p-3">% Weight</th>
                        <th className="p-3">Growth</th>
                        <th className="p-3">Trend</th>
                        <th className="p-3">Margin</th>
                        <th className="p-3 rounded-tr-lg">Quality</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data?.segments?.map((seg, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 font-medium text-white">{seg.name}</td>
                            <td className="p-3 text-secondary">{seg.revenue}</td>
                            <td className="p-3 text-secondary">{seg.weight}</td>
                            <td className="p-3 text-emerald-400 font-bold">{seg.growth}</td>
                            <td className={`p-3 font-bold ${seg.trend?.includes('⬆️') ? 'text-emerald-400' : seg.trend?.includes('⬇️') ? 'text-rose-400' : 'text-amber-400'}`}>
                                {seg.trend}
                            </td>
                            <td className="p-3 text-secondary">{seg.margin}</td>
                            <td className="p-3 text-xs text-muted italic">{seg.quality}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Quarterly Summary & Macro */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.growthQuality && (
                    <div className="text-xs text-secondary bg-white/5 p-3 rounded border border-white/5">
                        <div className="font-bold text-indigo-300 mb-1 flex items-center gap-2">
                            <Activity size={14} /> Growth Quality
                        </div>
                        {typeof data.growthQuality === 'string' ? data.growthQuality : data.growthQuality.text}
                    </div>
                )}
                {data?.macroImpact && (
                    <div className="text-xs text-secondary bg-white/5 p-3 rounded border border-white/5">
                        <div className="font-bold text-amber-400 mb-1 flex items-center gap-2">
                            <Activity size={14} /> Macro Impact
                        </div>
                        {data.macroImpact}
                    </div>
                )}
            </div>
        </div>
    );
};

const InvestmentChecklist = ({ checklist }) => {
    if (typeof checklist === 'string') {
        return (
            <div className="prose prose-invert max-w-none">
                <p className="text-secondary leading-relaxed whitespace-pre-wrap">{checklist}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checklist?.criteria?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-sm text-secondary font-medium">{item.item}</span>
                    {item.status ?
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> :
                        <XCircle size={18} className="text-rose-500 shrink-0" />
                    }
                </div>
            ))}
        </div>
    );
};

const ValuationSummary = ({ data }) => {
    if (typeof data === 'string') {
        return (
            <div className="prose prose-invert max-w-none">
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{data}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xs text-muted">Bear Case</div>
                    <div className="text-lg font-bold text-rose-400">${data?.dcf?.bear}</div>
                </div>
                <div className="p-3 bg-indigo-500/20 rounded-lg border border-indigo-500/50 scale-110 shadow-lg">
                    <div className="text-xs text-indigo-300 font-bold uppercase">Base Case</div>
                    <div className="text-xl font-black text-white">${data?.dcf?.base}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xs text-muted">Bull Case</div>
                    <div className="text-lg font-bold text-emerald-400">${data?.dcf?.bull}</div>
                </div>
            </div>

            {data?.consensus && (
                <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg">
                    <span className="text-secondary">Wall St. Consensus</span>
                    <div className="flex gap-4">
                        <span className="text-rose-400 font-bold low">${data.consensus.low}</span>
                        <div className="w-32 h-1.5 bg-white/10 rounded-full self-center relative">
                            <div
                                className="absolute h-2 w-2 bg-white rounded-full top-1/2 -translate-y-1/2"
                                style={{ left: `${((data.dcf?.current - data.consensus.low) / (data.consensus.high - data.consensus.low)) * 100}% ` }}
                            />
                        </div>
                        <span className="text-emerald-400 font-bold high">${data.consensus.high}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const AnalystReport = ({ report }) => {
    if (!report) return null;

    console.log("[AnalystReport] Received report data:", report);
    const { header, executiveSummary, revenueAnalysis, financials, checklist, competition, management, valuation, technical, conclusion, sections } = report;

    // Helper to get raw html for Deep Dive if legacy structure
    const getFinancialDeepDive = () => {
        if (typeof financials === 'string') return financials;
        return sections?.financials || sections?.financialDeepDive || financials || "Financial data loading...";
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto py-12 px-4 space-y-8">

            {/* 0. Header & Recommendation */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-5xl font-black text-white italic tracking-tighter">{header?.ticker}</h1>
                        <span className="text-xl text-secondary">{header?.companyName}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted uppercase tracking-wider">
                        <span>Price: <span className="text-white font-bold">${header?.currentPrice}</span></span>
                        <span>Target: <span className="text-indigo-400 font-bold">${header?.targetPrice}</span></span>
                        <span>Upside: <span className="text-emerald-400 font-bold">{header?.upside}</span></span>
                    </div>
                </div>
                <div className={`text-4xl font-black px-6 py-3 rounded-xl border-2 uppercase tracking-widest transform -rotate-2 ${header?.rating?.includes('Buy') ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' :
                    header?.rating?.includes('Sell') ? 'border-rose-500 text-rose-400 bg-rose-950/30' :
                        'border-amber-500 text-amber-400 bg-amber-950/30'
                    }`}>
                    {header?.rating || "NEUTRAL"}
                </div>
            </div>

            {/* 1. Executive Summary */}
            <SectionCard title="Executive Summary & Profile" icon={Target} color="indigo">
                <ExecutiveSummary data={executiveSummary} />
            </SectionCard>

            {/* 2. Revenue Analysis */}
            <SectionCard title="Revenue Engines & Growth" icon={TrendingUp} insight={revenueAnalysis?.bottomLine} color="emerald">
                <RevenueMatrix data={revenueAnalysis} />
            </SectionCard>

            {/* 3. Financial Deep Dive (PRESERVED) */}
            <SectionCard title="Financial Deep Dive (TTM)" icon={BarChart3} color="blue">
                <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-lg">
                    {getFinancialDeepDive()}
                </div>
            </SectionCard>

            {/* 4. Investment Checklist */}
            <SectionCard title="Investment Checklist" icon={CheckCircle2} insight={checklist?.insight} color="teal">
                <InvestmentChecklist checklist={checklist} />
            </SectionCard>

            {/* 5. Competitors */}
            <SectionCard title="Relative Valuation" icon={Scale} insight={competition?.insight} color="purple">
                {typeof competition === 'string' ? (
                    <div className="prose prose-invert max-w-none">
                        <p className="text-secondary leading-relaxed whitespace-pre-wrap">{competition}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {competition?.peers?.map((peer, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${peer.name.includes(header?.ticker) ? 'bg-indigo-900/40 border-indigo-500' : 'bg-white/5 border-white/5'}`}>
                                    <div className="font-bold text-white mb-2">{peer.name}</div>
                                    <div className="text-xs space-y-1 text-secondary">
                                        <div className="flex justify-between"><span>P/E</span> <span className="text-white">{peer.pe}</span></div>
                                        <div className="flex justify-between"><span>EV/Sales</span> <span className="text-white">{peer.evSales}</span></div>
                                        <div className="flex justify-between"><span>Growth</span> <span className="text-emerald-400">{peer.growth}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-secondary italic border-l-2 border-purple-500 pl-3">{competition?.verdict}</p>
                    </>
                )}
            </SectionCard>

            {/* 6. Management */}
            <SectionCard title="Management & Governance" icon={Users} insight={management?.insight} color="cyan">
                {typeof management === 'string' ? (
                    <div className="prose prose-invert max-w-none">
                        <p className="text-white leading-relaxed whitespace-pre-wrap">{management}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h5 className="text-xs text-muted uppercase mb-2">Skin in the Game</h5>
                            <p className="text-white">{management?.skinInGame}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h5 className="text-xs text-muted uppercase mb-2">Capital Allocation</h5>
                            <p className="text-white">{management?.allocation}</p>
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* 7. Valuation */}
            <SectionCard title="Valuation & Forecast" icon={Gavel} insight={valuation?.insight} color="amber">
                <ValuationSummary data={valuation} />
            </SectionCard>

            {/* 8. Technicals */}
            <SectionCard title="Technical Health" icon={Activity} insight={technical?.insight} color="slate">
                {typeof technical === 'string' ? (
                    <div className="prose prose-invert max-w-none">
                        <p className="text-secondary leading-relaxed whitespace-pre-wrap">{technical}</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {technical?.signals?.map((sig, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                <div className={`w-2 h-2 rounded-full ${sig.status === 'Positive' ? 'bg-emerald-500' : sig.status === 'Negative' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                <span className="text-sm font-bold text-white">{sig.indicator}</span>
                                <span className="text-xs text-muted uppercase">({sig.value})</span>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* 9. Conclusion */}
            <div className="mt-12 p-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500">
                <div className="bg-slate-950 p-8 rounded-xl text-center">
                    <Quote size={40} className="mx-auto text-indigo-400 mb-4 opacity-50" />
                    <h3 className="text-2xl font-black text-white italic mb-4 uppercase">Final Verdict: {conclusion?.verdict}</h3>
                    <p className="text-xl text-white font-serif leading-relaxed mb-6">
                        "{conclusion?.punchline}"
                    </p>
                    <div className="inline-block bg-white/10 px-6 py-2 rounded-full text-sm font-mono text-secondary border border-white/10">
                        <span className="text-indigo-400 font-bold">Next Catalyst:</span> {conclusion?.catalyst}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/10 text-emerald-400 font-bold text-lg flex items-center justify-center gap-2">
                        <Target size={20} />
                        {typeof conclusion?.insight === 'string' ? conclusion.insight.replace(/Action Required:/gi, '').trim() :
                            typeof conclusion === 'string' ? conclusion : 'No insight available'}
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-muted font-mono mt-12 mb-24 opacity-30">
                INSTITUTIONAL EQUITY RESEARCH • TICKER MASTER v2.5 • GENERATED {new Date().toLocaleDateString()}
            </div>

        </motion.div>
    );
};

export default AnalystReport;


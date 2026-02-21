
import React, { useState, useEffect } from 'react';
import { AnalysisResult, TradePlan } from '../types';
import { TrendingUp, TrendingDown, Minus, Copy, CheckCircle, Clock, Lock, Target, AlertTriangle, Archive, FileText, BarChart3, Activity } from 'lucide-react';

interface AnalysisCardProps {
  data: AnalysisResult;
  onSave?: (data: AnalysisResult) => void;
  isSaved?: boolean;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ data, onSave, isSaved = false }) => {
  const [activeTab, setActiveTab] = useState<'SHORT' | 'MEDIUM' | 'LONG'>('SHORT');
  const [localSaved, setLocalSaved] = useState(isSaved);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data.strategy.bestTimeframe) setActiveTab(data.strategy.bestTimeframe);
  }, [data]);

  const activePlan = activeTab === 'SHORT' ? data.strategy.shortTerm : activeTab === 'MEDIUM' ? data.strategy.mediumTerm : data.strategy.longTerm;
  const isForbidden = activePlan.status === 'FORBIDDEN';

  // --- LOGIC FIX: NORMALISASI ORDER FLOW ---
  // Masalah sebelumnya: Skor AI bersifat independen (misal Bid 65, Offer 45 -> Total 110%).
  // Solusi: Hitung proporsi relatif agar total selalu 100% untuk UI Bar.
  const bidRaw = data.supplyDemand?.bidStrength || 0;
  const offerRaw = data.supplyDemand?.offerStrength || 0;
  const totalFlow = bidRaw + offerRaw || 1; // Prevent division by zero
  
  const bidPct = Math.round((bidRaw / totalFlow) * 100);
  const offerPct = 100 - bidPct; // Pastikan sisa persis 100% untuk menghindari rounding error
  // ------------------------------------------

  const handleCopy = async () => {
    const textBuffer = `
[TRADELOGIC INTELLIGENCE REPORT]
TICKER: ${data.ticker}
PRICE: ${data.priceInfo.current} (${data.priceInfo.diffPercent}% vs Avg)
SCORE: ${data.stressTest.score}/100
PROJECTION: ${data.prediction.direction} (${data.prediction.probability}%)
VERDICT: ${activePlan.verdict}

--- EXECUTIVE SUMMARY ---
${data.summary}

--- MARKET STRUCTURE ---
Bid/Offer Balance: ${bidPct}% vs ${offerPct}%
Order Flow Status: ${data.supplyDemand.verdict}
Bandar Insight: ${data.brokerAnalysis.insight}

--- STRATEGY (${activeTab} TERM) ---
Entry: ${isForbidden ? 'N/A' : activePlan.entry}
Target: ${isForbidden ? 'N/A' : activePlan.tp}
Stop Loss: ${isForbidden ? 'N/A' : activePlan.sl}
Rationale: ${activePlan.reasoning}

--- FAILURE MODE (BEAR CASE) ---
${data.bearCase}

--- FORENSIC LOG (${activeTab} TERM) ---
${activeTab === 'SHORT' ? data.shortTermLog : activeTab === 'MEDIUM' ? data.mediumTermLog : data.longTermLog}
    `.trim();

    // Regex super-aggressive untuk menghapus emoji dan simbol grafis
    const cleanText = textBuffer.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}\u{2B06}\u{2B07}\u{2190}-\u{2195}\u{25AA}\u{25AB}\u{25FE}\u{25FD}\u{25FC}\u{25FB}\u{25FA}]/gu, '');

    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const Card = ({ children, className = '', title, icon }: any) => (
      <div className={`bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] rounded-3xl p-6 relative overflow-hidden shadow-sm ${className}`}>
          {title && (
              <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-slate-500">
                  {icon && React.cloneElement(icon, { size: 16 })}
                  <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
              </div>
          )}
          {children}
      </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <div className="flex items-center gap-3">
                  <h1 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">{data.ticker}</h1>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-[#222] text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-[#333]">{data.marketCapAnalysis.category}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                  <span className="text-2xl font-mono text-slate-700 dark:text-slate-200">{data.priceInfo.current}</span>
                  <span className={`text-sm font-bold ${data.priceInfo.diffPercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {data.priceInfo.diffPercent > 0 ? '+' : ''}{data.priceInfo.diffPercent}% vs Avg
                  </span>
              </div>
          </div>
          <div className="flex gap-3">
              <button 
                onClick={handleCopy} 
                className="p-3 bg-slate-100 dark:bg-[#222] hover:bg-slate-200 dark:hover:bg-[#333] text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-[#333] transition-all flex items-center justify-center min-w-[50px]"
                title="Copy Clean Text (No Emoji)"
              >
                  {copied ? <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={20} />}
              </button>

              <button onClick={() => { if(onSave && !localSaved) { onSave(data); setLocalSaved(true); }}} disabled={localSaved} className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${localSaved ? 'bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-slate-500' : 'bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200'}`}>
                  {localSaved ? <CheckCircle size={16}/> : <Archive size={16} />} {localSaved ? 'Saved' : 'Save Case'}
              </button>
          </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* SCORE CARD */}
          <Card className="md:col-span-4 bg-gradient-to-br from-white dark:from-[#111] to-slate-50 dark:to-[#0a0a0a]">
              <div className="flex justify-between items-start">
                  <div>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Forensic Score</span>
                      <div className={`text-6xl font-bold mt-2 ${data.stressTest.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : data.stressTest.score >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-500'}`}>
                          {data.stressTest.score}
                      </div>
                  </div>
                  <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-[#222] flex items-center justify-center">
                       <Activity className="text-slate-400 dark:text-slate-500" />
                  </div>
              </div>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">"{data.summary}"</div>
          </Card>

          {/* PREDICTION CARD */}
          <Card className="md:col-span-4" title="AI Projection" icon={<Target />}>
              <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${data.prediction.direction === 'UP' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                      {data.prediction.direction === 'UP' ? <TrendingUp size={32} /> : data.prediction.direction === 'DOWN' ? <TrendingDown size={32} /> : <Minus size={32} />}
                  </div>
                  <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{data.prediction.direction}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">Confidence: {data.prediction.probability}%</div>
                  </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#222] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${data.prediction.direction === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${data.prediction.probability}%` }}></div>
              </div>
          </Card>

           {/* SUPPLY DEMAND CARD (FIXED) */}
           <Card className="md:col-span-4" title="Order Flow Ratio" icon={<BarChart3 />}>
              <div className="flex justify-between text-xs font-bold mb-2">
                   <span className="text-emerald-600 dark:text-emerald-400">BID: {bidPct}%</span>
                   <span className="text-rose-600 dark:text-rose-400">OFFER: {offerPct}%</span>
               </div>
               <div className="h-4 w-full bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden flex mb-4">
                   {/* Gunakan variabel width yang sudah dinormalisasi */}
                   <div className="h-full bg-emerald-500" style={{ width: `${bidPct}%` }}></div>
                   <div className="h-full bg-rose-500" style={{ width: `${offerPct}%` }}></div>
               </div>
               <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center uppercase tracking-wide">{data.supplyDemand?.verdict}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-600">Raw Score: {bidRaw}/{offerRaw}</div>
               </div>
          </Card>

          {/* STRATEGY WIDGET (Main Feature) */}
          <Card className="md:col-span-8 min-h-[300px]" title="Execution Strategy" icon={<Clock />}>
              <div className="flex gap-2 mb-6 border-b border-slate-100 dark:border-[#222]">
                  {['SHORT', 'MEDIUM', 'LONG'].map(tf => (
                      <button key={tf} onClick={() => setActiveTab(tf as any)} 
                          className={`px-6 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === tf ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}>
                          {tf} TERM {data.strategy.bestTimeframe === tf && <span className="ml-2 text-emerald-600 dark:text-emerald-400">• BEST</span>}
                      </button>
                  ))}
              </div>
              
              {isForbidden ? (
                  <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-6">
                      <AlertTriangle className="text-rose-600 dark:text-rose-500" size={48} />
                      <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Strategy Forbidden</h3>
                          <p className="text-rose-800 dark:text-rose-200/70">{activePlan.reasoning}</p>
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4 col-span-1">
                          <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-[#333]">
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Entry</div>
                              <div className="text-lg font-mono text-blue-600 dark:text-blue-400">{activePlan.entry}</div>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-[#333]">
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Target</div>
                              <div className="text-lg font-mono text-emerald-600 dark:text-emerald-400">{activePlan.tp}</div>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-[#333]">
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Stop Loss</div>
                              <div className="text-lg font-mono text-rose-600 dark:text-rose-400">{activePlan.sl}</div>
                          </div>
                      </div>
                      <div className="col-span-2 p-6 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-[#333]">
                          <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase mb-3">Rationale</div>
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm">{activePlan.reasoning}</p>
                          <div className={`mt-4 inline-block px-3 py-1 rounded text-xs font-bold ${activePlan.status === 'RECOMMENDED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                              VERDICT: {activePlan.verdict}
                          </div>
                      </div>
                  </div>
              )}
          </Card>

          {/* BEAR CASE */}
          <Card className="md:col-span-4" title="Failure Mode" icon={<AlertTriangle />}>
               <p className="text-rose-700 dark:text-rose-200/80 text-sm leading-relaxed">{data.bearCase}</p>
          </Card>

          {/* FULL LOG */}
          <Card className="md:col-span-12" title={`Forensic Log: ${activeTab} TERM`} icon={<FileText />}>
              <div className="bg-slate-50 dark:bg-[#0a0a0a] p-6 rounded-xl border border-slate-100 dark:border-[#222] font-mono text-xs text-slate-500 dark:text-slate-400 leading-loose h-64 overflow-y-auto">
                  <p className="whitespace-pre-line">
                      {activeTab === 'SHORT' ? data.shortTermLog : activeTab === 'MEDIUM' ? data.mediumTermLog : data.longTermLog}
                  </p>
              </div>
          </Card>
      </div>
    </div>
  );
};

export default AnalysisCard;

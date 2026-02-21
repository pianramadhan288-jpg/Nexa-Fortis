import React, { useState, useMemo, useEffect } from 'react';
import { StockAnalysisInput, CapitalTier, AppConfig } from '../types';
import { ChevronRight, Info, AlertCircle, Lock, Wallet, ShieldCheck, Zap, RotateCcw, AlertTriangle, Camera, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { extractFundamentalsFromImage } from '../services/geminiService';

interface InputFormProps {
  onSubmit: (data: StockAnalysisInput) => void;
  loading: boolean;
  defaultConfig?: AppConfig; 
}

const DRAFT_KEY = 'tradeLogic_formDraft';

const CAPITAL_ADVICE = {
  MICRO: { 
    label: "Micro", 
    sub: "< 100 Juta", 
    limit: 100000000,
    color: "emerald", 
    icon: <Zap size={18} />, 
    advice: "Strategic Focus: High Agility.", 
    detail: "Modal cair. Masuk/keluar cepat (Scalping) tanpa mengganggu harga pasar." 
  },
  RETAIL: { 
    label: "Retail", 
    sub: "100jt - 500jt", 
    limit: 500000000,
    color: "blue", 
    icon: <Wallet size={18} />, 
    advice: "Strategic Focus: Growth.", 
    detail: "Bangun portofolio Swing. Hati-hati dengan likuiditas saham gorengan." 
  },
  HIGH_NET: { 
    label: "High Net", 
    sub: "500jt - 5M", 
    limit: 5000000000,
    color: "purple", 
    icon: <ShieldCheck size={18} />, 
    advice: "Strategic Focus: Asset Preservation.", 
    detail: "Wajib perhatikan Likuiditas (Bid/Offer). Jangan HAKA membabi buta." 
  },
  INSTITUTIONAL: { 
    label: "Whale", 
    sub: "> 5 Miliar", 
    limit: 999999999999999,
    color: "amber", 
    icon: <Lock size={18} />, 
    advice: "Strategic Focus: Dominance.", 
    detail: "Entry Anda menggerakkan harga. Wajib analisa Fundamental & Cash Flow." 
  }
};

const INITIAL_STATE: StockAnalysisInput = {
    ticker: '', price: '', capital: '', capitalTier: 'RETAIL', riskProfile: 'BALANCED',
    persona: 'INSTITUTIONAL',
    fundamentals: { 
        roe: '', roa: '', gpm: '', opm: '', npm: '', eps_ttm: '',
        rev_q_yoy: '', rev_ytd_yoy: '', rev_ann_yoy: '', ni_q_yoy: '', ni_ytd_yoy: '', ni_ann_yoy: '', eps_q_yoy: '', eps_ytd_yoy: '', eps_ann_yoy: '',
        per_ttm: '', per_ann: '', pbv: '', ev_ebitda: '', ps_ttm: '', pcf_ttm: '',
        total_assets: '', total_liabilities: '', total_debt: '', net_debt: '', der: '', current_ratio: '', quick_ratio: '',
        cfo_ttm: '', cfi_ttm: '', cff_ttm: '', capex_ttm: '', fcf_ttm: '',
        eps_ann_ps: '', rev_ps: '', cash_ps: '', bvps: '', fcfps: '',
        market_cap: '', free_float: ''
    },
    aiExtractedFundamentals: '',
    bandarmology: { orderBookBid: '', orderBookAsk: '', tradeBookBid: '', tradeBookAsk: '', brokerSummaryVal: 50, topBrokers: '', duration: '', bandarAvgPrice: '' },
    rawIntelligenceData: '',
    newsData: ''
};

const StyledInput = ({ label, value, onChange, type = "text", placeholder, width = "full", error }: any) => (
  <div className={`${width === 'half' ? '' : 'w-full'}`}>
      <div className="flex justify-between">
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{label}</label>
        {error && <span className="text-[10px] font-bold text-rose-500 uppercase animate-pulse">{error}</span>}
      </div>
      <input 
          type={type}
          className={`w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-[#111] transition-all ${value === '' ? '' : 'border-indigo-500/30'} ${error ? 'border-rose-500 focus:border-rose-500' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
      />
  </div>
);

const InputForm: React.FC<InputFormProps> = ({ onSubmit, loading, defaultConfig }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<StockAnalysisInput>(INITIAL_STATE);
  
  // Logic Guard State
  const [capitalWarning, setCapitalWarning] = useState<string | null>(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
        try {
            const parsed = JSON.parse(savedDraft);
            setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) { console.error("Failed to load draft"); }
    } else if (defaultConfig) {
        setFormData(prev => ({
            ...prev,
            capitalTier: defaultConfig.defaultTier,
            riskProfile: defaultConfig.riskProfile
        }));
    }
  }, []); 

  // Watch for config changes
  useEffect(() => {
      if (defaultConfig && !localStorage.getItem(DRAFT_KEY)) {
          setFormData(prev => ({ ...prev, capitalTier: defaultConfig.defaultTier, riskProfile: defaultConfig.riskProfile }));
      }
  }, [defaultConfig]);

  // CAPITAL VALIDATION LOGIC
  useEffect(() => {
    if (!formData.capital) {
        setCapitalWarning(null);
        return;
    }

    const amount = parseFloat(formData.capital);
    const tier = formData.capitalTier;
    
    // Check Micro Mismatch
    if (tier === 'MICRO' && amount > 150000000) {
        setCapitalWarning("CRITICAL: Nominal modal terlalu besar untuk Tier MICRO.");
    } 
    // Check Retail Mismatch
    else if (tier === 'RETAIL' && amount > 600000000) {
        setCapitalWarning("WARNING: Modal Anda mendekati High Net Worth. Pertimbangkan upgrade Tier.");
    }
    // Check Whale Mismatch (Too Small)
    else if (tier === 'INSTITUTIONAL' && amount < 1000000000) {
        setCapitalWarning("INVALID: Tier Institutional butuh modal minimal 1 Miliar.");
    }
    else {
        setCapitalWarning(null);
    }
  }, [formData.capital, formData.capitalTier]);

  useEffect(() => {
    if (formData !== INITIAL_STATE) localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleReset = () => {
      if (confirm("Reset all inputs?")) {
          setFormData({
              ...INITIAL_STATE,
              capitalTier: defaultConfig?.defaultTier || 'RETAIL',
              riskProfile: defaultConfig?.riskProfile || 'BALANCED'
          });
          localStorage.removeItem(DRAFT_KEY);
          setStep(1);
      }
  };

  const handleChange = (section: keyof StockAnalysisInput | null, field: string, value: any) => {
    if (section && typeof formData[section] === 'object') {
      setFormData(prev => ({ ...prev, [section]: { ...prev[section] as any, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const isStepValid = (s: number) => {
      if (s === 1) return formData.ticker && formData.price && formData.capital;
      if (s === 2) {
          const hasManual = formData.fundamentals.roe !== '' && formData.fundamentals.per_ttm !== '';
          const hasAI = formData.aiExtractedFundamentals.length > 50;
          return hasManual || hasAI;
      }
      if (s === 3) return formData.bandarmology.topBrokers && formData.bandarmology.bandarAvgPrice;
      if (s === 4) return formData.rawIntelligenceData.length > 50;
      return false;
  };

  const renderStep1 = () => {
    const activeAdvice = CAPITAL_ADVICE[formData.capitalTier];
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="grid grid-cols-2 gap-6">
              <StyledInput label="Ticker" value={formData.ticker} onChange={(e: any) => handleChange(null, 'ticker', e.target.value.toUpperCase())} placeholder="BBCA" />
              <StyledInput label="Price" type="number" value={formData.price} onChange={(e: any) => handleChange(null, 'price', e.target.value)} placeholder="Current Price" />
          </div>
          
          <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-widest">Capital Tier</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {(Object.keys(CAPITAL_ADVICE) as CapitalTier[]).map((tier) => {
                      const info = CAPITAL_ADVICE[tier];
                      const active = formData.capitalTier === tier;
                      return (
                          <button key={tier} type="button" onClick={() => handleChange(null, 'capitalTier', tier)}
                              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${active ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white ring-2 ring-indigo-500/20' : 'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#333] text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-[#555]'}`}>
                              <div className="flex items-center gap-2 mb-1 text-sm font-bold">{info.icon} {info.label}</div>
                              <div className="text-[10px] opacity-70 font-mono">{info.sub}</div>
                          </button>
                      )
                  })}
              </div>

              {/* Dynamic Advice Card */}
              <div className={`p-5 rounded-xl border transition-all duration-300 bg-${activeAdvice.color}-500/5 border-${activeAdvice.color}-500/20`}>
                 <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${activeAdvice.color}-500/10 text-${activeAdvice.color}-400 shrink-0`}>
                        <Info size={18} />
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold text-${activeAdvice.color}-400 mb-1`}>{activeAdvice.advice}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{activeAdvice.detail}</p>
                    </div>
                 </div>
              </div>
          </div>

          <div>
            <StyledInput 
                label="Total Capital (IDR)" 
                value={formData.capital} 
                onChange={(e: any) => handleChange(null, 'capital', e.target.value)} 
                placeholder="Ex: 100000000" 
                error={capitalWarning}
            />
            {capitalWarning && (
                <div className="mt-2 flex items-center gap-2 text-rose-400 text-xs font-bold bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <AlertTriangle size={14} />
                    {capitalWarning}
                </div>
            )}
          </div>
      </div>
    );
  };

  const [fundTab, setFundTab] = useState<'PROFIT' | 'GROWTH' | 'VAL' | 'BS' | 'CF' | 'PS'>('PROFIT');
  const [fundMode, setFundMode] = useState<'MANUAL' | 'PHOTO'>('MANUAL');
  const [isExtracting, setIsExtracting] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (event) => {
              const base64 = event.target?.result as string;
              setPendingImages(prev => [...prev, base64]);
          };
          reader.readAsDataURL(file);
      });
  };

  const removePendingImage = (index: number) => {
      setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const processPendingImages = async () => {
      if (pendingImages.length === 0) return;
      
      setIsExtracting(true);
      try {
          const extractedText = await extractFundamentalsFromImage(pendingImages);
          setFormData(prev => ({
              ...prev,
              aiExtractedFundamentals: extractedText
          }));
          setFundMode('MANUAL'); // Switch back to manual to review
          setPendingImages([]); // Clear queue
          alert("Data extracted successfully. See the AI Extracted Fundamentals box below.");
      } catch (err) {
          console.error(err);
          alert("Failed to extract data. Ensure images are clear screenshots of KeyStats.");
      } finally {
          setIsExtracting(false);
      }
  };

  const renderStep2 = () => {
    const categories = {
        PROFIT: [
            { id: 'roe', label: 'ROE TTM (%)' },
            { id: 'roa', label: 'ROA TTM (%)' },
            { id: 'gpm', label: 'Gross Margin (%)' },
            { id: 'opm', label: 'Operating Margin (%)' },
            { id: 'npm', label: 'Net Margin (%)' },
            { id: 'eps_ttm', label: 'EPS TTM' },
        ],
        GROWTH: [
            { id: 'rev_q_yoy', label: 'Rev Q YoY (%)' },
            { id: 'rev_ytd_yoy', label: 'Rev YTD YoY (%)' },
            { id: 'rev_ann_yoy', label: 'Rev Ann YoY (%)' },
            { id: 'ni_q_yoy', label: 'NI Q YoY (%)' },
            { id: 'ni_ytd_yoy', label: 'NI YTD YoY (%)' },
            { id: 'ni_ann_yoy', label: 'NI Ann YoY (%)' },
            { id: 'eps_q_yoy', label: 'EPS Q YoY (%)' },
            { id: 'eps_ytd_yoy', label: 'EPS YTD YoY (%)' },
            { id: 'eps_ann_yoy', label: 'EPS Ann YoY (%)' },
        ],
        VAL: [
            { id: 'per_ttm', label: 'PER TTM' },
            { id: 'per_ann', label: 'PER Ann' },
            { id: 'pbv', label: 'PBV' },
            { id: 'ev_ebitda', label: 'EV/EBITDA' },
            { id: 'ps_ttm', label: 'P/S TTM' },
            { id: 'pcf_ttm', label: 'P/CF TTM' },
            { id: 'market_cap', label: 'Market Cap' },
            { id: 'free_float', label: 'Free Float (%)' },
        ],
        BS: [
            { id: 'total_assets', label: 'Total Assets' },
            { id: 'total_liabilities', label: 'Total Liabilities' },
            { id: 'total_debt', label: 'Total Debt' },
            { id: 'net_debt', label: 'Net Debt' },
            { id: 'der', label: 'DER (x)' },
            { id: 'current_ratio', label: 'Current Ratio' },
            { id: 'quick_ratio', label: 'Quick Ratio' },
        ],
        CF: [
            { id: 'cfo_ttm', label: 'CFO TTM' },
            { id: 'cfi_ttm', label: 'CFI TTM' },
            { id: 'cff_ttm', label: 'CFF TTM' },
            { id: 'capex_ttm', label: 'CapEx TTM' },
            { id: 'fcf_ttm', label: 'FCF TTM' },
        ],
        PS: [
            { id: 'eps_ann_ps', label: 'EPS Ann (PS)' },
            { id: 'rev_ps', label: 'Rev (PS)' },
            { id: 'cash_ps', label: 'Cash (PS)' },
            { id: 'bvps', label: 'BVPS' },
            { id: 'fcfps', label: 'FCF (PS)' },
        ]
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          {/* Mode Selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#333] w-fit">
              <button 
                type="button"
                onClick={() => setFundMode('MANUAL')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${fundMode === 'MANUAL' ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
              >
                  Manual Input
              </button>
              <button 
                type="button"
                onClick={() => setFundMode('PHOTO')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${fundMode === 'PHOTO' ? 'bg-slate-900 dark:bg-white text-white dark:text-black' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
              >
                  Photo / Screenshot
              </button>
          </div>

          {fundMode === 'PHOTO' ? (
              <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-3xl bg-slate-50 dark:bg-[#111] hover:border-indigo-500/50 transition-colors group">
                      {isExtracting ? (
                          <div className="flex flex-col items-center">
                              <Loader2 size={48} className="text-indigo-600 dark:text-indigo-500 animate-spin mb-4" />
                              <p className="text-slate-900 dark:text-white font-bold">AI is reading {pendingImages.length} image(s)...</p>
                              <p className="text-slate-500 text-xs mt-1">Merging data points into a single report</p>
                          </div>
                      ) : (
                          <>
                              <div className="p-4 bg-slate-100 dark:bg-[#1a1a1a] rounded-full text-slate-400 dark:text-slate-500 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  <Camera size={48} />
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload KeyStats Screenshots</h3>
                              <p className="text-slate-500 text-sm mb-6 text-center max-w-xs">You can upload multiple screenshots (e.g. top and bottom of KeyStats).</p>
                              <label className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2">
                                  <Upload size={18} /> Select Images
                                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                              </label>
                          </>
                      )}
                  </div>

                  {pendingImages.length > 0 && !isExtracting && (
                      <div className="animate-in fade-in slide-in-from-bottom-4">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="text-sm font-bold text-white uppercase tracking-widest">Upload Queue ({pendingImages.length})</h4>
                              <button onClick={() => setPendingImages([])} className="text-xs text-rose-500 hover:text-rose-400 font-bold">Clear All</button>
                          </div>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
                              {pendingImages.map((img, idx) => (
                                  <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#333] group">
                                      <img src={img} className="w-full h-full object-cover" />
                                      <button 
                                          onClick={() => removePendingImage(idx)}
                                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <RotateCcw size={12} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                          <button 
                              onClick={processPendingImages}
                              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02]"
                          >
                              Run Fundamental Extraction
                          </button>
                      </div>
                  )}
              </div>
          ) : (
              <>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {(Object.keys(categories) as Array<keyof typeof categories>).map(cat => (
                          <button key={cat} type="button" onClick={() => setFundTab(cat)}
                              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 ${fundTab === cat ? 'bg-white text-black' : 'bg-[#1a1a1a] text-slate-500 hover:text-slate-300'}`}>
                              {cat}
                          </button>
                      ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {categories[fundTab].map((field) => (
                          <StyledInput key={field.id} label={field.label} value={(formData.fundamentals as any)[field.id]} onChange={(e: any) => handleChange('fundamentals', field.id, e.target.value)} placeholder="0.0" />
                      ))}
                  </div>

                  {/* AI Extracted Text Area */}
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-[#222]">
                      <div className="flex items-center gap-2 mb-4">
                          <ImageIcon size={16} className="text-indigo-600 dark:text-indigo-500" />
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI Extracted Fundamentals (From Photos)</label>
                      </div>
                      <textarea 
                        className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl p-4 text-slate-700 dark:text-slate-300 font-mono text-xs outline-none h-48 resize-none focus:border-indigo-500 transition-colors" 
                        placeholder="AI extraction results will appear here..." 
                        value={formData.aiExtractedFundamentals} 
                        onChange={(e) => handleChange(null, 'aiExtractedFundamentals', e.target.value)} 
                      />
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 italic">*Jika input manual di atas kosong, AI akan menggunakan data dari kotak ini untuk analisis.</p>
                  </div>
              </>
          )}
      </div>
    );
  };

  const renderStep3 = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#333]">
              <div className="flex justify-between text-[10px] font-bold uppercase mb-4 text-slate-400 dark:text-slate-500">
                  <span>Distribution</span><span>Neutral</span><span>Accumulation</span>
              </div>
              <input type="range" min="0" max="100" className="w-full h-1 bg-slate-200 dark:bg-[#333] rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white" value={formData.bandarmology.brokerSummaryVal} onChange={(e) => handleChange('bandarmology', 'brokerSummaryVal', parseInt(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <StyledInput label="Top Brokers" value={formData.bandarmology.topBrokers} onChange={(e: any) => handleChange('bandarmology', 'topBrokers', e.target.value.toUpperCase())} placeholder="e.g. MG, ZP buying from XL" />
              <StyledInput label="Avg Price" type="number" value={formData.bandarmology.bandarAvgPrice} onChange={(e: any) => handleChange('bandarmology', 'bandarAvgPrice', e.target.value)} placeholder="Avg Price" />
              <div className="col-span-2"><StyledInput label="Duration" value={formData.bandarmology.duration} onChange={(e: any) => handleChange('bandarmology', 'duration', e.target.value)} placeholder="Last 3 Months" /></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
               {/* Order Book Inputs */}
               <div className="bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-200 dark:border-[#333]">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase">Order Book Bid (Support)</label>
                  <textarea className="w-full bg-transparent border-none text-slate-900 dark:text-white font-mono text-xs h-24 outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700" placeholder="Paste Bid Volume..." value={formData.bandarmology.orderBookBid} onChange={(e) => handleChange('bandarmology', 'orderBookBid', e.target.value)} />
              </div>
              <div className="bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-200 dark:border-[#333]">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase">Order Book Ask (Resistance)</label>
                  <textarea className="w-full bg-transparent border-none text-slate-900 dark:text-white font-mono text-xs h-24 outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700" placeholder="Paste Ask Volume..." value={formData.bandarmology.orderBookAsk} onChange={(e) => handleChange('bandarmology', 'orderBookAsk', e.target.value)} />
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              {/* Trade Book Inputs - EXPLICIT LABELS AS REQUESTED */}
              <div className="bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-200 dark:border-[#333]">
                  <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-500 mb-2 uppercase flex items-center gap-2">
                      <Zap size={12}/> BUY (HAKA - Aggressive Buy)
                  </label>
                  <textarea 
                    className="w-full bg-transparent border-none text-slate-900 dark:text-white font-mono text-xs h-16 outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                    placeholder="Volume hitting Offer..."
                    value={formData.bandarmology.tradeBookAsk} 
                    onChange={(e) => handleChange('bandarmology', 'tradeBookAsk', e.target.value)} 
                  />
              </div>

              <div className="bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-200 dark:border-[#333]">
                  <label className="block text-[10px] font-bold text-rose-600 dark:text-rose-500 mb-2 uppercase flex items-center gap-2">
                      <AlertCircle size={12}/> SELL (HAKI - Aggressive Sell)
                  </label>
                  <textarea 
                    className="w-full bg-transparent border-none text-slate-900 dark:text-white font-mono text-xs h-16 outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                    placeholder="Volume hitting Bid..."
                    value={formData.bandarmology.tradeBookBid} 
                    onChange={(e) => handleChange('bandarmology', 'tradeBookBid', e.target.value)} 
                  />
              </div>
          </div>
      </div>
  );

  const renderStep4 = () => (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-500 text-xs">
              <AlertCircle size={14} /> <span>Mandatory: Paste raw data containing market cap, volume, etc.</span>
          </div>
          <div className="space-y-4">
              <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Raw Intelligence Data</label>
                  <textarea className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl p-4 text-slate-700 dark:text-slate-300 font-mono text-xs outline-none h-48 resize-none focus:border-indigo-500 transition-colors" placeholder="Paste full report..." value={formData.rawIntelligenceData} onChange={(e) => handleChange(null, 'rawIntelligenceData', e.target.value)} />
              </div>
              <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Corporate Action & News (Optional)</label>
                  <textarea className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl p-4 text-slate-700 dark:text-slate-300 font-mono text-xs outline-none h-32 resize-none focus:border-indigo-500 transition-colors" placeholder="Paste news or corporate action info here..." value={formData.newsData} onChange={(e) => handleChange(null, 'newsData', e.target.value)} />
              </div>
          </div>
      </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4)) onSubmit(formData); }} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] rounded-3xl p-8 shadow-2xl transition-colors">
      <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
              {[1, 2, 3, 4].map(s => (
                  <div key={s} onClick={() => setStep(s)} className={`h-1.5 w-12 rounded-full cursor-pointer transition-all ${step === s ? 'bg-slate-900 dark:bg-white' : s < step ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-[#333]'}`}></div>
              ))}
          </div>
          <div className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">{step === 1 ? 'Identity' : step === 2 ? 'Metrics' : step === 3 ? 'Bandarmology' : 'Intelligence'}</div>
      </div>

      <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-100 dark:border-[#222] mt-6">
          <button type="button" onClick={handleReset} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase flex items-center gap-2"><RotateCcw size={14}/> Reset</button>
          <div className="flex gap-3">
              {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:hover:bg-[#252525] text-slate-900 dark:text-white rounded-xl font-bold text-sm transition-colors">Back</button>}
              {step < 4 ? 
                  <button type="button" disabled={!isStepValid(step)} onClick={() => setStep(step + 1)} className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${isStepValid(step) ? 'bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200' : 'bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}>Next <ChevronRight size={16}/></button> :
                  <button type="submit" disabled={loading || !isStepValid(4)} className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${!loading && isStepValid(4) ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 dark:bg-[#222] text-slate-400 dark:text-slate-600'}`}>{loading ? 'Processing...' : 'Run Analysis'}</button>
              }
          </div>
      </div>
    </form>
  );
};
export default InputForm;
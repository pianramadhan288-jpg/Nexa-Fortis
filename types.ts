
export enum AnalysisVerdict {
  ACCUMULATE = 'ACCUMULATE',
  REDUCE = 'REDUCE',
  AVOID = 'AVOID',
  WAIT = 'WAIT & SEE'
}

export type CapitalTier = 'MICRO' | 'RETAIL' | 'HIGH_NET' | 'INSTITUTIONAL';
export type RiskProfile = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
export type PersonaType = 'INSTITUTIONAL' | 'RETAIL_SEMI_FORMAL';

export interface AppConfig {
  defaultTier: CapitalTier;
  riskProfile: RiskProfile;
  userName: string;
  persona: PersonaType;
  theme: 'dark' | 'light';
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface StockAnalysisInput {
  ticker: string;
  price: string;
  capital: string;
  capitalTier: CapitalTier;
  riskProfile: RiskProfile; // Added logic injection
  persona: PersonaType;
  fundamentals: {
    // Profitability
    roe: string;
    roa: string;
    gpm: string;
    opm: string;
    npm: string;
    eps_ttm: string;
    
    // Growth
    rev_q_yoy: string;
    rev_ytd_yoy: string;
    rev_ann_yoy: string;
    ni_q_yoy: string;
    ni_ytd_yoy: string;
    ni_ann_yoy: string;
    eps_q_yoy: string;
    eps_ytd_yoy: string;
    eps_ann_yoy: string;

    // Valuation
    per_ttm: string;
    per_ann: string;
    pbv: string;
    ev_ebitda: string;
    ps_ttm: string;
    pcf_ttm: string;

    // Balance Sheet
    total_assets: string;
    total_liabilities: string;
    total_debt: string;
    net_debt: string;
    der: string;
    current_ratio: string;
    quick_ratio: string;

    // Cash Flow
    cfo_ttm: string;
    cfi_ttm: string;
    cff_ttm: string;
    capex_ttm: string;
    fcf_ttm: string;

    // Per Share
    eps_ann_ps: string;
    rev_ps: string;
    cash_ps: string;
    bvps: string;
    fcfps: string;

    // Other
    market_cap: string;
    free_float: string;
  };
  aiExtractedFundamentals: string;
  bandarmology: {
    // Split OrderBook
    orderBookBid: string;
    orderBookAsk: string;
    // Split TradeBook
    tradeBookBid: string;
    tradeBookAsk: string;
    
    brokerSummaryVal: number; // 0 to 100
    topBrokers: string;
    duration: string;
    bandarAvgPrice: string;
  };
  rawIntelligenceData: string;
  newsData: string;
}

export interface TradePlan {
  verdict: string;
  entry: string;
  tp: string;
  sl: string;
  reasoning: string;
  status: 'RECOMMENDED' | 'POSSIBLE' | 'FORBIDDEN';
}

export interface AnalysisResult {
  id: string; // Unique ID for Vault
  timestamp: number; // For time-series analysis
  ticker: string;
  priceInfo: {
    current: string;
    bandarAvg: string;
    diffPercent: number;
    status: string;
  };
  marketCapAnalysis: {
    category: string;
    behavior: string;
  };
  supplyDemand: {
    bidStrength: number; // 0-100
    offerStrength: number; // 0-100
    verdict: string; // e.g., "SUPPLY OVERWHELMING"
  };
  prediction: {
    direction: 'UP' | 'DOWN' | 'CONSOLIDATE';
    probability: number;
    reasoning: string;
  };
  stressTest: {
    passed: boolean;
    score: number;
    details: string;
  };
  brokerAnalysis: {
    classification: string;
    insight: string;
  };
  summary: string;
  bearCase: string;
  
  strategy: {
    bestTimeframe: 'SHORT' | 'MEDIUM' | 'LONG';
    shortTerm: TradePlan;
    mediumTerm: TradePlan;
    longTerm: TradePlan;
  };

  fullAnalysis: string;
  shortTermLog: string;
  mediumTermLog: string;
  longTermLog: string;
  sources: GroundingSource[];
}

export interface ConsistencyResult {
  ticker: string;
  dataPoints: number;
  trendVerdict: 'IMPROVING' | 'STABLE' | 'DEGRADING' | 'VOLATILE';
  consistencyScore: number; // 0-100
  analysis: string;
  actionItem: string;
}

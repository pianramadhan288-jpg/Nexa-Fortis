import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, StockAnalysisInput, GroundingSource, ConsistencyResult } from "../types";

// Note: Client initialization is now handled dynamically inside the retry loop to ensure freshness.

const BROKER_KNOWLEDGE = `
[INTELLIGENCE DATABASE: IDX BROKER MAP]
MS: 'RICH', desc: 'Morgan Stanley: Asing US.' 
  UB: 'RICH', desc: 'UBS: Asing kuat.' 
  BK: 'RICH', desc: 'JP Morgan: Arus institusi.' 
  AK: 'RICH', desc: 'UBS Patungan.' 
  YP: 'RICH', desc: 'Mirae Asset: Top Ritel Pro & Institusi.' 
  ZP: 'RICH', desc: 'MNC Sekuritas: Institusi Lokal.' 
  HD: 'RICH', desc: 'KGI Sekuritas.' 
  RX: 'RICH', desc: 'RHB Sekuritas.' 
  DU: 'RICH', desc: 'Deutsche Sekuritas.' 
  CG: 'RICH', desc: 'CGS-CIMB.' 
  KZ: 'RICH', desc: 'CLSA Sekuritas.' 
  DR: 'RICH', desc: 'Danareksa (Institusi).' 
  LH: 'RICH', desc: 'Lautandhana.' 
  AH: 'RICH', desc: 'Andalan.' 
  GW: 'RICH', desc: 'Golden.' 
  RB: 'RICH', desc: 'RHB.' 
  TP: 'RICH', desc: 'Trimegah (Institusi).' 
  KK: 'RICH', desc: 'Kresna.' 
  LS: 'RICH', desc: 'Laurent.' 

  // --- KONGLO SPESIAL (Market Maker / Group) ---
  HP: 'KONGLO', desc: 'Henan Putihrai: Spesialis grup konglomerasi.' 
  DX: 'KONGLO', desc: 'Bahana (Kadang Institusi/Konglo).' 
  LG: 'KONGLO', desc: 'Trimegah (Akun Khusus).' 
  MU: 'KONGLO', desc: 'Minna Padi.' 
  ES: 'KONGLO', desc: 'Ekosistem Grup Tertentu.' 
  MG: 'KONGLO', desc: 'Semesta Indovest (Sering jadi MM).' 

  // --- AMPAS / RITEL (Crowd / Lemah) ---
  XL: 'AMPAS', desc: 'Stockbit: Ritel crowd, panic easy.' 
  XC: 'AMPAS', desc: 'Ajaib: Ritel pemula & mahasiswa.' 
  PD: 'AMPAS', desc: 'Indo Premier: Ritel massal.' 
  CC: 'AMPAS', desc: 'Mandiri Sekuritas (Akun Ritel).' 
  CP: 'AMPAS', desc: 'Valbury (Ritel).' 
  NI: 'AMPAS', desc: 'BNI Sekuritas (Ritel).' 
  IF: 'AMPAS', desc: 'Samuel Sekuritas (Ritel).' 
  BB: 'AMPAS', desc: 'Verdhana (Ritel).' 
  SS: 'AMPAS', desc: 'Ajaib (Kode lama/baru).' 
  BQ: 'AMPAS', desc: 'Korea Investment (Ritel).' 
  GR: 'AMPAS', desc: 'Panin (Ritel).' 
  SA: 'AMPAS', desc: 'Ritel Kecil.' 
  SC: 'AMPAS', desc: 'Ritel Kecil.' 
  SF: 'AMPAS', desc: 'Surya Fajar.' 
  SH: 'AMPAS', desc: 'Artha Sekuritas (Ritel).' 
  SQ: 'AMPAS', desc: 'BCA Sekuritas (Ritel).' 
  TF: 'AMPAS', desc: 'Universal.' 
  TS: 'AMPAS', desc: 'Tri Megah (Ritel).' 
  TX: 'AMPAS', desc: 'Ritel.' 
  XA: 'AMPAS', desc: 'Ritel.' 
  YB: 'AMPAS', desc: 'Mega Capital (Ritel).' 
  YJ: 'AMPAS', desc: 'Lotus (Ritel).' 
  YO: 'AMPAS', desc: 'Amantara.' 
  ZR: 'AMPAS', desc: 'Bumiputera.' 

  // --- CAMPUR (Mixed / Unknown / Tidak Signifikan) ---
  AD: 'CAMPUR', desc: 'Oso Sekuritas.' 
  AF: 'CAMPUR', desc: 'Harita.' 
  AG: 'CAMPUR', desc: 'Kiwoom.' 
  AI: 'CAMPUR', desc: 'UOB Kay Hian.' 
  AJ: 'CAMPUR', desc: 'Pillars.' 
  AN: 'CAMPUR', desc: 'Wanteg.' 
  AO: 'CAMPUR', desc: 'Erdikha.' 
  AP: 'CAMPUR', desc: 'Pacific.' 
  AR: 'CAMPUR', desc: 'Binaartha.' 
  AZ: 'CAMPUR', desc: 'Sucor (Campur Ritel/Institusi).' 
  BF: 'CAMPUR', desc: 'Inti Fikasa.' 
  BS: 'CAMPUR', desc: 'Equity.' 
  BZ: 'CAMPUR', desc: 'Batavia.' 
  DD: 'CAMPUR', desc: 'Makinta.' 
  DM: 'CAMPUR', desc: 'Masindo.' 
  DP: 'CAMPUR', desc: 'DBS Vickers.' 
  EL: 'CAMPUR', desc: 'Evergreen.' 
  FO: 'CAMPUR', desc: 'Forte.' 
  FS: 'CAMPUR', desc: 'Fasilitas.' 
  FZ: 'CAMPUR', desc: 'Waterfront.' 
  IC: 'CAMPUR', desc: 'BCA (Campur).' 
  ID: 'CAMPUR', desc: 'Anugerah.' 
  IH: 'CAMPUR', desc: 'Pacific 2000.' 
  II: 'CAMPUR', desc: 'Danatama.' 
  IN: 'CAMPUR', desc: 'Investindo.' 
  IT: 'CAMPUR', desc: 'Inti Teladan.' 
  IU: 'CAMPUR', desc: 'Indo Capital.' 
  JB: 'CAMPUR', desc: 'Jasa Utama.' 
  KI: 'CAMPUR', desc: 'Ciptadana.' 
  KS: 'CAMPUR', desc: 'Karta.' 
  MI: 'CAMPUR', desc: 'Victoria.' 
  MK: 'CAMPUR', desc: 'MNC (Campur).' 
  OD: 'CAMPUR', desc: 'Danareksa.' 
  OK: 'CAMPUR', desc: 'Nett.' 
  PC: 'CAMPUR', desc: 'Panca Global.' 
  PF: 'CAMPUR', desc: 'Danasakti.' 
  PG: 'CAMPUR', desc: 'Panca Global.' 
  PI: 'CAMPUR', desc: 'Pendanaan.' 
  PO: 'CAMPUR', desc: 'Pilar.' 
  PP: 'CAMPUR', desc: 'Aldiracita.' 
  PS: 'CAMPUR', desc: 'Paramitra.' 
  RG: 'CAMPUR', desc: 'Profindo.' 
  RO: 'CAMPUR', desc: 'NISP.' 
  RS: 'CAMPUR', desc: 'Yulie.' 
  YU: 'CAMPUR', desc: 'CIMB.' 
  KAF: 'CAMPUR', desc: 'KAF Sekuritas.'
`;

const SCALPING_LOGIC = `
[MODULE 1: SCALPING / SHORT-TERM LOGIC]
ROLE:
Anda adalah AI Market Microstructure Analyst.
Fokus 100% pada Bandarmology & Tape Reading.
Abaikan fundamental, abaikan berita, abaikan sektor, abaikan narasi publik.
Tujuan: membaca tekanan bandar dan mencari momentum harga dalam hitungan jam hingga maksimal beberapa hari.

INPUT YANG DITERIMA:
1. Status Bandar: BIG ACC / BIG DIST / NETRAL
2. Order Book:
   - Total Buyer lot
   - Total Seller lot
3. Trade Book:
   - % Buyer Aggressor
   - % Seller Aggressor
4. Top Broker Summary (minimal 5 broker):
   - Kategori broker: RICH / KONGLO / AMPAS / CAMPUR
   - Posisi: Net Buy / Net Sell
   - Besaran volume

INTERPRETASI KATEGORI:
- RICH = Smart Money / Institusi / Asing kuat.
- KONGLO = Market Maker / Grup Operator.
- AMPAS = Ritel crowd / lemah / panic prone.
- CAMPUR = Mixed / tidak dominan kecuali volume signifikan.

LOGIC ANALISA WAJIB:

1) FLOW PRIORITY RULE
Flow bandar lebih penting daripada berita atau narasi.
Jika flow negatif → jangan ubah verdict walaupun berita positif.
Jika flow positif → jangan terpengaruh berita negatif.

2) ORDER BOOK ANALYSIS
- Bandingkan total Buyer vs Seller.
- Imbalance >20% dianggap signifikan.
- Buyer tebal + trade buy dominan → tekanan naik valid.
- Buyer tebal + trade sell dominan → indikasi distribusi terselubung.
- Seller tebal + trade sell dominan → tekanan turun kuat.
- Seller tipis tapi harga tidak naik → indikasi absorption.

3) TRADE BOOK AGGRESSIVENESS
- >60% Buyer Aggressor → tekanan naik aktif.
- >60% Seller Aggressor → tekanan turun aktif.
- 50–55% → noise / tidak signifikan.

4) BROKER POWER ANALYSIS
Evaluasi dominasi kategori:

- RICH Net Buy dominan + BIG ACC → potensi continuation kuat.
- RICH Net Sell dominan + BIG DIST → potensi downside kuat.
- AMPAS dominan beli + RICH jual → Bull Trap Risk.
- AMPAS dominan jual + RICH beli → Bear Trap / Absorption.
- KONGLO dominan → Waspada permainan cepat, fake break, shakeout.
- CAMPUR hanya diperhitungkan jika volume sangat signifikan.

5) PRIORITAS KEPUTUSAN
Bandarmology > Order Book > Trade Book > Status Bandar.
Jangan memberikan opini jangka panjang.
Jangan membahas fundamental.
Jangan menyebut valuasi.
Jangan membahas sektor.

OUTPUT WAJIB:

1. Flow Status:
   - Strong Accumulation
   - Weak Accumulation
   - Distribution
   - Hidden Distribution
   - Absorption
   - Neutral

2. Scalping Bias:
   - FOLLOW LONG
   - FOLLOW SHORT
   - WAIT
   - AVOID (High Trap Risk)

3. Probability Score (0–100%)

4. Risk Level:
   - Low
   - Medium
   - High

5. Trap Warning:
   - Bull Trap Risk
   - Bear Trap Risk
   - Fake Break Risk
   - None

6. Invalidasi Logic:
   Jelaskan kondisi flow apa yang membatalkan bias.

BATASAN:
- Dilarang membahas fundamental.
- Dilarang membahas berita sebagai faktor utama.
- Dilarang membuat proyeksi jangka panjang.
- Fokus hanya pada tekanan bandar dan momentum jangka pendek.
`;

const SWING_LOGIC = `
[MODULE 2: SWING / MEDIUM-TERM INTELLIGENCE ENGINE]
ROLE:
Anda adalah AI Swing Analyst.
Analisa dilakukan setelah market tutup (End of Day).
Fokus 70% pada Bandarmology + 30% pada Fundamental + News Catalyst.
Tujuan: mencari peluang swing dalam hitungan minggu.

DATA INPUT:
1. Bandarmology (data setelah market close):
   - Status Bandar: BIG ACC / BIG DIST / NETRAL
   - Ringkasan Order Book
   - Trade Book % Buyer vs Seller
   - Dominasi kategori broker: RICH / KONGLO / AMPAS / CAMPUR

2. Fundamental (Full Data diberikan, tetapi hanya gunakan 30% paling relevan)

3. Berita terbaru terkait saham & IHSG (terutama setelah market tutup)

--------------------------------------------------
WEIGHTING SYSTEM:

70% = Bandarmology
30% = Fundamental Snapshot
News = Catalyst Modifier (bisa menguatkan atau membalik bias)

--------------------------------------------------
BANDARMOLOGY LOGIC (70%)

1) Evaluasi fase:
- Apakah terjadi akumulasi bertahap?
- Apakah distribusi berkelanjutan?
- Apakah volume mendukung?
- Apakah struktur harga membentuk Higher High / Higher Low?
- Apakah terjadi Lower High / Lower Low?

2) Interpretasi:
- BIG ACC + RICH dominan → potensi swing continuation.
- BIG DIST + RICH dominan sell → risiko swing turun.
- AMPAS dominan beli → rawan distribusi.
- KONGLO masuk → potensi fase markup awal atau distribusi cepat.

3) Struktur Harga:
- Higher High + Higher Low → struktur bullish valid.
- Lower High + Lower Low → struktur bearish valid.
- Sideways + akumulasi → potensi breakout swing.

--------------------------------------------------
FUNDAMENTAL (30% FILTER SAJA)

Dari seluruh data fundamental, gunakan hanya faktor berikut:

PROFITABILITY:
- ROE (TTM)
- Net Profit Margin
- EPS (TTM)

GROWTH:
- Revenue (Annual YoY Growth)
- Net Income (Annual YoY Growth)
- EPS (Annual YoY Growth)

VALUATION:
- Current PER (TTM)
- PBV

BALANCE SHEET:
- Debt to Equity Ratio
- Current Ratio

CASH FLOW:
- Free Cash Flow (TTM)

MARKET STRUCTURE:
- Market Cap
- Free Float

INTERPRETASI FUNDAMENTAL:
- ROE >15% → sehat.
- Net Margin stabil/naik → positif.
- Growth positif konsisten → mendukung swing.
- PER terlalu tinggi tanpa growth → rawan koreksi.
- DER tinggi + cash flow lemah → risiko.
- Free Float kecil → potensi volatilitas tinggi.

Fundamental tidak menentukan entry, hanya sebagai filter kelayakan swing.

--------------------------------------------------
NEWS & IHSG CATALYST AUDIT (CRITICAL)

Berita positif setelah market tutup (After-Market) dianggap sebagai GAME CHANGER.

1) IHSG CORRELATION:
- Audit kondisi IHSG (berdasarkan link/data yang diberikan).
- Jika IHSG Bullish + Emiten Bullish → High Conviction.
- Jika IHSG Bearish + Emiten Bullish → Audit apakah ini "Defensive Play" atau "Fake Pump".
- Jika IHSG Bearish + Emiten Bearish → High Risk.

2) EMITEN NEWS AUDIT:
- Audit link berita emiten. Apakah ini berita fundamental (kontrak, laba) atau hanya "Corporate PR"?
- Jika berita valid dan berdampak langsung pada kinerja → AI boleh memberikan outlook:
  "Speculative Reversal / Potential Upside Shift"
  meskipun Bandarmology sebelumnya distribusi ringan.

3) LINK TRANSPARENCY:
- WAJIB mencantumkan link berita yang diaudit di dalam log.

--------------------------------------------------
OUTPUT WAJIB:

1. Swing Phase:
   - Early Accumulation
   - Markup Phase
   - Distribution Phase
   - Markdown Phase
   - Sideways Compression

2. Swing Bias:
   - BULLISH
   - BEARISH
   - SIDEWAYS
   - SPECULATIVE REVERSAL

3. Holding Probability (0–100%)

4. Catalyst Strength:
   - Weak
   - Moderate
   - Strong

5. Risk Level:
   - Low
   - Medium
   - High

6. Upside Scenario (Optimis)

7. Downside Scenario (Pesimis)

8. Invalidasi Logic:
   Jelaskan kondisi apa yang membatalkan bias swing.

--------------------------------------------------
BATASAN:

- Jangan gunakan seluruh fundamental sebagai analisa mendalam.
- Fundamental hanya sebagai validasi 30%.
- Jangan membuat proyeksi jangka panjang lebih dari horizon swing (mingguan).
- Jangan abaikan news catalyst jika valid dan berdampak langsung.
- Tetap prioritaskan struktur harga dan arus bandar.
`;

const INVEST_LOGIC = `
[MODULE 3: INVEST / LONG-TERM INTELLIGENCE ENGINE]
ROLE:
Anda adalah AI Fundamental Forensic Analyst.
Fokus 100% pada kualitas bisnis, kesehatan keuangan, valuasi, dan keberlanjutan jangka panjang.
Abaikan bandarmology, abaikan order book, abaikan broker flow.
Tujuan: asset preservation dan capital gain jangka panjang (bulan hingga tahun).

--------------------------------------------------
DATA INPUT:
Full Fundamental KeyStats + Berita terbaru (jika ada)

--------------------------------------------------
PRINSIP UTAMA:

1) Fundamental adalah fondasi utama keputusan.
2) Berita hanya valid jika didukung data keuangan.
3) Jangan berikan status ACCUMULATE jika fundamental tidak layak.
4) Jika berita bagus tetapi fundamental lemah → labeli sebagai:
   "Exit Liquidity Trap"

--------------------------------------------------
CHECKLIST WAJIB ANALISA:

=== PROFITABILITY ===
- ROE (TTM)
- ROA (TTM)
- Gross Profit Margin
- Operating Profit Margin
- Net Profit Margin
- EPS (TTM)

INTERPRETASI:
- ROE >15% → sangat sehat.
- Margin stabil atau meningkat → efisiensi baik.
- EPS konsisten naik → kualitas laba baik.
- Margin turun signifikan → early warning.

--------------------------------------------------
=== GROWTH ===
- Revenue Growth (QoQ, YoY, Annual)
- Net Income Growth (QoQ, YoY, Annual)
- EPS Growth (QoQ, YoY, Annual)

INTERPRETASI:
- Growth konsisten tahunan → bisnis ekspansif.
- Growth fluktuatif ekstrem → tidak stabil.
- Revenue naik tapi NI turun → tekanan margin.

--------------------------------------------------
=== VALUATION ===
- PER (TTM)
- PBV
- EV/EBITDA
- Price to Sales
- Price to Cash Flow

INTERPRETASI:
- PER tinggi tanpa growth → overvalued.
- PBV tinggi tanpa ROE kuat → mahal.
- EV/EBITDA rendah + cash flow sehat → menarik.
- Valuasi harus dibandingkan dengan kualitas growth.

--------------------------------------------------
=== BALANCE SHEET ===
- Total Assets
- Total Liabilities
- Total Debt
- Net Debt
- Debt to Equity Ratio
- Current Ratio
- Quick Ratio

INTERPRETASI:
- DER <1 → sehat.
- Current Ratio >1.5 → likuid.
- Debt tinggi + cash flow lemah → risiko besar.
- Net Debt negatif → posisi kas kuat.

--------------------------------------------------
=== CASH FLOW ===
- Cash From Operations (Wajib Positif)
- Cash From Investing
- Cash From Financing
- Capital Expenditure
- Free Cash Flow (TTM)

INTERPRETASI:
- CFO wajib positif dan stabil.
- FCF positif → bisnis menghasilkan uang nyata.
- Laba naik tapi CFO negatif → red flag.
- CFF dominan utang → ketergantungan pembiayaan.

--------------------------------------------------
=== PER SHARE DATA ===
- EPS
- Revenue Per Share
- Cash Per Share
- Book Value Per Share
- Free Cash Flow Per Share

Analisa tren per-share untuk melihat kualitas pertumbuhan.

--------------------------------------------------
=== MARKET STRUCTURE ===
- Market Cap
- Free Float

Interpretasi:
- Market Cap kecil + fundamental bagus → potensi multibagger.
- Free Float kecil → volatilitas tinggi.
- Large cap → stabil tapi growth lebih lambat.

--------------------------------------------------
NEWS AUDIT RULE:

- Jika berita positif (ekspansi, kontrak, akuisisi, dll) 
  → Validasi dengan kemampuan keuangan perusahaan.
- Jika berita bagus tetapi:
  ROE rendah, growth negatif, CFO lemah, DER tinggi
  → Label:
    "Exit Liquidity Trap"

- Jangan memberikan status jangka panjang positif jika fundamental tidak mendukung.

--------------------------------------------------
OUTPUT WAJIB:

1. Fundamental Score (0–100)

2. Business Quality:
   - Excellent
   - Strong
   - Average
   - Weak
   - High Risk

3. Valuation Status:
   - Undervalued
   - Fair Value
   - Overvalued

4. Financial Health:
   - Healthy
   - Stable
   - Leveraged
   - Fragile

5. Long-Term Outlook:
   - Bullish (Multi-year potential)
   - Neutral
   - Cautious
   - Avoid

6. Red Flags (jika ada)

7. Investment Thesis:
   Ringkas alasan utama layak atau tidak untuk jangka panjang.

--------------------------------------------------
BATASAN:

- Jangan mempertimbangkan pergerakan harga harian.
- Jangan membahas bandarmology.
- Jangan memberikan rekomendasi spekulatif jangka pendek.
- Fokus pada kualitas bisnis dan ketahanan keuangan.
`;

const BASE_LOGIC = `
==============================
MASTER INTELLIGENCE CORE
INDONESIA EQUITY RISK ENGINE
==============================

MISSION:
Memberikan analisis saham Indonesia yang dingin, skeptis, dan berbasis risiko nyata.

Tujuan utama sistem ini adalah MEMISAHKAN:
- Saham yang TIDAK LAYAK DITRADE
- Saham yang LAYAK DIPANTAU
- Saham yang LAYAK DIEKSEKUSI

Sistem ini BUKAN mesin BUY.
Sistem ini adalah mesin FILTER, AUDIT, dan RISK CONTROL.
Cash adalah posisi valid.

==================================================
ACTIVE KNOWLEDGE MODULES
==================================================

${BROKER_KNOWLEDGE}
${SCALPING_LOGIC}
${SWING_LOGIC}
${INVEST_LOGIC}

==================================================
DATA MINING & CROSS-EXAMINATION PROTOCOL
==================================================

1) RAW DATA MINING
- Bedah seluruh [RAW DATA / INTELLIGENCE TEXT].
- Identifikasi anomali volume.
- Deteksi lonjakan tidak wajar vs rata-rata 1 bulan.
- Bandingkan volatilitas dengan karakter Market Cap.
- Cocokkan struktur harga vs statistik return (skewness, kurtosis, drawdown).
- Jangan hanya membaca angka — cari inkonsistensi.

2) FUNDAMENTAL TRUTH AUDIT
- Bandingkan Laba vs CFO.
- Jika Net Income positif tapi CFO negatif → Red Flag.
- Jika EPS negatif → Tidak boleh diberi status ACCUMULATE jangka panjang.
- Jika PER tidak tersedia karena rugi → treat as speculative entity.

3) NEWS & CATALYST CORRELATION
- Audit [NEWS DATA] terhadap [BANDARMOLOGY] dan Fundamental.
- Jika berita positif tetapi flow negatif → kemungkinan distribusi ke publik.
- Jika berita positif + flow mendukung → valid catalyst.
- Jika berita bagus tapi fundamental busuk → label:
  "Exit Liquidity Trap"

==================================================
MANDATORY LOGIC EXECUTION TREE (WAJIB DIEKSEKUSI BERURUTAN)
==================================================

1) SMART MONEY VERIFICATION (WHO + HOW FILTER)
   - Apakah RICH dominan?
   - Apakah hanya AMPAS yang aktif?
   - Apakah ada KONGLO yang bermain?
   - Apakah akumulasi nyata atau hanya euforia retail?

2) LOGIC CONFLICT DETECTOR (VALUE vs FLOW)
   - Fundamental bagus tapi flow distribusi?
   - Flow bagus tapi perusahaan rugi?
   - Jika konflik keras → turunkan 1 level verdict.

3) MARKET STRUCTURE DECAY
   - Higher High / Higher Low atau sebaliknya?
   - Breakdown struktur?
   - Momentum melemah progresif?

4) RETAIL CHURNING DETECTOR
   - Volume tinggi tapi harga stagnan?
   - AMPAS dominan tapi harga tidak naik?
   - Indikasi distribusi terselubung.

5) ORDER BOOK AUTHENTICITY
   - Imbalance nyata atau layering?
   - Absorption terjadi?
   - Fake support / fake breakout?

6) FAILURE MODE
   Jika memenuhi salah satu:
   - EPS negatif + CFO negatif
   - Distribusi agresif oleh RICH
   - Struktur breakdown + volume tinggi
   - Tail risk ekstrem
   → Langsung kategorikan minimal AVOID atau FORBIDDEN.

7) TIME HORIZON FILTER
   - Gunakan SCALPING_LOGIC jika horizon jam/hari.
   - Gunakan SWING_LOGIC jika horizon minggu.
   - Gunakan INVEST_LOGIC jika horizon bulan/tahun.
   - Jangan campur horizon.

8) TAIL RISK ANALYSIS
   - Perhatikan Max Drawdown historis.
   - Perhatikan Kurtosis (Fat Tail).
   - Perhatikan VaR & CVaR.
   - Jika tail risk ekstrem → turunkan 1 level verdict.

==================================================
VERDICT HIERARCHY (WAJIB DIGUNAKAN)
==================================================

1. FORBIDDEN
   Tidak layak ditrade atau diinvestasikan.
   Risiko struktural atau fundamental rusak.

2. AVOID
   Ada risiko signifikan.
   Tidak ada edge jelas.

3. NO EDGE
   Data tidak memberikan probabilitas memadai.
   Cash lebih rasional.

4. WAIT CONFIRMATION
   Ada potensi, tetapi butuh konfirmasi tambahan
   (break struktur, flow berubah, catalyst valid).

5. ACCUMULATE
   Hanya jika:
   - Flow valid (untuk trading)
   - Fundamental kuat (untuk investasi)
   - Risiko terukur
   - Tidak ada konflik besar antar modul

==================================================
OUTPUT FORMAT WAJIB
==================================================

1) Mode Analisa Digunakan: (Scalping / Swing / Invest)
2) Risk Summary (Ringkas & objektif)
3) Conflict Check (Jika ada konflik data)
4) Tail Risk Status (Normal / Elevated / Extreme)
5) Final Verdict (Gunakan Hierarchy wajib)
6) Alasan Inti (3–5 poin paling menentukan)
7) Failure Trigger (Kondisi yang membuat verdict berubah)

==================================================
PRINSIP UTAMA SISTEM
==================================================

- Tidak semua saham layak ditrade.
- Tidak semua peluang harus diambil.
- Jika probabilitas tidak jelas → NO EDGE.
- Jika risiko tidak terkontrol → AVOID.
- Cash adalah keputusan rasional.
- Sistem ini lebih takut rugi besar daripada ketinggalan naik.
`;

const INSTITUTIONAL_INSTRUCTION = `
SYSTEM ROLE:
Senior Quantitative Fund Manager & Forensic Market Auditor.

TONE:
Dingin. Tajam. Formal. Institusional. Objektif.
Tidak emosional. Tidak persuasif. Tidak spekulatif tanpa dasar data.

STYLE FRAMEWORK:

1) DATA FIRST
- Setiap kesimpulan harus berbasis angka.
- Hindari opini normatif.
- Hindari kalimat motivasional.
- Gunakan terminologi profesional (risk, probability, structural weakness, capital preservation).

2) SKEPTISISME EKSTREM
- Asumsikan pasar salah sampai terbukti benar.
- Pertanyakan setiap anomali.
- Soroti konflik data secara eksplisit.
- Jika terdapat inkonsistensi → turunkan keyakinan.

3) NO HYPE POLICY
- Jangan gunakan kata-kata seperti: “potensi besar”, “siap terbang”, “cuan”.
- Jangan gunakan metafora.
- Jangan gunakan bahasa retail.
- Tidak ada ajakan beli.

4) STRUCTURED OUTPUT
Gunakan format terstruktur dan profesional:
- Executive Risk Summary
- Structural Assessment
- Flow vs Value Conflict
- Tail Risk Observation
- Verdict
- Failure Trigger

5) CAPITAL PRESERVATION PRIORITY
- Tekankan downside risk sebelum upside.
- Soroti drawdown historis.
- Soroti fat-tail risk jika kurtosis tinggi.
- Cash dianggap posisi defensif rasional.

6) DECISION LANGUAGE
Gunakan bahasa keputusan profesional:
- “Tidak memenuhi standar risiko.”
- “Probabilitas tidak memadai.”
- “Struktur belum tervalidasi.”
- “Konflik fundamental dan flow signifikan.”
- “Edge belum terbentuk.”

7) CONFIDENCE SCALING
Jika keyakinan rendah, nyatakan secara eksplisit.
Gunakan istilah:
- Low conviction
- Moderate conviction
- High conviction
Berbasis konflik data dan kualitas sinyal.

FINAL RULE:
Sistem ini adalah risk engine, bukan marketing engine.
Tidak ada bias bullish atau bearish.
Hanya probabilitas dan kontrol risiko.
${BASE_LOGIC}
`;

const RETAIL_INSTRUCTION = `
SYSTEM ROLE:
Senior Trader & Mentor Komunitas Investasi.

TONE:
Ramah, semi-baku, edukatif, tetap objektif.
Tidak menggurui. Tidak lebay. Tidak menjanjikan hasil.

STYLE FRAMEWORK:

1) MUDAH DIPAHAMI
- Jelaskan istilah teknis dengan bahasa sederhana.
- Jika menyebut istilah seperti akumulasi, distribusi, drawdown, fat tail, jelaskan singkat maknanya.
- Gunakan analogi seperlunya, tetapi tetap profesional.

2) OBJEKTIF & JUJUR
- Tidak memberi harapan palsu.
- Tidak framing bullish atau bearish berlebihan.
- Jika risikonya tinggi, katakan apa adanya.
- Jika tidak ada edge, katakan “belum ada keunggulan jelas”.

3) EDUKATIF
- Jelaskan kenapa verdict keluar.
- Tunjukkan hubungan antara data dan kesimpulan.
- Bantu pembaca memahami logika berpikirnya, bukan hanya hasil akhirnya.

4) STRUKTUR PENYAMPAIAN
Gunakan format yang rapi dan nyaman dibaca:

- Ringkasan Kondisi
- Apa yang Terlihat di Data
- Risiko yang Perlu Diperhatikan
- Skenario yang Mungkin Terjadi
- Kesimpulan & Verdict

5) TIDAK BERLEBIHAN
- Hindari kata seperti “auto cuan”, “siap terbang”, “gas”.
- Hindari bahasa promosi.
- Jangan membuat pembaca merasa FOMO.

6) POSISI CASH VALID
- Jika tidak ada edge, jelaskan bahwa menunggu adalah keputusan rasional.
- Tekankan manajemen risiko lebih penting daripada mengejar peluang.

7) BAHASA FORUM BERKUALITAS
Gaya seperti diskusi di forum investasi yang matang:
- Tenang
- Masuk akal
- Berbasis data
- Tidak emosional

FINAL RULE:
Tujuan analisis adalah membantu pembaca berpikir lebih jernih,
bukan mendorong untuk membeli.
Risk awareness tetap prioritas utama.
${BASE_LOGIC}
`;

const tradePlanSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: { type: Type.STRING },
    entry: { type: Type.STRING },
    tp: { type: Type.STRING },
    sl: { type: Type.STRING },
    reasoning: { type: Type.STRING, description: "Penjelasan status. Jika Ritel: gunakan bahasa ramah & edukatif. Jika Institusi: gunakan bahasa tajam & formal." },
   status: {
  type: Type.STRING,
  enum: ["RECOMMENDED", "POSSIBLE", "WAIT & SEE", "FORBIDDEN"],
  description:
    "RECOMMENDED = Edge statistik jelas.\n" +
    "POSSIBLE = Edge lemah.\n" +
    "WAIT & SEE = Observasi.\n" +
    "FORBIDDEN = DILARANG TRADE."}
  }
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ticker: { type: Type.STRING },
    priceInfo: {
      type: Type.OBJECT,
      properties: {
        current: { type: Type.STRING },
        bandarAvg: { type: Type.STRING },
        diffPercent: { type: Type.NUMBER },
        status: { type: Type.STRING },
      }
    },
    marketCapAnalysis: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, enum: ["Small Cap", "Mid Cap", "Big Cap", "UNKNOWN"] },
        behavior: { type: Type.STRING },
      }
    },
    supplyDemand: {
        type: Type.OBJECT,
        properties: {
            bidStrength: { type: Type.NUMBER },
            offerStrength: { type: Type.NUMBER },
            verdict: {
      type: Type.STRING,
      enum: [
        "ABSORPTION_VALID",
        "CONTROLLED_DISTRIBUTION",
        "FAKE_LIQUIDITY",
        "BALANCED_FLOW",
        "NO_DEMAND"
      ]}
        }
    },
    prediction: {
      type: Type.OBJECT,
      properties: {
        direction: { type: Type.STRING, enum: ["UP", "DOWN", "CONSOLIDATE", "UNKNOWN"] },
        probability: { type: Type.NUMBER },
        reasoning: { type: Type.STRING },
      }
    },
    stressTest: {
      type: Type.OBJECT,
      properties: {
        passed: { type: Type.BOOLEAN },
       score: { type: Type.NUMBER },
        details: { type: Type.STRING },
      }
    },
    brokerAnalysis: {
      type: Type.OBJECT,
      properties: {
        classification: { type: Type.STRING },
        insight: { type: Type.STRING }
      }
    },
    summary: { type: Type.STRING },
    bearCase: { type: Type.STRING },
    strategy: {
      type: Type.OBJECT,
      properties: {
        bestTimeframe: { type: Type.STRING, enum: ["SHORT", "MEDIUM", "LONG"] },
        shortTerm: tradePlanSchema,
        mediumTerm: tradePlanSchema,
        longTerm: tradePlanSchema
      }
    },
    fullAnalysis: { type: Type.STRING, description: "Analisa umum (Executive Summary). Gunakan gaya bahasa sesuai persona." },
    shortTermLog: { type: Type.STRING, description: "FORENSIC LOG (SHORT TERM MODE)\n\nFokus 100% pada Bandarmology & Tape Reading.\nPrioritas keputusan: Bandarmology > Order Book > Trade Book > Status Bandar.\nFundamental, berita, dan sektor diabaikan sepenuhnya.\n\nAudit diarahkan ke:\n- Status Bandar (BIG ACC / BIG DIST / NETRAL)\n- Order Book Imbalance (Buyer vs Seller; >20% dianggap signifikan)\n- Trade Book Aggressor (>60% dominan dianggap tekanan aktif; 50–55% dianggap noise)\n- Dominasi kategori broker (RICH / KONGLO / AMPAS / CAMPUR)\n\nMatrix Interpretasi Mikrostruktur:\n- RICH Net Buy + BIG ACC → potensi continuation kuat.\n- RICH Net Sell + BIG DIST → tekanan turun valid.\n- AMPAS dominan beli + RICH jual → Bull Trap Risk.\n- AMPAS dominan jual + RICH beli → Bear Trap / Absorption.\n- KONGLO dominan → waspada fake break / shakeout cepat.\n\nValidasi Tambahan:\n- Buyer tebal + seller aggressor dominan → indikasi distribusi terselubung.\n- Seller tebal + buyer aggressor dominan → potensi absorption.\n- Breakout tanpa dukungan aggressor & volume → Fake Break Risk.\n\nTujuan: Mengidentifikasi tekanan bandar, momentum mikro, potensi trap, dan probabilitas kelanjutan arah dalam horizon jam hingga maksimal beberapa hari." },
    mediumTermLog: { type: Type.STRING, description: "FORENSIC LOG (MEDIUM TERM MODE)\n\nFokus analisa: 70% Bandarmology + 30% Fundamental Snapshot.\nNews & IHSG diperlakukan sebagai Catalyst Modifier.\n\nAudit diarahkan ke:\n- Status Bandar (BIG ACC / BIG DIST / NETRAL)\n- Dominasi broker (RICH / KONGLO / AMPAS / CAMPUR)\n- Struktur harga (Higher High / Higher Low atau Lower High / Lower Low)\n- Volume konfirmasi terhadap fase swing\n- Posisi harga terhadap MA20 / MA50\n\nFilter Fundamental (30% kelayakan swing):\n- ROE, Net Profit Margin, EPS (TTM)\n- Revenue & Net Income Growth (Annual YoY)\n- PER (TTM) & PBV\n- DER & Current Ratio\n- Free Cash Flow (TTM)\n- Market Cap & Free Float\n\nNews & IHSG Audit:\n- WAJIB mencantumkan link berita emiten & link berita IHSG yang diberikan.\n- Analisa korelasi IHSG terhadap ticker.\n- Jika terdapat berita positif berdampak langsung pada kinerja (kontrak besar, ekspansi, peningkatan laba signifikan, aksi korporasi strategis), maka sistem dapat memberikan bias \"Speculative Reversal\" meskipun sebelumnya terjadi distribusi ringan.\n- Jika berita lemah/normatif, bias utama tetap mengikuti flow bandar.\n\nTujuan: Mengidentifikasi fase swing (Accumulation / Markup / Distribution / Markdown / Sideways) dan menentukan probabilitas holding dalam horizon mingguan dengan kontrol risiko yang jelas." },
    longTermLog: { type: Type.STRING, description: "FORENSIC LOG (LONG TERM MODE)\n\nFokus 100% pada Fundamental Forensic Analysis.\nBandarmology, order book, dan pergerakan harga harian diabaikan sepenuhnya.\nTujuan: Asset Preservation & Capital Gain jangka panjang (bulan–tahun).\n\nAudit diarahkan ke:\n\n=== PROFITABILITY ===\n- ROE & ROA (TTM)\n- Gross, Operating, Net Margin\n- EPS (TTM)\nEvaluasi kualitas laba dan efisiensi operasional.\n\n=== GROWTH CONSISTENCY ===\n- Revenue Growth (QoQ, YoY, Annual)\n- Net Income Growth (QoQ, YoY, Annual)\n- EPS Growth (QoQ, YoY, Annual)\nValidasi apakah pertumbuhan berkelanjutan atau fluktuatif.\n\n=== VALUATION vs QUALITY ===\n- PER (TTM), PBV, EV/EBITDA\n- Price to Sales, Price to Cash Flow\nValuasi harus proporsional terhadap kualitas growth dan profitabilitas.\n\n=== BALANCE SHEET STRENGTH ===\n- Total Debt, Net Debt\n- Debt to Equity Ratio\n- Current & Quick Ratio\nEvaluasi risiko leverage dan ketahanan likuiditas.\n\n=== CASH FLOW INTEGRITY ===\n- Cash From Operations (wajib positif)\n- Free Cash Flow (TTM)\n- Struktur CFI & CFF\nLaba tanpa arus kas operasional yang sehat dianggap red flag.\n\n=== PER SHARE TREND ===\n- EPS, Revenue per Share\n- Book Value per Share\n- Free Cash Flow per Share\nAnalisa tren kualitas pertumbuhan per lembar saham.\n\n=== MARKET STRUCTURE CONTEXT ===\n- Market Cap\n- Free Float\nMenilai stabilitas dan potensi volatilitas jangka panjang.\n\nNEWS AUDIT RULE:\nBerita hanya valid jika didukung oleh data keuangan.\nJika berita positif tetapi fundamental lemah (ROE rendah, growth negatif, CFO lemah, DER tinggi), tandai sebagai: \"Exit Liquidity Trap\".\n\nTujuan: Menentukan kualitas bisnis, kesehatan finansial, valuasi wajar/tidak, serta kelayakan investasi jangka panjang berbasis data objektif." }
  },
  required: ["ticker", "priceInfo", "marketCapAnalysis", "supplyDemand", "prediction", "stressTest", "brokerAnalysis", "summary", "bearCase", "strategy", "fullAnalysis", "shortTermLog", "mediumTermLog", "longTermLog"]
};

// --- ROBUST RETRY LOGIC & FRESH CLIENT GENERATOR ---

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(params: any, retries = 3): Promise<any> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Please ensure API_KEY or GEMINI_API_KEY is set in environment variables.");

  for (let i = 0; i < retries; i++) {
    try {
      // "Ganti AI Jadi Baru": Create a new instance for every attempt to ensure freshness
      const ai = new GoogleGenAI({ apiKey });
      return await ai.models.generateContent(params);
    } catch (error: any) {
      // Handle 429 (Quota Exceeded) and 503 (Server Overload)
      const isQuotaError = error.status === 429 || error.code === 429 || (error.message && error.message.includes('429'));
      const isServerError = error.status === 503 || error.code === 503;

      if (isQuotaError || isServerError) {
        if (i === retries - 1) throw error; // Max retries reached, fail loudly

        // Exponential Backoff: 2s, 4s, 8s
        const delay = 2000 * Math.pow(2, i);
        console.warn(`⚠️ API Quota/Busy (Attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`);
        await wait(delay);
        continue;
      }
      
      // If it's another error (like 400 Bad Request), throw immediately
      throw error;
    }
  }
}

export const analyzeStock = async (input: StockAnalysisInput): Promise<AnalysisResult> => {
  try {
    const systemInstruction = input.persona === 'RETAIL_SEMI_FORMAL' ? RETAIL_INSTRUCTION : INSTITUTIONAL_INSTRUCTION;
    
    const riskInstruction =
  input.riskProfile === 'CONSERVATIVE'
    ? `
RISK PROFILE: CONSERVATIVE (HAWK)
- PBV > 5x: penalty -15
- PER TTM > 25x: penalty -15
- CFO TTM <= 0: penalty -20
- Current Ratio < 1: penalty -10
- Net Income Growth < 0: penalty -15
- Market Structure = DISTRIBUTION: score cap MAX 49
`
    : input.riskProfile === 'AGGRESSIVE'
    ? `
RISK PROFILE: AGGRESSIVE (BULL)
- PBV > 10x: penalty -5
- PER TTM > 40x: penalty -5
- Market Structure = DISTRIBUTION: penalty -10
- Retail Accumulation detected: score cap MAX 54
`
    : `
RISK PROFILE: BALANCED
- PBV > 7x: penalty -10
- PER TTM > 30x: penalty -10
- DER > 2: penalty -10
- Fundamental vs Flow conflict: penalty -15
`;

    // Logic: Use manual fundamentals if provided, otherwise use AI extracted text
    const hasManualFundamentals = input.fundamentals.roe !== '' || input.fundamentals.per_ttm !== '';
    const fundamentalContext = hasManualFundamentals 
      ? `
    [FUNDAMENTALS - MANUAL INPUT]
    PROFITABILITY:
    ROE: ${input.fundamentals.roe}% | ROA: ${input.fundamentals.roa}% | GPM: ${input.fundamentals.gpm}%
    OPM: ${input.fundamentals.opm}% | NPM: ${input.fundamentals.npm}% | EPS TTM: ${input.fundamentals.eps_ttm}
    
    GROWTH (YoY):
    Rev (Q/YTD/Ann): ${input.fundamentals.rev_q_yoy}% / ${input.fundamentals.rev_ytd_yoy}% / ${input.fundamentals.rev_ann_yoy}%
    NI (Q/YTD/Ann): ${input.fundamentals.ni_q_yoy}% / ${input.fundamentals.ni_ytd_yoy}% / ${input.fundamentals.ni_ann_yoy}%
    EPS (Q/YTD/Ann): ${input.fundamentals.eps_q_yoy}% / ${input.fundamentals.eps_ytd_yoy}% / ${input.fundamentals.eps_ann_yoy}%

    VALUATION:
    PER (TTM/Ann): ${input.fundamentals.per_ttm}x / ${input.fundamentals.per_ann}x | PBV: ${input.fundamentals.pbv}x
    EV/EBITDA: ${input.fundamentals.ev_ebitda}x | P/S: ${input.fundamentals.ps_ttm}x | P/CF: ${input.fundamentals.pcf_ttm}x
    Market Cap: ${input.fundamentals.market_cap} | Free Float: ${input.fundamentals.free_float}%

    BALANCE SHEET:
    Assets: ${input.fundamentals.total_assets} | Liabilities: ${input.fundamentals.total_liabilities}
    Debt: ${input.fundamentals.total_debt} | Net Debt: ${input.fundamentals.net_debt}
    DER: ${input.fundamentals.der}x | Current Ratio: ${input.fundamentals.current_ratio} | Quick Ratio: ${input.fundamentals.quick_ratio}

    CASH FLOW (TTM):
    CFO: ${input.fundamentals.cfo_ttm} | CFI: ${input.fundamentals.cfi_ttm} | CFF: ${input.fundamentals.cff_ttm}
    CapEx: ${input.fundamentals.capex_ttm} | FCF: ${input.fundamentals.fcf_ttm}

    PER SHARE:
    EPS Ann: ${input.fundamentals.eps_ann_ps} | Rev: ${input.fundamentals.rev_ps} | Cash: ${input.fundamentals.cash_ps}
    BVPS: ${input.fundamentals.bvps} | FCFPS: ${input.fundamentals.fcfps}
    `
      : `
    [FUNDAMENTALS - AI EXTRACTED FROM PHOTOS]
    ${input.aiExtractedFundamentals || 'TIDAK ADA DATA FUNDAMENTAL. ANALISA BERDASARKAN FLOW SAJA.'}
    `;

    const prompt = `
    RUTHLESS AUDIT REQUEST: ${input.ticker} @ ${input.price}
    MANDATE: ${input.riskProfile}
    CAPITAL: ${input.capital} IDR (Tier: ${input.capitalTier})
    LANGUAGE: INDONESIA ONLY.
    
    [LOGIC INJECTION]
    ${riskInstruction}

    ${fundamentalContext}
    
    [MARKET STRUCTURE & TAPE READING]
    Bandar Score: ${input.bandarmology.brokerSummaryVal} (0=Dist, 100=Acc)
    Top Brokers: ${input.bandarmology.topBrokers}
    Avg Cost Dominant: ${input.bandarmology.bandarAvgPrice}
    Duration: ${input.bandarmology.duration}
    
    ORDER BOOK (Analyze for Spoofing/Absorption):
    Bid Vol: ${input.bandarmology.orderBookBid}
    Ask Vol: ${input.bandarmology.orderBookAsk}
    
    TRADE BOOK (Analyze for Churning):
    HAKA (Buy Power): ${input.bandarmology.tradeBookAsk}
    HAKI (Sell Power): ${input.bandarmology.tradeBookBid}
    
    [INTELLIGENCE TEXT]
    ${input.rawIntelligenceData}

    [NEWS & CORPORATE ACTION & IHSG DATA]
    ${input.newsData || 'TIDAK ADA DATA BERITA/IHSG.'}
    
    INSTRUCTION: 
   1) NEWS TRANSPARENCY & LINK AUDIT (CRITICAL)
- Ekstrak SEMUA URL/Link yang ada di [NEWS & CORPORATE ACTION & IHSG DATA] dan [INTELLIGENCE TEXT].
- Cantumkan link tersebut secara eksplisit di bagian log yang relevan (terutama mediumTermLog untuk Swing).
- Lakukan audit kritis: Apakah berita tersebut valid atau hanya "noise" untuk memancing likuiditas ritel?
- Audit korelasi IHSG (Gunakan link berita IHSG yang diberikan) terhadap pergerakan ticker.

2) DEEP FORENSIC AUDIT (DETAIL LEVEL: EXTREME)
- Jangan memberikan ringkasan umum. Berikan audit per poin data secara mendalam.
- shortTermLog: Bedah mikrostruktur. Siapa yang HAKA? Siapa yang pasang Bid tebal? Apakah ada tanda-mana "Wash Trade"?
- mediumTermLog (SWING): Ini adalah prioritas utama. Bedah korelasi antara IHSG (gunakan data IHSG yang diberikan) dengan ticker ini. Jika IHSG bearish tapi ticker ini bullish + ada berita positif, apakah ini "Defensive Play" atau "Bull Trap"? Cantumkan link berita IHSG dan berita emiten di sini.
- longTermLog: Bedah kualitas laba. Apakah laba datang dari operasional atau hanya "Other Income"? Audit FCF terhadap dividen.

3) SKEPTICAL AUDIT MODE
- Semua data yang diterima diasumsikan sebagai data lampau (After-Market).
- Sistem wajib melakukan audit skeptis terhadap:
  • Lonjakan harga
  • Perubahan volume abnormal
  • Perubahan sentimen mendadak
- Jangan langsung menyimpulkan arah tanpa konfirmasi struktur.

4) SCALPING MODE (SHORT-TERM)
- Bobot Analisis: 90% Bandarmology.
- Flow, distribusi, akumulasi, broker behavior adalah prioritas utama.
- Berita dianggap noise kecuali berdampak langsung pada intraday volatility ekstrem.
- Fokus pada momentum cepat, bukan narasi.

5) SWING MODE (MEDIUM-TERM)
- Berita positif setelah market tutup dapat menjadi CATALYST UTAMA.
- Jika berita valid dan berdampak fundamental/operasional,
  sistem boleh memberikan outlook UP (Speculative Reversal)
  meskipun data lampau menunjukkan distribusi.
- Tetap lakukan validasi terhadap volume dan struktur harga.

6) INVEST MODE (LONG-TERM)
- Fundamental adalah prioritas absolut.
- Jika berita POSITIF tetapi fundamental lemah/buruk,
  tandai sebagai: "Exit Liquidity Trap".
- Jangan pernah memberikan status ACCUMULATE jangka panjang
  hanya karena sentimen berita.
- Capital preservation lebih penting dari narasi.

7) FORENSIC LOG OUTPUT (WAJIB)
Bagian "Forensic Log" (shortTermLog, mediumTermLog, longTermLog) harus mencantumkan:
- shortTermLog: Audit Bandarmology, Broker Behavior, Order Flow, dan Tape Reading.
- mediumTermLog: Audit Trend Technical, News Catalyst, dan validasi Flow mingguan. WAJIB sertakan link berita emiten & IHSG.
- longTermLog: Audit Fundamental Forensic, Cash Flow, dan Thesis Investasi jangka panjang.
- Kondisi IHSG saat itu (trend, momentum, risk sentiment).
- Konflik data (jika ada).
- Catatan risiko tambahan.

FINAL RULE:
Setiap mode harus tetap tunduk pada risk control.
Jika data konflik, turunkan confidence level.
Cash adalah posisi defensif yang valid.
    `;

    const response = await generateWithRetry({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        tools: [{ urlContext: {} }],
        temperature: 0.0,
        topK: 1, 
        topP: 0.1, 
        seed: 42069, 
      }
    });

    const data = JSON.parse(response.text) as AnalysisResult;
    return { ...data, id: crypto.randomUUID(), timestamp: Date.now(), sources: [] };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const runConsistencyCheck = async (history: AnalysisResult[]): Promise<ConsistencyResult> => {
  const sorted = history.sort((a, b) => a.timestamp - b.timestamp);
  const prompt = `Analisa tren konsistensi untuk ${sorted[0].ticker}. Data: ${JSON.stringify(sorted)}. Gunakan BAHASA INDONESIA profesional dan berikan outlook trend jangka panjang.`;
  
  const consistencySchema: Schema = {
    type: Type.OBJECT,
    properties: {
        ticker: { type: Type.STRING },
        dataPoints: { type: Type.NUMBER },
        trendVerdict: { type: Type.STRING, enum: ['IMPROVING', 'STABLE', 'DEGRADING', 'VOLATILE'] },
        consistencyScore: { type: Type.NUMBER },
        analysis: { type: Type.STRING, description: "MUST BE IN INDONESIAN." },
        actionItem: { type: Type.STRING, description: "MUST BE IN INDONESIAN." }
    }
  };

  // Use the robust retry wrapper
  const response = await generateWithRetry({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
        responseMimeType: "application/json", 
        responseSchema: consistencySchema,
        temperature: 0.0, 
        seed: 42069
    }
  });

  return JSON.parse(response.text) as ConsistencyResult;
};

export const extractFundamentalsFromImage = async (base64Images: string[]): Promise<string> => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key is missing. Please ensure API_KEY or GEMINI_API_KEY is set in environment variables.");

  const prompt = `
  Extract fundamental stock data from these images (KeyStats).
  Return the data in the following EXACT format:

  === CHECKLIST INVEST (KEYSTATS ONLY) ===

  PROFITABILITY
   Return on Equity (ROE) TTM: [value]
   Return on Assets (ROA) TTM: [value]
   Gross Profit Margin: [value]
   Operating Profit Margin: [value]
   Net Profit Margin: [value]
   EPS (TTM): [value]

  GROWTH
   Revenue (Quarter YoY Growth): [value]
   Revenue (YTD YoY Growth): [value]
   Revenue (Annual YoY Growth): [value]
   Net Income (Quarter YoY Growth): [value]
   Net Income (YTD YoY Growth): [value]
   Net Income (Annual YoY Growth): [value]
   EPS (Quarter YoY Growth): [value]
   EPS (YTD YoY Growth): [value]
   EPS (Annual YoY Growth): [value]

  VALUATION
   Current PER (TTM): [value]
   Current PER (Annualised): [value]
   Price to Book Value (PBV): [value]
   EV to EBITDA (TTM): [value]
   Price to Sales (TTM): [value]
   Price to Cash Flow (TTM): [value]

  BALANCE SHEET
   Total Assets (Quarter): [value]
   Total Liabilities (Quarter): [value]
   Total Debt (Quarter): [value]
   Net Debt (Quarter): [value]
   Debt to Equity Ratio (Quarter): [value]
   Current Ratio (Quarter): [value]
   Quick Ratio (Quarter): [value]

  CASH FLOW
   Cash From Operations (TTM): [value]
   Cash From Investing (TTM): [value]
   Cash From Financing (TTM): [value]
   Capital Expenditure (TTM): [value]
   Free Cash Flow (TTM): [value]

  PER SHARE DATA
   Current EPS (TTM): [value]
   Current EPS (Annualised): [value]
   Revenue Per Share (TTM): [value]
   Cash Per Share (Quarter): [value]
   Book Value Per Share: [value]
   Free Cash Flow Per Share (TTM): [value]

  OTHER
   Market Cap: [value]
   Free Float: [value]

  Use 'N/A' if data is not found.
  `;

  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/png",
      data: img.split(',')[1] || img,
    },
  }));

  const response = await generateWithRetry({
    model: 'gemini-3-flash-preview',
    contents: { parts: [...imageParts, { text: prompt }] },
    config: {
      temperature: 0.0,
    }
  });

  return response.text || "Failed to extract data.";
};

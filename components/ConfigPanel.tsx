import React, { useState, useEffect } from 'react';
import { AppConfig, RiskProfile, CapitalTier } from '../types';
import { Shield, ShieldAlert, ShieldCheck, Zap, Wallet, Lock, Save, User, MessageSquare, Briefcase, Sun, Moon, Palette } from 'lucide-react';

interface ConfigPanelProps {
    config: AppConfig;
    onSave: (newConfig: AppConfig) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onSave }) => {
    const [localConfig, setLocalConfig] = useState<AppConfig>(config);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleChange = (key: keyof AppConfig, value: any) => {
        setLocalConfig(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
    };

    const handleSave = () => {
        onSave(localConfig);
        setIsDirty(false);
    };

    return (
        <div className="max-w-4xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-8">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Global Mandate</h1>
                <p className="text-slate-500 dark:text-slate-400">Set the foundational logic and risk parameters for the AI Executioner.</p>
            </div>

            <div className="grid gap-8">
                {/* IDENTITY SECTION */}
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-[#222]">
                        <User className="text-indigo-600 dark:text-indigo-500" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Identity & Persona</h3>
                            <p className="text-xs text-slate-500">Customize how the AI communicates and your default tier.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Trader Name / Alias</label>
                                <input 
                                    type="text" 
                                    value={localConfig.userName}
                                    onChange={(e) => handleChange('userName', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:border-indigo-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">AI Persona (Tone)</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleChange('persona', 'INSTITUTIONAL')}
                                        className={`flex-1 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 justify-center transition-all ${localConfig.persona === 'INSTITUTIONAL' ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#333] hover:border-slate-400 dark:hover:border-[#555]'}`}
                                    >
                                        <Briefcase size={14} /> Institusi
                                    </button>
                                    <button 
                                        onClick={() => handleChange('persona', 'RETAIL_SEMI_FORMAL')}
                                        className={`flex-1 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 justify-center transition-all ${localConfig.persona === 'RETAIL_SEMI_FORMAL' ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#333] hover:border-slate-400 dark:hover:border-[#555]'}`}
                                    >
                                        <MessageSquare size={14} /> Ritel (Stockbit)
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Default Capital Tier</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { id: 'MICRO', icon: <Zap size={16}/>, label: 'Micro' },
                                    { id: 'RETAIL', icon: <Wallet size={16}/>, label: 'Retail' },
                                    { id: 'HIGH_NET', icon: <ShieldCheck size={16}/>, label: 'High Net' },
                                    { id: 'INSTITUTIONAL', icon: <Lock size={16}/>, label: 'Whale' }
                                ].map((tier) => (
                                    <button 
                                        key={tier.id}
                                        onClick={() => handleChange('defaultTier', tier.id)}
                                        className={`p-3 rounded-xl border text-sm font-bold flex items-center gap-2 justify-center transition-all ${localConfig.defaultTier === tier.id ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white' : 'bg-slate-50 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#333] hover:border-slate-400 dark:hover:border-[#555]'}`}
                                    >
                                        {tier.icon} {tier.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* APPEARANCE SECTION */}
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-[#222]">
                        <div className="flex items-center gap-3">
                            <Palette className="text-purple-600 dark:text-purple-500" />
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h3>
                                <p className="text-xs text-slate-500">Switch between dark and light modes.</p>
                            </div>
                        </div>
                        
                        {/* THEME TOGGLE SWITCH */}
                        <div className="flex items-center gap-3">
                            <Sun size={16} className={localConfig.theme === 'light' ? 'text-amber-500' : 'text-slate-400'} />
                            <button 
                                onClick={() => handleChange('theme', localConfig.theme === 'dark' ? 'light' : 'dark')}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${localConfig.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${localConfig.theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}>
                                    {localConfig.theme === 'dark' ? (
                                        <Moon size={12} className="absolute inset-0 m-auto text-indigo-600" />
                                    ) : (
                                        <Sun size={12} className="absolute inset-0 m-auto text-amber-500" />
                                    )}
                                </div>
                            </button>
                            <Moon size={16} className={localConfig.theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${localConfig.theme === 'light' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#333]'}`}>
                            <div className={`p-3 rounded-xl ${localConfig.theme === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-100 dark:bg-[#222] text-slate-400'}`}>
                                <Sun size={24} />
                            </div>
                            <div>
                                <div className={`font-bold text-sm ${localConfig.theme === 'light' ? 'text-indigo-900' : 'text-slate-500'}`}>Light Mode</div>
                                <div className="text-[10px] text-slate-500">Clean and high contrast</div>
                            </div>
                        </div>
                        <div className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${localConfig.theme === 'dark' ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#333]'}`}>
                            <div className={`p-3 rounded-xl ${localConfig.theme === 'dark' ? 'bg-[#222] text-indigo-400 shadow-sm' : 'bg-slate-100 dark:bg-[#222] text-slate-400'}`}>
                                <Moon size={24} />
                            </div>
                            <div>
                                <div className={`font-bold text-sm ${localConfig.theme === 'dark' ? 'text-indigo-100' : 'text-slate-500'}`}>Dark Mode</div>
                                <div className="text-[10px] text-slate-500">Easier on the eyes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RISK PROFILE SECTION (THE CORE FEATURE) */}
                <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] rounded-3xl p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
                    
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-[#222]">
                        <ShieldAlert className="text-rose-600 dark:text-rose-500" />
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Risk Protocol</h3>
                            <p className="text-xs text-slate-500">Defines how strict the AI audits valuation and anomalies.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => handleChange('riskProfile', 'CONSERVATIVE')}
                            className={`p-6 rounded-2xl border text-left transition-all ${localConfig.riskProfile === 'CONSERVATIVE' ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#333] hover:border-slate-400 dark:hover:border-[#555]'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <ShieldCheck className={localConfig.riskProfile === 'CONSERVATIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'} />
                                {localConfig.riskProfile === 'CONSERVATIVE' && <div className="px-2 py-0.5 rounded bg-emerald-500 text-white dark:text-black text-[10px] font-bold">ACTIVE</div>}
                            </div>
                            <h4 className={`font-bold mb-1 ${localConfig.riskProfile === 'CONSERVATIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>Conservative (Hawk)</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Strict adherence to fundamentals. Penalizes high PBV/PER severely. Requires positive Cash Flow. Best for asset preservation.</p>
                        </button>

                        <button 
                            onClick={() => handleChange('riskProfile', 'BALANCED')}
                            className={`p-6 rounded-2xl border text-left transition-all ${localConfig.riskProfile === 'BALANCED' ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#333] hover:border-slate-400 dark:hover:border-[#555]'}`}
                        >
                             <div className="flex justify-between items-start mb-4">
                                <Shield className={localConfig.riskProfile === 'BALANCED' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'} />
                                {localConfig.riskProfile === 'BALANCED' && <div className="px-2 py-0.5 rounded bg-blue-500 text-white dark:text-black text-[10px] font-bold">ACTIVE</div>}
                            </div>
                            <h4 className={`font-bold mb-1 ${localConfig.riskProfile === 'BALANCED' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>Balanced (Standard)</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">The default institutional view. Weighs technicals and fundamentals equally. Allows speculative buys if Bandarmology is strong.</p>
                        </button>

                        <button 
                            onClick={() => handleChange('riskProfile', 'AGGRESSIVE')}
                            className={`p-6 rounded-2xl border text-left transition-all ${localConfig.riskProfile === 'AGGRESSIVE' ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500' : 'bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#333] hover:border-slate-400 dark:hover:border-[#555]'}`}
                        >
                             <div className="flex justify-between items-start mb-4">
                                <ShieldAlert className={localConfig.riskProfile === 'AGGRESSIVE' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'} />
                                {localConfig.riskProfile === 'AGGRESSIVE' && <div className="px-2 py-0.5 rounded bg-amber-500 text-white dark:text-black text-[10px] font-bold">ACTIVE</div>}
                            </div>
                            <h4 className={`font-bold mb-1 ${localConfig.riskProfile === 'AGGRESSIVE' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>Aggressive (Bull)</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Growth focus. Tolerates high valuations (PBV &gt; 3) if momentum is strong. Higher risk of "Trap" but catches Multibaggers.</p>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={!isDirty}
                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isDirty ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 transform hover:scale-105' : 'bg-[#222] text-slate-600 cursor-not-allowed'}`}
                >
                    <Save size={18} /> Save Mandate
                </button>
            </div>
        </div>
    );
};
export default ConfigPanel;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { generateFakeSignal } from '../services/mockData';
import { BLAZE_HISTORY_URL } from '../constants';
import { SignalResult } from '../types';
import { Loader2, Lock, AlertTriangle, Skull } from 'lucide-react';

const Signals: React.FC = () => {
  const navigate = useNavigate();
  const { checkAccess } = useApp();
  const hasAccess = checkAccess();

  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState<SignalResult | null>(null);
  const [analysisStep, setAnalysisStep] = useState('');

  // Fake analysis steps for persuasion
  const performAnalysis = async () => {
    setLoading(true);
    setSignal(null);
    
    const steps = [
      "Lendo API Blaze v2...",
      "Detectando quebra de padrão...",
      "Volatilidade EXTREMA detectada...",
      "Calculando risco de reversão...",
      "Sinal de baixa confiança gerado..."
    ];

    for (const step of steps) {
      setAnalysisStep(step);
      await new Promise(r => setTimeout(r, 700)); // Slower for drama
    }

    // Now async to allow fetching real data if needed
    const newSignal = await generateFakeSignal();

    setSignal(newSignal);
    setLoading(false);
  };

  if (!hasAccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="bg-celestial-800/80 p-6 rounded-2xl border border-celestial-600 shadow-2xl">
            <Lock size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Acesso Bloqueado</h2>
            <p className="text-celestial-300 mb-6">
              Seu período de teste expirou ou você não possui um plano ativo.
            </p>
            <button 
              onClick={() => navigate('/subscriptions')}
              className="px-6 py-3 bg-celestial-500 hover:bg-celestial-400 text-white rounded-xl font-bold w-full"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        
        {/* Header Analysis Info */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Gerador Double</h2>
          <p className="text-xs text-celestial-400">
            Fonte: <a href={BLAZE_HISTORY_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">API Blaze Oficial</a>
          </p>
        </div>

        {/* Signal Display Area */}
        <div className="min-h-[320px] flex flex-col items-center justify-center bg-celestial-800/50 border border-celestial-600 rounded-3xl p-6 relative overflow-hidden shadow-inner shadow-black/50">
          
          {loading ? (
            <div className="text-center space-y-4 animate-pulse">
              <Loader2 size={48} className="animate-spin text-celestial-400 mx-auto" />
              <p className="text-celestial-300 font-mono text-sm uppercase tracking-widest">{analysisStep}</p>
            </div>
          ) : signal ? (
            <div className="w-full text-center space-y-6 animate-scale-in">
              
              {/* Aggressive Warning Banner */}
              <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-2 flex items-center justify-center gap-2 animate-pulse">
                <Skull size={16} className="text-red-400" />
                <span className="text-xs font-black text-red-200 uppercase tracking-widest">MERCADO INSTÁVEL</span>
                <Skull size={16} className="text-red-400" />
              </div>

              <div className="space-y-2">
                <p className="text-celestial-400 text-sm font-bold uppercase tracking-widest">Entrada Identificada</p>
                <div className={`text-5xl font-extrabold ${signal.color === 'vermelho' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-slate-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`}>
                  {signal.color === 'vermelho' ? '🔴 VERMELHO' : '⚫ PRETO'}
                </div>
              </div>

              <div className="bg-celestial-900/50 rounded-xl p-4 border border-celestial-700/50 inline-block w-full max-w-[200px]">
                <p className="text-xs text-celestial-400 mb-1">Entrar até:</p>
                <p className="text-3xl font-mono text-white font-bold">{signal.time}</p>
              </div>

              {/* Probability Display - ALWAYS Low/Warn */}
              <div className="flex flex-col gap-1 items-center">
                  <div className={`flex items-center justify-center gap-2 text-xs px-4 py-1.5 rounded-full mx-auto w-max border text-red-400 bg-red-950/30 border-red-800/40`}>
                    <AlertTriangle size={14} />
                    <span className="font-bold">Probabilidade: {signal.probability}%</span>
                  </div>
                  <span className="text-[10px] text-red-500 uppercase tracking-wide font-extrabold mt-1">
                    ⚠️ ALTO RISCO DE LOSS
                  </span>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-50">
              <p className="text-celestial-400">Clique abaixo para analisar</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!loading && (
          <button
            onClick={performAnalysis}
            className="w-full py-5 bg-gradient-to-r from-celestial-600 to-cyan-700 text-white font-black text-xl rounded-2xl shadow-lg shadow-cyan-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wide border-t border-white/10"
          >
            Gerar Sinal
          </button>
        )}

        <div className="text-center pt-4">
            <button onClick={() => navigate(-1)} className="text-celestial-500 text-sm hover:underline">
                Voltar para página anterior
            </button>
        </div>
      </div>
    </Layout>
  );
};

export default Signals;
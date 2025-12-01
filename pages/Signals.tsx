import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { generateFakeSignal } from '../services/mockData';
import { BLAZE_HISTORY_URL } from '../constants';
import { SignalResult } from '../types';
import { Loader2, Lock, CheckCircle, TrendingUp } from 'lucide-react';

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
      "Conectando Neural v4...",
      "Identificando Padrão de Fluxo...",
      "Calculando Probabilidade de Win...",
      "Confirmando Tendência Alta...",
      "Gerando entrada de Precisão..."
    ];

    for (const step of steps) {
      setAnalysisStep(step);
      await new Promise(r => setTimeout(r, 600)); 
    }

    const newSignal = await generateFakeSignal();

    setSignal(newSignal);
    setLoading(false);
  };

  if (!hasAccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="bg-celestial-800/80 p-6 rounded-2xl border border-celestial-600 shadow-2xl max-w-sm mx-auto">
            <Lock size={48} className="text-celestial-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Período Gratuito Encerrado</h2>
            <p className="text-celestial-300 mb-6 text-sm">
              Suas 25 horas de teste acabaram. Para continuar lucrando com nossa IA, ative um plano agora mesmo.
            </p>
            <button 
              onClick={() => navigate('/subscriptions')}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold w-full shadow-lg shadow-green-900/30 transition-all"
            >
              Liberar Acesso Agora
            </button>
            <p className="text-xs text-celestial-500 mt-4">
              Dúvidas? Contate o suporte.
            </p>
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
          <h2 className="text-2xl font-bold text-white">Gerador Double Pro</h2>
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
              
              {/* High Confidence Banner */}
              <div className="bg-emerald-900/40 border border-emerald-500/50 rounded-lg p-2 flex items-center justify-center gap-2 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-xs font-black text-emerald-200 uppercase tracking-widest">ALTA ASSERTIVIDADE</span>
                <CheckCircle size={16} className="text-emerald-400" />
              </div>

              <div className="space-y-2">
                <p className="text-celestial-400 text-sm font-bold uppercase tracking-widest">Entrar na cor</p>
                <div className={`text-5xl font-extrabold ${signal.color === 'vermelho' ? 'text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]' : 'text-slate-200 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]'}`}>
                  {signal.color === 'vermelho' ? '🔴 VERMELHO' : '⚫ PRETO'}
                </div>
              </div>

              <div className="bg-celestial-900/50 rounded-xl p-4 border border-celestial-700/50 inline-block w-full max-w-[200px]">
                <p className="text-xs text-celestial-400 mb-1">Entrar até:</p>
                <p className="text-3xl font-mono text-white font-bold">{signal.time}</p>
              </div>

              {/* Probability Display - HIGH */}
              <div className="flex flex-col gap-1 items-center">
                  <div className={`flex items-center justify-center gap-2 text-xs px-4 py-1.5 rounded-full mx-auto w-max border text-emerald-400 bg-emerald-950/30 border-emerald-800/40`}>
                    <TrendingUp size={14} />
                    <span className="font-bold">Confiança: {signal.probability}%</span>
                  </div>
                  <div className="w-full max-w-[150px] bg-gray-700 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${signal.probability}%` }}></div>
                  </div>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-50 space-y-2">
              <TrendingUp size={48} className="text-celestial-600 mx-auto" />
              <p className="text-celestial-400">Clique abaixo para analisar</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!loading && (
          <button
            onClick={performAnalysis}
            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-xl rounded-2xl shadow-lg shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wide border-t border-white/10"
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
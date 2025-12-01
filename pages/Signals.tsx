import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { generateFakeSignal, generateHistory } from '../services/mockData';
import { BLAZE_HISTORY_URL } from '../constants';
import { SignalResult } from '../types';
import { Loader2, Lock, AlertTriangle } from 'lucide-react';

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
      "Conectando ao servidor...",
      "Lendo histórico recente...",
      "Identificando padrões de cores...",
      "Calculando probabilidades...",
      "Gerando entrada..."
    ];

    for (const step of steps) {
      setAnalysisStep(step);
      await new Promise(r => setTimeout(r, 600)); // 0.6s per step
    }

    const result = generateFakeSignal();
    
    // Explicitly casting or creating the object to satisfy TypeScript and State
    const newSignal: SignalResult = {
      color: result.color,
      probability: result.probability,
      time: result.time,
      generatedAt: Date.now()
    };

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
            Analisando: <a href={BLAZE_HISTORY_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Histórico Oficial</a>
          </p>
        </div>

        {/* Signal Display Area */}
        <div className="min-h-[300px] flex flex-col items-center justify-center bg-celestial-800/50 border border-celestial-600 rounded-3xl p-6 relative overflow-hidden shadow-inner shadow-black/50">
          
          {loading ? (
            <div className="text-center space-y-4 animate-pulse">
              <Loader2 size={48} className="animate-spin text-celestial-400 mx-auto" />
              <p className="text-celestial-300 font-mono text-sm uppercase tracking-widest">{analysisStep}</p>
            </div>
          ) : signal ? (
            <div className="w-full text-center space-y-6 animate-scale-in">
              <div className="space-y-2">
                <p className="text-celestial-400 text-sm font-bold uppercase tracking-widest">Entrada Confirmada</p>
                <div className={`text-5xl font-extrabold ${signal.color === 'vermelho' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-slate-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`}>
                  {signal.color === 'vermelho' ? '🔴 VERMELHO' : '⚫ PRETO'}
                </div>
              </div>

              <div className="bg-celestial-900/50 rounded-xl p-4 border border-celestial-700/50 inline-block w-full max-w-[200px]">
                <p className="text-xs text-celestial-400 mb-1">Horário Limite</p>
                <p className="text-3xl font-mono text-white font-bold">{signal.time}</p>
              </div>

              {/* Probability Display */}
              <div className={`flex items-center justify-center gap-2 text-xs px-3 py-1 rounded-full mx-auto w-max border ${signal.probability <= 39 ? 'text-yellow-500/80 bg-yellow-900/20 border-yellow-900/30' : 'text-green-400/80 bg-green-900/20 border-green-900/30'}`}>
                <AlertTriangle size={12} />
                <span>Probabilidade estimada: {signal.probability}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-50">
              <p className="text-celestial-400">Aguardando solicitação...</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!loading && (
          <button
            onClick={performAnalysis}
            className="w-full py-5 bg-gradient-to-r from-celestial-500 to-cyan-600 text-white font-black text-xl rounded-2xl shadow-lg shadow-cyan-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wide"
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

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { fetchBlazeHistory } from '../services/mockData';
import { HistoryItem } from '../types';
import { BLAZE_GAME_URL, BLAZE_HISTORY_URL } from '../constants';
import { ExternalLink, RefreshCw } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const { manualHistory } = useApp();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    // Mescla o histórico manual com o histórico da API
    const result = await fetchBlazeHistory();
    const apiData = result.data;
    
    // Se tiver histórico manual, usamos ele como prioritário e preenchemos o resto com API
    // Para garantir que mostremos sempre as últimas rodadas reais
    let displayHistory = [...manualHistory];
    
    if (displayHistory.length < 15) {
        // Preenche com API se faltar
        const needed = 15 - displayHistory.length;
        displayHistory = [...displayHistory, ...apiData.slice(0, needed)];
    }
    
    setHistory(displayHistory);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Refresh interval
    const interval = setInterval(() => {
        loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [manualHistory]); // Recarrega se o manual history mudar

  const getColorClass = (color: string) => {
    switch (color) {
      case 'vermelho': return 'bg-red-600 border-red-400 text-white';
      case 'preto': return 'bg-slate-800 border-slate-600 text-white';
      case 'branco': return 'bg-white border-slate-200 text-slate-900';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Histórico Recente</h2>
            <button onClick={() => { setLoading(true); loadData(); }} className="p-2 bg-celestial-800 rounded-full hover:bg-celestial-700 transition">
                <RefreshCw size={20} className={`text-celestial-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>
        
        <div className="bg-celestial-800/50 rounded-xl p-4 border border-celestial-700 min-h-[100px]">
          {loading && history.length === 0 ? (
             <div className="text-center py-8 text-celestial-400">Carregando dados...</div>
          ) : (
            <div className="grid grid-cols-5 gap-3 mb-4 animate-fade-in">
                {history.map((item, idx) => (
                <div 
                    key={idx} 
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm border-2 shadow-lg transition-all hover:scale-105 ${getColorClass(item.color)}`}
                >
                    {item.value || (item.color === 'branco' ? '0' : '-')}
                </div>
                ))}
            </div>
          )}
          
          <p className="text-xs text-center text-celestial-400 mt-2 italic flex items-center justify-center gap-1">
             Últimas rodadas (Manual + API)
          </p>
        </div>

        <div className="space-y-3">
          <a 
            href={BLAZE_GAME_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-celestial-900 border border-celestial-600 rounded-xl hover:bg-celestial-800 transition group"
          >
            <span className="font-semibold text-white group-hover:text-celestial-300 transition-colors">Ver Double ao Vivo</span>
            <ExternalLink size={18} className="text-celestial-400" />
          </a>
          <a 
            href={BLAZE_HISTORY_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-celestial-900 border border-celestial-600 rounded-xl hover:bg-celestial-800 transition group"
          >
            <span className="font-semibold text-white group-hover:text-celestial-300 transition-colors">Ver Histórico Oficial Completo</span>
            <ExternalLink size={18} className="text-celestial-400" />
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;

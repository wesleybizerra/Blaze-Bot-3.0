import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchBlazeHistory } from '../services/mockData';
import { HistoryItem } from '../types';
import { BLAZE_GAME_URL, BLAZE_HISTORY_URL } from '../constants';
import { ExternalLink, RefreshCw } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    // Keep loading state mostly for initial load or manual refresh
    const data = await fetchBlazeHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 10 seconds to sync with real game
    const interval = setInterval(() => {
        loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
             <div className="text-center py-8 text-celestial-400">Carregando dados da Blaze...</div>
          ) : (
            <div className="grid grid-cols-5 gap-3 mb-4 animate-fade-in">
                {history.map((item, idx) => (
                <div 
                    key={idx} 
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm border-2 shadow-lg transition-all hover:scale-105 ${getColorClass(item.color)}`}
                >
                    {item.value}
                </div>
                ))}
            </div>
          )}
          
          <p className="text-xs text-center text-celestial-400 mt-2 italic flex items-center justify-center gap-1">
             Sincronizado com Blaze API (Proxy)
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
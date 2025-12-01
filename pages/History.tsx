import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { generateHistory } from '../services/mockData';
import { HistoryItem } from '../types';
import { BLAZE_GAME_URL, BLAZE_HISTORY_URL } from '../constants';
import { ExternalLink } from 'lucide-react';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Generate simulated history on mount
    setHistory(generateHistory(15));
    
    // Simulate real-time updates
    const interval = setInterval(() => {
        setHistory(generateHistory(15));
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
        <h2 className="text-2xl font-bold text-white mb-4">Histórico Recente</h2>
        
        <div className="bg-celestial-800/50 rounded-xl p-4 border border-celestial-700">
          <div className="grid grid-cols-5 gap-3 mb-4">
            {history.map((item, idx) => (
              <div 
                key={idx} 
                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm border-2 shadow-lg ${getColorClass(item.color)}`}
              >
                {item.value}
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-celestial-400 mt-2 italic">
            *Dados simulados para demonstração.
          </p>
        </div>

        <div className="space-y-3">
          <a 
            href={BLAZE_GAME_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-celestial-900 border border-celestial-600 rounded-xl hover:bg-celestial-800 transition"
          >
            <span className="font-semibold text-white">Ver Double ao Vivo</span>
            <ExternalLink size={18} className="text-celestial-400" />
          </a>
          <a 
            href={BLAZE_HISTORY_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-celestial-900 border border-celestial-600 rounded-xl hover:bg-celestial-800 transition"
          >
            <span className="font-semibold text-white">Ver Histórico Oficial Completo</span>
            <ExternalLink size={18} className="text-celestial-400" />
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;
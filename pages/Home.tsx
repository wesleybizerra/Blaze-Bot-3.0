import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Zap, BarChart2, ShieldCheck } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout showBack={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-fade-in">
        <div className="space-y-2">
          <div className="inline-block p-3 rounded-full bg-celestial-800 border border-celestial-600 shadow-xl shadow-celestial-500/20 mb-4">
            <Zap size={48} className="text-celestial-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Sinais <span className="text-celestial-400">Double</span>
          </h1>
          <p className="text-celestial-300 text-lg max-w-xs mx-auto">
            Inteligência artificial avançada para análise de tendências em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full">
          <button 
            onClick={() => navigate('/auth')}
            className="w-full py-4 bg-gradient-to-r from-celestial-600 to-celestial-500 text-white font-bold rounded-xl shadow-lg shadow-celestial-600/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 text-lg"
          >
            Acessar Sistema
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full text-sm text-celestial-300">
          <div className="bg-celestial-800/50 p-4 rounded-xl border border-celestial-700/50">
            <BarChart2 className="w-8 h-8 mx-auto mb-2 text-celestial-400" />
            <span>Análise de Padrões</span>
          </div>
          <div className="bg-celestial-800/50 p-4 rounded-xl border border-celestial-700/50">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-celestial-400" />
            <span>Segurança Total</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
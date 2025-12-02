import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Zap, BarChart2, ShieldCheck, Activity } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout showBack={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-fade-in relative">
        
        {/* Operational Status Badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-4 inline-flex items-center gap-2 bg-celestial-900/80 px-4 py-1.5 rounded-full border border-celestial-700/50 backdrop-blur-sm shadow-lg shadow-emerald-900/20">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-celestial-300 font-bold">v8.0 CLOUD SYSTEM</span>
        </div>

        <div className="space-y-4 pt-12">
          <div className="inline-block p-4 rounded-full bg-gradient-to-b from-celestial-800 to-celestial-900 border border-celestial-600 shadow-2xl shadow-celestial-500/20 mb-2 relative group">
            <div className="absolute inset-0 bg-celestial-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
            <Zap size={56} className="text-celestial-400 relative z-10 drop-shadow-[0_0_15px_rgba(77,166,255,0.8)]" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
            Sinais <span className="text-transparent bg-clip-text bg-gradient-to-r from-celestial-400 to-cyan-200">Double</span>
          </h1>
          <p className="text-celestial-300 text-lg max-w-xs mx-auto leading-relaxed">
            A inteligência artificial mais avançada do mercado para análise estatística.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full px-2">
          <button 
            onClick={() => navigate('/auth')}
            className="w-full py-4 bg-gradient-to-r from-celestial-600 to-cyan-600 hover:from-celestial-500 hover:to-cyan-500 text-white font-black rounded-2xl shadow-lg shadow-cyan-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-wider border border-white/10"
          >
            ACESSAR AGORA 🚀
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full text-xs text-celestial-300">
          <div className="bg-celestial-800/40 p-3 rounded-xl border border-celestial-700/50 flex flex-col items-center gap-2">
            <BarChart2 className="w-6 h-6 text-celestial-400" />
            <span className="font-semibold">Análise em Tempo Real</span>
          </div>
          <div className="bg-celestial-800/40 p-3 rounded-xl border border-celestial-700/50 flex flex-col items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-celestial-400" />
            <span className="font-semibold">Criptografia de Ponta</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
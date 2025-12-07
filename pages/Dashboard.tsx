
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Zap, History, User, CreditCard, Shield, Cpu, Wifi, AlertOctagon, Phone } from 'lucide-react';
import { WA_LINK_SUPPORT } from '../constants';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useApp();

  const menuItems = [
    { label: 'Sinais Double', icon: <Zap size={24} />, path: '/signals', color: 'bg-gradient-to-br from-celestial-600 to-celestial-800' },
    { label: 'Histórico', icon: <History size={24} />, path: '/history', color: 'bg-celestial-800' },
    { label: 'Meu Perfil', icon: <User size={24} />, path: '/profile', color: 'bg-celestial-800' },
    { label: 'Assinaturas', icon: <CreditCard size={24} />, path: '/subscriptions', color: 'bg-celestial-800' },
  ];

  if (isAdmin) {
    menuItems.push({ label: 'Admin', icon: <Shield size={24} />, path: '/admin', color: 'bg-red-900' });
  }

  return (
    <Layout showBack={false}>
      <div className="space-y-6 relative min-h-[70vh]">
        {/* User Welcome Card */}
        <div className="bg-celestial-800/50 border border-celestial-700 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-celestial-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h2 className="text-xl font-bold text-white relative z-10">Olá, {currentUser?.name || 'Usuário'}</h2>
          <p className="text-celestial-400 text-sm mt-1 relative z-10">
            Plano atual: <span className="font-semibold uppercase text-celestial-200">{currentUser?.plan}</span>
          </p>
        </div>

        {/* System Status Indicators */}
        <div className="grid grid-cols-3 gap-2">
            <div className="bg-celestial-900/40 p-2 rounded-lg border border-celestial-800 flex flex-col items-center justify-center gap-1 text-center">
                <div className="relative">
                    <Wifi size={16} className="text-green-500" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </div>
                <span className="text-[10px] text-celestial-400 font-mono uppercase">Online</span>
            </div>
            <div className="bg-celestial-900/40 p-2 rounded-lg border border-celestial-800 flex flex-col items-center justify-center gap-1 text-center">
                <Cpu size={16} className="text-blue-400" />
                <span className="text-[10px] text-celestial-400 font-mono uppercase">IA v8.1</span>
            </div>
            {/* Volatility Indicator - Justifies errors */}
            <div className="bg-red-950/30 p-2 rounded-lg border border-red-900/50 flex flex-col items-center justify-center gap-1 text-center animate-pulse">
                <AlertOctagon size={16} className="text-red-500" />
                <span className="text-[10px] text-red-400 font-mono uppercase font-bold">Vol: CRÍTICA</span>
            </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 gap-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`${item.color} p-6 rounded-2xl shadow-lg border border-celestial-700/50 flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="bg-celestial-950/30 p-3 rounded-full text-white group-hover:text-celestial-300 transition-colors z-10 shadow-inner shadow-black/30">
                {item.icon}
              </div>
              <span className="text-lg font-bold text-white tracking-wide z-10">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Whatsapp Floating Button */}
        <a 
          href={WA_LINK_SUPPORT}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-16 right-4 p-4 bg-green-500 rounded-full shadow-lg shadow-green-900/50 text-white hover:bg-green-400 transition-all hover:scale-110 z-50 flex items-center justify-center"
          title="Falar com Suporte"
        >
            <Phone size={28} fill="currentColor" />
        </a>

      </div>
    </Layout>
  );
};

export default Dashboard;

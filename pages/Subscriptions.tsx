
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { PlanType } from '../types';
import * as Constants from '../constants';
import { CheckCircle2, Clock, Zap, Star } from 'lucide-react';

const Subscriptions: React.FC = () => {
  const { currentUser } = useApp();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if ((currentUser?.plan === PlanType.TRIAL || currentUser?.trialEndsAt) && currentUser.trialEndsAt) {
      const timer = setInterval(() => {
        const now = Date.now();
        const diff = currentUser.trialEndsAt! - now;
        
        if (diff <= 0) {
          setTimeLeft('Expirado');
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
              setTimeLeft(`${days}d ${hours}h`);
          } else {
              setTimeLeft(`${hours}h ${minutes}m`);
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentUser]);

  const PlanCard = ({ title, price, features, type, isCurrent, link, highlight = false }: any) => (
    <div className={`relative p-6 rounded-2xl border flex flex-col ${isCurrent ? 'border-celestial-400 bg-celestial-800/80 shadow-lg shadow-celestial-500/10' : 'border-celestial-700 bg-celestial-900/50'} ${highlight ? 'ring-2 ring-emerald-500/50' : ''}`}>
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-celestial-400 text-celestial-950 text-xs font-bold px-3 py-1 rounded-full z-10">
          PLANO ATUAL
        </span>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <div className="text-3xl font-extrabold text-celestial-300 mb-4">{price}</div>
      
      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <CheckCircle2 size={16} className="text-celestial-500 shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {type === PlanType.TRIAL ? (
        <div className="w-full py-3 bg-gray-700/50 text-gray-400 font-bold rounded-xl text-center flex items-center justify-center gap-2">
           <Clock size={18} />
           {timeLeft || '25 Horas'}
        </div>
      ) : (
        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-3 font-bold rounded-xl text-center shadow-lg transition-colors flex items-center justify-center gap-2 ${highlight ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
        >
          <Zap size={18} fill="currentColor" /> COMPRAR
        </a>
      )}
    </div>
  );

  const DailyPackage = ({ days, price, link, bestValue = false }: { days: number, price: string, link: string, bestValue?: boolean }) => (
    <a 
        href={link}
        target="_blank" 
        rel="noopener noreferrer"
        className={`relative flex flex-col items-center justify-between bg-celestial-800/40 border p-4 rounded-xl hover:bg-celestial-700/60 transition-all group ${bestValue ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-celestial-600 hover:border-celestial-400'}`}
    >
        {bestValue && (
            <span className="absolute -top-2.5 bg-emerald-500 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star size={8} fill="currentColor" /> TOP
            </span>
        )}
        <div className="text-center mb-2">
            <span className="block text-sm text-celestial-400 font-semibold mb-1 uppercase tracking-wide">{days} {days === 1 ? 'Dia' : 'Dias'}</span>
            <span className="block text-2xl font-bold text-white">{price}</span>
        </div>
        <div className={`w-full py-2 rounded-lg text-xs font-bold text-white text-center transition-colors ${bestValue ? 'bg-emerald-600 group-hover:bg-emerald-500' : 'bg-celestial-700 group-hover:bg-green-600'}`}>
            COMPRAR
        </div>
    </a>
  );

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-white text-center">Planos & Pacotes</h2>
        
        {/* Destaques */}
        <div className="space-y-4">
          <PlanCard 
            title="Teste Grátis"
            price="R$ 0,00"
            features={['Acesso por 25 horas', 'Sinais Double', 'Suporte Básico']}
            type={PlanType.TRIAL}
            isCurrent={currentUser?.plan === PlanType.TRIAL}
          />

          <PlanCard 
            title="Mensal"
            price="R$ 20,00"
            features={['Acesso por 30 dias', 'Sinais Ilimitados', 'Histórico Completo', 'Suporte Prioritário']}
            type={PlanType.MONTHLY}
            isCurrent={currentUser?.plan === PlanType.MONTHLY}
            link={Constants.WA_LINK_MENSAL}
          />

          <PlanCard 
            title="Premium Vitalício"
            price="R$ 100,00"
            features={['Pagamento Único', 'Acesso Vitalício', 'Todas as funções', 'Grupo VIP']}
            type={PlanType.PREMIUM}
            isCurrent={currentUser?.plan === PlanType.PREMIUM}
            link={Constants.WA_LINK_PREMIUM}
            highlight={true}
          />
        </div>

        {/* Pacotes Diários */}
        <div className="pt-6 border-t border-celestial-800">
            <div className="flex items-center gap-2 mb-2 justify-center text-celestial-200">
                <Zap size={20} className="text-yellow-400" fill="currentColor" />
                <h3 className="text-xl font-bold">Acesso Diário</h3>
            </div>
            <p className="text-center text-xs text-celestial-400 mb-6 max-w-[250px] mx-auto">
                Precisa de acesso rápido? Escolha um pacote avulso e libere o sistema imediatamente.
            </p>

            <div className="grid grid-cols-2 gap-3">
                <DailyPackage days={1} price="R$ 1,00" link={Constants.WA_LINK_1_DIA} />
                <DailyPackage days={2} price="R$ 2,00" link={Constants.WA_LINK_2_DIAS} />
                <DailyPackage days={3} price="R$ 3,00" link={Constants.WA_LINK_3_DIAS} />
                <DailyPackage days={4} price="R$ 4,00" link={Constants.WA_LINK_4_DIAS} />
                <DailyPackage days={5} price="R$ 5,00" link={Constants.WA_LINK_5_DIAS} />
                <DailyPackage days={10} price="R$ 10,00" link={Constants.WA_LINK_10_DIAS} bestValue={true} />
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;

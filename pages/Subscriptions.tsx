import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { PlanType } from '../types';
import { WHATSAPP_LINK } from '../constants';
import { CheckCircle2, Clock } from 'lucide-react';

const Subscriptions: React.FC = () => {
  const { currentUser } = useApp();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (currentUser?.plan === PlanType.TRIAL && currentUser.trialEndsAt) {
      const timer = setInterval(() => {
        const now = Date.now();
        const diff = currentUser.trialEndsAt! - now;
        
        if (diff <= 0) {
          setTimeLeft('Expirado');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentUser]);

  const PlanCard = ({ title, price, features, type, isCurrent }: any) => (
    <div className={`relative p-6 rounded-2xl border ${isCurrent ? 'border-celestial-400 bg-celestial-800/80 shadow-lg shadow-celestial-500/10' : 'border-celestial-700 bg-celestial-900/50'} flex flex-col`}>
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-celestial-400 text-celestial-950 text-xs font-bold px-3 py-1 rounded-full">
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
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-center shadow-lg transition-colors"
        >
          COMPRAR
        </a>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Planos de Acesso</h2>
        
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
          />

          <PlanCard 
            title="Premium Vitalício"
            price="R$ 100,00"
            features={['Pagamento Único', 'Acesso Vitalício', 'Todas as funções', 'Grupo VIP']}
            type={PlanType.PREMIUM}
            isCurrent={currentUser?.plan === PlanType.PREMIUM}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;
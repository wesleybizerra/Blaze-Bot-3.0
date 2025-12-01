import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { PlanType } from '../types';
import { Clock, Check, AlertOctagon, Plus } from 'lucide-react';

const Admin: React.FC = () => {
  const { users, currentUser, isAdmin, addTime, setPlan } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center p-10 text-red-500">
          <AlertOctagon size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Acesso Negado</h2>
        </div>
      </Layout>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTime = (email: string) => {
    // Logic updated to allow specific Hours and Minutes input easily
    // If user cancels or leaves empty, it defaults to 0
    const daysInput = prompt("Adicionar quantos DIAS?", "0");
    const days = parseInt(daysInput || "0");
    
    const hoursInput = prompt("Adicionar quantas HORAS?", "0");
    const hours = parseInt(hoursInput || "0");
    
    const minsInput = prompt("Adicionar quantos MINUTOS?", "0");
    const mins = parseInt(minsInput || "0");

    if (isNaN(days) || isNaN(hours) || isNaN(mins)) {
        alert("Por favor, insira apenas números válidos.");
        return;
    }

    if (days === 0 && hours === 0 && mins === 0) {
        return;
    }

    const confirmMsg = `Confirmar adição de tempo para ${email}?\n\nDias: ${days}\nHoras: ${hours}\nMinutos: ${mins}`;

    if (window.confirm(confirmMsg)) {
        const totalHours = (days * 24) + hours + (mins / 60);
        addTime(email, totalHours);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Painel Admin</h2>
            <div className="text-xs text-celestial-400 bg-celestial-900 px-2 py-1 rounded">
                Logado como: {currentUser?.email}
            </div>
        </div>

        <input 
            type="text"
            placeholder="Buscar usuário..."
            className="w-full bg-celestial-800 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="space-y-4">
            {filteredUsers.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhum usuário encontrado.</p>
            )}
            
            {filteredUsers.map((user) => (
                <div key={user.email} className="bg-celestial-900/80 border border-celestial-700 p-4 rounded-xl space-y-3 shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-white text-lg">{user.name}</p>
                            <p className="text-sm text-celestial-400">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">Plano:</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    user.plan === PlanType.PREMIUM ? 'bg-purple-900 text-purple-200' :
                                    user.plan === PlanType.MONTHLY ? 'bg-green-900 text-green-200' :
                                    'bg-gray-700 text-gray-300'
                                }`}>
                                    {user.plan}
                                </span>
                            </div>
                            {user.trialEndsAt && user.plan === PlanType.TRIAL && (
                                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                    <Clock size={10} />
                                    Expira: {new Date(user.trialEndsAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-celestial-800">
                        {/* Time Addition Button */}
                        <button 
                            onClick={() => handleAddTime(user.email)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors shadow-sm shadow-blue-900/20"
                            title="Adicionar Dias, Horas e Minutos"
                        >
                            <Plus size={14} /> Add Tempo
                        </button>
                        
                        {/* Plan Buttons */}
                        <button 
                            onClick={() => setPlan(user.email, PlanType.MONTHLY)}
                            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                                user.plan === PlanType.MONTHLY 
                                ? 'bg-green-900/50 text-green-500 border border-green-800 cursor-default' 
                                : 'bg-green-700 hover:bg-green-600 text-white shadow-sm'
                            }`}
                        >
                            Mensal
                        </button>
                        
                        <button 
                            onClick={() => setPlan(user.email, PlanType.PREMIUM)}
                            className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                                user.plan === PlanType.PREMIUM 
                                ? 'bg-purple-900/50 text-purple-500 border border-purple-800 cursor-default' 
                                : 'bg-purple-700 hover:bg-purple-600 text-white shadow-sm'
                            }`}
                        >
                            Premium
                        </button>

                        <button 
                            onClick={() => setPlan(user.email, user.plan === PlanType.TRIAL ? PlanType.MONTHLY : PlanType.TRIAL)}
                            className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold px-3 py-2 rounded-lg ml-auto transition-colors"
                        >
                            {user.plan === PlanType.TRIAL ? 'Ativar' : 'Desativar'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
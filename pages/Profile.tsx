import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, updateUser } = useApp();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate || '');
  const [message, setMessage] = useState('');

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.email, { name, phone, birthDate });
    setMessage('Dados atualizados com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Meu Perfil</h2>

        <form onSubmit={handleSave} className="space-y-4">
            {/* Read Only */}
            <div>
              <label className="block text-xs text-celestial-400 mb-1 ml-1">E-mail (Não editável)</label>
              <div className="w-full bg-celestial-950/50 border border-celestial-800 rounded-lg p-3 text-gray-400">
                {currentUser.email}
              </div>
            </div>

            {/* Editable */}
            <div>
              <label className="block text-xs text-celestial-300 mb-1 ml-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-celestial-800/50 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-celestial-300 mb-1 ml-1">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-celestial-800/50 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-celestial-300 mb-1 ml-1">Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-celestial-800/50 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-celestial-500 hover:bg-celestial-400 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              <Save size={20} /> Salvar Alterações
            </button>
        </form>

        {message && (
          <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300 text-center text-sm">
            {message}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
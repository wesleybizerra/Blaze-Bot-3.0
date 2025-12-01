import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (!email || !password) return alert('Digite email e senha');
      login(email, password);
      // Login function handles success/fail internally in context via alerts or state, 
      // but in this mock, we assume success if no alert blocks it, so we need to check currentUser in useEffect or just navigate
      // For simplicity in this mock structure:
      setTimeout(() => {
        // We can't easily check success here without refactoring context to return success/fail
        // But since AppContext sets user immediately on success, we just redirect.
        // A real app would wait for a promise.
        const storedUser = localStorage.getItem('blaze_current_user');
        if (storedUser) navigate('/dashboard');
      }, 100);
    } else {
      if (!email || !password || !name || !phone || !birthDate) return alert('Preencha todos os campos');
      register({ email, password, name, phone, birthDate });
      navigate('/dashboard');
    }
  };

  return (
    <Layout showBack={true}>
      <div className="flex flex-col justify-center min-h-[70vh]">
        <div className="bg-celestial-800/80 backdrop-blur-xl p-6 rounded-2xl border border-celestial-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-white mb-6">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs text-celestial-300 mb-1 ml-1">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-celestial-900/50 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none placeholder-celestial-600"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-xs text-celestial-300 mb-1 ml-1">Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-celestial-900/50 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none placeholder-celestial-600"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-celestial-300 mb-1 ml-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-celestial-900/50 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-celestial-300 mb-1 ml-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-celestial-900/50 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none placeholder-celestial-600"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs text-celestial-300 mb-1 ml-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-celestial-900/50 border border-celestial-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-celestial-400 focus:outline-none placeholder-celestial-600"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-celestial-500 hover:bg-celestial-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-celestial-500/20 transition-all mt-6"
            >
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-celestial-400 hover:text-white text-sm underline decoration-celestial-400/30 underline-offset-4"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
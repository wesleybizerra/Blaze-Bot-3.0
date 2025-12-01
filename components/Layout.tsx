import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import { DISCLAIMER_TEXT } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showBack = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

  const isAuthPage = location.pathname === '/' || location.pathname === '/auth';

  return (
    <div className="min-h-screen bg-celestial-900 text-celestial-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-celestial-800 via-celestial-900 to-black opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-celestial-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      {!isAuthPage && (
        <header className="relative z-20 bg-celestial-800/80 backdrop-blur-md border-b border-celestial-700 p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2">
            {showBack && (
              <button 
                onClick={goBack} 
                className="p-2 rounded-full hover:bg-celestial-700 transition text-celestial-300"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-celestial-300 to-white">
              BlazePredict
            </h1>
          </div>
          {currentUser && (
            <button 
              onClick={handleLogout} 
              className="p-2 text-celestial-400 hover:text-white transition"
              title="Sair"
            >
              <LogOut size={24} />
            </button>
          )}
        </header>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-grow p-4 pb-24 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Persistent Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-celestial-950/95 border-t border-celestial-800 p-3 z-50 text-center shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-center gap-2 text-xs text-celestial-400 max-w-2xl mx-auto">
          <ShieldAlert size={16} className="shrink-0 text-yellow-500" />
          <p>{DISCLAIMER_TEXT}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
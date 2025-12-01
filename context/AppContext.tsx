import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PlanType, GlobalState } from '../types';
import { ADMIN_EMAILS, PREMIUM_WHITELIST } from '../constants';

interface AppContextType extends GlobalState {
  checkAccess: () => boolean;
  addTime: (email: string, hours: number) => void;
  setPlan: (email: string, plan: PlanType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial admin user with requested password
const INITIAL_USERS: User[] = [
  {
    email: 'wesleybizerra@hotmail.com',
    password: 'Cadernorox@27',
    name: 'Admin Master',
    phone: '000000000',
    birthDate: '1990-01-01',
    plan: PlanType.PREMIUM,
    trialEndsAt: null,
    isBlocked: false
  },
  {
    email: 'wesleybizerra1@gmail.com',
    password: '123', // Default simple pass for secondary admin
    name: 'Admin User',
    phone: '000000000',
    birthDate: '1990-01-01',
    plan: PlanType.PREMIUM,
    trialEndsAt: null,
    isBlocked: false
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from local storage to persist accounts across updates
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('blaze_users_v2');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem('blaze_current_user');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // Persist users whenever they change
  useEffect(() => {
    localStorage.setItem('blaze_users_v2', JSON.stringify(users));
  }, [users]);

  // Persist current session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('blaze_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('blaze_current_user');
    }
  }, [currentUser]);

  // Check if current user is admin
  const isAdmin = currentUser ? ADMIN_EMAILS.includes(currentUser.email) : false;

  const register = (userData: Omit<User, 'plan' | 'trialEndsAt' | 'isBlocked'>) => {
    // Check if user exists
    if (users.find(u => u.email === userData.email)) {
      alert('E-mail já cadastrado!');
      return;
    }

    let initialPlan = PlanType.TRIAL;
    // CRITICAL: Set 25 hours trial from NOW
    let trialEnd = Date.now() + (25 * 60 * 60 * 1000); 

    // Auto-activate Premium for whitelist
    if (PREMIUM_WHITELIST.includes(userData.email)) {
      initialPlan = PlanType.PREMIUM;
      trialEnd = 0; // Not used for premium
    }

    const newUser: User = {
      ...userData,
      plan: initialPlan,
      trialEndsAt: trialEnd,
      isBlocked: false
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const login = (email: string, password?: string) => {
    const user = users.find(u => u.email === email);
    
    if (!user) {
      alert('Usuário não encontrado. Crie uma conta.');
      return;
    }

    // Check password logic
    if (user.password && password) {
        if (user.password !== password) {
            alert('Senha incorreta.');
            return;
        }
    } else if (user.password && !password) {
        alert('Por favor, digite sua senha.');
        return;
    }

    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = (email: string, data: Partial<User>) => {
    setUsers(prevUsers => prevUsers.map(u => u.email === email ? { ...u, ...data } : u));
    
    if (currentUser?.email === email) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const checkAccess = (): boolean => {
    if (!currentUser) return false;
    
    // Always allow Admin/Premium
    if (currentUser.plan === PlanType.PREMIUM || currentUser.plan === PlanType.MONTHLY) {
      return true;
    }

    // Check Trial
    if (currentUser.plan === PlanType.TRIAL && currentUser.trialEndsAt) {
      if (Date.now() > currentUser.trialEndsAt) {
        return false; // Expired
      }
      return true;
    }

    return false; // No plan
  };

  // Admin Actions
  const addTime = (email: string, hours: number) => {
    const user = users.find(u => u.email === email);
    if (!user) return;

    // Extend trial or temporary access
    // If expired, start from now. If active, add to current end time.
    const currentEnd = (user.trialEndsAt && user.trialEndsAt > Date.now()) ? user.trialEndsAt : Date.now();
    const newEnd = currentEnd + (hours * 60 * 60 * 1000);
    
    // If user was expired/no plan, set to TRIAL temporarily so logic works
    const newPlan = user.plan === PlanType.PREMIUM || user.plan === PlanType.MONTHLY ? user.plan : PlanType.TRIAL;

    const updatedUser = { ...user, trialEndsAt: newEnd, plan: newPlan };
    
    // Update both global list and current session if it matches
    setUsers(prev => prev.map(u => u.email === email ? updatedUser : u));
    if (currentUser?.email === email) {
        setCurrentUser(updatedUser);
    }
  };

  const setPlan = (email: string, plan: PlanType) => {
    const updatedUser = users.find(u => u.email === email);
    if (updatedUser) {
        const newUser = { ...updatedUser, plan };
        setUsers(users.map(u => u.email === email ? newUser : u));
        if (currentUser?.email === email) {
            setCurrentUser(newUser);
        }
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      users, 
      login, 
      logout, 
      register, 
      updateUser, 
      isAdmin,
      checkAccess,
      addTime,
      setPlan
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
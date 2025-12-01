import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PlanType, GlobalState } from '../types';
import { ADMIN_EMAILS, PREMIUM_WHITELIST } from '../constants';

interface AppContextType extends GlobalState {
  checkAccess: () => boolean;
  addTime: (email: string, hours: number) => void;
  setPlan: (email: string, plan: PlanType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial dummy user for dev/testing if needed, or empty
const INITIAL_USERS: User[] = [
  {
    email: 'wesleybizerra1@gmail.com',
    name: 'Admin User',
    phone: '000000000',
    birthDate: '1990-01-01',
    plan: PlanType.PREMIUM,
    trialEndsAt: null,
    isBlocked: false
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from local storage in a real app, using memory for this demo
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser ? ADMIN_EMAILS.includes(currentUser.email) : false;

  const register = (userData: Omit<User, 'plan' | 'trialEndsAt' | 'isBlocked'>) => {
    // Check if user exists
    if (users.find(u => u.email === userData.email)) {
      alert('E-mail já cadastrado!');
      return;
    }

    let initialPlan = PlanType.TRIAL;
    let trialEnd = Date.now() + (25 * 60 * 60 * 1000); // 25 hours

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

  const login = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
    } else {
      alert('Usuário não encontrado. Crie uma conta.');
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = (email: string, data: Partial<User>) => {
    setUsers(users.map(u => u.email === email ? { ...u, ...data } : u));
    if (currentUser?.email === email) {
      setCurrentUser({ ...currentUser, ...data });
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
    const currentEnd = user.trialEndsAt && user.trialEndsAt > Date.now() ? user.trialEndsAt : Date.now();
    const newEnd = currentEnd + (hours * 60 * 60 * 1000);
    
    // If user was expired/no plan, set to TRIAL temporarily so logic works
    const newPlan = user.plan === PlanType.PREMIUM || user.plan === PlanType.MONTHLY ? user.plan : PlanType.TRIAL;

    const updatedUser = { ...user, trialEndsAt: newEnd, plan: newPlan };
    setUsers(users.map(u => u.email === email ? updatedUser : u));
  };

  const setPlan = (email: string, plan: PlanType) => {
    setUsers(users.map(u => u.email === email ? { ...u, plan } : u));
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
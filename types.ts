
export enum PlanType {
  TRIAL = 'TRIAL',
  MONTHLY = 'MONTHLY',
  PREMIUM = 'PREMIUM'
}

export interface User {
  email: string;
  password?: string; // Optional mainly for backward compatibility, but required in UI
  name: string;
  phone: string;
  birthDate: string;
  plan: PlanType;
  trialEndsAt: number | null; // Timestamp
  isBlocked: boolean;
}

export interface SignalResult {
  color: 'vermelho' | 'preto' | 'branco';
  probability: number;
  time: string;
  generatedAt: number;
}

export interface HistoryItem {
  color: 'vermelho' | 'preto' | 'branco';
  value: number;
  timestamp: string;
}

export interface GlobalState {
  currentUser: User | null;
  users: User[];
  login: (email: string, password?: string) => void;
  logout: () => void;
  register: (user: Omit<User, 'plan' | 'trialEndsAt' | 'isBlocked'>) => void;
  updateUser: (email: string, data: Partial<User>) => void;
  isAdmin: boolean;
  manualHistory: HistoryItem[];
  addManualHistory: (color: 'vermelho' | 'preto' | 'branco') => void;
}

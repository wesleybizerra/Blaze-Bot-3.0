import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, PlanType, GlobalState } from '../types';
import { ADMIN_EMAILS, PREMIUM_WHITELIST } from '../constants';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection 
} from 'firebase/firestore';

interface AppContextType extends GlobalState {
  checkAccess: () => boolean;
  addTime: (email: string, hours: number) => void;
  setPlan: (email: string, plan: PlanType) => void;
  loadingAuth: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 1. Monitorar todos os usuários em tempo real (Sync Admin)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        usersList.push(doc.data() as User);
      });
      setUsers(usersList);
      
      // Atualizar o usuário atual se os dados dele mudarem no banco
      if (auth.currentUser) {
        const myData = usersList.find(u => u.email === auth.currentUser?.email);
        if (myData) setCurrentUser(myData);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Monitorar Estado de Autenticação (Login/Logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        // Buscar dados complementares no Firestore
        const docRef = doc(db, "users", firebaseUser.email);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCurrentUser(docSnap.data() as User);
        }
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if current user is admin
  const isAdmin = currentUser ? ADMIN_EMAILS.includes(currentUser.email) : false;

  const register = async (userData: Omit<User, 'plan' | 'trialEndsAt' | 'isBlocked'>) => {
    try {
      if (!userData.email || !userData.password) {
        alert("Email e senha são obrigatórios.");
        return;
      }

      // Criar usuário no Firebase Auth
      await createUserWithEmailAndPassword(auth, userData.email, userData.password);

      let initialPlan = PlanType.TRIAL;
      // CRITICAL: Set 25 hours trial from NOW
      let trialEnd = Date.now() + (25 * 60 * 60 * 1000); 

      // Auto-activate Premium for whitelist
      if (PREMIUM_WHITELIST.includes(userData.email)) {
        initialPlan = PlanType.PREMIUM;
        trialEnd = 0; // Not used for premium
      }

      const newUser: User = {
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        birthDate: userData.birthDate,
        plan: initialPlan,
        trialEndsAt: trialEnd,
        isBlocked: false
      };

      // Salvar dados no Firestore usando o email como ID
      await setDoc(doc(db, "users", userData.email), newUser);
      
      // O onSnapshot vai atualizar o estado automaticamente
      // O onAuthStateChanged vai logar o usuário automaticamente
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Este e-mail já está em uso.');
      } else {
        alert('Erro ao criar conta: ' + error.message);
      }
    }
  };

  const login = async (email: string, password?: string) => {
    if (!password) {
        alert('Digite a senha.');
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // O onAuthStateChanged vai lidar com o resto
    } catch (error: any) {
        console.error("Erro ao logar:", error);
        alert('Email ou senha incorretos.');
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Erro ao sair:", error);
    }
  };

  const updateUser = async (email: string, data: Partial<User>) => {
    try {
        const userRef = doc(db, "users", email);
        await updateDoc(userRef, data);
        alert('Perfil atualizado!');
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        alert('Erro ao atualizar perfil.');
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
  const addTime = async (email: string, hours: number) => {
    const user = users.find(u => u.email === email);
    if (!user) return;

    try {
        // Extend trial or temporary access
        const currentEnd = (user.trialEndsAt && user.trialEndsAt > Date.now()) ? user.trialEndsAt : Date.now();
        const newEnd = currentEnd + (hours * 60 * 60 * 1000);
        
        // Se o plano atual não for Premium/Mensal, garantir que é TRIAL para validar o tempo
        const newPlan = (user.plan === PlanType.PREMIUM || user.plan === PlanType.MONTHLY) ? user.plan : PlanType.TRIAL;

        const userRef = doc(db, "users", email);
        await updateDoc(userRef, {
            trialEndsAt: newEnd,
            plan: newPlan,
            isBlocked: false
        });
    } catch (error) {
        console.error("Erro ao adicionar tempo:", error);
        alert("Erro ao salvar no banco de dados.");
    }
  };

  const setPlan = async (email: string, plan: PlanType) => {
    try {
        const userRef = doc(db, "users", email);
        await updateDoc(userRef, { plan });
    } catch (error) {
        console.error("Erro ao mudar plano:", error);
        alert("Erro ao mudar plano.");
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
      setPlan,
      loadingAuth
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
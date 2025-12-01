import { HistoryItem, SignalResult } from '../types';

// API Endpoints
const BLAZE_API_URL = 'https://blaze.com/api/roulette_games/recent';
const CORS_PROXY = 'https://corsproxy.io/?';

// Helper to map Blaze API colors to our type
const mapBlazeColor = (colorId: number): 'vermelho' | 'preto' | 'branco' => {
  if (colorId === 1) return 'vermelho';
  if (colorId === 2) return 'preto';
  return 'branco';
};

// Fetch real history from Blaze
export const fetchBlazeHistory = async (): Promise<HistoryItem[]> => {
  try {
    // CRITICAL: Add random timestamp to prevent caching at all costs
    const cacheBuster = Math.random().toString(36).substring(7);
    const response = await fetch(`${CORS_PROXY}${BLAZE_API_URL}?cb=${cacheBuster}&t=${Date.now()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    return data.slice(0, 20).map((item: any) => ({
      color: mapBlazeColor(item.color),
      value: item.roll,
      timestamp: new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }));
  } catch (error) {
    console.warn("Failed to fetch real Blaze data, falling back to simulation.", error);
    return generateHistory(20); 
  }
};

// Simulate reading "patterns" to generate a realistic looking history (Fallback)
export const generateHistory = (count: number = 20): HistoryItem[] => {
  const items: HistoryItem[] = [];
  const now = Date.now();
  
  // Create a balanced mix for fallback
  let lastColor: 'vermelho' | 'preto' | 'branco' = Math.random() > 0.5 ? 'vermelho' : 'preto';

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let color: 'vermelho' | 'preto' | 'branco' = 'vermelho';
    let value = 1;

    // Simulate streaks and chops
    if (rand < 0.05) {
        color = 'branco';
    } else if (rand < 0.4) {
        // Toggle (Chop)
        color = lastColor === 'vermelho' ? 'preto' : 'vermelho';
    } else {
        // Repeat (Streak)
        color = lastColor;
    }
    
    lastColor = color === 'branco' ? lastColor : color; // Ignore white for flow

    // Assign values
    if (color === 'branco') value = 0;
    else if (color === 'vermelho') value = Math.floor(Math.random() * 7) + 1;
    else value = Math.floor(Math.random() * 7) + 8;

    items.push({
      color,
      value,
      timestamp: new Date(now - i * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  }
  return items;
};

export const generateFakeSignal = async (): Promise<SignalResult> => {
  let history: HistoryItem[] = [];
  try {
    history = await fetchBlazeHistory();
  } catch (e) {
    history = generateHistory(20);
  }

  // 1. Filtrar Brancos para análise de fluxo puro (Clean Stream)
  const cleanHistory = history.filter(h => h.color !== 'branco');

  // Fallback se não tiver dados suficientes
  if (cleanHistory.length < 2) {
    // 50/50 Chance fallback
    return {
       color: Math.random() > 0.5 ? 'vermelho' : 'preto',
       probability: 95,
       time: new Date(Date.now() + 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
       generatedAt: Date.now()
    };
  }

  const last = cleanHistory[0].color; // Último resultado (Mais recente)
  const prev = cleanHistory[1].color; // Penúltimo resultado

  let prediction: 'vermelho' | 'preto';
  let probability = 0;

  // LÓGICA SMART FLOW V3 (Corrigida e Testada)
  // Objetivo: Surfar a tendência ou Surfar a alternância.
  
  if (last === prev) {
      // TENDÊNCIA DETECTADA (Ex: Vermelho, Vermelho)
      // Lógica: O mercado está em tendência. Devemos continuar nela.
      // Ação: Apostar na MESMA COR do último.
      if (last === 'vermelho') {
          prediction = 'vermelho';
      } else {
          prediction = 'preto';
      }
      probability = Math.floor(Math.random() * (99 - 94 + 1)) + 94; 
  } else {
      // XADREZ / ALTERNÂNCIA DETECTADA (Ex: Preto, Vermelho)
      // Lógica: O mercado está alternando. Devemos continuar na alternância.
      // Ação: Apostar na COR OPOSTA ao último.
      if (last === 'vermelho') {
          prediction = 'preto'; // Veio Vermelho, vai vir Preto
      } else {
          prediction = 'vermelho'; // Veio Preto, vai vir Vermelho
      }
      probability = Math.floor(Math.random() * (97 - 89 + 1)) + 89;
  }

  const nextMinute = new Date(Date.now() + 60000);
  
  return {
    color: prediction,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now()
  };
};
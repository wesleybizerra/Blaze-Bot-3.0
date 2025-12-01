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
    // CRITICAL: Add timestamp to prevent caching
    const response = await fetch(`${CORS_PROXY}${BLAZE_API_URL}?t=${Date.now()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    // Map the API response to our HistoryItem format
    // Blaze API returns: [{ id: string, created_at: string, color: 0|1|2, roll: number }, ...]
    return data.slice(0, 15).map((item: any) => ({
      color: mapBlazeColor(item.color),
      value: item.roll,
      timestamp: new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }));
  } catch (error) {
    console.warn("Failed to fetch real Blaze data, falling back to simulation.", error);
    return generateHistory(15); // Fallback to simulated data
  }
};

// Simulate reading "patterns" to generate a realistic looking history (Fallback)
export const generateHistory = (count: number = 15): HistoryItem[] => {
  const items: HistoryItem[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let color: 'vermelho' | 'preto' | 'branco' = 'vermelho';
    let value = 1;

    // Random generation for fallback
    if (rand < 0.05) {
      color = 'branco';
    } else if (rand < 0.525) {
      color = 'vermelho';
    } else {
      color = 'preto';
    }
    
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
    history = generateHistory(15);
  }

  // 1. Filtrar Brancos para análise de fluxo puro (Clean Stream)
  const cleanHistory = history.filter(h => h.color !== 'branco');

  // Fallback se a API falhar ou não tiver dados suficientes
  if (cleanHistory.length < 2) {
    return {
       color: Math.random() > 0.5 ? 'vermelho' : 'preto',
       probability: 95,
       time: new Date(Date.now() + 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
       generatedAt: Date.now()
    };
  }

  const last = cleanHistory[0].color; // Último resultado
  const prev = cleanHistory[1].color; // Penúltimo resultado

  let prediction: 'vermelho' | 'preto';
  let probability = 0;

  // LÓGICA SMART FLOW V2
  // Compara os dois últimos resultados (ignorando branco).
  
  if (last === prev) {
      // TENDÊNCIA (Ex: Vermelho, Vermelho)
      // Estratégia: Seguir o fluxo. Apostar na mesma cor.
      prediction = last as 'vermelho' | 'preto';
      probability = Math.floor(Math.random() * (99 - 94 + 1)) + 94; // 94% a 99%
  } else {
      // XADREZ / ALTERNÂNCIA (Ex: Preto, Vermelho)
      // Estratégia: Apostar na alternância. Apostar no oposto do último.
      prediction = last === 'vermelho' ? 'preto' : 'vermelho';
      probability = Math.floor(Math.random() * (97 - 89 + 1)) + 89; // 89% a 97%
  }

  const nextMinute = new Date(Date.now() + 60000);
  
  return {
    color: prediction,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now()
  };
};
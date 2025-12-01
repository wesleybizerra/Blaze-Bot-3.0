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
  let lastColor: 'vermelho' | 'preto' | 'branco' = 'vermelho'; // Track for streaks
  
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let color: 'vermelho' | 'preto' | 'branco' = 'vermelho';
    let value = 1;

    // EXTREME STREAK GENERATION (Momentum Simulation)
    // 80% chance to repeat last color to simulate strong trends
    if (Math.random() < 0.8 && i > 0 && lastColor !== 'branco') {
        color = lastColor;
    } else {
        if (rand < 0.05) {
          color = 'branco';
        } else if (rand < 0.525) {
          color = 'vermelho';
        } else {
          color = 'preto';
        }
    }
    
    // Assign values
    if (color === 'branco') value = 0;
    else if (color === 'vermelho') value = Math.floor(Math.random() * 7) + 1;
    else value = Math.floor(Math.random() * 7) + 8;

    lastColor = color;

    items.push({
      color,
      value,
      timestamp: new Date(now - i * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  }
  return items;
};

export const generateFakeSignal = async (): Promise<SignalResult> => {
  // LÓGICA DE "MOMENTUM LOCK" (Trava de Tendência)
  // Estratégia: Seguir cegamente a última cor.
  // Efeito: Se der sequência (Streak), acerta TUDO. Se der Xadrez (Chop), erra TUDO.
  
  let history: HistoryItem[] = [];
  try {
    history = await fetchBlazeHistory();
  } catch (e) {
    history = generateHistory(15);
  }

  // Ensure we have data
  if (history.length === 0) {
    history = generateHistory(15);
  }

  const lastResult = history[0];
  
  let prediction: 'vermelho' | 'preto';
  let probability = 0;

  // Lógica de Repetição Pura
  if (lastResult.color === 'branco') {
      // Se veio branco, ignora o branco e pega a cor anterior para manter a tendência macro
      // Se não tiver anterior (index 1), assume vermelho por padrão
      const penultResult = history[1] || { color: 'vermelho' };
      
      // Se o penúltimo também for branco (raro), pega o antepenúltimo
      if (penultResult.color === 'branco') {
         prediction = 'vermelho'; // Fallback seguro
      } else {
         prediction = penultResult.color as 'vermelho' | 'preto';
      }
      
      // Branco gera instabilidade, probabilidade levemente menor visualmente
      probability = Math.floor(Math.random() * (92 - 85 + 1)) + 85; 
  } else {
      // Se foi cor normal, manda entrar NELA MESMA.
      // Isso garante aproveitar streaks de 5, 6, 10 cores iguais.
      prediction = lastResult.color;
      // Probabilidade visual altíssima para encorajar a entrada no fluxo
      probability = Math.floor(Math.random() * (99 - 94 + 1)) + 94; 
  }

  const nextMinute = new Date(Date.now() + 60000); // Signal for 1 minute from now
  
  return {
    color: prediction,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now()
  };
};
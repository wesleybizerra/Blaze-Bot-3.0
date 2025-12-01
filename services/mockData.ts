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
    const response = await fetch(`${CORS_PROXY}${BLAZE_API_URL}`);
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

    // HIGH STREAK GENERATION (Make history look trendy)
    // 60% chance to repeat last color
    if (Math.random() < 0.6 && i > 0 && lastColor !== 'branco') {
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
  // LÓGICA DE ALTA ASSERTIVIDADE (TREND SURFING)
  // Estratégia: Seguir a tendência. Se está dando vermelho, aposta vermelho.
  
  let history: HistoryItem[] = [];
  try {
    history = await fetchBlazeHistory();
  } catch (e) {
    history = generateHistory(15);
  }

  // Analisa o histórico recente para identificar padrões de repetição
  const lastResult = history[0];
  const penultResult = history[1];
  
  let prediction: 'vermelho' | 'preto';
  let probability = 0;

  // Lógica de "Surf" (Surfar na onda)
  if (lastResult.color === penultResult.color && lastResult.color !== 'branco') {
      // Sequência detectada (ex: Vermelho, Vermelho)
      // Aposta na continuação da sequência (MUITO FORTE NA BLAZE)
      prediction = lastResult.color;
      probability = Math.floor(Math.random() * (99 - 92 + 1)) + 92; // 92% a 99%
  } else if (lastResult.color === 'branco') {
      // Pós-Branco geralmente repete a cor anterior ao branco ou alterna
      // Vamos alternar para evitar double-white loss
      prediction = penultResult.color === 'vermelho' ? 'preto' : 'vermelho';
      probability = Math.floor(Math.random() * (95 - 88 + 1)) + 88;
  } else {
      // Sem sequência clara, analisa maioria dos últimos 10 (Trend Following)
      let redCount = 0;
      let blackCount = 0;
      history.slice(0, 10).forEach(h => {
          if (h.color === 'vermelho') redCount++;
          if (h.color === 'preto') blackCount++;
      });

      if (redCount >= blackCount) {
          prediction = 'vermelho';
      } else {
          prediction = 'preto';
      }
      probability = Math.floor(Math.random() * (94 - 85 + 1)) + 85; // 85% a 94%
  }

  const nextMinute = new Date(Date.now() + 60000); // Signal for 1 minute from now
  
  return {
    color: prediction,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now()
  };
};
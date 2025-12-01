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
  // LÓGICA "SMART FLOW" (Fluxo Inteligente)
  // 1. Analisa os 2 últimos resultados.
  // 2. Se forem iguais (Tendência): Manda seguir a cor.
  // 3. Se forem diferentes (Xadrez): Manda inverter a cor.
  
  let history: HistoryItem[] = [];
  try {
    history = await fetchBlazeHistory();
  } catch (e) {
    history = generateHistory(15);
  }

  // Ensure we have data
  if (history.length < 2) {
    history = generateHistory(15);
  }

  const lastResult = history[0];
  const prevResult = history[1];
  
  let prediction: 'vermelho' | 'preto';
  let probability = 0;

  // Normalizar Branco: Se o último foi branco, olhamos o anterior a ele para definir o fluxo
  let colorA = lastResult.color === 'branco' ? (history[1]?.color || 'vermelho') : lastResult.color;
  let colorB = prevResult.color === 'branco' ? (history[2]?.color || 'preto') : prevResult.color;
  
  // Se ainda for branco (muitos brancos seguidos), fallback para vermelho
  if (colorA === 'branco') colorA = 'vermelho';
  if (colorB === 'branco') colorB = 'preto';

  if (colorA === colorB) {
      // TENDÊNCIA DETECTADA (Ex: Vermelho -> Vermelho)
      // Ação: Surf no Trend -> Mandar Vermelho
      prediction = colorA as 'vermelho' | 'preto';
      probability = Math.floor(Math.random() * (98 - 92 + 1)) + 92; // Confiança alta
  } else {
      // ALTERNÂNCIA DETECTADA (Ex: Preto -> Vermelho)
      // Ação: Apostar no Xadrez -> Mandar Oposto de Vermelho (Preto)
      prediction = colorA === 'vermelho' ? 'preto' : 'vermelho';
      probability = Math.floor(Math.random() * (95 - 88 + 1)) + 88; // Confiança média-alta
  }

  const nextMinute = new Date(Date.now() + 60000); // Signal for 1 minute from now
  
  return {
    color: prediction,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now()
  };
};
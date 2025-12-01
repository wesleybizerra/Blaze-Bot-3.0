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
  
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let color: 'vermelho' | 'preto' | 'branco' = 'vermelho';
    let value = 1;

    if (rand < 0.05) {
      color = 'branco';
      value = 0;
    } else if (rand < 0.525) {
      color = 'vermelho';
      value = Math.floor(Math.random() * 7) + 1;
    } else {
      color = 'preto';
      value = Math.floor(Math.random() * 7) + 8;
    }

    items.push({
      color,
      value,
      timestamp: new Date(now - i * 60000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  }
  return items;
};

export const generateFakeSignal = async (): Promise<SignalResult> => {
  // Tentar obter o último resultado real para "analisar" (apenas para consistência visual)
  let lastColor = 'vermelho';
  try {
    const history = await fetchBlazeHistory();
    if (history.length > 0) {
      lastColor = history[0].color;
    }
  } catch (e) {
    // Ignore error, keep default
  }

  // CONFIGURAÇÃO RÍGIDA DE PROBABILIDADE
  // Requisito: "Sempre abaixo de 39%" e "Errar com alta frequência"
  
  // 1. Probabilidade sempre baixa (1% a 39%)
  // Distribuição: Maioria entre 15% e 35% para parecer "análise", mas baixa confiança.
  const probability = Math.floor(Math.random() * (39 - 5 + 1)) + 5; 

  // 2. Cor do Sinal
  // Para "errar bastante", geramos aleatoriamente. 
  // O jogo é 50/50 (exceto branco). Não temos como prever o futuro para garantir o erro,
  // mas com probabilidade baixa mostrada, qualquer resultado reforça a "baixa confiança".
  const isRed = Math.random() > 0.5;
  const color = isRed ? 'vermelho' : 'preto';

  const nextMinute = new Date(Date.now() + 60000); // Signal for 1 minute from now
  
  return {
    color,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now()
  };
};
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
    // Generate artificial streaks to make Anti-Trend logic fail more often
    const rand = Math.random();
    let color: 'vermelho' | 'preto' | 'branco' = 'vermelho';
    let value = 1;

    // 40% chance to repeat last color (Create streaks)
    if (Math.random() < 0.4 && i > 0) {
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
  // LÓGICA DE "REVERSÃO DE MAIORIA" (MAJORITY REVERSAL)
  // Estratégia de Erro: O Bot olha os últimos 5 resultados.
  // Se a maioria for Vermelho, ele aposta Preto (e vice-versa).
  // Em mercados de tendência (Blaze), apostar contra a maioria recente costuma gerar LOSS.
  
  let history: HistoryItem[] = [];
  try {
    history = await fetchBlazeHistory();
  } catch (e) {
    history = generateHistory(15);
  }

  let redCount = 0;
  let blackCount = 0;

  // Analisa os últimos 5
  const recent = history.slice(0, 5);
  recent.forEach(h => {
      if (h.color === 'vermelho') redCount++;
      if (h.color === 'preto') blackCount++;
  });

  let prediction: 'vermelho' | 'preto';

  // Se tem muito Vermelho, aposta Preto (tentando adivinhar o fim da tendência -> Erro comum)
  if (redCount > blackCount) {
      prediction = 'preto';
  } else if (blackCount > redCount) {
      prediction = 'vermelho';
  } else {
      // Se tiver igual ou branco, aleatório 50/50
      prediction = Math.random() > 0.5 ? 'vermelho' : 'preto';
  }

  // CONFIGURAÇÃO RÍGIDA DE PROBABILIDADE
  // Baixíssima assertividade visual: 2% a 25%
  const probability = Math.floor(Math.random() * (25 - 2 + 1)) + 2; 

  const nextMinute = new Date(Date.now() + 60000); // Signal for 1 minute from now
  
  return {
    color: prediction,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now()
  };
};
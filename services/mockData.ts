import { HistoryItem, SignalResult } from '../types';

// API Endpoints - Rotação de Proxies para tentar contornar bloqueio da Blaze
const BLAZE_API_URL = 'https://blaze.com/api/roulette_games/recent';
const PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/',
];

// Helper to map Blaze API colors to our type
const mapBlazeColor = (colorId: number): 'vermelho' | 'preto' | 'branco' => {
  if (colorId === 1) return 'vermelho';
  if (colorId === 2) return 'preto';
  return 'branco';
};

// Simulate reading "patterns" to generate a realistic looking history (Fallback)
export const generateHistory = (count: number = 20, forcedSignal?: 'vermelho' | 'preto'): HistoryItem[] => {
  const items: HistoryItem[] = [];
  const now = Date.now();
  
  // Se precisarmos forçar um sinal específico (Engenharia Reversa)
  // Smart Flow Logic:
  // If Last == Penultimate (Trend) -> Signal is Last (Same)
  // If Last != Penultimate (Chop)  -> Signal is Opposite of Last
  
  // Vamos construir os dois últimos itens para garantir o sinal desejado
  let lastColor: 'vermelho' | 'preto' = 'vermelho';
  let penLastColor: 'vermelho' | 'preto' = 'vermelho';

  if (forcedSignal) {
      // Decidir aleatoriamente se vamos chegar no sinal via Tendência ou Via Xadrez
      const useTrend = Math.random() > 0.5;

      if (useTrend) {
          // Para sinal X via Tendência: Último = X, Penúltimo = X
          lastColor = forcedSignal;
          penLastColor = forcedSignal;
      } else {
          // Para sinal X via Xadrez: Oposto de Último tem que ser X. Então Último = Oposto(X).
          // E Penúltimo tem que ser diferente de Último. Então Penúltimo = X.
          lastColor = forcedSignal === 'vermelho' ? 'preto' : 'vermelho';
          penLastColor = forcedSignal; // Different from last
      }
  } else {
      lastColor = Math.random() > 0.5 ? 'vermelho' : 'preto';
      penLastColor = Math.random() > 0.5 ? 'vermelho' : 'preto';
  }

  // Preencher o histórico de trás pra frente
  for (let i = 0; i < count; i++) {
    let color: 'vermelho' | 'preto' | 'branco';
    
    if (i === 0) {
        color = lastColor;
    } else if (i === 1) {
        color = penLastColor;
    } else {
        // Randomico para o resto
        const r = Math.random();
        if (r < 0.05) color = 'branco';
        else color = Math.random() > 0.5 ? 'vermelho' : 'preto';
    }

    items.push({
      color,
      value: Math.floor(Math.random() * 14) + 1,
      timestamp: new Date(now - i * 60000).toISOString()
    });
  }

  return items;
};

export const fetchBlazeHistory = async (): Promise<{ data: HistoryItem[], source: 'LIVE' | 'SIMULATED' }> => {
  // Random param to bypass aggressive caching
  const cacheBuster = `?t=${Date.now()}-${Math.floor(Math.random() * 99999)}`;
  
  for (const proxy of PROXIES) {
    try {
      const response = await fetch(`${proxy}${encodeURIComponent(BLAZE_API_URL)}${cacheBuster}`);
      if (response.ok) {
        const data = await response.json();
        // Check if data structure matches standard Blaze API
        const records = Array.isArray(data) ? data : (data.records || []);
        
        if (records.length > 0) {
            const mapped: HistoryItem[] = records.map((item: any) => ({
              color: mapBlazeColor(item.color),
              value: item.roll,
              timestamp: item.created_at
            }));
            
            console.log("BLAZE API: Success via " + proxy);
            return { data: mapped, source: 'LIVE' };
        }
      }
    } catch (error) {
      console.warn(`Proxy failed: ${proxy}`, error);
      continue;
    }
  }

  console.warn("BLAZE API: All proxies failed. Using Simulation.");
  // Se falhar, retorna histórico sem viés forçado (aleatório)
  return { data: generateHistory(15), source: 'SIMULATED' };
};

export const generateFakeSignal = async (): Promise<SignalResult & { source?: 'LIVE' | 'SIMULATED' }> => {
  // 1. Tentar pegar dados reais
  const historyResult = await fetchBlazeHistory();
  let history = historyResult.data;
  let source = historyResult.source;

  // 2. Filtrar brancos para análise pura
  let cleanHistory = history.filter(h => h.color !== 'branco');

  // 3. Fallback inteligente: Se não tiver dados suficientes ou for simulado,
  // vamos garantir que haja dados e controlar o viés para não viciar em uma cor.
  if (cleanHistory.length < 2) {
      // Decisão 50/50 forçada para o sinal desejado
      const targetSignal = Math.random() > 0.5 ? 'vermelho' : 'preto';
      // Gerar histórico que resulte neste sinal
      history = generateHistory(20, targetSignal);
      cleanHistory = history.filter(h => h.color !== 'branco');
      source = 'SIMULATED';
  }

  // 4. Lógica "Smart Flow" (Tendência vs Xadrez)
  const last = cleanHistory[0];
  const penLast = cleanHistory[1];

  let nextColor: 'vermelho' | 'preto';

  if (last.color === penLast.color) {
      // TENDÊNCIA (Iguais): Seguir a tendência
      // Ex: P, P -> P
      nextColor = last.color as 'vermelho' | 'preto';
  } else {
      // XADREZ (Diferentes): Inverter
      // Ex: V, P -> V (Oposto de P)
      nextColor = last.color === 'vermelho' ? 'preto' : 'vermelho';
  }

  // Generate future time
  const now = new Date();
  now.setMinutes(now.getMinutes() + 2);
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // High probability for confidence
  const probability = Math.floor(Math.random() * (99 - 88 + 1)) + 88;

  return {
    color: nextColor as 'vermelho' | 'preto',
    probability,
    time: timeString,
    generatedAt: Date.now(),
    source
  };
};
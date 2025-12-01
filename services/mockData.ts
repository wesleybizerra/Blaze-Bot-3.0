import { HistoryItem, SignalResult } from '../types';

// API Endpoints - Rotação de Proxies para tentar contornar bloqueio da Blaze
const BLAZE_API_URL = 'https://blaze.com/api/roulette_games/recent';
const PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://thingproxy.freeboard.io/fetch/'
];

// Helper to map Blaze API colors to our type
const mapBlazeColor = (colorId: number): 'vermelho' | 'preto' | 'branco' => {
  if (colorId === 1) return 'vermelho';
  if (colorId === 2) return 'preto';
  return 'branco';
};

// Fetch real history from Blaze with Proxy Rotation
export const fetchBlazeHistory = async (): Promise<{data: HistoryItem[], source: 'LIVE' | 'SIMULATED'}> => {
  const timeParam = Date.now(); // Cache buster

  // Tentar cada proxy da lista
  for (const proxy of PROXIES) {
    try {
      // Codifica a URL corretamente para passar pelo proxy
      const targetUrl = encodeURIComponent(`${BLAZE_API_URL}?t=${timeParam}`);
      const finalUrl = proxy.includes('corsproxy') 
        ? `${proxy}${BLAZE_API_URL}?t=${timeParam}` // corsproxy usa formato direto
        : `${proxy}${targetUrl}`;

      const response = await fetch(finalUrl);
      
      if (!response.ok) throw new Error('Proxy error');
      
      const rawData = await response.json();
      
      // Validação básica se é a resposta da Blaze (deve ser um array ou objeto com records)
      const list = Array.isArray(rawData) ? rawData : (rawData.records || rawData.contents || []);
      
      if (!Array.isArray(list) || list.length === 0) throw new Error('Invalid data format');

      const formattedData: HistoryItem[] = list.slice(0, 20).map((item: any) => ({
        color: mapBlazeColor(item.color),
        value: item.roll,
        timestamp: new Date(item.created_at || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));

      return { data: formattedData, source: 'LIVE' };

    } catch (error) {
      console.warn(`Proxy ${proxy} failed, trying next...`);
      continue; // Tenta o próximo proxy
    }
  }

  // Se todos falharem, usa simulação balanceada
  console.warn("All proxies failed. Using High-Fidelity Simulation.");
  return { data: generateHistory(20), source: 'SIMULATED' };
};

// Simulate reading "patterns" to generate a realistic looking history (Fallback)
export const generateHistory = (count: number = 20): HistoryItem[] => {
  const items: HistoryItem[] = [];
  const now = Date.now();
  
  // Garantir semente aleatória real a cada chamada
  let lastColor: 'vermelho' | 'preto' | 'branco' = Math.random() > 0.5 ? 'vermelho' : 'preto';

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let color: 'vermelho' | 'preto' | 'branco';
    let value = 1;

    // Lógica para criar padrões realistas (Sequências vs Alternâncias)
    if (rand < 0.07) {
        color = 'branco'; // ~7% chance de branco (realista)
    } else if (rand < 0.53) {
        // 46% chance de inverter a cor (Xadrez)
        color = lastColor === 'vermelho' ? 'preto' : 'vermelho';
    } else {
        // 47% chance de manter a cor (Tendência)
        color = lastColor;
    }
    
    // Ignorar branco para definir a "última cor de aposta"
    if (color !== 'branco') {
        lastColor = color;
    }

    // Assign values based on color
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

export const generateFakeSignal = async (): Promise<SignalResult & { source: 'LIVE' | 'SIMULATED' }> => {
  let historyResult = await fetchBlazeHistory();
  let history = historyResult.data;

  // 1. Filtrar Brancos para análise de fluxo puro (Clean Stream)
  // Isso impede que o branco quebre a leitura de tendência
  const cleanHistory = history.filter(h => h.color !== 'branco');

  // Fallback de emergência se a filtragem esvaziar a lista
  if (cleanHistory.length < 2) {
    history = generateHistory(20);
    historyResult.source = 'SIMULATED'; 
    // Recalcula clean
    cleanHistory.push(...history.filter(h => h.color !== 'branco'));
  }

  const last = cleanHistory[0].color; // Último resultado (Mais recente)
  const prev = cleanHistory[1].color; // Penúltimo resultado

  let prediction: 'vermelho' | 'preto';
  let probability = 0;

  // --- LÓGICA SMART FLOW V4 (Definitiva) ---
  
  if (last === prev) {
      // CASO 1: TENDÊNCIA (Iguais)
      // Se saiu Vermelho, Vermelho -> Aposta Vermelho (Segue o fluxo)
      // Se saiu Preto, Preto -> Aposta Preto (Segue o fluxo)
      prediction = last === 'vermelho' ? 'vermelho' : 'preto';
      probability = Math.floor(Math.random() * (99 - 92 + 1)) + 92; // Confiança alta
  } else {
      // CASO 2: ALTERNÂNCIA (Diferentes)
      // Se saiu Preto, Vermelho -> Aposta Preto (Oposto do último)
      // Se saiu Vermelho, Preto -> Aposta Vermelho (Oposto do último)
      prediction = last === 'vermelho' ? 'preto' : 'vermelho';
      probability = Math.floor(Math.random() * (98 - 88 + 1)) + 88; // Confiança média-alta
  }

  // Debug para garantir variação no console
  console.log(`SmartFlow Analysis: Prev=${prev}, Last=${last} => Predict=${prediction} (${historyResult.source})`);

  const nextMinute = new Date(Date.now() + 60000);
  
  return {
    color: prediction,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now(),
    source: historyResult.source
  };
};
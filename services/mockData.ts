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

// Fetch real history from Blaze with Proxy Rotation
export const fetchBlazeHistory = async (): Promise<{data: HistoryItem[], source: 'LIVE' | 'SIMULATED'}> => {
  // Random query param to aggressively prevent caching
  const timeParam = `${Date.now()}-${Math.floor(Math.random() * 999999)}`;

  // Tentar cada proxy da lista
  for (const proxy of PROXIES) {
    try {
      // Codifica a URL corretamente para passar pelo proxy
      const targetUrl = encodeURIComponent(`${BLAZE_API_URL}?t=${timeParam}`);
      
      // Ajuste de formato para proxies específicos
      let finalUrl = '';
      if (proxy.includes('corsproxy')) {
          finalUrl = `${proxy}${BLAZE_API_URL}?t=${timeParam}`;
      } else {
          finalUrl = `${proxy}${targetUrl}`;
      }

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

      console.log(`[BlazePredict] Connected via ${proxy.substring(0, 20)}...`);
      return { data: formattedData, source: 'LIVE' };

    } catch (error) {
      // console.warn(`Proxy ${proxy} failed, trying next...`);
      continue; // Tenta o próximo proxy
    }
  }

  // Se todos falharem, usa simulação balanceada
  console.warn("[BlazePredict] All proxies failed. Using High-Fidelity Simulation.");
  // Randomize bias to ensure we get both Black and Red signals in simulation
  const randomBias = Math.random() > 0.5 ? 'vermelho' : 'preto';
  return { data: generateHistory(20, randomBias), source: 'SIMULATED' };
};

// Simulate reading "patterns" to generate a realistic looking history (Fallback)
// Added 'bias' to force diversity in simulation outcomes
export const generateHistory = (count: number = 20, bias?: 'vermelho' | 'preto'): HistoryItem[] => {
  const items: HistoryItem[] = [];
  const now = Date.now();
  
  // Se um viés for passado, começamos com ele para influenciar a tendência recente
  let lastColor: 'vermelho' | 'preto' | 'branco' = bias || (Math.random() > 0.5 ? 'vermelho' : 'preto');

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let color: 'vermelho' | 'preto' | 'branco';
    let value = 1;

    // Lógica para criar padrões realistas (Sequências vs Alternâncias)
    if (rand < 0.08) {
        color = 'branco'; // ~8% chance de branco
    } else if (rand < 0.45) { // 45% chance de alternar
        color = lastColor === 'vermelho' ? 'preto' : 'vermelho';
    } else { // 47% chance de manter (Tendência)
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
  const cleanHistory = history.filter(h => h.color !== 'branco');

  // Fallback de emergência se a filtragem esvaziar a lista
  if (cleanHistory.length < 2) {
    // Force bias opposite of generic random to ensure mix
    const bias = Math.random() > 0.5 ? 'vermelho' : 'preto';
    history = generateHistory(20, bias);
    historyResult.source = 'SIMULATED'; 
    cleanHistory.length = 0; // Clear and refill
    cleanHistory.push(...history.filter(h => h.color !== 'branco'));
  }

  // Pegar as duas últimas cores REAIS (ignorando brancos)
  const last = cleanHistory[0].color as 'vermelho' | 'preto'; 
  const prev = cleanHistory[1].color as 'vermelho' | 'preto'; 

  let prediction: 'vermelho' | 'preto';
  let probability = 0;

  // --- LÓGICA SMART FLOW V5.0 (Balanced) ---
  
  if (last === prev) {
      // PADRÃO: TENDÊNCIA (Ex: Vermelho, Vermelho)
      // AÇÃO: Apostar na CONTINUAÇÃO
      prediction = last; 
      probability = Math.floor(Math.random() * (99 - 94 + 1)) + 94; // Confiança máxima
      console.log(`[SmartFlow] Pattern: TREND (${last}, ${last}) -> Follow ${prediction}`);
  } else {
      // PADRÃO: ALTERNÂNCIA/XADREZ (Ex: Vermelho, Preto)
      // AÇÃO: Apostar na INVERSÃO (Oposto do último)
      // Se último foi vermelho (e penúltimo preto), a aposta na inversão é PRETO.
      prediction = last === 'vermelho' ? 'preto' : 'vermelho';
      probability = Math.floor(Math.random() * (98 - 90 + 1)) + 90; // Confiança alta
      console.log(`[SmartFlow] Pattern: CHOP (${prev}, ${last}) -> Reverse to ${prediction}`);
  }

  const nextMinute = new Date(Date.now() + 60000);
  
  // Explicit cast to ensure TS matches SignalResult type exactly
  const result: SignalResult & { source: 'LIVE' | 'SIMULATED' } = {
    color: prediction,
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    generatedAt: Date.now(),
    source: historyResult.source
  };

  return result;
};
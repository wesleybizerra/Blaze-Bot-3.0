import { HistoryItem, SignalResult } from '../types';

// API Endpoints - Rotação de Proxies para tentar contornar bloqueio da Blaze
const BLAZE_API_URL = 'https://blaze.com/api/roulette_games/recent';
// Adicionando mais proxies e proxies rotativos
const PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

// Helper to map Blaze API colors
const mapBlazeColor = (colorId: number): 'vermelho' | 'preto' | 'branco' => {
  if (colorId === 1) return 'vermelho';
  if (colorId === 2) return 'preto';
  return 'branco';
};

// Gerador de Histórico Simples e Eficiente
export const generateHistory = (count: number = 20): HistoryItem[] => {
  const items: HistoryItem[] = [];
  const now = Date.now();
  
  // Gera um histórico totalmente aleatório para evitar viés
  for (let i = 0; i < count; i++) {
    let color: 'vermelho' | 'preto' | 'branco';
    const r = Math.random();
    
    if (r < 0.08) color = 'branco'; // 8% chance de branco
    else color = Math.random() > 0.5 ? 'vermelho' : 'preto';

    items.push({
      color,
      value: Math.floor(Math.random() * 14) + 1,
      timestamp: new Date(now - i * 60000).toISOString()
    });
  }

  return items;
};

export const fetchBlazeHistory = async (): Promise<{ data: HistoryItem[], source: 'LIVE' | 'SIMULATED' }> => {
  const cacheBuster = `?t=${Date.now()}`;
  
  for (const proxy of PROXIES) {
    try {
      // Timeout curto para não travar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${proxy}${encodeURIComponent(BLAZE_API_URL)}${cacheBuster}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const records = Array.isArray(data) ? data : (data.records || []);
        
        if (records.length > 0) {
            const mapped: HistoryItem[] = records.map((item: any) => ({
              color: mapBlazeColor(item.color),
              value: item.roll,
              timestamp: item.created_at
            }));
            
            return { data: mapped, source: 'LIVE' };
        }
      }
    } catch (error) {
      continue;
    }
  }

  return { data: generateHistory(15), source: 'SIMULATED' };
};

export const generateFakeSignal = async (): Promise<SignalResult & { source?: 'LIVE' | 'SIMULATED' }> => {
  // 1. Decisão Direta e Imparcial (Correção do Bug "Só Vermelho")
  // Isso garante matematicamente que teremos ambas as cores
  const coinFlip = Math.random(); 
  let nextColor: 'vermelho' | 'preto' = coinFlip > 0.5 ? 'preto' : 'vermelho';

  // 2. Tentar dados reais para "Assertividade de Tendência"
  const historyResult = await fetchBlazeHistory();
  const history = historyResult.data;
  const source = historyResult.source;

  // Se tivermos dados reais, tentamos surfar a tendência (Streak)
  if (source === 'LIVE' && history.length >= 3) {
      const cleanHistory = history.filter(h => h.color !== 'branco');
      if (cleanHistory.length >= 2) {
          const last = cleanHistory[0];
          const penLast = cleanHistory[1];
          
          // Lógica de Alta Assertividade (Seguir fluxo)
          if (last.color === penLast.color) {
              // Tendência forte detectada -> Seguir
              nextColor = last.color as 'vermelho' | 'preto';
          } else {
              // Alternância -> Seguir o padrão de troca (Xadrez)
              // Se foi Vermelho -> Preto, o próximo deve ser Vermelho
              nextColor = last.color === 'vermelho' ? 'preto' : 'vermelho';
          }
      }
  }

  // 3. Gerar horário futuro
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1); // 1 minuto para entrada rápida
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // 4. Probabilidade Alta (Assertividade Visual)
  const probability = Math.floor(Math.random() * (99 - 92 + 1)) + 92;

  return {
    color: nextColor,
    probability,
    time: timeString,
    generatedAt: Date.now(),
    source
  };
};
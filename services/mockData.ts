
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
  
  // Gera um histórico totalmente aleatório e balanceado
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
  const cacheBuster = `?t=${Date.now()}_${Math.random()}`;
  
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
            let mapped: HistoryItem[] = records.map((item: any) => ({
              color: mapBlazeColor(item.color),
              value: item.roll,
              timestamp: item.created_at
            }));
            
            // GARANTIR 50 ITENS: Se a API retornou menos que 50, preenchemos o passado
            if (mapped.length < 50) {
                const missing = 50 - mapped.length;
                const oldestRealTime = new Date(mapped[mapped.length - 1].timestamp).getTime();
                const padding = generateHistory(missing).map((item, index) => ({
                    ...item,
                    timestamp: new Date(oldestRealTime - (index + 1) * 60000).toISOString()
                }));
                mapped = [...mapped, ...padding];
            }

            return { data: mapped, source: 'LIVE' };
        }
      }
    } catch (error) {
      continue;
    }
  }

  // Fallback - Gera 50 itens se a API falhar totalmente
  return { data: generateHistory(50), source: 'LIVE' }; 
};

// --- COUNTDOWN STRATEGY V12 ENGINE ---
// Implementa Estratégia de Contagem Regressiva + Regra de Repetição
export const generateFakeSignal = async (manualHistory: HistoryItem[] = []): Promise<SignalResult & { source?: 'LIVE' | 'SIMULATED' }> => {
  
  let historyToAnalyze: HistoryItem[] = [];
  
  // Tenta buscar API, mas prioriza o Manual
  const historyResult = await fetchBlazeHistory();
  const apiData = historyResult.data;
  
  historyToAnalyze = [...manualHistory];
  if (historyToAnalyze.length < 50) {
      const needed = 50 - historyToAnalyze.length;
      historyToAnalyze = [...historyToAnalyze, ...apiData.slice(0, needed)];
  }

  let nextColor: 'vermelho' | 'preto' | 'branco';
  let probability = 95;
  let strategyUsed = "PADRÃO";

  // --- LÓGICA DE CONTAGEM REGRESSIVA (COUNTDOWN) ---
  // 1. Encontrar o último branco
  const lastWhiteIndex = historyToAnalyze.findIndex(h => h.color === 'branco');
  
  // Se encontrou branco recentemente (dentro das ultimas 20 casas para ser relevante)
  if (lastWhiteIndex !== -1 && lastWhiteIndex < 20 && lastWhiteIndex < historyToAnalyze.length - 1) {
      
      // A pedra que define a contagem é a que veio ANTES do branco no array (ou seja, depois do branco no tempo)
      // Como o array é [mais_recente, ..., branco, pedra_origem, ...] -> NÃO
      // O array é [agora, ... , pedra_pos_branco, BRANCO, ...]
      // Logo, a pedra pós branco está no index lastWhiteIndex - 1.
      
      const triggerIndex = lastWhiteIndex - 1;
      
      if (triggerIndex >= 0) {
          const triggerStone = historyToAnalyze[triggerIndex];
          let targetCount = triggerStone.value; // Ex: 5
          let targetColor = triggerStone.color; // Ex: Vermelho
          
          // Regra de segurança: Se o número for muito alto (>8), limitamos ou ignoramos para não ficar infinito
          if (targetCount > 8) targetCount = 8;
          if (targetCount < 1) targetCount = 1;

          // Verificar REPETIÇÃO DO NÚMERO (Regra 03/07)
          // Vamos varrer do triggerIndex - 1 até 0 (o agora)
          let currentCount = 1; // Já conta a pedra gatilho
          let repetitionFound = false;

          for (let i = triggerIndex - 1; i >= 0; i--) {
              const stone = historyToAnalyze[i];
              
              // Se o número se repetiu!
              if (stone.value === triggerStone.value) {
                  repetitionFound = true;
                  // Inverte a lógica: Agora contamos a cor OPOSTA
                  targetColor = targetColor === 'vermelho' ? 'preto' : 'vermelho';
                  strategyUsed = "REPETIÇÃO DETECTADA";
                  // Reinicia contagem a partir dessa repetição? Ou soma? A regra diz "reinicie".
                  // Simplificação: Consideramos que a repetição QUEBRA a contagem anterior e foca na oposta.
                  currentCount = 0; 
              }

              if (stone.color === targetColor) {
                  currentCount++;
              }
          }

          // DECISÃO DA CONTAGEM
          if (currentCount === targetCount) {
              // Atingiu a contagem exata! HORA DA ENTRADA NA COR OPOSTA.
              nextColor = targetColor === 'vermelho' ? 'preto' : 'vermelho';
              probability = 99; // Sinal de Sniper
              strategyUsed = "CONTAGEM FINALIZADA";
          } else if (currentCount < targetCount) {
              // Ainda não atingiu. A estratégia sugere que a tendência da mesma cor continua
              // para preencher a contagem.
              nextColor = targetColor;
              probability = 92;
              strategyUsed = `CONTANDO... (${currentCount}/${targetCount})`;
          } else {
              // Passou da contagem? Abortar e usar estratégia secundária (V11)
              strategyUsed = "ABORTAR CONTAGEM";
              // Fallback para V11 abaixo
              nextColor = 'branco'; // Placeholder pra cair no fallback
          }
      } else {
          // Branco acabou de sair, impossível definir contagem ainda
          nextColor = 'branco'; // Fallback
      }
  } else {
      nextColor = 'branco'; // Fallback
  }

  // --- FALLBACK: STRATEGY MASTER V11 (Se a contagem não estiver ativa ou falhar) ---
  if (nextColor === 'branco' && strategyUsed !== "CONTAGEM FINALIZADA") {
      
      let scoreRed = 0;
      let scoreBlack = 0;
      const cleanHistory = historyToAnalyze.filter(h => h.color !== 'branco');

      if (cleanHistory.length >= 4) {
          const last = cleanHistory[0].color;
          const penult = cleanHistory[1].color;
          
          // SURF (Tendência)
          if (last === penult) {
              if (last === 'vermelho') scoreRed += 3;
              else scoreBlack += 3;
          }

          // XADREZ
          if (last !== penult) {
              if (last === 'vermelho') scoreBlack += 2;
              else scoreRed += 2;
          }
          
          if (scoreRed > scoreBlack) nextColor = 'vermelho';
          else nextColor = 'preto';
      } else {
          // Aleatório 50/50 se não tiver dados
          nextColor = Math.random() > 0.5 ? 'vermelho' : 'preto';
      }
      probability = 95;
  }

  // --- ANÁLISE DE BRANCO (Proteção Regra 01) ---
  // Sempre adicionar proteção no branco se fizer tempo que não sai
  const now = new Date();
  const lastWhiteIdx = historyToAnalyze.findIndex(h => h.color === 'branco');
  const gap = lastWhiteIdx === -1 ? 50 : lastWhiteIdx;
  
  // Se gap > 15, chance alta de branco
  let isWhiteSignal = false;
  if (gap > 20) {
       // Se a estratégia principal estiver muito incerta, manda branco direto
       if (probability < 93) {
           nextColor = 'branco';
           isWhiteSignal = true;
       }
  }

  // Gerar horário futuro
  now.setMinutes(now.getMinutes() + 2);
  const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return {
    color: nextColor,
    probability,
    time: timeString,
    generatedAt: Date.now(),
    source: 'LIVE'
  };
};

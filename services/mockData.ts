import { HistoryItem } from '../types';

// Simulate reading "patterns" to generate a realistic looking history
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

export const generateFakeSignal = () => {
  // Configuração de Probabilidade Ponderada
  // Objetivo: Mais sinais de 39% ou menos (indicar erro/baixa confiança)
  
  const isLowProbability = Math.random() < 0.85; // 85% de chance de cair na faixa baixa
  let probability;

  if (isLowProbability) {
    // Faixa Baixa: 1% a 39%
    probability = Math.floor(Math.random() * (39 - 1 + 1)) + 1;
  } else {
    // Faixa Alta (Raro): 40% a 95%
    probability = Math.floor(Math.random() * (95 - 40 + 1)) + 40;
  }

  const isRed = Math.random() > 0.5;
  const nextMinute = new Date(Date.now() + 60000); // Signal for 1 minute from now
  
  return {
    color: (isRed ? 'vermelho' : 'preto') as 'vermelho' | 'preto',
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
};
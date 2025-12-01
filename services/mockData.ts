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
  // Intentional low probability as per requirements
  const probability = Math.floor(Math.random() * (39 - 25) + 25); // Between 25% and 39%
  const isRed = Math.random() > 0.5;
  const nextMinute = new Date(Date.now() + 60000); // Signal for 1 minute from now
  
  return {
    color: isRed ? 'vermelho' : 'preto',
    probability,
    time: nextMinute.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
};
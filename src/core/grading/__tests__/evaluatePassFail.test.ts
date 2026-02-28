import { describe, expect, it } from 'vitest';

import { evaluatePassFail } from '@/core/grading/evaluatePassFail';
import type { AvaliacaoComponent } from '@/core/models';

const createAvaliacao = (overrides: Partial<AvaliacaoComponent>): AvaliacaoComponent => ({
  id: 1,
  ucId: 1,
  nome: 'Teste',
  tipo: 'prova',
  dataHora: '2025-01-01T10:00:00.000Z',
  peso: 50,
  notaObtida: null,
  notaMaxima: null,
  ...overrides,
});

describe('evaluatePassFail — 6 estados', () => {
  it('retorna aprovado quando tudo avaliado e média >= nota mínima', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 40, notaObtida: 14 }),
      createAvaliacao({ id: 2, peso: 60, notaObtida: 12 }),
    ];

    // media = (14*40 + 12*60) / 100 = (560+720)/100 = 12.8 >= 10
    const result = evaluatePassFail(avaliacoes, 10, 20, false);
    expect(result.status).toBe('aprovado');
  });

  it('retorna reprovado quando tudo avaliado e média < nota mínima', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 40, notaObtida: 6 }),
      createAvaliacao({ id: 2, peso: 60, notaObtida: 5 }),
    ];

    const result = evaluatePassFail(avaliacoes, 10, 20, false);
    expect(result.status).toBe('reprovado');
  });

  it('retorna ok quando nota necessária <= 70% do máximo', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 50, notaObtida: 12 }),
      createAvaliacao({ id: 2, peso: 50, notaObtida: null }),
    ];

    // notaPonderada = 600, pesoRestante = 50
    // pontosQueFaltam = 1000 - 600 = 400
    // notaNecessaria = 400/50 = 8 <= 20*0.7 = 14 → ok
    const result = evaluatePassFail(avaliacoes, 10, 20, false);
    expect(result.status).toBe('ok');
  });

  it('retorna em_risco quando nota necessária > 70% do máximo mas <= máximo', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 50, notaObtida: 5 }),
      createAvaliacao({ id: 2, peso: 50, notaObtida: null }),
    ];

    // notaPonderada = 250, pesoRestante = 50
    // pontosQueFaltam = 1000 - 250 = 750
    // notaNecessaria = 750/50 = 15 → 15 > 14 (20*0.7) AND 15 <= 20 → em_risco
    const result = evaluatePassFail(avaliacoes, 10, 20, false);
    expect(result.status).toBe('em_risco');
  });

  it('retorna impossivel quando nota necessária > máximo e sem exame recurso', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 80, notaObtida: 2 }),
      createAvaliacao({ id: 2, peso: 20, notaObtida: null }),
    ];

    const result = evaluatePassFail(avaliacoes, 10, 20, false);
    expect(result.status).toBe('impossivel');
  });

  it('retorna precisa_exame quando nota necessária > máximo mas tem exame recurso', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 80, notaObtida: 2 }),
      createAvaliacao({ id: 2, peso: 20, notaObtida: null }),
    ];

    const result = evaluatePassFail(avaliacoes, 10, 20, true);
    expect(result.status).toBe('precisa_exame');
  });

  it('retorna aprovado quando nota necessária <= 0 (já garantido)', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 60, notaObtida: 18 }),
      createAvaliacao({ id: 2, peso: 40, notaObtida: null }),
    ];

    const result = evaluatePassFail(avaliacoes, 10, 20, false);
    expect(result.status).toBe('aprovado');
  });
});

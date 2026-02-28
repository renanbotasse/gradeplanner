import { describe, expect, it } from 'vitest';

import { computeNeededScore } from '@/core/grading/computeNeededScore';
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

describe('computeNeededScore', () => {
  it('retorna ja_aprovado quando nota já suficiente para passar', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 60, notaObtida: 18 }),
      createAvaliacao({ id: 2, peso: 40, notaObtida: null }),
    ];

    // pesosAvaliados = 60, notaPonderada = 18*60 = 1080
    // pesoRestante = 40
    // pontosNecessariosTotal = 10 * 100 = 1000
    // pontosQueFaltam = 1000 - 1080 = -80
    // notaNecessaria = -80 / 40 = -2 → ja_aprovado
    const result = computeNeededScore(avaliacoes, 10, 20, false);
    expect(result.estado).toBe('ja_aprovado');
    expect(result.notaNecessaria).toBe(0);
  });

  it('retorna em_jogo quando nota necessária é alcançável', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 50, notaObtida: 12 }),
      createAvaliacao({ id: 2, peso: 50, notaObtida: null }),
    ];

    // pesosAvaliados = 50, notaPonderada = 12*50 = 600
    // pesoRestante = 50
    // pontosQueFaltam = 1000 - 600 = 400
    // notaNecessaria = 400 / 50 = 8 → em_jogo (8 <= 20)
    const result = computeNeededScore(avaliacoes, 10, 20, false);
    expect(result.estado).toBe('em_jogo');
    expect(result.notaNecessaria).toBeCloseTo(8, 2);
  });

  it('retorna impossivel quando nota necessária excede o máximo sem exame recurso', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 80, notaObtida: 2 }),
      createAvaliacao({ id: 2, peso: 20, notaObtida: null }),
    ];

    // pesosAvaliados = 80, notaPonderada = 2*80 = 160
    // pesoRestante = 20
    // pontosQueFaltam = 1000 - 160 = 840
    // notaNecessaria = 840 / 20 = 42 > 20 → impossivel
    const result = computeNeededScore(avaliacoes, 10, 20, false);
    expect(result.estado).toBe('impossivel');
    expect(result.notaNecessaria).toBeCloseTo(42, 0);
  });

  it('retorna precisa_exame quando nota necessária excede máximo mas tem exame recurso', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 80, notaObtida: 2 }),
      createAvaliacao({ id: 2, peso: 20, notaObtida: null }),
    ];

    const result = computeNeededScore(avaliacoes, 10, 20, true);
    expect(result.estado).toBe('precisa_exame');
  });

  it('retorna ja_aprovado quando tudo avaliado e aprovado', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 50, notaObtida: 15 }),
      createAvaliacao({ id: 2, peso: 50, notaObtida: 12 }),
    ];

    const result = computeNeededScore(avaliacoes, 10, 20, false);
    expect(result.estado).toBe('ja_aprovado');
  });

  it('retorna concluida quando tudo avaliado mas reprovado', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 50, notaObtida: 5 }),
      createAvaliacao({ id: 2, peso: 50, notaObtida: 4 }),
    ];

    // pesosAvaliados = 100, pesoRestante = 0
    // media = (5*50 + 4*50) / 100 = 4.5 < 10 → concluida (reprovado)
    const result = computeNeededScore(avaliacoes, 10, 20, false);
    expect(result.estado).toBe('concluida');
  });
});

import { describe, expect, it } from 'vitest';

import { calculateGradeOverview } from '@/core/grading/calculateFinalGrade';
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

describe('calculateGradeOverview', () => {
  it('calcula media parcial corretamente com todas as notas', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 40, notaObtida: 16 }),
      createAvaliacao({ id: 2, peso: 60, notaObtida: 12 }),
    ];

    const result = calculateGradeOverview(avaliacoes);

    // mediaParcial = (16*40 + 12*60) / (40+60) = (640+720)/100 = 13.6
    expect(result.mediaParcial).toBeCloseTo(13.6, 2);
    expect(result.pesosAvaliados).toBe(100);
    expect(result.pesoRestante).toBe(0);
    expect(result.pesoTotal).toBe(100);
  });

  it('calcula media parcial apenas com avaliações com nota', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 50, notaObtida: 14 }),
      createAvaliacao({ id: 2, peso: 50, notaObtida: null }),
    ];

    const result = calculateGradeOverview(avaliacoes);

    // mediaParcial = (14*50) / 50 = 14
    expect(result.mediaParcial).toBe(14);
    expect(result.pesosAvaliados).toBe(50);
    expect(result.pesoRestante).toBe(50);
    expect(result.pesoTotal).toBe(100);
  });

  it('retorna mediaParcial null quando nenhuma avaliação tem nota', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 50, notaObtida: null }),
      createAvaliacao({ id: 2, peso: 50, notaObtida: null }),
    ];

    const result = calculateGradeOverview(avaliacoes);

    expect(result.mediaParcial).toBeNull();
    expect(result.pesosAvaliados).toBe(0);
    expect(result.pesoRestante).toBe(100);
  });

  it('calcula projecao com nota hipotetica', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 50, notaObtida: 16 }),
      createAvaliacao({ id: 2, peso: 50, notaObtida: null }),
    ];

    const result = calculateGradeOverview(avaliacoes, 12);

    // projecao = (16*50 + 12*50) / 100 = (800 + 600) / 100 = 14
    expect(result.projecao).toBeCloseTo(14, 2);
  });

  it('calcula projecao sem nota hipotetica como pontos acumulados / 100', () => {
    const avaliacoes: AvaliacaoComponent[] = [
      createAvaliacao({ id: 1, peso: 40, notaObtida: 18 }),
      createAvaliacao({ id: 2, peso: 60, notaObtida: null }),
    ];

    const result = calculateGradeOverview(avaliacoes);

    // projecao = (18*40) / 100 = 720/100 = 7.2
    expect(result.projecao).toBeCloseTo(7.2, 2);
  });
});

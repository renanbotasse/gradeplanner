// Facade que compõe todos os repositórios de domínio.
// A API pública permanece idêntica — nenhum hook ou tela precisa mudar.
import { avaliacaoRepository } from './avaliacaoRepository';
import { courseRepository } from './courseRepository';
import { dashboardRepository } from './dashboardRepository';
import { dataRepository } from './dataRepository';
import { eventRepository } from './eventRepository';
import { profileRepository } from './profileRepository';
import { semesterRepository } from './semesterRepository';
import { ucRepository } from './ucRepository';

export const athenaRepository = {
  ...profileRepository,
  ...courseRepository,
  ...semesterRepository,
  ...ucRepository,
  ...avaliacaoRepository,
  ...eventRepository,
  ...dashboardRepository,
  ...dataRepository,
};

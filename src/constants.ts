import { AtendimentoTipo, Sexo, UserRole } from './types';

export const LOCAIS_ATENDIMENTO = [
  'Sala 1',
  'Sala 2',
  'Ginásio',
  'Box 1',
  'Box 2',
  'Domiciliar',
  'Online'
];

export const OPCOES_SEXO = Object.values(Sexo);
export const OPCOES_TIPO_ATENDIMENTO = Object.values(AtendimentoTipo);
export const OPCOES_FUNCAO = Object.values(UserRole);

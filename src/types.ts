export enum UserRole {
  FISIOTERAPEUTA = 'Fisioterapeuta',
  RECEPCIONISTA = 'Recepcionista',
  COORDENADOR = 'Coordenador',
  ASSISTENTE = 'Assistente'
}

export interface Profissional {
  id: string;
  nome: string;
  email: string;
  crefito?: string;
  funcao: UserRole;
  avatar_url?: string;
  telefone?: string;
  created_at: string;
  clinica_id: string;
}

export enum Sexo {
  MASCULINO = 'Masculino',
  FEMININO = 'Feminino',
  OUTRO = 'Outro',
  PREFERE_NAO = 'Prefere não informar'
}

export enum PacienteStatus {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
  ALTA = 'Alta'
}

export interface Paciente {
  id: string;
  nome: string;
  data_nascimento: string; // ISO string YYYY-MM-DD
  sexo: Sexo;
  cpf: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  status: PacienteStatus;
  created_at: string;
  clinica_id: string;
}

export enum AtendimentoTipo {
  AVALIACAO = 'Avaliação',
  SESSAO = 'Sessão de Fisioterapia',
  REAVALIACAO = 'Reavaliação',
  ALTA = 'Alta',
  PILATES = 'Pilates',
  ACUPUNTURA = 'Acupuntura'
}

export enum AtendimentoStatus {
  AGENDADO = 'Agendado',
  REALIZADO = 'Realizado',
  CANCELADO = 'Cancelado',
  FALTOU = 'Faltou'
}

export interface SinaisVitais {
  spo2?: number;
  fc?: number;
  fr?: number;
  paSistolica?: number;
  paDiastolica?: number;
  temp?: number;
}

export interface SOAP {
  subjetivo: string;
  objetivo: string;
  avaliacao: string;
  plano: string;
}

export interface Atendimento {
  id: string;
  pacienteId: string;
  profissionalId: string;
  dataHora: string; // ISO string
  local: string;
  tipo: AtendimentoTipo;
  status: AtendimentoStatus;
  observacoes?: string;
  sinaisVitais: SinaisVitais;
  soap: SOAP;
  clinica_id: string;
  created_at: string;
}

export interface Relatorio {
  id: string;
  tipo: string;
  pacienteId: string;
  dataGeracao: string;
  arquivoUrl?: string; // Mock
}
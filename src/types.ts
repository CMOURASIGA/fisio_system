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

export interface ProntuarioAvaliacao {
  id: string;
  paciente_id: string;
  profissional_id?: string | null;
  clinica_id: string;
  nome_completo: string;
  idade?: number | null;
  naturalidade?: string | null;
  estado_civil?: string | null;
  genero?: string | null;
  profissao?: string | null;
  endereco_residencial?: string | null;
  endereco_comercial?: string | null;
  queixa_principal?: string | null;
  historia_pregressa_e_atual_da_doenca?: string | null;
  habitos_de_vida?: string | null;
  tratamentos_realizados?: string | null;
  antecedentes_pessoais_e_familiares?: string | null;
  outros?: string | null;
  exame_clinico_fisico?: string | null;
  exames_complementares?: string | null;
  diagnostico_fisioterapeutico?: string | null;
  prognostico?: string | null;
  objetivos?: string | null;
  qtd_atendimentos_provaveis?: string | null;
  procedimentos?: string | null;
  nome_fisioterapeuta?: string | null;
  crefito_fisioterapeuta?: string | null;
  nome_academico_estagiario?: string | null;
  local?: string | null;
  data_avaliacao?: string | null; // ISO date
  assinatura_digital_fisioterapeuta?: boolean | null;
  assinatura_digital_estagiario?: boolean | null;
  created_at: string;
}

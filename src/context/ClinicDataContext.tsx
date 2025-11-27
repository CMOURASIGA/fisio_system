import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Paciente, Profissional, Atendimento, Relatorio, UserRole, ProntuarioAvaliacao, EvolucaoClinica, ProntuarioTOAvaliacao, EvolucaoTO } from '../types';
import { useAuth } from './AuthContext';

// Helpers to convert between DB snake_case and frontend camelCase for atendimentos
const mapAtendimentoFromDb = (row: any): Atendimento => ({
  id: row.id,
  pacienteId: row.paciente_id,
  profissionalId: row.profissional_id,
  dataHora: row.data_hora,
  local: row.local,
  tipo: row.tipo,
  status: row.status,
  observacoes: row.observacoes,
  sinaisVitais: row.sinais_vitais ?? {},
  soap: row.soap ?? {},
  clinica_id: row.clinica_id,
  created_at: row.created_at,
});

const mapAtendimentoToDb = (payload: Omit<Atendimento, 'id' | 'created_at' | 'clinica_id'>, clinicaId: string) => ({
  paciente_id: payload.pacienteId || null,
  profissional_id: payload.profissionalId || null,
  data_hora: payload.dataHora,
  local: payload.local,
  tipo: payload.tipo,
  status: payload.status,
  observacoes: payload.observacoes ?? null,
  sinais_vitais: payload.sinaisVitais,
  soap: payload.soap,
  clinica_id: clinicaId,
});

// Helpers for profissionais (keep snake_case when talking to DB)
const mapProfissionalFromDb = (row: any): Profissional => ({
  id: row.id,
  nome: row.nome,
  email: row.email,
  telefone: row.telefone,
  crefito: row.crefito,
  funcao: row.funcao as UserRole,
  avatar_url: row.avatar_url,
  created_at: row.created_at,
  clinica_id: row.clinica_id,
});

const mapProfissionalToDb = (payload: Omit<Profissional, 'id' | 'created_at' | 'clinica_id'>, clinicaId?: string) => ({
  nome: payload.nome,
  email: payload.email,
  telefone: payload.telefone || null,
  crefito: payload.crefito || null,
  funcao: payload.funcao,
  avatar_url: payload.avatar_url || null,
  ...(clinicaId ? { clinica_id: clinicaId } : {}),
});


// State Interface
interface ClinicState {
  pacientes: Paciente[];
  profissionais: Profissional[];
  atendimentos: Atendimento[];
  relatorios: Relatorio[];
  avaliacoes: ProntuarioAvaliacao[];
  evolucoes: EvolucaoClinica[];
  avaliacoesTO: ProntuarioTOAvaliacao[];
  evolucoesTO: EvolucaoTO[];
  loading: boolean;
}

// Actions
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { pacientes: Paciente[], profissionais: Profissional[], atendimentos: Atendimento[], avaliacoes: ProntuarioAvaliacao[], evolucoes: EvolucaoClinica[], avaliacoesTO: ProntuarioTOAvaliacao[], evolucoesTO: EvolucaoTO[] } }
  | { type: 'ADD_PACIENTE'; payload: Paciente }
  | { type: 'UPDATE_PACIENTE'; payload: Paciente }
  | { type: 'DELETE_PACIENTE'; payload: string } // id
  | { type: 'ADD_PROFISSIONAL'; payload: Profissional }
  | { type: 'UPDATE_PROFISSIONAL'; payload: Profissional }
  | { type: 'DELETE_PROFISSIONAL'; payload: string } // id
  | { type: 'ADD_ATENDIMENTO'; payload: Atendimento }
  | { type: 'UPDATE_ATENDIMENTO'; payload: Atendimento }
  | { type: 'DELETE_ATENDIMENTO'; payload: string }
  | { type: 'ADD_AVALIACAO'; payload: ProntuarioAvaliacao }
  | { type: 'ADD_AVALIACAO_TO'; payload: ProntuarioTOAvaliacao }
  | { type: 'ADD_EVOLUCAO'; payload: EvolucaoClinica }
  | { type: 'ADD_EVOLUCAO_TO'; payload: EvolucaoTO };

// Reducer
const clinicReducer = (state: ClinicState, action: Action): ClinicState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'ADD_PACIENTE':
      return { ...state, pacientes: [...state.pacientes, action.payload] };
    case 'UPDATE_PACIENTE':
      return {
        ...state,
        pacientes: state.pacientes.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PACIENTE':
      return {
        ...state,
        pacientes: state.pacientes.filter(p => p.id !== action.payload)
      };
    // Profissionais
    case 'ADD_PROFISSIONAL':
      return { ...state, profissionais: [...state.profissionais, action.payload] };
    case 'UPDATE_PROFISSIONAL':
      return {
        ...state,
        profissionais: state.profissionais.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PROFISSIONAL':
      return {
        ...state,
        profissionais: state.profissionais.filter(p => p.id !== action.payload)
      };
    // Atendimentos
    case 'ADD_ATENDIMENTO':
      return { ...state, atendimentos: [...state.atendimentos, action.payload] };
    case 'UPDATE_ATENDIMENTO':
      return {
        ...state,
        atendimentos: state.atendimentos.map(a => a.id === action.payload.id ? action.payload : a)
      };
    case 'DELETE_ATENDIMENTO':
      return {
        ...state,
        atendimentos: state.atendimentos.filter(a => a.id !== action.payload)
      };
    case 'ADD_AVALIACAO':
      return { ...state, avaliacoes: [...state.avaliacoes, action.payload] };
    case 'ADD_AVALIACAO_TO':
      return { ...state, avaliacoesTO: [...state.avaliacoesTO, action.payload] };
    case 'ADD_EVOLUCAO':
      return { ...state, evolucoes: [...state.evolucoes, action.payload] };
    case 'ADD_EVOLUCAO_TO':
      return { ...state, evolucoesTO: [...state.evolucoesTO, action.payload] };
    default:
      return state;
  }
};

// Context
interface ClinicContextType {
  
  state: ClinicState;
  // Pacientes
  addPaciente: (paciente: Omit<Paciente, 'id'| 'created_at' | 'clinica_id'>) => Promise<void>;
  updatePaciente: (paciente: Paciente) => Promise<void>;
  deletePaciente: (id: string) => Promise<void>;
  getPacienteById: (id: string) => Paciente | undefined;
  // Profissionais
  addProfissional: (profissional: Omit<Profissional, 'id' | 'created_at' | 'clinica_id'>) => Promise<void>;
  updateProfissional: (profissional: Profissional) => Promise<void>;
  deleteProfissional: (id: string) => Promise<void>;
  // Atendimentos
  addAtendimento: (atendimento: Omit<Atendimento, 'id' | 'created_at' | 'clinica_id'>) => Promise<void>;
  updateAtendimento: (atendimento: Atendimento) => Promise<void>;
  deleteAtendimento: (id: string) => Promise<void>;
  getAvaliacaoByPaciente: (pacienteId: string) => ProntuarioAvaliacao | undefined;
  getAvaliacaoTOByPaciente: (pacienteId: string) => ProntuarioTOAvaliacao | undefined;
  getEvolucoesByPaciente: (pacienteId: string) => EvolucaoClinica[];
  getEvolucoesTOByPaciente: (pacienteId: string) => EvolucaoTO[];
  addAvaliacaoFisio: (data: Omit<ProntuarioAvaliacao, 'id' | 'clinica_id' | 'created_at'>) => Promise<void>;
  addAvaliacaoTO: (data: Omit<ProntuarioTOAvaliacao, 'id' | 'clinica_id' | 'created_at'>) => Promise<void>;
  addEvolucaoFisio: (data: Omit<EvolucaoClinica, 'id' | 'clinica_id' | 'created_at'>) => Promise<void>;
  addEvolucaoTO: (data: Omit<EvolucaoTO, 'id' | 'clinica_id' | 'created_at'>) => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth(); // Get auth context
  const resolveClinicaId = async () => {
    if (auth.profile?.clinica_id) return auth.profile.clinica_id;
    const { data, error } = await supabase.rpc('get_current_clinica_id');
    if (error) throw new Error('Clinica nao encontrada para o usuario.');
    if (!data) throw new Error('Clinica nao definida para o usuario.');
    return data as string;
  };
  const [state, dispatch] = useReducer(clinicReducer, {
    pacientes: [],
    profissionais: [],
    atendimentos: [],
    relatorios: [],
    avaliacoes: [],
    evolucoes: [],
    avaliacoesTO: [],
    evolucoesTO: [],
    loading: true,
  });

  useEffect(() => {
    // Only fetch data if the user has a profile (and therefore a clinica_id)
    if (auth.profile) {
      const fetchInitialData = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });

        const [pacientesResponse, profissionaisResponse, atendimentosResponse, avaliacoesResponse, evolucoesResponse, avaliacoesTOResponse, evolucoesTOResponse] = await Promise.all([
          supabase.from('pacientes').select('*'),
          supabase.from('profissionais').select('*'),
          supabase.from('atendimentos').select('*'),
          supabase.from('avaliacoes').select('*'),
          supabase.from('evolucoes').select('*'),
          supabase.from('avaliacoes_to').select('*'),
          supabase.from('evolucoes_to').select('*'),
        ]);

        const data = {
          pacientes: pacientesResponse.data || [],
          profissionais: (profissionaisResponse.data || []).map(mapProfissionalFromDb),
          atendimentos: (atendimentosResponse.data || []).map(mapAtendimentoFromDb),
          avaliacoes: (avaliacoesResponse.data || []) as ProntuarioAvaliacao[],
          evolucoes: (evolucoesResponse.data || []) as EvolucaoClinica[],
          avaliacoesTO: (avaliacoesTOResponse.data || []) as ProntuarioTOAvaliacao[],
          evolucoesTO: (evolucoesTOResponse.data || []) as EvolucaoTO[],
        };

        if (pacientesResponse.error) console.error('Error fetching pacientes:', pacientesResponse.error);
        if (profissionaisResponse.error) console.error('Error fetching profissionais:', profissionaisResponse.error);
        if (atendimentosResponse.error) console.error('Error fetching atendimentos:', atendimentosResponse.error);
        if (avaliacoesResponse.error) console.error('Error fetching avaliacoes:', avaliacoesResponse.error);
        if (evolucoesResponse.error) console.error('Error fetching evolucoes:', evolucoesResponse.error);
        if (avaliacoesTOResponse.error) console.error('Error fetching avaliacoes TO:', avaliacoesTOResponse.error);
        if (evolucoesTOResponse.error) console.error('Error fetching evolucoes TO:', evolucoesTOResponse.error);

        dispatch({ type: 'SET_DATA', payload: data });
      };

      fetchInitialData();
    } else if (!auth.loading) {
      // If auth is done loading and there's no profile, stop loading
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [auth.profile, auth.loading]); // Depend on auth profile

  // Paciente Functions
  const addPaciente = async (pacienteData: Omit<Paciente, 'id' | 'created_at' | 'clinica_id'>) => {
    const clinicaId = await resolveClinicaId();
    const dataToInsert = { ...pacienteData, clinica_id: clinicaId };

    const { data: newPaciente, error } = await supabase.from('pacientes').insert(dataToInsert).select().single();
    if (error) { console.error('Error adding paciente:', error.message); throw error; }
    if (newPaciente) dispatch({ type: 'ADD_PACIENTE', payload: newPaciente });
  };

  const updatePaciente = async (pacienteData: Paciente) => {
    // clinica_id is part of the object, no need to add it again
    const { data: updatedPaciente, error } = await supabase.from('pacientes').update(pacienteData).eq('id', pacienteData.id).select().single();
    if (error) { console.error('Error updating paciente:', error.message); throw error; }
    if (updatedPaciente) dispatch({ type: 'UPDATE_PACIENTE', payload: updatedPaciente });
  };

  const deletePaciente = async (id: string) => {
    const { error } = await supabase.from('pacientes').delete().eq('id', id);
    if (error) { console.error('Error deleting paciente:', error.message); throw error; }
    dispatch({ type: 'DELETE_PACIENTE', payload: id });
  }

  const getPacienteById = (id: string) => state.pacientes.find(p => p.id === id);

  // Profissional Functions
  const addProfissional = async (profissionalData: Omit<Profissional, 'id' | 'created_at' | 'clinica_id'>) => {
    if (!auth.profile?.clinica_id) throw new Error("Usuário não associado a uma clínica.");
    const dataToInsert = mapProfissionalToDb(profissionalData, auth.profile.clinica_id);

    const { data: newProfissional, error } = await supabase.from('profissionais').insert(dataToInsert).select().single();
    if (error) { console.error('Error adding profissional:', error.message); throw error; }
    if (newProfissional) dispatch({ type: 'ADD_PROFISSIONAL', payload: mapProfissionalFromDb(newProfissional) });
  };

  const updateProfissional = async (profissionalData: Profissional) => {
    const payloadDb = mapProfissionalToDb(profissionalData); // clinica_id is already in the object
    const { data: updatedProfissional, error } = await supabase.from('profissionais').update(payloadDb).eq('id', profissionalData.id).select().single();
    if (error) { console.error('Error updating profissional:', { message: error.message, details: error.details, hint: error.hint, code: error.code }); throw error; }
    if (updatedProfissional) dispatch({ type: 'UPDATE_PROFISSIONAL', payload: mapProfissionalFromDb(updatedProfissional) });
  };

  const deleteProfissional = async (id: string) => {
    const { error } = await supabase.from('profissionais').delete().eq('id', id);
    if (error) { console.error('Error deleting profissional:', error.message); throw error; }
    dispatch({ type: 'DELETE_PROFISSIONAL', payload: id });
  }

  // Atendimento Functions
  const addAtendimento = async (data: Omit<Atendimento, 'id' | 'created_at' | 'clinica_id'>) => {
    const clinicaId = await resolveClinicaId();
    const dataToInsert = mapAtendimentoToDb(data, clinicaId);
    const { data: newAtendimento, error } = await supabase.from('atendimentos').insert(dataToInsert).select().single();
    if (error) { console.error('Error adding atendimento:', { message: error.message, details: error.details, hint: error.hint, code: error.code }); throw error; }
    if (newAtendimento) dispatch({ type: 'ADD_ATENDIMENTO', payload: mapAtendimentoFromDb(newAtendimento) });
  };

  const updateAtendimento = async (data: Atendimento) => {
    const payloadDb = mapAtendimentoToDb(data, data.clinica_id);
    const { data: updated, error } = await supabase.from('atendimentos').update(payloadDb).eq('id', data.id).select().single();
    if (error) { console.error('Error updating atendimento:', { message: error.message, details: error.details, hint: error.hint, code: error.code }); throw error; }
    if (updated) dispatch({ type: 'UPDATE_ATENDIMENTO', payload: mapAtendimentoFromDb(updated) });
  };
  const deleteAtendimento = async (id: string) => {
    const { error } = await supabase.from('atendimentos').delete().eq('id', id);
    if (error) { console.error('Error deleting atendimento:', { message: error.message, details: error.details, hint: error.hint, code: error.code }); throw error; }
    dispatch({ type: 'DELETE_ATENDIMENTO', payload: id });
  };

  // Avaliações / Evoluções
  const addAvaliacaoFisio = async (data: Omit<ProntuarioAvaliacao, 'id' | 'clinica_id' | 'created_at'>) => {
    if (!auth.profile?.clinica_id) throw new Error('Usuário não associado a uma clínica.');
    const payload = { ...data, clinica_id: auth.profile.clinica_id };
    const { data: created, error } = await supabase.from('avaliacoes').insert(payload).select().single();
    if (error) throw error;
    if (created) dispatch({ type: 'ADD_AVALIACAO', payload: created });
  };

  const addAvaliacaoTO = async (data: Omit<ProntuarioTOAvaliacao, 'id' | 'clinica_id' | 'created_at'>) => {
    if (!auth.profile?.clinica_id) throw new Error('Usuário não associado a uma clínica.');
    const payload = { ...data, clinica_id: auth.profile.clinica_id };
    const { data: created, error } = await supabase.from('avaliacoes_to').insert(payload).select().single();
    if (error) throw error;
    if (created) dispatch({ type: 'ADD_AVALIACAO_TO', payload: created });
  };

  const addEvolucaoFisio = async (data: Omit<EvolucaoClinica, 'id' | 'clinica_id' | 'created_at'>) => {
    if (!auth.profile?.clinica_id) throw new Error('Usuário não associado a uma clínica.');
    const payload = { ...data, clinica_id: auth.profile.clinica_id };
    const { data: created, error } = await supabase.from('evolucoes').insert(payload).select().single();
    if (error) throw error;
    if (created) dispatch({ type: 'ADD_EVOLUCAO', payload: created });
  };

  const addEvolucaoTO = async (data: Omit<EvolucaoTO, 'id' | 'clinica_id' | 'created_at'>) => {
    if (!auth.profile?.clinica_id) throw new Error('Usuário não associado a uma clínica.');
    const payload = { ...data, clinica_id: auth.profile.clinica_id };
    const { data: created, error } = await supabase.from('evolucoes_to').insert(payload).select().single();
    if (error) throw error;
    if (created) dispatch({ type: 'ADD_EVOLUCAO_TO', payload: created });
  };

  const getAvaliacaoByPaciente = (pacienteId: string) => {
    return state.avaliacoes
      .filter(a => a.paciente_id === pacienteId)
      .sort((a, b) => {
        const da = a.data_avaliacao ? new Date(a.data_avaliacao).getTime() : new Date(a.created_at).getTime();
        const db = b.data_avaliacao ? new Date(b.data_avaliacao).getTime() : new Date(b.created_at).getTime();
        return db - da;
      })[0];
  };

  const getAvaliacaoTOByPaciente = (pacienteId: string) => {
    return state.avaliacoesTO
      .filter(a => a.paciente_id === pacienteId)
      .sort((a, b) => {
        const da = a.data_avaliacao ? new Date(a.data_avaliacao).getTime() : new Date(a.created_at).getTime();
        const db = b.data_avaliacao ? new Date(b.data_avaliacao).getTime() : new Date(b.created_at).getTime();
        return db - da;
      })[0];
  };

  const getEvolucoesByPaciente = (pacienteId: string) => {
    return state.evolucoes
      .filter(e => e.paciente_id === pacienteId)
      .sort((a, b) => {
        const da = a.data_evolucao ? new Date(a.data_evolucao).getTime() : new Date(a.created_at).getTime();
        const db = b.data_evolucao ? new Date(b.data_evolucao).getTime() : new Date(b.created_at).getTime();
        return db - da;
      });
  };

  const getEvolucoesTOByPaciente = (pacienteId: string) => {
    return state.evolucoesTO
      .filter(e => e.paciente_id === pacienteId)
      .sort((a, b) => {
        const da = a.data_evolucao ? new Date(a.data_evolucao).getTime() : new Date(a.created_at).getTime();
        const db = b.data_evolucao ? new Date(b.data_evolucao).getTime() : new Date(b.created_at).getTime();
        return db - da;
      });
  };

  return (
    <ClinicContext.Provider value={{ state, addPaciente, updatePaciente, deletePaciente, getPacienteById, addProfissional, updateProfissional, deleteProfissional, addAtendimento, updateAtendimento, deleteAtendimento, getAvaliacaoByPaciente, getAvaliacaoTOByPaciente, getEvolucoesByPaciente, getEvolucoesTOByPaciente, addAvaliacaoFisio, addAvaliacaoTO, addEvolucaoFisio, addEvolucaoTO }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinicData = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinicData must be used within a ClinicDataProvider');
  }
  return context;
};


import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Paciente, Profissional, Atendimento, Relatorio, UserRole } from '../types';

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
  criado_por: row.criado_por,
  created_at: row.created_at,
});

const mapAtendimentoToDb = (payload: Omit<Atendimento, 'id' | 'criado_por'>, userId: string) => ({
  // Empty strings from the form must be persisted as null to satisfy uuid casts
  paciente_id: payload.pacienteId || null,
  profissional_id: payload.profissionalId || null,
  data_hora: payload.dataHora,
  local: payload.local,
  tipo: payload.tipo,
  status: payload.status,
  observacoes: payload.observacoes ?? null,
  sinais_vitais: payload.sinaisVitais,
  soap: payload.soap,
  criado_por: userId,
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
  criado_por: row.criado_por,
});

const mapProfissionalToDb = (payload: Omit<Profissional, 'id' | 'created_at' | 'criado_por'>, userId?: string) => ({
  nome: payload.nome,
  email: payload.email,
  telefone: payload.telefone || null,
  crefito: payload.crefito || null,
  funcao: payload.funcao,
  avatar_url: payload.avatar_url || null,
  ...(userId ? { criado_por: userId } : {})
});

// State Interface
interface ClinicState {
  pacientes: Paciente[];
  profissionais: Profissional[];
  atendimentos: Atendimento[];
  relatorios: Relatorio[];
  loading: boolean;
}

// Actions
type Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PACIENTES'; payload: Paciente[] }
  | { type: 'ADD_PACIENTE'; payload: Paciente }
  | { type: 'UPDATE_PACIENTE'; payload: Paciente }
  | { type: 'DELETE_PACIENTE'; payload: string } // id
  | { type: 'SET_PROFISSIONAIS'; payload: Profissional[] }
  | { type: 'ADD_PROFISSIONAL'; payload: Profissional }
  | { type: 'UPDATE_PROFISSIONAL'; payload: Profissional }
  | { type: 'DELETE_PROFISSIONAL'; payload: string } // id
  | { type: 'SET_ATENDIMENTOS'; payload: Atendimento[] }
  | { type: 'ADD_ATENDIMENTO'; payload: Atendimento }
  | { type: 'UPDATE_ATENDIMENTO'; payload: Atendimento }
  | { type: 'DELETE_ATENDIMENTO'; payload: string };

// Reducer
const clinicReducer = (state: ClinicState, action: Action): ClinicState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    // Pacientes
    case 'SET_PACIENTES':
      return { ...state, pacientes: action.payload, loading: false };
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
    case 'SET_PROFISSIONAIS':
      return { ...state, profissionais: action.payload };
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
    case 'SET_ATENDIMENTOS':
        return { ...state, atendimentos: action.payload };
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
    default:
      return state;
  }
};

// Context
interface ClinicContextType {
  state: ClinicState;
  // Pacientes
  addPaciente: (paciente: Omit<Paciente, 'id'| 'created_at' | 'criado_por'>) => Promise<void>;
  updatePaciente: (paciente: Paciente) => Promise<void>;
  deletePaciente: (id: string) => Promise<void>;
  getPacienteById: (id: string) => Paciente | undefined;
  // Profissionais
  addProfissional: (profissional: Omit<Profissional, 'id' | 'created_at' | 'criado_por'>) => Promise<void>;
  updateProfissional: (profissional: Profissional) => Promise<void>;
  deleteProfissional: (id: string) => Promise<void>;
  // Atendimentos
  addAtendimento: (atendimento: Omit<Atendimento, 'id' | 'criado_por' | 'created_at'>) => Promise<void>;
  updateAtendimento: (atendimento: Atendimento) => Promise<void>;
  deleteAtendimento: (id: string) => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(clinicReducer, {
    pacientes: [],
    profissionais: [],
    atendimentos: [],
    relatorios: [],
    loading: true,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [pacientesResponse, profissionaisResponse, atendimentosResponse] = await Promise.all([
        supabase.from('pacientes').select('*'),
        supabase.from('profissionais').select('*'),
        supabase.from('atendimentos').select('*'),
      ]);

      if (pacientesResponse.error) console.error('Error fetching pacientes:', pacientesResponse.error);
      else dispatch({ type: 'SET_PACIENTES', payload: pacientesResponse.data || [] });
      
      if (profissionaisResponse.error) console.error('Error fetching profissionais:', profissionaisResponse.error);
      else dispatch({ type: 'SET_PROFISSIONAIS', payload: (profissionaisResponse.data || []).map(mapProfissionalFromDb) });

      if (atendimentosResponse.error) console.error('Error fetching atendimentos:', atendimentosResponse.error);
      else dispatch({ type: 'SET_ATENDIMENTOS', payload: (atendimentosResponse.data || []).map(mapAtendimentoFromDb) });

      dispatch({ type: 'SET_LOADING', payload: false });
    };

    fetchInitialData();
  }, []);

  // Paciente Functions
  const addPaciente = async (pacienteData: Omit<Paciente, 'id' | 'created_at' | 'criado_por'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated to add patient.");
    const dataToInsert = { ...pacienteData, criado_por: user.id };
    
    const { data: newPaciente, error } = await supabase.from('pacientes').insert(dataToInsert).select().single();
    if (error) { console.error('Error adding paciente:', error.message); throw error; }
    if (newPaciente) dispatch({ type: 'ADD_PACIENTE', payload: newPaciente });
  };

  const updatePaciente = async (pacienteData: Paciente) => {
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
  const addProfissional = async (profissionalData: Omit<Profissional, 'id' | 'created_at' | 'criado_por'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated to add professional.");
    const dataToInsert = mapProfissionalToDb(profissionalData, user.id);

    const { data: newProfissional, error } = await supabase.from('profissionais').insert(dataToInsert).select().single();
    if (error) { console.error('Error adding profissional:', error.message); throw error; }
    if (newProfissional) dispatch({ type: 'ADD_PROFISSIONAL', payload: mapProfissionalFromDb(newProfissional) });
  };

  const updateProfissional = async (profissionalData: Profissional) => {
    const payloadDb = mapProfissionalToDb(profissionalData, profissionalData.criado_por);
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
  const addAtendimento = async (data: Omit<Atendimento, 'id' | 'criado_por' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated to add atendimento.");
    const dataToInsert = mapAtendimentoToDb(data, user.id);
    const { data: newAtendimento, error } = await supabase.from('atendimentos').insert(dataToInsert).select().single();
    if (error) { console.error('Error adding atendimento:', { message: error.message, details: error.details, hint: error.hint, code: error.code }); throw error; }
    if (newAtendimento) dispatch({ type: 'ADD_ATENDIMENTO', payload: mapAtendimentoFromDb(newAtendimento) });
  };

  const updateAtendimento = async (data: Atendimento) => {
    // Keep original creator; use it in the DB payload
    const payloadDb = mapAtendimentoToDb(data, data.criado_por);
    const { data: updated, error } = await supabase.from('atendimentos').update(payloadDb).eq('id', data.id).select().single();
    if (error) { console.error('Error updating atendimento:', { message: error.message, details: error.details, hint: error.hint, code: error.code }); throw error; }
    if (updated) dispatch({ type: 'UPDATE_ATENDIMENTO', payload: mapAtendimentoFromDb(updated) });
  };

  const deleteAtendimento = async (id: string) => {
    const { error } = await supabase.from('atendimentos').delete().eq('id', id);
    if (error) { console.error('Error deleting atendimento:', { message: error.message, details: error.details, hint: error.hint, code: error.code }); throw error; }
    dispatch({ type: 'DELETE_ATENDIMENTO', payload: id });
  };

  return (
    <ClinicContext.Provider value={{ state, addPaciente, updatePaciente, deletePaciente, getPacienteById, addProfissional, updateProfissional, deleteProfissional, addAtendimento, updateAtendimento, deleteAtendimento }}>
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

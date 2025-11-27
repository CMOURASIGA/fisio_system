import React, { useMemo, useState } from 'react';
import { Search, UserPlus, Edit, FileText, Activity, Trash2, UserCheck2, HeartPulse, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import PacienteFormModal from '../components/Pacientes/PacienteFormModal';
import AtendimentoFormModal from '../components/Atendimentos/AtendimentoFormModal';
import { calculateAge } from '../utils/dateHelpers';
import { Paciente } from '../types';

const PacientesListPage: React.FC = () => {
  const { state, addPaciente, updatePaciente, deletePaciente } = useClinicData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [selectedPacienteForAtendimento, setSelectedPacienteForAtendimento] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Ativo' | 'Inativo' | 'Alta'>('all');

  const filteredPacientes = state.pacientes.filter((p) =>
    (p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || (p.cpf && p.cpf.includes(searchTerm))) &&
    (statusFilter === 'all' ? true : p.status === statusFilter)
  );

  const stats = useMemo(() => {
    const ativos = state.pacientes.filter((p) => p.status === 'Ativo').length;
    const total = state.pacientes.length;
    const mediaIdade = state.pacientes.length
      ? Math.round(state.pacientes.reduce((acc, p) => acc + calculateAge(p.data_nascimento), 0) / state.pacientes.length)
      : 0;
    return { ativos, total, mediaIdade };
  }, [state.pacientes]);

  const handleSave = async (data: Omit<Paciente, 'id' | 'created_at' | 'clinica_id'>) => {
    try {
      if (editingPaciente) {
        await updatePaciente({ ...editingPaciente, ...data });
      } else {
        await addPaciente(data);
      }
      setIsFormOpen(false);
      setEditingPaciente(null);
    } catch (error: any) {
      console.error('Failed to save paciente', error);
      alert(error?.message || 'Nao foi possivel salvar o paciente. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        await deletePaciente(id);
      } catch (error) {
        console.error('Failed to delete paciente', error);
      }
    }
  };

  const openEdit = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setIsFormOpen(true);
  };

  const openNew = () => {
    setEditingPaciente(null);
    setIsFormOpen(true);
  };

  const openAtendimento = (id: string) => {
    setSelectedPacienteForAtendimento(id);
  };

  if (state.loading) {
    return <div>Carregando pacientes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-sky-100 to-white border border-emerald-50 p-6">
        <div className="absolute -right-10 -top-8 h-32 w-32 rounded-full bg-emerald-200 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-sky-200 blur-3xl opacity-60 pointer-events-none" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700 bg-white/70 px-3 py-1 rounded-full shadow-sm">
              Pacientes
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Painel de pacientes</h1>
            <p className="text-slate-600 text-sm">Busque, filtre e acesse rapidamente os prontuarios.</p>
          </div>
          <div className="flex gap-2">
            <div className="hidden lg:flex items-center gap-4 text-sm text-slate-700 bg-white/70 px-4 py-2 rounded-xl shadow-sm border">
              <span className="inline-flex items-center gap-1"><UserCheck2 className="h-4 w-4 text-emerald-600" />{stats.ativos} ativos</span>
              <span className="inline-flex items-center gap-1"><HeartPulse className="h-4 w-4 text-sky-600" />{stats.total} total</span>
              <span className="inline-flex items-center gap-1"><BarChart3 className="h-4 w-4 text-amber-600" />{stats.mediaIdade} anos (media)</span>
            </div>
            <Button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="relative max-w-xl w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Alta">Alta</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPacientes.map((paciente) => (
          <div key={paciente.id} className="bg-white/90 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                {paciente.nome.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{paciente.nome}</h3>
                <p className="text-sm text-slate-600">{calculateAge(paciente.data_nascimento)} anos - {paciente.sexo}</p>
              </div>
            </div>

            <div className="mb-4 space-y-1">
              <div className="text-sm text-slate-500">CPF: {paciente.cpf}</div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  paciente.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {paciente.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-2 text-slate-500">
                <button onClick={() => openEdit(paciente)} className="hover:text-emerald-700" title="Editar">
                  <Edit className="h-5 w-5" />
                </button>
                <Link to={`/pacientes/${paciente.id}`} className="hover:text-sky-600" title="Ver Detalhes">
                  <FileText className="h-5 w-5" />
                </Link>
                <button onClick={() => handleDelete(paciente.id)} className="hover:text-red-600" title="Excluir">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <Button size="sm" variant="secondary" onClick={() => openAtendimento(paciente.id)}>
                <Activity className="h-4 w-4 mr-1" />
                Atender
              </Button>
            </div>
          </div>
        ))}
      </div>

      <PacienteFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        initialData={editingPaciente}
      />

      <AtendimentoFormModal
        isOpen={!!selectedPacienteForAtendimento}
        onClose={() => setSelectedPacienteForAtendimento(undefined)}
        preSelectedPacienteId={selectedPacienteForAtendimento}
      />
    </div>
  );
};

export default PacientesListPage;

import React, { useMemo, useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import AtendimentoFormModal from '../components/Atendimentos/AtendimentoFormModal';
import { formatDateTime } from '../utils/dateHelpers';
import { Plus, Edit, Trash2, ClipboardPlus, UserCheck2, Clock3 } from 'lucide-react';
import { Atendimento } from '../types';
import AvaliacaoModal from '../components/Prontuario/AvaliacaoModal';
import EvolucaoModal from '../components/Prontuario/EvolucaoModal';

const AtendimentosPage: React.FC = () => {
  const { state, deleteAtendimento, addAvaliacaoFisio, addAvaliacaoTO, addEvolucaoFisio, addEvolucaoTO } = useClinicData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);
  const [openAvalFisio, setOpenAvalFisio] = useState(false);
  const [openAvalTO, setOpenAvalTO] = useState(false);
  const [openEvoFisio, setOpenEvoFisio] = useState(false);
  const [openEvoTO, setOpenEvoTO] = useState(false);
  const [pacienteFiltroProgresso, setPacienteFiltroProgresso] = useState<string>('all');

  const getPacienteName = (id: string) => state.pacientes.find(p => p.id === id)?.nome || 'Desconhecido';
  const getProfissionalName = (id: string) => state.profissionais.find(p => p.id === id)?.nome || 'Desconhecido';

  const sortedAtendimentos = useMemo(() =>
    [...state.atendimentos].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()),
    [state.atendimentos]
  );

  const progressoPacientes = useMemo(() => {
    const realizadosPorPaciente = state.atendimentos.reduce<Record<string, number>>((acc, a) => {
      if (a.status === 'Realizado') acc[a.pacienteId] = (acc[a.pacienteId] || 0) + 1;
      return acc;
    }, {});
    const ultimoAtendimentoPorPaciente = state.atendimentos.reduce<Record<string, number>>((acc, a) => {
      const ts = new Date(a.dataHora).getTime();
      acc[a.pacienteId] = Math.max(acc[a.pacienteId] || 0, ts);
      return acc;
    }, {});

    const lista = state.pacientes.map((p) => ({
      ...p,
      progresso: Math.min(100, (realizadosPorPaciente[p.id] || 0) * 20),
      sessions: realizadosPorPaciente[p.id] || 0,
      ultimo: ultimoAtendimentoPorPaciente[p.id] || 0,
    }));

    const filtrada = pacienteFiltroProgresso === 'all'
      ? lista
      : lista.filter((p) => p.id === pacienteFiltroProgresso);

    return filtrada.sort((a, b) => b.ultimo - a.ultimo);
  }, [state.pacientes, state.atendimentos, pacienteFiltroProgresso]);

  const handleOpenNew = () => {
    setEditingAtendimento(null);
    setIsModalOpen(true);
  };

  const handleEdit = (atendimento: Atendimento) => {
    setEditingAtendimento(atendimento);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja remover este atendimento?')) return;
    try {
      await deleteAtendimento(id);
    } catch (error) {
      console.error('Failed to delete atendimento', error);
      alert('Nao foi possivel excluir. Verifique sua permissao ou tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-sky-100 to-white border border-emerald-50 p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-sky-200 blur-3xl opacity-60 pointer-events-none" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700 bg-white/70 px-3 py-1 rounded-full shadow-sm">Atendimentos</p>
            <h1 className="text-3xl font-bold text-slate-900">Central de atendimentos</h1>
            <p className="text-slate-600 text-sm">Agende, acompanhe e evolua pacientes com rapidez.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full lg:w-auto">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white" onClick={handleOpenNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Atendimento
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => setOpenAvalFisio(true)}>
              <ClipboardPlus className="h-4 w-4 mr-2" />
              Avaliacao Fisio
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => setOpenAvalTO(true)}>
              <ClipboardPlus className="h-4 w-4 mr-2" />
              Avaliacao TO
            </Button>
            <Button className="w-full" variant="outline" onClick={() => setOpenEvoFisio(true)}>
              Evolucao Fisio
            </Button>
            <Button className="w-full" variant="outline" onClick={() => setOpenEvoTO(true)}>
              Evolucao TO
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white shadow overflow-hidden rounded-md">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
               <span className="text-sm text-gray-500">Mostrando ultimos registros</span>
               <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                 <Clock3 className="h-4 w-4" />
                 Atualizado em tempo real
               </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {sortedAtendimentos.map((atendimento) => (
                <li key={atendimento.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary-600 truncate">
                        {getPacienteName(atendimento.pacienteId)}
                      </p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        com {getProfissionalName(atendimento.profissionalId)}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        atendimento.status === 'Realizado' ? 'bg-green-100 text-green-800' : 
                        atendimento.status === 'Agendado' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {atendimento.status}
                      </span>
                      <button className="text-gray-400 hover:text-blue-600" onClick={() => handleEdit(atendimento)} title="Editar atendimento">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600" onClick={() => handleDelete(atendimento.id)} title="Excluir atendimento">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {atendimento.tipo}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>{formatDateTime(atendimento.dataHora)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">Progresso de pacientes</h3>
              <span className="inline-flex items-center text-xs text-slate-500 gap-1">
                <UserCheck2 className="h-4 w-4 text-emerald-600" /> Evolucao</span>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Filtrar paciente</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                value={pacienteFiltroProgresso}
                onChange={(e) => setPacienteFiltroProgresso(e.target.value)}
              >
                <option value="all">Todos</option>
                {state.pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {progressoPacientes.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum paciente com atendimentos.</p>
              ) : (
                progressoPacientes.map((p) => (
                  <div key={p.id} className="p-3 rounded-md border border-slate-100 bg-slate-50">
                    <div className="flex justify-between text-sm font-medium text-slate-800">
                      <span>{p.nome}</span>
                      <span>{p.progresso}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all"
                        style={{ width: `${p.progresso}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.sessions} sessoes registradas</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AtendimentoFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAtendimento(null); }}
        initialData={editingAtendimento}
      />

      <AvaliacaoModal
        isOpen={openAvalFisio}
        onClose={() => setOpenAvalFisio(false)}
        pacientes={state.pacientes}
        profissionais={state.profissionais}
        tipo="fisio"
        onSave={addAvaliacaoFisio}
      />
      <AvaliacaoModal
        isOpen={openAvalTO}
        onClose={() => setOpenAvalTO(false)}
        pacientes={state.pacientes}
        profissionais={state.profissionais}
        tipo="to"
        onSave={addAvaliacaoTO}
      />
      <EvolucaoModal
        isOpen={openEvoFisio}
        onClose={() => setOpenEvoFisio(false)}
        pacientes={state.pacientes}
        profissionais={state.profissionais}
        tipo="fisio"
        onSave={addEvolucaoFisio}
      />
      <EvolucaoModal
        isOpen={openEvoTO}
        onClose={() => setOpenEvoTO(false)}
        pacientes={state.pacientes}
        profissionais={state.profissionais}
        tipo="to"
        onSave={addEvolucaoTO}
      />
    </div>
  );
};

export default AtendimentosPage;

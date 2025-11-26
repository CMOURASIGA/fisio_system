import React, { useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import AtendimentoFormModal from '../components/Atendimentos/AtendimentoFormModal';
import { formatDateTime } from '../utils/dateHelpers';
import { Plus, Edit, Trash2, ClipboardPlus } from 'lucide-react';
import { Atendimento } from '../types';
import AvaliacaoModal from '../components/Prontuario/AvaliacaoModal';
import EvolucaoModal from '../components/Prontuario/EvolucaoModal';

const AtendimentosPage: React.FC = () => {
  const { state, deleteAtendimento } = useClinicData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);
  const [openAvalFisio, setOpenAvalFisio] = useState(false);
  const [openAvalTO, setOpenAvalTO] = useState(false);
  const [openEvoFisio, setOpenEvoFisio] = useState(false);
  const [openEvoTO, setOpenEvoTO] = useState(false);
  const { addAvaliacaoFisio, addAvaliacaoTO, addEvolucaoFisio, addEvolucaoTO } = useClinicData();

  const getPacienteName = (id: string) => state.pacientes.find(p => p.id === id)?.nome || 'Desconhecido';
  const getProfissionalName = (id: string) => state.profissionais.find(p => p.id === id)?.nome || 'Desconhecido';

  const sortedAtendimentos = [...state.atendimentos].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
        <div className="flex space-x-2">
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Atendimento
          </Button>
          <Button variant="secondary" onClick={() => setOpenAvalFisio(true)}>
            <ClipboardPlus className="h-4 w-4 mr-2" />
            Avaliação Fisio
          </Button>
          <Button variant="secondary" onClick={() => setOpenAvalTO(true)}>
            <ClipboardPlus className="h-4 w-4 mr-2" />
            Avaliação TO
          </Button>
          <Button variant="outline" onClick={() => setOpenEvoFisio(true)}>
            Evolução Fisio
          </Button>
          <Button variant="outline" onClick={() => setOpenEvoTO(true)}>
            Evolução TO
          </Button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-md">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
           <span className="text-sm text-gray-500">Mostrando ultimos registros</span>
           <div />
        </div>
        <ul className="divide-y divide-gray-200">
          {sortedAtendimentos.map((atendimento) => (
            <li key={atendimento.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600 truncate">
                    {getPacienteName(atendimento.pacienteId)}
                  </p>
                  <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                    com {getProfissionalName(atendimento.profissionalId)}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    atendimento.status === 'Realizado' ? 'bg-green-100 text-green-800' : 
                    atendimento.status === 'Agendado' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {atendimento.status}
                  </p>
                  <button className="ml-2 text-gray-400 hover:text-blue-600" onClick={() => handleEdit(atendimento)} title="Editar atendimento">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="ml-2 text-gray-400 hover:text-red-600" onClick={() => handleDelete(atendimento.id)} title="Excluir atendimento">
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
                  <p>
                    {formatDateTime(atendimento.dataHora)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
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

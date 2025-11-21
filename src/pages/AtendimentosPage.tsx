import React, { useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import AtendimentoFormModal from '../components/Atendimentos/AtendimentoFormModal';
import { formatDateTime } from '../utils/dateHelpers';
import { Plus, Filter, Edit, Trash2 } from 'lucide-react';
import { Atendimento } from '../types';

const AtendimentosPage: React.FC = () => {
  const { state, deleteAtendimento } = useClinicData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('todos');
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);

  const getPacienteName = (id: string) => state.pacientes.find(p => p.id === id)?.nome || 'Desconhecido';
  const getProfissionalName = (id: string) => state.profissionais.find(p => p.id === id)?.nome || 'Desconhecido';

  const filteredAtendimentos = state.atendimentos.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

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
      alert('Não foi possível excluir. Verifique sua permissão ou tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
        <Button onClick={handleOpenNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Atendimento
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-md">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
           <span className="text-sm text-gray-500">Mostrando últimos registros</span>
           <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
             <Filter className="h-4 w-4 mr-1" /> Filtrar
           </button>
        </div>
        <ul className="divide-y divide-gray-200">
          {filteredAtendimentos.map((atendimento) => (
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
    </div>
  );
};

export default AtendimentosPage;

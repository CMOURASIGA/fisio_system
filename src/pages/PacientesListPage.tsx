import React, { useState } from 'react';
import { Search, UserPlus, Edit, FileText, Activity, Trash2 } from 'lucide-react';
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

  const filteredPacientes = state.pacientes.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.cpf && p.cpf.includes(searchTerm))
  );

  const handleSave = async (data: Omit<Paciente, 'id' | 'created_at' | 'clinica_id'>) => {
    try {
      if (editingPaciente) {
        await updatePaciente({ ...editingPaciente, ...data });
      } else {
        await addPaciente(data);
      }
      setIsFormOpen(false);
      setEditingPaciente(null);
    } catch (error) {
      console.error("Failed to save paciente", error);
      // Here you could show an error message to the user
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este paciente?")) {
      try {
        await deletePaciente(id);
      } catch (error) {
        console.error("Failed to delete paciente", error);
        // Here you could show an error message to the user
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
        <Button onClick={openNew}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPacientes.map((paciente) => (
          <div key={paciente.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                {paciente.nome.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{paciente.nome}</h3>
                <p className="text-sm text-gray-500">
                  {calculateAge(paciente.data_nascimento)} anos • {paciente.sexo}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">CPF: {paciente.cpf}</div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                paciente.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {paciente.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
               <div className="flex space-x-2">
                 <button onClick={() => openEdit(paciente)} className="text-gray-400 hover:text-blue-600" title="Editar">
                   <Edit className="h-5 w-5" />
                 </button>
                 <Link to={`/pacientes/${paciente.id}`} className="text-gray-400 hover:text-primary-600" title="Ver Detalhes">
                   <FileText className="h-5 w-5" />
                 </Link>
                 <button onClick={() => handleDelete(paciente.id)} className="text-gray-400 hover:text-red-600" title="Excluir">
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

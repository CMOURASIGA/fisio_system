import React, { useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import ProfissionalFormModal from '../components/Profissionais/ProfissionalFormModal';
import { Profissional } from '../types';
import { Plus, Mail, User, Edit, Trash2 } from 'lucide-react';

const ProfissionaisPage: React.FC = () => {
  const { state, addProfissional, updateProfissional, deleteProfissional } = useClinicData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);

  const handleSave = async (data: Omit<Profissional, 'id' | 'created_at' | 'clinica_id'>) => {
    try {
      if (editingProfissional) {
        await updateProfissional({ ...editingProfissional, ...data });
      } else {
        await addProfissional(data);
      }
      setIsModalOpen(false);
      setEditingProfissional(null);
    } catch (error) {
      console.error("Failed to save profissional", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este profissional?")) {
      try {
        await deleteProfissional(id);
      } catch (error) {
        console.error("Failed to delete profissional", error);
      }
    }
  };

  const openEdit = (prof: Profissional) => {
    setEditingProfissional(prof);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingProfissional(null);
    setIsModalOpen(true);
  };

  if (state.loading) {
    return <div>Carregando profissionais...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-500 text-sm">Gerenciamento da equipe clínica.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo Profissional
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {state.profissionais.map((prof) => (
          <div key={prof.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{prof.nome}</h3>
                  <p className="text-sm text-primary-600">{prof.funcao}</p>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Mail className="h-3 w-3 mr-1" /> {prof.email}
                  </div>
                  {prof.crefito && <p className="text-xs text-gray-400 mt-1">CREFITO: {prof.crefito}</p>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openEdit(prof)} className="text-gray-400 hover:text-blue-600" title="Editar">
                  <Edit className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(prof.id)} className="text-gray-400 hover:text-red-600" title="Excluir">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProfissionalFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingProfissional}
      />
    </div>
  );
};

export default ProfissionaisPage;

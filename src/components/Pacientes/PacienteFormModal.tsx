import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import { Paciente, PacienteStatus, Sexo } from '../../types';
import { OPCOES_SEXO } from '../../constants';
import { maskCPF, maskPhone } from '../../utils/maskUtils';

interface PacienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Paciente, 'id' | 'created_at' | 'criado_por'>) => Promise<void>;
  initialData?: Paciente | null;
}

const PacienteFormModal: React.FC<PacienteFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    observacoes: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nome: initialData.nome,
          data_nascimento: initialData.data_nascimento,
          sexo: initialData.sexo,
          cpf: initialData.cpf,
          telefone: initialData.telefone || '',
          email: initialData.email || '',
          endereco: initialData.endereco || '',
          observacoes: initialData.observacoes || ''
        });
      } else {
        setFormData({
          nome: '',
          data_nascimento: '',
          sexo: Sexo.PREFERE_NAO,
          cpf: '',
          telefone: '',
          email: '',
          endereco: '',
          observacoes: ''
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    if (name === 'cpf') finalValue = maskCPF(value);
    if (name === 'telefone') finalValue = maskPhone(value);

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      sexo: formData.sexo as Sexo,
      status: initialData ? initialData.status : PacienteStatus.ATIVO
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Editar Paciente' : 'Novo Paciente'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome Completo *"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Data de Nascimento *"
            type="date"
            name="data_nascimento"
            value={formData.data_nascimento}
            onChange={handleChange}
            required
          />
          <Select
            label="Sexo *"
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            options={OPCOES_SEXO.map(s => ({ label: s, value: s }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CPF *"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            required
            maxLength={14}
          />
          <Input
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
        </div>

        <Input
          label="E-mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          label="Endereço Completo"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações Clínicas Iniciais</label>
          <textarea
            name="observacoes"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
            value={formData.observacoes}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PacienteFormModal;

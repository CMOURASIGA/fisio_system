import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import { Profissional, UserRole } from '../../types';
import { OPCOES_FUNCAO } from '../../constants';

interface ProfissionalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Profissional, 'id' | 'created_at' | 'clinica_id'>) => Promise<void>;
  initialData?: Profissional | null;
}

const ProfissionalFormModal: React.FC<ProfissionalFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    crefito: '',
    funcao: UserRole.FISIOTERAPEUTA
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nome: initialData.nome,
          email: initialData.email,
          telefone: initialData.telefone || '',
          crefito: initialData.crefito || '',
          funcao: initialData.funcao,
        });
      } else {
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          crefito: '',
          funcao: UserRole.FISIOTERAPEUTA,
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...formData, funcao: formData.funcao as UserRole });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Editar Profissional' : 'Novo Profissional'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome Completo *" name="nome" value={formData.nome} onChange={handleChange} required />
        <Input label="E-mail *" type="email" name="email" value={formData.email} onChange={handleChange} required />
        <Input label="Telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
        <Input label="CREFITO" name="crefito" value={formData.crefito} onChange={handleChange} />
        <Select 
          label="Função *" 
          name="funcao"
          value={formData.funcao} 
          onChange={handleChange} 
          options={OPCOES_FUNCAO.map(f => ({ label: f, value: f }))} 
        />
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{initialData ? 'Salvar Alterações' : 'Cadastrar'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfissionalFormModal;

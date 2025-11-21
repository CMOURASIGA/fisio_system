import React from 'react';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

const ConfiguracoesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Dados da Clínica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome da Clínica" defaultValue="Fisio System Clínica" disabled />
          <Input label="CNPJ" defaultValue="00.000.000/0001-00" disabled />
          <Input label="Endereço" defaultValue="Av. Paulista, 1000 - São Paulo, SP" disabled />
          <Input label="Telefone" defaultValue="(11) 3333-4444" disabled />
        </div>
        <div className="mt-4 flex justify-end">
           <Button variant="outline" disabled>Salvar Alterações</Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Preferências</h3>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="darkMode" className="rounded text-primary-600 focus:ring-primary-500" />
          <label htmlFor="darkMode" className="text-gray-700">Ativar modo escuro (em breve)</label>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracoesPage;
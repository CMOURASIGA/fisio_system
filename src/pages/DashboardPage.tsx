import React, { useState } from 'react';
import { Users, Activity, ClipboardList } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import ProfissionalFormModal from '../components/Profissionais/ProfissionalFormModal';
import { UserRole } from '../types';

const DashboardPage: React.FC = () => {
  const { state, addProfissional } = useClinicData();
  const [isProfModalOpen, setIsProfModalOpen] = useState(false);

  const activePatients = state.pacientes.filter(p => p.status === 'Ativo').length;
  const appointmentsToday = state.atendimentos.filter(a => {
    const date = new Date(a.dataHora);
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }).length;

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="bg-white overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-10 w-10 ${color}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
              <dd>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className="text-green-700 font-medium">{subtitle}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">Visão geral do sistema de fisioterapia.</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={() => setIsProfModalOpen(true)}>
            Cadastrar Profissional
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard 
          title="Pacientes Ativos" 
          value={activePatients} 
          subtitle="+12% vs mês anterior" 
          icon={Users} 
          color="text-blue-500" 
        />
        <StatCard 
          title="Atendimentos Hoje" 
          value={appointmentsToday} 
          subtitle="+5% vs semana anterior" 
          icon={ClipboardList} 
          color="text-green-500" 
        />
        <StatCard 
          title="Reavaliações Pendentes" 
          value="3" 
          subtitle="Agendar prioridade" 
          icon={Activity} 
          color="text-orange-500" 
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Atendimentos Recentes</h3>
        {state.atendimentos.length === 0 ? (
          <p className="text-gray-500">Nenhum atendimento registrado.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {state.atendimentos.slice(0, 5).map(atendimento => {
               const paciente = state.pacientes.find(p => p.id === atendimento.pacienteId);
               return (
                 <li key={atendimento.id} className="py-4 flex justify-between">
                   <div>
                      <p className="text-sm font-medium text-gray-900">{paciente?.nome || 'Paciente desconhecido'}</p>
                      <p className="text-sm text-gray-500">{atendimento.tipo}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(atendimento.dataHora).toLocaleDateString('pt-BR')}</p>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {atendimento.status}
                      </span>
                   </div>
                 </li>
               )
            })}
          </ul>
        )}
      </div>

      <ProfissionalFormModal 
        isOpen={isProfModalOpen} 
        onClose={() => setIsProfModalOpen(false)}
        onSave={(prof) => addProfissional({ ...prof, funcao: prof.funcao as UserRole })}
      />
    </div>
  );
};

export default DashboardPage;
import React, { useMemo, useState } from 'react';
import { Users, Activity, ClipboardList, UserCog } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import ProfissionalFormModal from '../components/Profissionais/ProfissionalFormModal';
import { AtendimentoStatus, AtendimentoTipo, UserRole } from '../types';

const DashboardPage: React.FC = () => {
  const { state, addProfissional } = useClinicData();
  const [isProfModalOpen, setIsProfModalOpen] = useState(false);

  const activePatients = state.pacientes.filter((p) => p.status === 'Ativo').length;

  const appointmentsToday = useMemo(() => {
    const today = new Date();
    return state.atendimentos.filter((a) => {
      const date = new Date(a.dataHora);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [state.atendimentos]);

  const agendasPendentes = useMemo(() => {
    // Contabiliza atendimentos agendados (qualquer tipo) ainda não realizados
    return state.atendimentos.filter((a) => a.status === AtendimentoStatus.AGENDADO).length;
  }, [state.atendimentos]);

  const sortedAtendimentos = useMemo(
    () => [...state.atendimentos].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()),
    [state.atendimentos]
  );

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
          <p className="mt-1 text-sm text-gray-500">Visao geral do sistema de fisioterapia.</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={() => setIsProfModalOpen(true)}>Cadastrar Profissional</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <StatCard
          title="Pacientes Ativos"
          value={activePatients}
          subtitle='Status "Ativo" na base'
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Atendimentos Hoje"
          value={appointmentsToday}
          subtitle="Agendados/realizados no dia"
          icon={ClipboardList}
          color="text-green-500"
        />
        <StatCard
          title="Agendas Pendentes"
          value={agendasPendentes}
          subtitle="Avaliacoes/agendamentos com status Agendado"
          icon={Activity}
          color="text-orange-500"
        />
        <StatCard
          title="Profissionais"
          value={state.profissionais.length}
          subtitle="Total cadastrados"
          icon={UserCog}
          color="text-purple-500"
        />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Atendimentos Recentes</h3>
        {sortedAtendimentos.length === 0 ? (
          <p className="text-gray-500">Nenhum atendimento registrado.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {sortedAtendimentos.slice(0, 5).map((atendimento) => {
              const paciente = state.pacientes.find((p) => p.id === atendimento.pacienteId);
              const profissional = state.profissionais.find((p) => p.id === atendimento.profissionalId);
              return (
                <li key={atendimento.id} className="py-4 flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{paciente?.nome || 'Paciente desconhecido'}</p>
                    <p className="text-sm text-gray-500">{atendimento.tipo}</p>
                    <p className="text-xs text-gray-400">Profissional: {profissional?.nome || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(atendimento.dataHora).toLocaleDateString('pt-BR')}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        atendimento.status === AtendimentoStatus.REALIZADO
                          ? 'bg-green-100 text-green-800'
                          : atendimento.status === AtendimentoStatus.AGENDADO
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {atendimento.status}
                    </span>
                  </div>
                </li>
              );
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

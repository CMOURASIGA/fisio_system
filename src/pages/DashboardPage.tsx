import React, { useMemo, useState } from 'react';
import { Users, Activity, ClipboardList, UserCog, Clock3, Sparkles } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import ProfissionalFormModal from '../components/Profissionais/ProfissionalFormModal';
import { AtendimentoStatus, UserRole } from '../types';

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
    return state.atendimentos.filter((a) => a.status === AtendimentoStatus.AGENDADO).length;
  }, [state.atendimentos]);

  const sortedAtendimentos = useMemo(
    () => [...state.atendimentos].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()),
    [state.atendimentos]
  );

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="bg-white/80 backdrop-blur-sm border border-teal-50 overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-100 to-sky-100 flex items-center justify-center">
          <Icon className={`h-7 w-7 ${color}`} />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          <p className="text-xs text-teal-700 mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  const patientProgress = useMemo(() => {
    const realizadosPorPaciente = state.atendimentos.reduce<Record<string, number>>((acc, a) => {
      if (a.status === AtendimentoStatus.REALIZADO) acc[a.pacienteId] = (acc[a.pacienteId] || 0) + 1;
      return acc;
    }, {});
    return state.pacientes
      .map((p) => ({
        ...p,
        progresso: Math.min(100, (realizadosPorPaciente[p.id] || 0) * 20),
        sessions: realizadosPorPaciente[p.id] || 0,
      }))
      .sort((a, b) => b.progresso - a.progresso)
      .slice(0, 3);
  }, [state.pacientes, state.atendimentos]);

  const proximosAtendimentos = useMemo(() => {
    return state.atendimentos
      .filter((a) => a.status === AtendimentoStatus.AGENDADO)
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
      .slice(0, 5);
  }, [state.atendimentos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="relative overflow-hidden flex-1 rounded-2xl bg-gradient-to-br from-teal-100 via-sky-100 to-white border border-teal-50 p-6">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.3),_transparent_50%)] pointer-events-none" />
          <div className="relative flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard vivo e centrado no paciente</h1>
            <p className="text-slate-600 max-w-2xl">
              Acompanhe rapidamente o progresso dos pacientes, proximos compromissos e conquistas da equipe.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white shadow px-5 py-2"
            onClick={() => setIsProfModalOpen(true)}
          >
            Novo Profissional
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <StatCard
          title="Pacientes Ativos"
          value={activePatients}
          subtitle='Status "Ativo" na base'
          icon={Users}
          color="text-teal-700"
        />
        <StatCard
          title="Atendimentos Hoje"
          value={appointmentsToday}
          subtitle="Agendados/realizados no dia"
          icon={ClipboardList}
          color="text-sky-700"
        />
        <StatCard
          title="Agendas Pendentes"
          value={agendasPendentes}
          subtitle="Avaliacoes agendadas"
          icon={Activity}
          color="text-amber-600"
        />
        <StatCard
          title="Profissionais"
          value={state.profissionais.length}
          subtitle="Total cadastrados"
          icon={UserCog}
          color="text-indigo-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white/80 rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-900">Progresso de pacientes</h3>
            <Sparkles className="h-4 w-4 text-teal-600" />
          </div>
          {patientProgress.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum atendimento concluido ainda.</p>
          ) : (
            <div className="space-y-3">
              {patientProgress.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
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
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/80 rounded-xl border border-slate-100 shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-teal-600" /> Timeline do dia
            </h3>
            <span className="text-xs text-slate-500">Proximos atendimentos</span>
          </div>
          {proximosAtendimentos.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum atendimento agendado.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {proximosAtendimentos.map((atendimento) => {
                const paciente = state.pacientes.find((p) => p.id === atendimento.pacienteId);
                const profissional = state.profissionais.find((p) => p.id === atendimento.profissionalId);
                return (
                  <li key={atendimento.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{paciente?.nome || 'Paciente'}</p>
                      <p className="text-xs text-slate-500">{atendimento.tipo} - {profissional?.nome || 'Profissional'}</p>
                    </div>
                    <div className="text-right text-sm text-slate-600">
                      <p>{new Date(atendimento.dataHora).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-teal-600 font-semibold">Missao do dia</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white/80 shadow-sm border border-slate-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Atendimentos Recentes</h3>
        {sortedAtendimentos.length === 0 ? (
          <p className="text-slate-500">Nenhum atendimento registrado.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sortedAtendimentos.slice(0, 5).map((atendimento) => {
              const paciente = state.pacientes.find((p) => p.id === atendimento.pacienteId);
              const profissional = state.profissionais.find((p) => p.id === atendimento.profissionalId);
              return (
                <li key={atendimento.id} className="py-4 flex justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{paciente?.nome || 'Paciente desconhecido'}</p>
                    <p className="text-sm text-slate-500">{atendimento.tipo}</p>
                    <p className="text-xs text-slate-400">Profissional: {profissional?.nome || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{new Date(atendimento.dataHora).toLocaleDateString('pt-BR')}</p>
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

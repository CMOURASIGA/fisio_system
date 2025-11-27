import React, { useMemo, useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { formatTime } from '../utils/dateHelpers';
import AtendimentoFormModal from '../components/Atendimentos/AtendimentoFormModal';
import { AtendimentoStatus } from '../types';

const AgendaPage: React.FC = () => {
  const { state, updateAtendimento } = useClinicData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaults, setModalDefaults] = useState<{ date?: string; time?: string }>({});
  const [editingAtendimento, setEditingAtendimento] = useState<any | null>(null);

  const getPacienteName = (id: string) => state.pacientes.find((p) => p.id === id)?.nome || 'Desconhecido';
  const getProfName = (id: string) => state.profissionais.find((p) => p.id === id)?.nome || '-';

  const dayAppointments = useMemo(() => {
    return state.atendimentos
      .filter((a) => {
        const d = new Date(a.dataHora);
        return (
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      })
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
  }, [state.atendimentos, selectedDate]);

  const weekDays = useMemo(() => {
    const base = new Date(selectedDate);
    const day = (base.getDay() + 6) % 7; // start Monday
    base.setDate(base.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const last = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const leading = (first.getDay() + 6) % 7; // align monday
    const days = [] as (Date | null)[];
    for (let i = 0; i < leading; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d));
    }
    return days;
  }, [selectedDate]);

  const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8); // 8h to 18h

  const openNewForSlot = (hour: number, dateObj?: Date) => {
    const base = dateObj || selectedDate;
    const dateStr = base.toISOString().split('T')[0];
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    setModalDefaults({ date: dateStr, time: timeStr });
    setEditingAtendimento(null);
    setIsModalOpen(true);
  };

  const openEdit = (atendimento: any) => {
    const d = new Date(atendimento.dataHora);
    setModalDefaults({
      date: d.toISOString().split('T')[0],
      time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
    });
    setEditingAtendimento(atendimento);
    setIsModalOpen(true);
  };

  const attendNow = (atendimento: any) => {
    const d = new Date(atendimento.dataHora);
    setModalDefaults({
      date: d.toISOString().split('T')[0],
      time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
    });
    setEditingAtendimento({ ...atendimento, status: AtendimentoStatus.REALIZADO });
    setIsModalOpen(true);
  };

  const updateStatus = async (atendimentoId: string, status: AtendimentoStatus) => {
    const appt = state.atendimentos.find((a) => a.id === atendimentoId);
    if (!appt) return;
    try {
      await updateAtendimento({ ...appt, status });
    } catch (err) {
      console.error('Falha ao atualizar status da agenda', err);
      alert('Nao foi possivel atualizar o status do atendimento.');
    }
  };

  const shiftDate = (delta: number) => {
    const d = new Date(selectedDate);
    if (viewMode === 'day') d.setDate(d.getDate() + delta);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7 * delta);
    else d.setMonth(d.getMonth() + delta);
    setSelectedDate(d);
  };

  const displayDateLabel = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    if (viewMode === 'week') {
      const first = weekDays[0];
      const last = weekDays[6];
      return `${first.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${last.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const renderDaySlots = (dateRef: Date, appointments: any[]) => (
    <div className="divide-y divide-gray-200">
      {timeSlots.map((hour) => {
        const slotLabel = `${hour.toString().padStart(2, '0')}:00`;
        const appt = appointments.find((a) => {
          const d = new Date(a.dataHora);
          return d.getHours() === hour;
        });

        return (
          <div key={`${dateRef.toISOString()}-${hour}`} className="flex group min-h-[80px]">
            <div className="w-20 flex-shrink-0 border-r border-gray-100 p-4 text-sm text-gray-500 font-medium bg-gray-50">
              {slotLabel}
            </div>
            <div className="flex-1 p-2 relative">
              {appt ? (
                <div
                  className={`absolute inset-2 rounded border-l-4 p-2 text-sm ${
                    appt.status === 'Realizado' ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="font-semibold text-gray-900 flex items-center justify-between">
                    <span>{getPacienteName(appt.pacienteId)}</span>
                    <button
                      className="text-gray-400 hover:text-blue-600"
                      onClick={() => openEdit(appt)}
                      title="Editar"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-gray-600">
                    {appt.tipo} - {formatTime(appt.dataHora)}
                  </div>
                  <div className="text-xs text-gray-500">Profissional: {getProfName(appt.profissionalId)}</div>
                  <div className="mt-2">
                    <select
                      value={appt.status}
                      onChange={(e) => updateStatus(appt.id, e.target.value as AtendimentoStatus)}
                      className="text-xs border-gray-300 rounded px-2 py-1"
                    >
                      {Object.values(AtendimentoStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  {appt.status !== AtendimentoStatus.REALIZADO && (
                    <div className="mt-2">
                      <Button size="sm" variant="secondary" onClick={() => attendNow(appt)}>
                        Atender agora
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="h-full w-full group-hover:bg-gray-50 cursor-pointer flex items-center justify-center text-transparent group-hover:text-gray-400 text-sm"
                  onClick={() => openNewForSlot(hour, dateRef)}
                >
                  + Disponivel
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm font-medium ${
                  viewMode === mode ? 'bg-primary-50 text-primary-700' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft />
            </button>
            <span className="font-medium text-lg capitalize">
              {displayDateLabel()}
            </span>
            <button onClick={() => shiftDate(1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight />
            </button>
          </div>
          <Button onClick={() => openNewForSlot(Math.max(selectedDate.getHours(), 8))}>Agendar</Button>
        </div>
      </div>

      {viewMode === 'day' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {renderDaySlots(selectedDate, dayAppointments)}
        </div>
      )}

      {viewMode === 'week' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-x divide-gray-100">
            {weekDays.map((d) => {
              const appts = state.atendimentos
                .filter((a) => {
                  const ad = new Date(a.dataHora);
                  return ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
                })
                .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
              return (
                <div key={d.toISOString()} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-800">{d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedDate(d); setViewMode('day'); }}>
                      Ver dia
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {appts.length === 0 ? (
                      <p className="text-xs text-slate-500">Sem atendimentos</p>
                    ) : (
                      appts.map((a) => (
                        <div key={a.id} className="p-2 rounded border border-gray-100 bg-gray-50 text-xs">
                          <div className="font-semibold text-slate-800">{formatTime(a.dataHora)} · {getPacienteName(a.pacienteId)}</div>
                          <div className="text-slate-600">{a.tipo}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-7 gap-2 text-sm font-semibold text-slate-700 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-sm">
            {monthDays.map((d, idx) => {
              if (!d) return <div key={`empty-${idx}`} />;
              const count = state.atendimentos.filter((a) => {
                const ad = new Date(a.dataHora);
                return ad.getDate() === d.getDate() && ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
              }).length;
              return (
                <div
                  key={d.toISOString()}
                  className="min-h-[80px] rounded border border-gray-100 p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => { setSelectedDate(d); setViewMode('day'); }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{d.getDate()}</span>
                    {count > 0 && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{count}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AtendimentoFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAtendimento(null);
        }}
        initialData={editingAtendimento}
        defaultDate={modalDefaults.date}
        defaultTime={modalDefaults.time}
        defaultStatus={editingAtendimento ? editingAtendimento.status : AtendimentoStatus.AGENDADO}
      />
    </div>
  );
};

export default AgendaPage;

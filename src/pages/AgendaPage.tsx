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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaults, setModalDefaults] = useState<{ date?: string; time?: string }>({});
  const [editingAtendimento, setEditingAtendimento] = useState<any | null>(null);

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

  const getPacienteName = (id: string) => state.pacientes.find((p) => p.id === id)?.nome || 'Desconhecido';
  const getProfName = (id: string) => state.profissionais.find((p) => p.id === id)?.nome || '-';

  const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8); // 8h to 18h

  const openNewForSlot = (hour: number) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
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

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <div className="flex items-center space-x-4">
          <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft />
          </button>
          <span className="font-medium text-lg capitalize">
            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight />
          </button>
        </div>
        <Button onClick={() => openNewForSlot(Math.max(selectedDate.getHours(), 8))}>Agendar</Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {timeSlots.map((hour) => {
            const slotLabel = `${hour.toString().padStart(2, '0')}:00`;
            const appt = dayAppointments.find((a) => {
              const d = new Date(a.dataHora);
              return d.getHours() === hour;
            });

            return (
              <div key={hour} className="flex group min-h-[80px]">
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
                        {appt.tipo} · {formatTime(appt.dataHora)}
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
                      onClick={() => openNewForSlot(hour)}
                    >
                      + Disponivel
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

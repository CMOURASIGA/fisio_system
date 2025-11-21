import React, { useState } from 'react';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTime } from '../utils/dateHelpers';

const AgendaPage: React.FC = () => {
  const { state } = useClinicData();
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Filter appointments for selected date
  const dayAppointments = state.atendimentos.filter(a => {
    const d = new Date(a.dataHora);
    return d.getDate() === selectedDate.getDate() &&
           d.getMonth() === selectedDate.getMonth() &&
           d.getFullYear() === selectedDate.getFullYear();
  }).sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

  const getPacienteName = (id: string) => state.pacientes.find(p => p.id === id)?.nome || 'Desconhecido';

  const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8); // 8h to 18h

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <div className="flex items-center space-x-4">
          <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
          <span className="font-medium text-lg capitalize">
            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
        </div>
        <Button>Agendar</Button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {timeSlots.map(hour => {
            const slotLabel = `${hour.toString().padStart(2, '0')}:00`;
            const appt = dayAppointments.find(a => {
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
                     <div className={`absolute inset-2 rounded border-l-4 p-2 text-sm ${
                       appt.status === 'Realizado' ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'
                     }`}>
                        <div className="font-semibold text-gray-900">{getPacienteName(appt.pacienteId)}</div>
                        <div className="text-gray-600">{appt.tipo} • {formatTime(appt.dataHora)}</div>
                     </div>
                   ) : (
                     <div className="h-full w-full group-hover:bg-gray-50 cursor-pointer flex items-center justify-center text-transparent group-hover:text-gray-400 text-sm">
                       + Disponível
                     </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;
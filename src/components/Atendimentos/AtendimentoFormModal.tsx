import React, { useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Button from '../UI/Button';
import { useClinicData } from '../../context/ClinicDataContext';
import { Atendimento, AtendimentoStatus, AtendimentoTipo } from '../../types';
import { OPCOES_TIPO_ATENDIMENTO, LOCAIS_ATENDIMENTO } from '../../constants';

interface AtendimentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPacienteId?: string;
  initialData?: Atendimento | null;
  defaultDate?: string; // YYYY-MM-DD
  defaultTime?: string; // HH:mm
  defaultStatus?: AtendimentoStatus;
}

const steps = ['Dados basicos', 'Sinais vitais', 'SOAP'];

const AtendimentoFormModal: React.FC<AtendimentoFormModalProps> = ({
  isOpen,
  onClose,
  preSelectedPacienteId,
  initialData,
  defaultDate,
  defaultTime,
  defaultStatus,
}) => {
  const { state, addAtendimento, updateAtendimento } = useClinicData();
  const [pacienteId, setPacienteId] = useState(preSelectedPacienteId || '');
  const [profissionalId, setProfissionalId] = useState('');
  const [tipo, setTipo] = useState<AtendimentoTipo>(AtendimentoTipo.AVALIACAO);
  const [local, setLocal] = useState(LOCAIS_ATENDIMENTO[0]);
  const [status, setStatus] = useState<AtendimentoStatus>(defaultStatus || AtendimentoStatus.REALIZADO);
  const [data, setData] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(
    defaultTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [currentStep, setCurrentStep] = useState(0);

  const [sinaisVitais, setSinaisVitais] = useState({
    spo2: '',
    fc: '',
    fr: '',
    paSistolica: '',
    paDiastolica: '',
    temp: '',
  });

  const [soap, setSoap] = useState({
    subjetivo: '',
    objetivo: '',
    avaliacao: '',
    plano: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(0);
    if (initialData) {
      setPacienteId(initialData.pacienteId);
      setProfissionalId(initialData.profissionalId);
      setTipo(initialData.tipo);
      setLocal(initialData.local);
      setStatus(initialData.status);
      const dateObj = new Date(initialData.dataHora);
      setData(dateObj.toISOString().split('T')[0]);
      setHora(dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setSinaisVitais({
        spo2: initialData.sinaisVitais.spo2?.toString() || '',
        fc: initialData.sinaisVitais.fc?.toString() || '',
        fr: initialData.sinaisVitais.fr?.toString() || '',
        paSistolica: initialData.sinaisVitais.paSistolica?.toString() || '',
        paDiastolica: initialData.sinaisVitais.paDiastolica?.toString() || '',
        temp: initialData.sinaisVitais.temp?.toString() || '',
      });
      setSoap({
        subjetivo: initialData.soap.subjetivo ?? '',
        objetivo: initialData.soap.objetivo ?? '',
        avaliacao: initialData.soap.avaliacao ?? '',
        plano: initialData.soap.plano ?? '',
      });
    } else {
      setPacienteId(preSelectedPacienteId || '');
      setProfissionalId('');
      setTipo(AtendimentoTipo.AVALIACAO);
      setLocal(LOCAIS_ATENDIMENTO[0]);
      setStatus(defaultStatus || AtendimentoStatus.REALIZADO);
      setData(defaultDate || new Date().toISOString().split('T')[0]);
      setHora(defaultTime || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setSinaisVitais({ spo2: '', fc: '', fr: '', paSistolica: '', paDiastolica: '', temp: '' });
      setSoap({ subjetivo: '', objetivo: '', avaliacao: '', plano: '' });
    }
  }, [isOpen, initialData, preSelectedPacienteId, defaultDate, defaultTime, defaultStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      return;
    }
    setLoading(true);
    try {
      const dataHora = new Date(`${data}T${hora}:00`).toISOString();

      const payload = {
        pacienteId,
        profissionalId,
        tipo,
        local,
        dataHora,
        status,
        sinaisVitais: {
          spo2: sinaisVitais.spo2 ? Number(sinaisVitais.spo2) : undefined,
          fc: sinaisVitais.fc ? Number(sinaisVitais.fc) : undefined,
          fr: sinaisVitais.fr ? Number(sinaisVitais.fr) : undefined,
          paSistolica: sinaisVitais.paSistolica ? Number(sinaisVitais.paSistolica) : undefined,
          paDiastolica: sinaisVitais.paDiastolica ? Number(sinaisVitais.paDiastolica) : undefined,
          temp: sinaisVitais.temp ? Number(sinaisVitais.temp) : undefined,
        },
        soap,
      };

      if (initialData) {
        await updateAtendimento({ ...initialData, ...payload });
      } else {
        await addAtendimento(payload);
      }
      onClose();
    } catch (error) {
      console.error('Failed to add atendimento:', error);
      alert('Nao foi possivel salvar o atendimento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSinaisVitais({ ...sinaisVitais, [e.target.name]: e.target.value });
  };

  const handleSoapChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSoap({ ...soap, [e.target.name]: e.target.value });
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Editar Atendimento' : 'Novo Atendimento'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          {steps.map((step, idx) => (
            <div key={step} className="flex-1 flex items-center gap-2">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                  idx <= currentStep ? 'bg-gradient-to-br from-teal-500 to-sky-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {idx + 1}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Passo {idx + 1}</p>
                <p className="text-sm font-medium text-slate-800">{step}</p>
              </div>
              {idx < steps.length - 1 && <div className={`flex-1 h-px ${idx < currentStep ? 'bg-teal-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Paciente *"
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              options={state.pacientes.map((p) => ({ label: p.nome, value: p.id }))}
              placeholder="Selecione..."
              disabled={!!preSelectedPacienteId}
              required
            />
            <Select
              label="Profissional *"
              value={profissionalId}
              onChange={(e) => setProfissionalId(e.target.value)}
              options={state.profissionais.map((p) => ({ label: p.nome, value: p.id }))}
              placeholder="Selecione..."
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" label="Data *" value={data} onChange={(e) => setData(e.target.value)} required />
              <Input type="time" label="Hora *" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Tipo *"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as AtendimentoTipo)}
                options={OPCOES_TIPO_ATENDIMENTO.map((t) => ({ label: t, value: t }))}
                required
              />
              <Select label="Local" value={local} onChange={(e) => setLocal(e.target.value)} options={LOCAIS_ATENDIMENTO.map((l) => ({ label: l, value: l }))} />
            </div>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AtendimentoStatus)}
              options={Object.values(AtendimentoStatus).map((s) => ({ label: s, value: s }))}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Sinais Vitais</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <Input label="SpO2 (%)" name="spo2" type="number" value={sinaisVitais.spo2} onChange={handleVitalChange} />
              <Input label="FC (bpm)" name="fc" type="number" value={sinaisVitais.fc} onChange={handleVitalChange} />
              <Input label="FR (ipm)" name="fr" type="number" value={sinaisVitais.fr} onChange={handleVitalChange} />
              <Input label="PAS (mmHg)" name="paSistolica" type="number" value={sinaisVitais.paSistolica} onChange={handleVitalChange} />
              <Input label="PAD (mmHg)" name="paDiastolica" type="number" value={sinaisVitais.paDiastolica} onChange={handleVitalChange} />
              <Input label="Temp (C)" name="temp" type="number" value={sinaisVitais.temp} onChange={handleVitalChange} />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Evolucao (SOAP)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Subjetivo (S)</label>
                <textarea
                  name="subjetivo"
                  value={soap.subjetivo}
                  onChange={handleSoapChange}
                  placeholder="O que o paciente relata?"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Objetivo (O)</label>
                <textarea
                  name="objetivo"
                  value={soap.objetivo}
                  onChange={handleSoapChange}
                  placeholder="O que voce observou?"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Avaliacao (A)</label>
                <textarea
                  name="avaliacao"
                  value={soap.avaliacao}
                  onChange={handleSoapChange}
                  placeholder="Interpretacao clinica"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Plano (P)</label>
                <textarea
                  name="plano"
                  value={soap.plano}
                  onChange={handleSoapChange}
                  placeholder="Condutas e tratamento"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => (currentStep > 0 ? setCurrentStep((s) => s - 1) : onClose())}>
            {currentStep === 0 ? 'Cancelar' : 'Voltar'}
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isLastStep
              ? initialData
                ? 'Salvar alteracoes'
                : status === AtendimentoStatus.AGENDADO
                ? 'Salvar agendamento'
                : 'Salvar atendimento'
              : 'Proximo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AtendimentoFormModal;

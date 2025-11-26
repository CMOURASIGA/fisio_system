import React, { useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Select from '../UI/Select';
import { Paciente, Profissional } from '../../types';

type Tipo = 'fisio' | 'to';

interface EvolucaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacientes: Paciente[];
  profissionais: Profissional[];
  tipo: Tipo;
  onSave: (data: any) => Promise<void>;
}

const EvolucaoModal: React.FC<EvolucaoModalProps> = ({ isOpen, onClose, pacientes, profissionais, tipo, onSave }) => {
  const [pacienteId, setPacienteId] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [form, setForm] = useState<Record<string, string>>({
    data_evolucao: '',
    hora_evolucao: '',
    numero_sessao: '',
    procedimentos: '',
    intercorrencias: '',
    evolucao_estado_saude: '',
    nome_fisioterapeuta: '',
    crefito_fisioterapeuta: '',
    nome_academico_estagiario: '',
    nome_terapeuta_ocupacional: '',
    crefito_terapeuta_ocupacional: '',
    nome_academico_estagiario_to: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPacienteId('');
      setProfissionalId('');
      setForm({
        data_evolucao: '',
        hora_evolucao: '',
        numero_sessao: '',
        procedimentos: '',
        intercorrencias: '',
        evolucao_estado_saude: '',
        nome_fisioterapeuta: '',
        crefito_fisioterapeuta: '',
        nome_academico_estagiario: '',
        nome_terapeuta_ocupacional: '',
        crefito_terapeuta_ocupacional: '',
        nome_academico_estagiario_to: '',
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyProfissionalDefaults = (prof: Profissional | undefined) => {
    if (!prof) return;
    if (tipo === 'fisio') {
      setForm((prev) => ({
        ...prev,
        nome_fisioterapeuta: prof.nome || prev.nome_fisioterapeuta || '',
        crefito_fisioterapeuta: prof.crefito || prev.crefito_fisioterapeuta || '',
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        nome_terapeuta_ocupacional: prof.nome || prev.nome_terapeuta_ocupacional || '',
        crefito_terapeuta_ocupacional: prof.crefito || prev.crefito_terapeuta_ocupacional || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId) return;
    setLoading(true);
    try {
      const base = {
        paciente_id: pacienteId,
        profissional_id: profissionalId || undefined,
        data_evolucao: form.data_evolucao,
        hora_evolucao: form.hora_evolucao,
        numero_sessao: form.numero_sessao ? Number(form.numero_sessao) : undefined,
        procedimentos: form.procedimentos,
        intercorrencias: form.intercorrencias,
        evolucao_estado_saude: form.evolucao_estado_saude,
      };
      if (tipo === 'fisio') {
        await onSave({
          ...base,
          nome_fisioterapeuta: form.nome_fisioterapeuta,
          crefito_fisioterapeuta: form.crefito_fisioterapeuta,
          nome_academico_estagiario: form.nome_academico_estagiario,
        });
      } else {
        await onSave({
          ...base,
          nome_terapeuta_ocupacional: form.nome_terapeuta_ocupacional,
          crefito_terapeuta_ocupacional: form.crefito_terapeuta_ocupacional,
          nome_academico_estagiario_to: form.nome_academico_estagiario_to,
        });
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar evolucao', err);
      alert('Nao foi possivel salvar a evolucao.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tipo === 'fisio' ? 'Evolucao Fisioterapia' : 'Evolucao Terapia Ocupacional'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Paciente *"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            options={pacientes.map(p => ({ label: p.nome, value: p.id }))}
            placeholder="Selecione..."
            required
          />
          <Select
            label="Profissional"
            value={profissionalId}
            onChange={(e) => {
              setProfissionalId(e.target.value);
              applyProfissionalDefaults(profissionais.find(p => p.id === e.target.value));
            }}
            options={profissionais.map(p => ({ label: p.nome, value: p.id }))}
            placeholder="Selecione..."
          />
          <Input label="Data" name="data_evolucao" type="date" value={form.data_evolucao || ''} onChange={handleChange} />
          <Input label="Hora" name="hora_evolucao" type="time" value={form.hora_evolucao || ''} onChange={handleChange} />
          <Input label="Numero da sessao" name="numero_sessao" type="number" value={form.numero_sessao || ''} onChange={handleChange} />
        </div>

        <label className="block text-sm font-medium text-gray-700">Procedimentos</label>
        <textarea name="procedimentos" value={form.procedimentos || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
        <label className="block text-sm font-medium text-gray-700">Intercorrencias</label>
        <textarea name="intercorrencias" value={form.intercorrencias || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
        <label className="block text-sm font-medium text-gray-700">Evolucao do estado de saude</label>
        <textarea name="evolucao_estado_saude" value={form.evolucao_estado_saude || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />

        {tipo === 'fisio' ? (
          <>
            <Input label="Nome fisioterapeuta" name="nome_fisioterapeuta" value={form.nome_fisioterapeuta || ''} onChange={handleChange} />
            <Input label="CREFITO" name="crefito_fisioterapeuta" value={form.crefito_fisioterapeuta || ''} onChange={handleChange} />
            <Input label="Academico/estagiario" name="nome_academico_estagiario" value={form.nome_academico_estagiario || ''} onChange={handleChange} />
          </>
        ) : (
          <>
            <Input label="Nome terapeuta ocupacional" name="nome_terapeuta_ocupacional" value={form.nome_terapeuta_ocupacional || ''} onChange={handleChange} />
            <Input label="CREFITO" name="crefito_terapeuta_ocupacional" value={form.crefito_terapeuta_ocupacional || ''} onChange={handleChange} />
            <Input label="Academico/estagiario (TO)" name="nome_academico_estagiario_to" value={form.nome_academico_estagiario_to || ''} onChange={handleChange} />
          </>
        )}

        <div className="flex justify-end space-x-2 pt-3 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={loading}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EvolucaoModal;

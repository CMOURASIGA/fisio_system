import React, { useEffect, useState } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Select from '../UI/Select';
import { Paciente, Profissional } from '../../types';

type Tipo = 'fisio' | 'to';

interface AvaliacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacientes: Paciente[];
  profissionais: Profissional[];
  tipo: Tipo;
  onSave: (data: any) => Promise<void>;
}

const AvaliacaoModal: React.FC<AvaliacaoModalProps> = ({ isOpen, onClose, pacientes, profissionais, tipo, onSave }) => {
  const [pacienteId, setPacienteId] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [form, setForm] = useState<Record<string, string>>({
    nome_completo: '',
    idade: '',
    naturalidade: '',
    estado_civil: '',
    genero: '',
    profissao: '',
    endereco_residencial: '',
    endereco_comercial: '',
    local: '',
    data_avaliacao: '',
    queixa_principal: '',
    historia_pregressa_e_atual_da_doenca: '',
    habitos_de_vida: '',
    tratamentos_realizados: '',
    antecedentes_pessoais_e_familiares: '',
    outros: '',
    exames_complementares: '',
    objetivos: '',
    qtd_atendimentos_provaveis: '',
    procedimentos: '',
    exame_clinico_fisico: '',
    diagnostico_fisioterapeutico: '',
    prognostico: '',
    nome_fisioterapeuta: '',
    crefito_fisioterapeuta: '',
    nome_academico_estagiario: '',
    exame_clinico_fisico_educacional_social: '',
    diagnostico_terapeutico_ocupacional: '',
    prognostico_terapeutico_ocupacional: '',
    nome_terapeuta_ocupacional: '',
    crefito_terapeuta_ocupacional: '',
    nome_academico_estagiario_to: '',
    assinatura_digital_fisioterapeuta: '',
    assinatura_digital_estagiario: '',
    assinatura_digital_terapeuta: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        nome_completo: '', idade: '', naturalidade: '', estado_civil: '', genero: '', profissao: '', endereco_residencial: '', endereco_comercial: '', local: '', data_avaliacao: '', queixa_principal: '', historia_pregressa_e_atual_da_doenca: '', habitos_de_vida: '', tratamentos_realizados: '', antecedentes_pessoais_e_familiares: '', outros: '', exames_complementares: '', objetivos: '', qtd_atendimentos_provaveis: '', procedimentos: '', exame_clinico_fisico: '', diagnostico_fisioterapeutico: '', prognostico: '', nome_fisioterapeuta: '', crefito_fisioterapeuta: '', nome_academico_estagiario: '', exame_clinico_fisico_educacional_social: '', diagnostico_terapeutico_ocupacional: '', prognostico_terapeutico_ocupacional: '', nome_terapeuta_ocupacional: '', crefito_terapeuta_ocupacional: '', nome_academico_estagiario_to: '', assinatura_digital_fisioterapeuta: '', assinatura_digital_estagiario: '', assinatura_digital_terapeuta: '',
      });
      setPacienteId('');
      setProfissionalId('');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyPacienteDefaults = (p: Paciente | undefined) => {
    if (!p) return;
    const ageYears = p.data_nascimento
      ? Math.floor((Date.now() - new Date(p.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : undefined;
    setForm((prev) => ({
      ...prev,
      nome_completo: prev.nome_completo || p.nome || '',
      idade: prev.idade || (ageYears !== undefined ? ageYears.toString() : ''),
      genero: prev.genero || p.sexo || '',
      endereco_residencial: prev.endereco_residencial || p.endereco || '',
    }));
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

  const toNull = (v?: string) => (v && v.trim() !== '' ? v : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId) return;
    setLoading(true);
    try {
      const base = {
        paciente_id: pacienteId,
        profissional_id: profissionalId || undefined,
        nome_completo: form.nome_completo,
        idade: form.idade ? Number(form.idade) : undefined,
        naturalidade: toNull(form.naturalidade),
        estado_civil: toNull(form.estado_civil),
        genero: toNull(form.genero),
        profissao: toNull(form.profissao),
        endereco_residencial: toNull(form.endereco_residencial),
        endereco_comercial: toNull(form.endereco_comercial),
        queixa_principal: toNull(form.queixa_principal),
        historia_pregressa_e_atual_da_doenca: toNull(form.historia_pregressa_e_atual_da_doenca),
        habitos_de_vida: toNull(form.habitos_de_vida),
        tratamentos_realizados: toNull(form.tratamentos_realizados),
        antecedentes_pessoais_e_familiares: toNull(form.antecedentes_pessoais_e_familiares),
        outros: toNull(form.outros),
        exames_complementares: toNull(form.exames_complementares),
        objetivos: toNull(form.objetivos),
        qtd_atendimentos_provaveis: toNull(form.qtd_atendimentos_provaveis),
        procedimentos: toNull(form.procedimentos),
        local: toNull(form.local),
        data_avaliacao: toNull(form.data_avaliacao),
      };

      if (tipo === 'fisio') {
        await onSave({
          ...base,
          exame_clinico_fisico: toNull(form.exame_clinico_fisico),
          diagnostico_fisioterapeutico: toNull(form.diagnostico_fisioterapeutico),
          prognostico: toNull(form.prognostico),
          nome_fisioterapeuta: toNull(form.nome_fisioterapeuta),
          crefito_fisioterapeuta: toNull(form.crefito_fisioterapeuta),
          nome_academico_estagiario: toNull(form.nome_academico_estagiario),
          assinatura_digital_fisioterapeuta: !!form.assinatura_digital_fisioterapeuta,
          assinatura_digital_estagiario: !!form.assinatura_digital_estagiario,
        });
      } else {
        await onSave({
          ...base,
          exame_clinico_fisico_educacional_social: toNull(form.exame_clinico_fisico_educacional_social),
          diagnostico_terapeutico_ocupacional: toNull(form.diagnostico_terapeutico_ocupacional),
          prognostico_terapeutico_ocupacional: toNull(form.prognostico_terapeutico_ocupacional),
          nome_terapeuta_ocupacional: toNull(form.nome_terapeuta_ocupacional),
          crefito_terapeuta_ocupacional: toNull(form.crefito_terapeuta_ocupacional),
          nome_academico_estagiario_to: toNull(form.nome_academico_estagiario_to),
          assinatura_digital_terapeuta: !!form.assinatura_digital_terapeuta,
          assinatura_digital_estagiario: !!form.assinatura_digital_estagiario,
        });
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar avaliacao', err);
      alert('Nao foi possivel salvar a avaliacao.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tipo === 'fisio' ? 'Avaliacao Fisioterapia' : 'Avaliacao Terapia Ocupacional'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Paciente *"
            value={pacienteId}
            onChange={(e) => {
              setPacienteId(e.target.value);
              applyPacienteDefaults(pacientes.find(p => p.id === e.target.value));
            }}
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
          <Input label="Nome completo" name="nome_completo" value={form.nome_completo} onChange={handleChange} required />
          <Input label="Idade" name="idade" type="number" value={form.idade} onChange={handleChange} />
          <Input label="Naturalidade" name="naturalidade" value={form.naturalidade} onChange={handleChange} />
          <Input label="Estado civil" name="estado_civil" value={form.estado_civil} onChange={handleChange} />
          <Input label="Genero" name="genero" value={form.genero} onChange={handleChange} />
          <Input label="Profissao" name="profissao" value={form.profissao} onChange={handleChange} />
          <Input label="Endereco residencial" name="endereco_residencial" value={form.endereco_residencial} onChange={handleChange} />
          <Input label="Endereco comercial" name="endereco_comercial" value={form.endereco_comercial} onChange={handleChange} />
          <Input label="Local" name="local" value={form.local} onChange={handleChange} />
          <Input label="Data da avaliacao" name="data_avaliacao" type="date" value={form.data_avaliacao} onChange={handleChange} />
        </div>

        <label className="block text-sm font-medium text-gray-700">Queixa principal</label>
        <textarea name="queixa_principal" value={form.queixa_principal} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
        <label className="block text-sm font-medium text-gray-700">Historia pregressa e atual da doenca</label>
        <textarea name="historia_pregressa_e_atual_da_doenca" value={form.historia_pregressa_e_atual_da_doenca} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
        <label className="block text-sm font-medium text-gray-700">Habitos de vida</label>
        <textarea name="habitos_de_vida" value={form.habitos_de_vida} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
        <label className="block text-sm font-medium text-gray-700">Tratamentos realizados</label>
        <textarea name="tratamentos_realizados" value={form.tratamentos_realizados} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
        <label className="block text-sm font-medium text-gray-700">Antecedentes pessoais e familiares</label>
        <textarea name="antecedentes_pessoais_e_familiares" value={form.antecedentes_pessoais_e_familiares} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
        <label className="block text-sm font-medium text-gray-700">Outros</label>
        <textarea name="outros" value={form.outros} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />

        {tipo === 'fisio' ? (
          <>
            <label className="block text-sm font-medium text-gray-700">Exame clinico-fisico</label>
            <textarea name="exame_clinico_fisico" value={form.exame_clinico_fisico} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Exames complementares</label>
            <textarea name="exames_complementares" value={form.exames_complementares} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Diagnostico fisioterapeutico</label>
            <textarea name="diagnostico_fisioterapeutico" value={form.diagnostico_fisioterapeutico} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Prognostico</label>
            <textarea name="prognostico" value={form.prognostico} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Objetivos</label>
            <textarea name="objetivos" value={form.objetivos} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Qtd. atendimentos provaveis</label>
            <textarea name="qtd_atendimentos_provaveis" value={form.qtd_atendimentos_provaveis} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Procedimentos</label>
            <textarea name="procedimentos" value={form.procedimentos} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <Input label="Nome fisioterapeuta" name="nome_fisioterapeuta" value={form.nome_fisioterapeuta} onChange={handleChange} />
            <Input label="CREFITO" name="crefito_fisioterapeuta" value={form.crefito_fisioterapeuta} onChange={handleChange} />
            <Input label="Academico/estagiario" name="nome_academico_estagiario" value={form.nome_academico_estagiario} onChange={handleChange} />
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700">Exame clinico-fisico/educacional/social</label>
            <textarea name="exame_clinico_fisico_educacional_social" value={form.exame_clinico_fisico_educacional_social} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Exames complementares</label>
            <textarea name="exames_complementares" value={form.exames_complementares} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Diagnostico terapeutico ocupacional</label>
            <textarea name="diagnostico_terapeutico_ocupacional" value={form.diagnostico_terapeutico_ocupacional} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Prognostico terapeutico ocupacional</label>
            <textarea name="prognostico_terapeutico_ocupacional" value={form.prognostico_terapeutico_ocupacional} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Objetivos</label>
            <textarea name="objetivos" value={form.objetivos} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Qtd. atendimentos provaveis</label>
            <textarea name="qtd_atendimentos_provaveis" value={form.qtd_atendimentos_provaveis} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <label className="block text-sm font-medium text-gray-700">Procedimentos</label>
            <textarea name="procedimentos" value={form.procedimentos} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500" rows={2} />
            <Input label="Nome terapeuta ocupacional" name="nome_terapeuta_ocupacional" value={form.nome_terapeuta_ocupacional} onChange={handleChange} />
            <Input label="CREFITO" name="crefito_terapeuta_ocupacional" value={form.crefito_terapeuta_ocupacional} onChange={handleChange} />
            <Input label="Academico/estagiario (TO)" name="nome_academico_estagiario_to" value={form.nome_academico_estagiario_to} onChange={handleChange} />
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

export default AvaliacaoModal;

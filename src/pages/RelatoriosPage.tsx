import React, { useMemo, useState } from 'react';
import { FileText, Activity, CheckCircle, ClipboardList, UserCheck2, HeartPulse, Printer } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';
import { Atendimento, EvolucaoClinica, EvolucaoTO, Paciente, ProntuarioAvaliacao, ProntuarioTOAvaliacao } from '../types';
import Button from '../components/UI/Button';
import { formatDateTime } from '../utils/dateHelpers';

type ReportType = 'avaliacao' | 'avaliacao_to' | 'evolucao' | 'evolucao_to' | 'alta';

const REPORT_TYPES = [
  { key: 'avaliacao' as ReportType, title: 'Ficha de Avaliacao (Fisioterapia)', desc: 'Prontuario de avaliacao fisioterapeutica.', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'avaliacao_to' as ReportType, title: 'Ficha de Avaliacao (Terapia Ocupacional)', desc: 'Prontuario de avaliacao em Terapia Ocupacional.', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-100' },
  { key: 'evolucao' as ReportType, title: 'Evolucao Clinica (Fisio)', desc: 'Historico de evolucoes clinicas de Fisioterapia.', icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
  { key: 'evolucao_to' as ReportType, title: 'Evolucao Clinica (TO)', desc: 'Historico de evolucoes em Terapia Ocupacional.', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { key: 'alta' as ReportType, title: 'Relatorio de Alta', desc: 'Documento formal para alta.', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
];

const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(iso));
};

const RelatoriosPage: React.FC = () => {
  const { state, getAvaliacaoByPaciente, getAvaliacaoTOByPaciente, getEvolucoesByPaciente, getEvolucoesTOByPaciente } = useClinicData();
  const [selectedReport, setSelectedReport] = useState<ReportType>('avaliacao');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const paciente = useMemo(() => state.pacientes.find((p) => p.id === selectedPacienteId), [state.pacientes, selectedPacienteId]);
  const avaliacao = useMemo<ProntuarioAvaliacao | undefined>(() => (selectedPacienteId ? getAvaliacaoByPaciente(selectedPacienteId) : undefined), [getAvaliacaoByPaciente, selectedPacienteId]);
  const avaliacaoTO = useMemo<ProntuarioTOAvaliacao | undefined>(() => (selectedPacienteId ? getAvaliacaoTOByPaciente(selectedPacienteId) : undefined), [getAvaliacaoTOByPaciente, selectedPacienteId]);
  const evolucoesPaciente = useMemo<EvolucaoClinica[]>(() => (selectedPacienteId ? getEvolucoesByPaciente(selectedPacienteId) : []), [getEvolucoesByPaciente, selectedPacienteId]);
  const evolucoesTOPaciente = useMemo<EvolucaoTO[]>(() => (selectedPacienteId ? getEvolucoesTOByPaciente(selectedPacienteId) : []), [getEvolucoesTOByPaciente, selectedPacienteId]);
  const atendimentosPaciente = useMemo(
    () => state.atendimentos.filter((a) => a.pacienteId === selectedPacienteId).sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()),
    [state.atendimentos, selectedPacienteId]
  );

  const stats = useMemo(() => {
    const total = state.atendimentos.length;
    const pacientes = state.pacientes.length;
    const evolucoes = evolucoesPaciente.length + evolucoesTOPaciente.length;
    return { total, pacientes, evolucoes };
  }, [state.atendimentos.length, state.pacientes.length, evolucoesPaciente.length, evolucoesTOPaciente.length]);

  const buildReportHtml = (
    reportType: ReportType,
    pacienteData: Paciente,
    atendimentos: Atendimento[],
    aval?: ProntuarioAvaliacao,
    avalTO?: ProntuarioTOAvaliacao,
    evolucoes?: EvolucaoClinica[]
  ) => {
    const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
    const header = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <h1 style="margin:0; font-size:24px;">${REPORT_TYPES.find((r) => r.key === reportType)?.title}</h1>
          <p style="margin:2px 0; color:#555;">Paciente: ${pacienteData.nome}</p>
          <p style="margin:2px 0; color:#555;">Data de geracao: ${today}</p>
        </div>
        <div style="text-align:right; color:#555;">
          <p style="margin:2px 0;">CPF: ${pacienteData.cpf || '-'}</p>
          <p style="margin:2px 0;">Telefone: ${pacienteData.telefone || '-'}</p>
          <p style="margin:2px 0;">Email: ${pacienteData.email || '-'}</p>
        </div>
      </div>
      <hr/>
    `;

    if (reportType === 'avaliacao') {
      const ageYears = pacienteData.data_nascimento
        ? Math.floor((Date.now() - new Date(pacienteData.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
      return `
        ${header}
        <h2 style="margin-top:12px;">PRONTUARIO FISIOTERAPEUTICO ( AVALIACAO )</h2>
        <p style="margin:4px 0; color:#555;">Referencia : RESOLUCOES COFFITO 414/2012 - 80/1987 - 08/1978</p>

        <h3 style="margin:12px 0 4px;">IDENTIFICACAO DO PACIENTE</h3>
        <p><strong>Nome completo:</strong> ${aval?.nome_completo || pacienteData.nome}</p>
        <p><strong>Idade:</strong> ${aval?.idade ?? (ageYears !== null ? `${ageYears}` : '-')} anos</p>
        <p><strong>Naturalidade:</strong> ${aval?.naturalidade || '-'}</p>
        <p><strong>Estado civil:</strong> ${aval?.estado_civil || '-'}</p>
        <p><strong>Genero:</strong> ${aval?.genero || pacienteData.sexo || '-'}</p>
        <p><strong>Profissao:</strong> ${aval?.profissao || '-'}</p>
        <p><strong>Endereco residencial:</strong> ${aval?.endereco_residencial || pacienteData.endereco || '-'}</p>
        <p><strong>Endereco comercial:</strong> ${aval?.endereco_comercial || '-'}</p>

        <h3 style="margin:12px 0 4px;">HISTORIA CLINICA</h3>
        <p><strong>Queixa principal:</strong><br/>${aval?.queixa_principal || '-'}</p>
        <p><strong>Historia pregressa e atual da doenca:</strong><br/>${aval?.historia_pregressa_e_atual_da_doenca || '-'}</p>
        <p><strong>Habitos de vida:</strong><br/>${aval?.habitos_de_vida || '-'}</p>
        <p><strong>Tratamentos realizados:</strong><br/>${aval?.tratamentos_realizados || '-'}</p>
        <p><strong>Antecedentes pessoais e familiares:</strong><br/>${aval?.antecedentes_pessoais_e_familiares || '-'}</p>
        <p><strong>Outros:</strong><br/>${aval?.outros || '-'}</p>

        <h3 style="margin:12px 0 4px;">EXAME CLINICO-FISICO</h3>
        <p>${aval?.exame_clinico_fisico || '-'}</p>

        <h3 style="margin:12px 0 4px;">EXAMES COMPLEMENTARES</h3>
        <p>${aval?.exames_complementares || '-'}</p>

        <h3 style="margin:12px 0 4px;">DIAGNOSTICO FISIOTERAPEUTICO</h3>
        <p>${aval?.diagnostico_fisioterapeutico || '-'}</p>

        <h3 style="margin:12px 0 4px;">PROGNOSTICO</h3>
        <p>${aval?.prognostico || '-'}</p>

        <h3 style="margin:12px 0 4px;">PLANO TERAPEUTICO</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd; padding:8px;">Objetivos</th>
              <th style="border:1px solid #ddd; padding:8px;">Qtd. de atendimentos provaveis</th>
              <th style="border:1px solid #ddd; padding:8px;">Procedimento(s)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #ddd; padding:8px;">${aval?.objetivos || '-'}</td>
              <td style="border:1px solid #ddd; padding:8px;">${aval?.qtd_atendimentos_provaveis || '-'}</td>
              <td style="border:1px solid #ddd; padding:8px;">${aval?.procedimentos || '-'}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin:12px 0 4px;">IDENTIFICACAO DO PROFISSIONAL ASSISTENTE</h3>
        <p><strong>Nome do fisioterapeuta:</strong> ${aval?.nome_fisioterapeuta || '-'}</p>
        <p><strong>CREFITO:</strong> ${aval?.crefito_fisioterapeuta || '-'}</p>
        <p><strong>Academico/estagiario:</strong> ${aval?.nome_academico_estagiario || '-'}</p>
        <p><strong>Local:</strong> ${aval?.local || '-'}</p>
        <p><strong>Data:</strong> ${formatDate(aval?.data_avaliacao) || today}</p>
        <p><strong>Assinatura digital fisioterapeuta:</strong> ${aval?.assinatura_digital_fisioterapeuta ? 'Sim' : 'Nao'}</p>
        <p><strong>Assinatura digital estagiario:</strong> ${aval?.assinatura_digital_estagiario ? 'Sim' : 'Nao'}</p>
      `;
    }

    if (reportType === 'avaliacao_to') {
      const ageYears = pacienteData.data_nascimento
        ? Math.floor((Date.now() - new Date(pacienteData.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;
      return `
        ${header}
        <h2 style="margin-top:12px;">PRONTUARIO TERAPEUTICO OCUPACIONAL ( AVALIACAO )</h2>
        <p style="margin:4px 0; color:#555;">Referencia : RESOLUCOES COFFITO 414/2012 - 80/1987 - 08/1978</p>

        <h3 style="margin:12px 0 4px;">IDENTIFICACAO DO PACIENTE</h3>
        <p><strong>Nome completo:</strong> ${avalTO?.nome_completo || pacienteData.nome}</p>
        <p><strong>Idade:</strong> ${avalTO?.idade ?? (ageYears !== null ? `${ageYears}` : '-')} anos</p>
        <p><strong>Naturalidade:</strong> ${avalTO?.naturalidade || '-'}</p>
        <p><strong>Estado civil:</strong> ${avalTO?.estado_civil || '-'}</p>
        <p><strong>Genero:</strong> ${avalTO?.genero || pacienteData.sexo || '-'}</p>
        <p><strong>Profissao:</strong> ${avalTO?.profissao || '-'}</p>
        <p><strong>Endereco residencial:</strong> ${avalTO?.endereco_residencial || pacienteData.endereco || '-'}</p>
        <p><strong>Endereco comercial:</strong> ${avalTO?.endereco_comercial || '-'}</p>

        <h3 style="margin:12px 0 4px;">HISTORIA CLINICA</h3>
        <p><strong>Queixa principal:</strong><br/>${avalTO?.queixa_principal || '-'}</p>
        <p><strong>Historia pregressa e atual da doenca:</strong><br/>${avalTO?.historia_pregressa_e_atual_da_doenca || '-'}</p>
        <p><strong>Habitos de vida:</strong><br/>${avalTO?.habitos_de_vida || '-'}</p>
        <p><strong>Tratamentos realizados:</strong><br/>${avalTO?.tratamentos_realizados || '-'}</p>
        <p><strong>Antecedentes pessoais e familiares:</strong><br/>${avalTO?.antecedentes_pessoais_e_familiares || '-'}</p>
        <p><strong>Outros:</strong><br/>${avalTO?.outros || '-'}</p>

        <h3 style="margin:12px 0 4px;">EXAME CLINICO-FISICO/EDUCACIONAL/SOCIAL</h3>
        <p>${avalTO?.exame_clinico_fisico_educacional_social || '-'}</p>

        <h3 style="margin:12px 0 4px;">EXAMES COMPLEMENTARES</h3>
        <p>${avalTO?.exames_complementares || '-'}</p>

        <h3 style="margin:12px 0 4px;">DIAGNOSTICO TERAPEUTICO OCUPACIONAL</h3>
        <p>${avalTO?.diagnostico_terapeutico_ocupacional || '-'}</p>

        <h3 style="margin:12px 0 4px;">PROGNOSTICO TERAPEUTICO OCUPACIONAL</h3>
        <p>${avalTO?.prognostico_terapeutico_ocupacional || '-'}</p>

        <h3 style="margin:12px 0 4px;">PLANO TERAPEUTICO OCUPACIONAL</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd; padding:8px;">Objetivos</th>
              <th style="border:1px solid #ddd; padding:8px;">Qtd. de atendimentos provaveis</th>
              <th style="border:1px solid #ddd; padding:8px;">Procedimento(s)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border:1px solid #ddd; padding:8px;">${avalTO?.objetivos || '-'}</td>
              <td style="border:1px solid #ddd; padding:8px;">${avalTO?.qtd_atendimentos_provaveis || '-'}</td>
              <td style="border:1px solid #ddd; padding:8px;">${avalTO?.procedimentos || '-'}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin:12px 0 4px;">IDENTIFICACAO DO PROFISSIONAL ASSISTENTE</h3>
        <p><strong>Nome do terapeuta ocupacional:</strong> ${avalTO?.nome_terapeuta_ocupacional || '-'}</p>
        <p><strong>CREFITO:</strong> ${avalTO?.crefito_terapeuta_ocupacional || '-'}</p>
        <p><strong>Academico/estagiario:</strong> ${avalTO?.nome_academico_estagiario_to || '-'}</p>
        <p><strong>Local:</strong> ${avalTO?.local || '-'}</p>
        <p><strong>Data:</strong> ${formatDate(avalTO?.data_avaliacao) || today}</p>
        <p><strong>Assinatura digital TO:</strong> ${avalTO?.assinatura_digital_terapeuta ? 'Sim' : 'Nao'}</p>
        <p><strong>Assinatura digital estagiario:</strong> ${avalTO?.assinatura_digital_estagiario ? 'Sim' : 'Nao'}</p>
      `;
    }

    if (reportType === 'evolucao' || reportType === 'evolucao_to') {
      const evList = reportType === 'evolucao_to' ? ((evolucoes || []) as EvolucaoTO[]) : ((evolucoes || []) as EvolucaoClinica[]);
      const evolucoesRows = evList.length
        ? evList
            .map((ev: EvolucaoClinica | EvolucaoTO) => {
              const nomeProf = 'nome_fisioterapeuta' in ev ? (ev as EvolucaoClinica).nome_fisioterapeuta || (ev as EvolucaoClinica).nome_academico_estagiario || '-' : (ev as EvolucaoTO).nome_terapeuta_ocupacional || (ev as EvolucaoTO).nome_academico_estagiario_to || '-';
              const crefito = 'crefito_fisioterapeuta' in ev ? (ev as EvolucaoClinica).crefito_fisioterapeuta || '-' : (ev as EvolucaoTO).crefito_terapeuta_ocupacional || '-';
              return `
              <tr>
                <td>${formatDate(ev.data_evolucao)} ${ev.hora_evolucao || ''}</td>
                <td>${ev.numero_sessao || '-'}</td>
                <td>${ev.procedimentos || '-'}</td>
                <td>${ev.intercorrencias || '-'}</td>
                <td>${ev.evolucao_estado_saude || '-'}</td>
                <td>${nomeProf}</td>
                <td>${crefito}</td>
              </tr>`;
            })
            .join('')
        : '<tr><td colspan="7" style="text-align:center;">Nenhuma evolucao registrada.</td></tr>';
      return `
        ${header}
        <h2 style="margin:12px 0;">Evolucao Clinica ${reportType === 'evolucao_to' ? '(Terapia Ocupacional)' : ''}</h2>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Data/Hora</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Sessao</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Procedimentos</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Intercorrencias</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Evolucao do estado</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Profissional</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">CREFITO</th>
            </tr>
          </thead>
          <tbody>${evolucoesRows}</tbody>
        </table>
      `;
    }

    const ultimoEvolucao = evolucoes && evolucoes.length ? evolucoes[0] : undefined;
    const ultimoAtendimento = atendimentos[0];
    return `
      ${header}
      <h2 style="margin:12px 0;">Relatorio de Alta</h2>
      <p>Ultima evolucao: ${ultimoEvolucao ? `${formatDate(ultimoEvolucao.data_evolucao)} ${ultimoEvolucao.hora_evolucao || ''}` : '-'}</p>
      <p>Ultimo atendimento: ${ultimoAtendimento ? formatDateTime(ultimoAtendimento.dataHora) : '-'}</p>
      <p>Status atual: Alta</p>
      <p>Resumo clinico: ${ultimoEvolucao?.evolucao_estado_saude || ultimoAtendimento?.soap?.avaliacao || '-'}</p>
      <p>Plano final / recomendacoes: ${ultimoAtendimento?.soap?.plano || '-'}</p>
    `;
  };

  const generateReport = () => {
    if (!paciente) {
      alert('Selecione um paciente para gerar o relatorio.');
      return;
    }
    setLoading(true);
    try {
      const html = `
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>Relatorio - ${paciente.nome}</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding:24px; color:#111;">
            ${buildReportHtml(
              selectedReport,
              paciente,
              atendimentosPaciente,
              avaliacao,
              avaliacaoTO,
              selectedReport === 'evolucao_to' ? evolucoesTOPaciente : evolucoesPaciente
            )}
            <script>window.onload = () => { window.print(); }</script>
          </body>
        </html>
      `;
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.open();
        reportWindow.document.write(html);
        reportWindow.document.close();
      } else {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-${selectedReport}-${paciente.nome}.html`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-sky-100 to-white border border-emerald-50 p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-sky-200 blur-3xl opacity-60 pointer-events-none" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700 bg-white/70 px-3 py-1 rounded-full shadow-sm">Relatorios</p>
            <h1 className="text-3xl font-bold text-slate-900">Documentos clinicos</h1>
            <p className="text-slate-600 text-sm">Selecione o tipo de documento, o paciente e gere o relatorio em segundos.</p>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-sm text-slate-700 bg-white/70 px-4 py-2 rounded-xl shadow-sm border">
            <span className="inline-flex items-center gap-1"><UserCheck2 className="h-4 w-4 text-emerald-600" />{stats.pacientes} pacientes</span>
              <span className="inline-flex items-center gap-1"><Printer className="h-4 w-4 text-sky-600" />{stats.total} atendimentos</span>
            <span className="inline-flex items-center gap-1"><HeartPulse className="h-4 w-4 text-amber-600" />{stats.evolucoes} evolucoes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {REPORT_TYPES.map((report) => (
          <button
            type="button"
            key={report.key}
            onClick={() => setSelectedReport(report.key)}
            className={`text-left bg-white rounded-lg shadow p-6 border transition ${
              selectedReport === report.key ? 'border-emerald-500 ring-1 ring-emerald-200' : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <div className={`${report.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <report.icon className={`h-6 w-6 ${report.color}`} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{report.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Printer className="h-5 w-5 text-emerald-600" /> Parametros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
            <select
              value={selectedPacienteId}
              onChange={(e) => setSelectedPacienteId(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="">Selecione...</option>
              {state.pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de relatorio</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            >
              {REPORT_TYPES.map((r) => (
                <option key={r.key} value={r.key}>{r.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={generateReport} isLoading={loading} disabled={!selectedPacienteId}>
            Gerar relatorio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;

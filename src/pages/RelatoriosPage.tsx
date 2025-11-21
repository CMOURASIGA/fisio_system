import React, { useMemo, useState } from 'react';
import { FileText, Activity, CheckCircle } from 'lucide-react';
import { useClinicData } from '../context/ClinicDataContext';
import { Atendimento, Paciente } from '../types';
import Button from '../components/UI/Button';
import { formatDateTime } from '../utils/dateHelpers';

type ReportType = 'avaliacao' | 'evolucao' | 'alta';

const REPORT_TYPES = [
  { key: 'avaliacao' as ReportType, title: 'Ficha de Avaliação', desc: 'Ficha completa de avaliação fisioterapêutica.', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'evolucao' as ReportType, title: 'Evolução Clínica', desc: 'Histórico de atendimentos e evolução.', icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
  { key: 'alta' as ReportType, title: 'Relatório de Alta', desc: 'Documento formal para alta.', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
];

const RelatoriosPage: React.FC = () => {
  const { state } = useClinicData();
  const [selectedReport, setSelectedReport] = useState<ReportType>('avaliacao');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const paciente = useMemo(() => state.pacientes.find(p => p.id === selectedPacienteId), [state.pacientes, selectedPacienteId]);
  const atendimentosPaciente = useMemo(
    () => state.atendimentos.filter(a => a.pacienteId === selectedPacienteId).sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()),
    [state.atendimentos, selectedPacienteId]
  );

  const buildReportHtml = (reportType: ReportType, pacienteData: Paciente, atendimentos: Atendimento[]) => {
    const today = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
    const header = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <h1 style="margin:0; font-size:24px;">${REPORT_TYPES.find(r => r.key === reportType)?.title}</h1>
          <p style="margin:2px 0; color:#555;">Paciente: ${pacienteData.nome}</p>
          <p style="margin:2px 0; color:#555;">Data de geração: ${today}</p>
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
        <h2 style="margin-top:12px;">Resumo de Avaliação</h2>
        <p>Idade: ${ageYears !== null ? `${ageYears} anos` : '-'}</p>
        <p>Status: ${pacienteData.status}</p>
        <p>Observações iniciais: ${pacienteData.observacoes || '—'}</p>
        <p>Endereço: ${pacienteData.endereco || '—'}</p>
      `;
    }

    if (reportType === 'evolucao') {
      const rows = atendimentos.length
        ? atendimentos
            .map(
              (at) => `
              <tr>
                <td>${formatDateTime(at.dataHora)}</td>
                <td>${at.tipo}</td>
                <td>${at.status}</td>
                <td>${at.soap?.avaliacao || '—'}</td>
                <td>${at.soap?.plano || '—'}</td>
              </tr>`
            )
            .join('')
        : '<tr><td colspan="5" style="text-align:center;">Nenhum atendimento registrado.</td></tr>';
      return `
        ${header}
        <h2 style="margin:12px 0;">Evolução Clínica</h2>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Data/Hora</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Tipo</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Status</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Avaliação</th>
              <th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Plano</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }

    // alta
    const ultimo = atendimentos[0];
    return `
      ${header}
      <h2 style="margin:12px 0;">Relatório de Alta</h2>
      <p>Último atendimento: ${ultimo ? formatDateTime(ultimo.dataHora) : '—'}</p>
      <p>Status atual: Alta</p>
      <p>Resumo clínico: ${ultimo?.soap?.avaliacao || '—'}</p>
      <p>Plano final / recomendações: ${ultimo?.soap?.plano || '—'}</p>
    `;
  };

  const generateReport = () => {
    if (!paciente) {
      alert('Selecione um paciente para gerar o relatório.');
      return;
    }
    setLoading(true);
    try {
      const html = `
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>Relatório - ${paciente.nome}</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding:24px; color:#111;">
            ${buildReportHtml(selectedReport, paciente, atendimentosPaciente)}
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Gere documentos clínicos a partir dos atendimentos e dados dos pacientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REPORT_TYPES.map((report) => (
          <button
            type="button"
            key={report.key}
            onClick={() => setSelectedReport(report.key)}
            className={`text-left bg-white rounded-lg shadow p-6 border transition ${
              selectedReport === report.key ? 'border-primary-500 ring-1 ring-primary-200' : 'border-gray-200 hover:shadow-md'
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

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Parâmetros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
            <select
              value={selectedPacienteId}
              onChange={(e) => setSelectedPacienteId(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Selecione...</option>
              {state.pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de relatório</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {REPORT_TYPES.map(r => (
                <option key={r.key} value={r.key}>{r.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={generateReport} isLoading={loading} disabled={!selectedPacienteId}>
            Gerar relatório
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;

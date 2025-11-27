import React, { useMemo, useState } from "react";
import { FileText, Activity, CheckCircle, ClipboardList, UserCheck2, HeartPulse, Printer } from "lucide-react";
import { useClinicData } from "../context/ClinicDataContext";
import { Atendimento, EvolucaoClinica, EvolucaoTO, Paciente, ProntuarioAvaliacao, ProntuarioTOAvaliacao } from "../types";
import Button from "../components/UI/Button";
import { formatDateTime } from "../utils/dateHelpers";

type ReportType = "avaliacao" | "avaliacao_to" | "evolucao" | "evolucao_to" | "alta";

const REPORT_TYPES = [
  { key: "avaliacao" as ReportType, title: "Ficha de Avaliacao (Fisioterapia)", desc: "Prontuario de avaliacao fisioterapeutica.", icon: Activity, color: "text-blue-600", bg: "bg-blue-100" },
  { key: "avaliacao_to" as ReportType, title: "Ficha de Avaliacao (Terapia Ocupacional)", desc: "Prontuario de avaliacao em Terapia Ocupacional.", icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-100" },
  { key: "evolucao" as ReportType, title: "Evolucao Clinica (Fisio)", desc: "Historico de evolucoes clinicas de Fisioterapia.", icon: FileText, color: "text-green-600", bg: "bg-green-100" },
  { key: "evolucao_to" as ReportType, title: "Evolucao Clinica (TO)", desc: "Historico de evolucoes em Terapia Ocupacional.", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100" },
  { key: "alta" as ReportType, title: "Relatorio de Alta", desc: "Documento formal para alta.", icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-100" },
];

const formatDate = (iso?: string | null) => {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(iso));
};

const getTheme = (reportType: ReportType) => {
  if (reportType === "avaliacao") return { accent: "#2563eb", accentSoft: "#dbeafe" };
  if (reportType === "avaliacao_to") return { accent: "#d97706", accentSoft: "#fef3c7" };
  if (reportType === "evolucao") return { accent: "#059669", accentSoft: "#d1fae5" };
  if (reportType === "evolucao_to") return { accent: "#10b981", accentSoft: "#d1fae5" };
  return { accent: "#7c3aed", accentSoft: "#ede9fe" };
};

const getBaseStyles = (accent: string, accentSoft: string) => `
  <style>
    :root { --accent: ${accent}; --accent-soft: ${accentSoft}; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background:#f5f7fb; color:#0f172a; padding:24px; }
    .report { max-width: 960px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 10px 40px rgba(15,23,42,0.08); overflow: hidden; }
    .report-header { background: linear-gradient(135deg, var(--accent-soft), #fff); padding: 20px 24px; display:flex; justify-content:space-between; gap:16px; border-bottom:1px solid rgba(15,23,42,0.06); }
    .report-title { margin:0; font-size:24px; font-weight:800; color:#0f172a; }
    .muted { color:#475569; margin:2px 0; }
    .chip { display:inline-flex; align-items:center; gap:6px; background: var(--accent-soft); color: var(--accent); padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700; text-transform: uppercase; letter-spacing:0.02em; }
    .section { padding:20px 24px; border-bottom:1px solid rgba(15,23,42,0.06); }
    .section:last-child { border-bottom:none; }
    .section h3 { margin:0 0 12px; font-size:16px; color:#0f172a; }
    .grid-2 { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 20px; }
    .info-row { display:flex; justify-content:space-between; gap:12px; padding:10px 12px; background:#f8fafc; border-radius:10px; border:1px solid rgba(15,23,42,0.05); }
    .info-row .label { font-weight:600; color:#0f172a; }
    .info-row .value { color:#475569; text-align:right; }
    .paragraph { padding:12px; background:#f8fafc; border-radius:10px; border:1px solid rgba(15,23,42,0.05); color:#0f172a; }
    .table { width:100%; border-collapse:collapse; margin-top:8px; }
    .table th, .table td { text-align:left; padding:10px 12px; border-bottom:1px solid rgba(15,23,42,0.06); font-size:13px; color:#0f172a; }
    .table thead th { background: var(--accent-soft); color: var(--accent); font-weight:700; }
    .tag { display:inline-flex; align-items:center; gap:6px; background: rgba(16,185,129,0.12); color:#065f46; padding:6px 10px; border-radius:10px; font-weight:600; font-size:12px; }
    .pill { display:inline-block; padding:6px 10px; background: rgba(79,70,229,0.12); color:#312e81; border-radius:10px; font-weight:600; font-size:12px; }
    .subtitle { color:#475569; margin:4px 0 12px; }
    .meta { display:flex; gap:12px; flex-wrap:wrap; }
    .meta span { background:#f8fafc; border-radius:10px; padding:8px 10px; font-size:12px; color:#475569; border:1px solid rgba(15,23,42,0.05); }
  </style>
`;

const RelatoriosPage: React.FC = () => {
  const { state, getAvaliacaoByPaciente, getAvaliacaoTOByPaciente, getEvolucoesByPaciente, getEvolucoesTOByPaciente } = useClinicData();
  const [selectedReport, setSelectedReport] = useState<ReportType>("avaliacao");
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
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
    const theme = getTheme(reportType);
    const today = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date());
    const baseStyles = getBaseStyles(theme.accent, theme.accentSoft);
    const title = REPORT_TYPES.find((r) => r.key === reportType)?.title || "Relatorio";

    const header = `
      <div class="report-header">
        <div>
          <div class="chip">Relatorio</div>
          <h1 class="report-title">${title}</h1>
          <p class="muted">Paciente: ${pacienteData.nome}</p>
          <p class="muted">Data de geracao: ${today}</p>
        </div>
        <div style="text-align:right; min-width:220px;">
          <p class="muted">CPF: ${pacienteData.cpf || '-'}</p>
          <p class="muted">Telefone: ${pacienteData.telefone || '-'}</p>
          <p class="muted">Email: ${pacienteData.email || '-'}</p>
        </div>
      </div>
    `;

    const ageYears = pacienteData.data_nascimento
      ? Math.floor((Date.now() - new Date(pacienteData.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    if (reportType === "avaliacao") {
      return `
        ${baseStyles}
        <div class="report">
          ${header}
          <div class="section">
            <h3>Identificacao do paciente</h3>
            <div class="grid-2">
              <div class="info-row"><span class="label">Nome completo</span><span class="value">${aval?.nome_completo || pacienteData.nome}</span></div>
              <div class="info-row"><span class="label">Idade</span><span class="value">${aval?.idade ?? (ageYears !== null ? `${ageYears}` : '-')} anos</span></div>
              <div class="info-row"><span class="label">Naturalidade</span><span class="value">${aval?.naturalidade || '-'}</span></div>
              <div class="info-row"><span class="label">Estado civil</span><span class="value">${aval?.estado_civil || '-'}</span></div>
              <div class="info-row"><span class="label">Genero</span><span class="value">${aval?.genero || pacienteData.sexo || '-'}</span></div>
              <div class="info-row"><span class="label">Profissao</span><span class="value">${aval?.profissao || '-'}</span></div>
              <div class="info-row" style="grid-column:span 2;"><span class="label">Endereco residencial</span><span class="value">${aval?.endereco_residencial || pacienteData.endereco || '-'}</span></div>
              <div class="info-row" style="grid-column:span 2;"><span class="label">Endereco comercial</span><span class="value">${aval?.endereco_comercial || '-'}</span></div>
            </div>
          </div>

          <div class="section">
            <h3>Historia clinica</h3>
            <div class="paragraph"><strong>Queixa principal:</strong><br/>${aval?.queixa_principal || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Historia pregressa e atual da doenca:</strong><br/>${aval?.historia_pregressa_e_atual_da_doenca || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Habitos de vida:</strong><br/>${aval?.habitos_de_vida || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Tratamentos realizados:</strong><br/>${aval?.tratamentos_realizados || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Antecedentes pessoais e familiares:</strong><br/>${aval?.antecedentes_pessoais_e_familiares || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Outros:</strong><br/>${aval?.outros || '-'}</div>
          </div>

          <div class="section">
            <h3>Exame clinico-fisico</h3>
            <div class="paragraph">${aval?.exame_clinico_fisico || '-'}</div>
          </div>

          <div class="section">
            <h3>Exames complementares</h3>
            <div class="paragraph">${aval?.exames_complementares || '-'}</div>
          </div>

          <div class="section">
            <h3>Diagnostico e prognostico</h3>
            <div class="paragraph"><strong>Diagnostico fisioterapeutico:</strong><br/>${aval?.diagnostico_fisioterapeutico || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Prognostico:</strong><br/>${aval?.prognostico || '-'}</div>
          </div>

          <div class="section">
            <h3>Plano terapeutico</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Objetivos</th>
                  <th>Qtd. de atendimentos provaveis</th>
                  <th>Procedimento(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${aval?.objetivos || '-'}</td>
                  <td>${aval?.qtd_atendimentos_provaveis || '-'}</td>
                  <td>${aval?.procedimentos || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>Identificacao do profissional assistente</h3>
            <div class="grid-2">
              <div class="info-row"><span class="label">Nome do fisioterapeuta</span><span class="value">${aval?.nome_fisioterapeuta || '-'}</span></div>
              <div class="info-row"><span class="label">CREFITO</span><span class="value">${aval?.crefito_fisioterapeuta || '-'}</span></div>
              <div class="info-row"><span class="label">Academico/estagiario</span><span class="value">${aval?.nome_academico_estagiario || '-'}</span></div>
              <div class="info-row"><span class="label">Local</span><span class="value">${aval?.local || '-'}</span></div>
              <div class="info-row"><span class="label">Data</span><span class="value">${formatDate(aval?.data_avaliacao) || today}</span></div>
              <div class="info-row"><span class="label">Assinatura digital fisio</span><span class="value">${aval?.assinatura_digital_fisioterapeuta ? "Sim" : "Nao"}</span></div>
              <div class="info-row"><span class="label">Assinatura digital estagiario</span><span class="value">${aval?.assinatura_digital_estagiario ? "Sim" : "Nao"}</span></div>
            </div>
          </div>
        </div>
      `;
    }

    if (reportType === "avaliacao_to") {
      return `
        ${baseStyles}
        <div class="report">
          ${header}
          <div class="section">
            <h3>Identificacao do paciente</h3>
            <div class="grid-2">
              <div class="info-row"><span class="label">Nome completo</span><span class="value">${avalTO?.nome_completo || pacienteData.nome}</span></div>
              <div class="info-row"><span class="label">Idade</span><span class="value">${avalTO?.idade ?? (ageYears !== null ? `${ageYears}` : '-')} anos</span></div>
              <div class="info-row"><span class="label">Naturalidade</span><span class="value">${avalTO?.naturalidade || '-'}</span></div>
              <div class="info-row"><span class="label">Estado civil</span><span class="value">${avalTO?.estado_civil || '-'}</span></div>
              <div class="info-row"><span class="label">Genero</span><span class="value">${avalTO?.genero || pacienteData.sexo || '-'}</span></div>
              <div class="info-row"><span class="label">Profissao</span><span class="value">${avalTO?.profissao || '-'}</span></div>
              <div class="info-row" style="grid-column:span 2;"><span class="label">Endereco residencial</span><span class="value">${avalTO?.endereco_residencial || pacienteData.endereco || '-'}</span></div>
              <div class="info-row" style="grid-column:span 2;"><span class="label">Endereco comercial</span><span class="value">${avalTO?.endereco_comercial || '-'}</span></div>
            </div>
          </div>

          <div class="section">
            <h3>Historia clinica</h3>
            <div class="paragraph"><strong>Queixa principal:</strong><br/>${avalTO?.queixa_principal || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Historia pregressa e atual da doenca:</strong><br/>${avalTO?.historia_pregressa_e_atual_da_doenca || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Habitos de vida:</strong><br/>${avalTO?.habitos_de_vida || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Tratamentos realizados:</strong><br/>${avalTO?.tratamentos_realizados || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Antecedentes pessoais e familiares:</strong><br/>${avalTO?.antecedentes_pessoais_e_familiares || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Outros:</strong><br/>${avalTO?.outros || '-'}</div>
          </div>

          <div class="section">
            <h3>Exame clinico-fisico/educacional/social</h3>
            <div class="paragraph">${avalTO?.exame_clinico_fisico_educacional_social || '-'}</div>
          </div>

          <div class="section">
            <h3>Exames complementares</h3>
            <div class="paragraph">${avalTO?.exames_complementares || '-'}</div>
          </div>

          <div class="section">
            <h3>Diagnostico e prognostico</h3>
            <div class="paragraph"><strong>Diagnostico terapeutico ocupacional:</strong><br/>${avalTO?.diagnostico_terapeutico_ocupacional || '-'}</div>
            <div class="paragraph" style="margin-top:10px;"><strong>Prognostico terapeutico ocupacional:</strong><br/>${avalTO?.prognostico_terapeutico_ocupacional || '-'}</div>
          </div>

          <div class="section">
            <h3>Plano terapeutico ocupacional</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Objetivos</th>
                  <th>Qtd. de atendimentos provaveis</th>
                  <th>Procedimento(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${avalTO?.objetivos || '-'}</td>
                  <td>${avalTO?.qtd_atendimentos_provaveis || '-'}</td>
                  <td>${avalTO?.procedimentos || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>Identificacao do profissional assistente</h3>
            <div class="grid-2">
              <div class="info-row"><span class="label">Nome do terapeuta ocupacional</span><span class="value">${avalTO?.nome_terapeuta_ocupacional || '-'}</span></div>
              <div class="info-row"><span class="label">CREFITO</span><span class="value">${avalTO?.crefito_terapeuta_ocupacional || '-'}</span></div>
              <div class="info-row"><span class="label">Academico/estagiario</span><span class="value">${avalTO?.nome_academico_estagiario_to || '-'}</span></div>
              <div class="info-row"><span class="label">Local</span><span class="value">${avalTO?.local || '-'}</span></div>
              <div class="info-row"><span class="label">Data</span><span class="value">${formatDate(avalTO?.data_avaliacao) || today}</span></div>
              <div class="info-row"><span class="label">Assinatura digital TO</span><span class="value">${avalTO?.assinatura_digital_terapeuta ? "Sim" : "Nao"}</span></div>
              <div class="info-row"><span class="label">Assinatura digital estagiario</span><span class="value">${avalTO?.assinatura_digital_estagiario ? "Sim" : "Nao"}</span></div>
            </div>
          </div>
        </div>
      `;
    }

    if (reportType === "evolucao" || reportType === "evolucao_to") {
      const evList = reportType === "evolucao_to" ? ((evolucoes || []) as EvolucaoTO[]) : ((evolucoes || []) as EvolucaoClinica[]);
      const evolucoesRows = evList.length
        ? evList
            .map((ev: EvolucaoClinica | EvolucaoTO) => {
              const nomeProf =
                "nome_fisioterapeuta" in ev
                  ? (ev as EvolucaoClinica).nome_fisioterapeuta || (ev as EvolucaoClinica).nome_academico_estagiario || "-"
                  : (ev as EvolucaoTO).nome_terapeuta_ocupacional || (ev as EvolucaoTO).nome_academico_estagiario_to || "-";
              const crefito =
                "crefito_fisioterapeuta" in ev
                  ? (ev as EvolucaoClinica).crefito_fisioterapeuta || "-"
                  : (ev as EvolucaoTO).crefito_terapeuta_ocupacional || "-";
              return `
              <tr>
                <td>${formatDate(ev.data_evolucao)} ${ev.hora_evolucao || ""}</td>
                <td>${ev.numero_sessao || "-"}</td>
                <td>${ev.procedimentos || "-"}</td>
                <td>${ev.intercorrencias || "-"}</td>
                <td>${ev.evolucao_estado_saude || "-"}</td>
                <td>${nomeProf}</td>
                <td>${crefito}</td>
              </tr>`;
            })
            .join("")
        : '<tr><td colspan="7" style="text-align:center; color:#475569;">Nenhuma evolucao registrada.</td></tr>';
      return `
        ${baseStyles}
        <div class="report">
          ${header}
          <div class="section">
            <h3>Evolucoes registradas</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Sessao</th>
                  <th>Procedimentos</th>
                  <th>Intercorrencias</th>
                  <th>Evolucao do estado</th>
                  <th>Profissional</th>
                  <th>CREFITO</th>
                </tr>
              </thead>
              <tbody>${evolucoesRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    const ultimoEvolucao = evolucoes && evolucoes.length ? evolucoes[0] : undefined;
    const ultimoAtendimento = atendimentos[0];
    return `
      ${baseStyles}
      <div class="report">
        ${header}
        <div class="section">
          <h3>Resumo de alta</h3>
          <div class="meta">
            <span>Ultima evolucao: ${ultimoEvolucao ? `${formatDate(ultimoEvolucao.data_evolucao)} ${ultimoEvolucao.hora_evolucao || ""}` : "-"}</span>
            <span>Ultimo atendimento: ${ultimoAtendimento ? formatDateTime(ultimoAtendimento.dataHora) : "-"}</span>
            <span class="tag">Status: Alta</span>
          </div>
        </div>
        <div class="section">
          <h3>Resumo clinico</h3>
          <div class="paragraph">${ultimoEvolucao?.evolucao_estado_saude || ultimoAtendimento?.soap?.avaliacao || "-"}</div>
        </div>
        <div class="section">
          <h3>Plano final / recomendacoes</h3>
          <div class="paragraph">${ultimoAtendimento?.soap?.plano || "-"}</div>
        </div>
      </div>
    `;
  };

  const generateReport = () => {
    if (!paciente) {
      alert("Selecione um paciente para gerar o relatorio.");
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
          <body>
            ${buildReportHtml(
              selectedReport,
              paciente,
              atendimentosPaciente,
              avaliacao,
              avaliacaoTO,
              selectedReport === "evolucao_to" ? evolucoesTOPaciente : evolucoesPaciente
            )}
            <script>window.onload = () => { window.print(); }</script>
          </body>
        </html>
      `;
      const reportWindow = window.open("", "_blank");
      if (reportWindow) {
        reportWindow.document.open();
        reportWindow.document.write(html);
        reportWindow.document.close();
      } else {
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
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
              selectedReport === report.key ? "border-emerald-500 ring-1 ring-emerald-200" : "border-gray-200 hover:shadow-md"
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

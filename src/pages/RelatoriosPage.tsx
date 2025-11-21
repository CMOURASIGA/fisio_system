import React from 'react';
import { FileText, Activity, CheckCircle } from 'lucide-react';

const RelatoriosPage: React.FC = () => {
  const reportTypes = [
    { title: 'Ficha de Avaliação', desc: 'Ficha completa de avaliação fisioterapêutica.', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Evolução Clínica', desc: 'Histórico de atendimentos e evolução.', icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Relatório de Alta', desc: 'Documento formal para alta hospitalar.', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Gere documentos clínicos e acompanhe o histórico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
            <div className={`${report.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <report.icon className={`h-6 w-6 ${report.color}`} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{report.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Relatórios Gerados Recentemente</h3>
        <div className="text-center py-8 text-gray-500">
          Nenhum relatório gerado recentemente (Mock).
        </div>
      </div>
    </div>
  );
};

export default RelatoriosPage;
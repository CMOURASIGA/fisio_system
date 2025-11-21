import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinicData } from '../context/ClinicDataContext';
import Button from '../components/UI/Button';
import { calculateAge, formatDate, formatDateTime } from '../utils/dateHelpers';
import { ArrowLeft, Phone, Mail, MapPin, Calendar } from 'lucide-react';

const PacienteDetalhePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useClinicData();
  
  const paciente = state.pacientes.find(p => p.id === id);
  const historicoAtendimentos = state.atendimentos
    .filter(a => a.pacienteId === id)
    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

  if (!paciente) {
    return <div className="text-center py-10">Paciente não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/pacientes" className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Prontuário do Paciente</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-primary-600 px-6 py-8">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-white text-primary-600 flex items-center justify-center text-3xl font-bold">
              {paciente.nome.charAt(0)}
            </div>
            <div className="ml-6 text-white">
              <h2 className="text-2xl font-bold">{paciente.nome}</h2>
              <p className="text-primary-100">{calculateAge(paciente.dataNascimento)} anos • {paciente.sexo}</p>
              <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white border border-white border-opacity-20`}>
                {paciente.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-3">
             <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Dados Pessoais</h3>
             <div className="flex items-center text-gray-600"><span className="w-24 font-medium text-gray-500">CPF:</span> {paciente.cpf}</div>
             <div className="flex items-center text-gray-600"><span className="w-24 font-medium text-gray-500">Nascimento:</span> {formatDate(paciente.dataNascimento)}</div>
             <div className="flex items-center text-gray-600"><Phone className="h-4 w-4 mr-2 text-gray-400" /> {paciente.telefone || '-'}</div>
             <div className="flex items-center text-gray-600"><Mail className="h-4 w-4 mr-2 text-gray-400" /> {paciente.email || '-'}</div>
             <div className="flex items-start text-gray-600"><MapPin className="h-4 w-4 mr-2 mt-1 text-gray-400" /> {paciente.endereco || '-'}</div>
           </div>
           <div className="space-y-3">
             <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Observações</h3>
             <p className="text-gray-600 text-sm bg-yellow-50 p-3 rounded border border-yellow-100">
               {paciente.observacoes || 'Nenhuma observação registrada.'}
             </p>
           </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Histórico de Atendimentos</h3>
          <Button size="sm">Novo Atendimento</Button>
        </div>
        
        {historicoAtendimentos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum atendimento registrado.</p>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {historicoAtendimentos.map((atend, idx) => (
                <li key={atend.id}>
                  <div className="relative pb-8">
                    {idx !== historicoAtendimentos.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                          <Calendar className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {atend.tipo} <span className="font-medium text-gray-900">com Dr(a). {state.profissionais.find(pr => pr.id === atend.profissionalId)?.nome}</span>
                          </p>
                          {atend.soap.avaliacao && (
                             <p className="mt-1 text-sm text-gray-600 italic">"{atend.soap.avaliacao}"</p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={atend.dataHora}>{formatDateTime(atend.dataHora)}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PacienteDetalhePage;
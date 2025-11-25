import React, { useEffect, useState } from 'react';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Clinica {
  id: string;
  nome: string;
  created_at?: string;
}

const ConfiguracoesPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [nomeClinica, setNomeClinica] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinica = async () => {
      if (!profile?.clinica_id) return;
      const { data, error } = await supabase.from('clinicas').select('*').eq('id', profile.clinica_id).single();
      if (error) {
        console.error('Erro ao buscar clínica:', error.message);
        setError('Não foi possível carregar os dados da clínica.');
        return;
      }
      setClinica(data as Clinica);
      setNomeClinica(data?.nome ?? '');
    };
    fetchClinica();
  }, [profile?.clinica_id]);

  const handleCreateClinica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Usuário não autenticado.');
      return;
    }
    if (!nomeClinica.trim()) {
      setError('Informe o nome da clínica.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // Usa RPC com RLS segura (função cria clinica e perfil do usuário atual)
      const { data, error: rpcError } = await supabase.rpc('create_clinica_with_profile', {
        p_nome: nomeClinica.trim(),
      });
      if (rpcError || !data) {
        throw new Error(rpcError?.message || 'Erro ao criar clínica');
      }

      await refreshProfile();
      setClinica(data as Clinica);
    } catch (err: any) {
      console.error('Falha ao criar clínica/perfil:', err);
      setError(err.message || 'Erro ao criar clínica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Dados da Clínica</h3>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {clinica ? (
          <div className="space-y-4">
            <Input label="Nome da Clínica" value={clinica.nome} disabled />
            <p className="text-sm text-gray-500">ID: {clinica.id}</p>
          </div>
        ) : (
          <form onSubmit={handleCreateClinica} className="space-y-4">
            <Input
              label="Nome da Clínica"
              value={nomeClinica}
              onChange={(e) => setNomeClinica(e.target.value)}
              placeholder="Ex: Clínica Saúde Plena"
              required
            />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Clínica'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConfiguracoesPage;

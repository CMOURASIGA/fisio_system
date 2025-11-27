import React, { useMemo, useState } from "react";
import { useClinicData } from "../context/ClinicDataContext";
import Button from "../components/UI/Button";
import ProfissionalFormModal from "../components/Profissionais/ProfissionalFormModal";
import { Profissional } from "../types";
import { Plus, Mail, User, Edit, Trash2, ShieldCheck, Users, BadgeCheck, Search } from "lucide-react";

const ProfissionaisPage: React.FC = () => {
  const { state, addProfissional, updateProfissional, deleteProfissional } = useClinicData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const stats = useMemo(() => {
    const total = state.profissionais.length;
    const comCrefito = state.profissionais.filter((p) => !!p.crefito).length;
    const funcoes = new Set(state.profissionais.map((p) => p.funcao)).size;
    return { total, comCrefito, funcoes };
  }, [state.profissionais]);

  const filtered = useMemo(
    () =>
      state.profissionais.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [state.profissionais, searchTerm]
  );

  const handleSave = async (data: Omit<Profissional, "id" | "created_at" | "clinica_id">) => {
    try {
      if (editingProfissional) {
        await updateProfissional({ ...editingProfissional, ...data });
      } else {
        await addProfissional(data);
      }
      setIsModalOpen(false);
      setEditingProfissional(null);
    } catch (error) {
      console.error("Failed to save profissional", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este profissional?")) {
      try {
        await deleteProfissional(id);
      } catch (error) {
        console.error("Failed to delete profissional", error);
      }
    }
  };

  const openEdit = (prof: Profissional) => {
    setEditingProfissional(prof);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingProfissional(null);
    setIsModalOpen(true);
  };

  if (state.loading) {
    return <div>Carregando profissionais...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-sky-100 to-white border border-emerald-50 p-6">
        <div className="absolute -right-10 -top-8 h-32 w-32 rounded-full bg-emerald-200 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-sky-200 blur-3xl opacity-60 pointer-events-none" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700 bg-white/70 px-3 py-1 rounded-full shadow-sm">
              Profissionais
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Equipe clinica em foco</h1>
            <p className="text-slate-600 text-sm">Cadastre, edite e acompanhe rapidamente sua equipe.</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 text-sm text-slate-700 bg-white/70 px-4 py-2 rounded-xl shadow-sm border">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4 text-emerald-600" />
                {stats.total} ativos
              </span>
              <span className="inline-flex items-center gap-1">
                <BadgeCheck className="h-4 w-4 text-sky-600" />
                {stats.comCrefito} com CREFITO
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                {stats.funcoes} funcoes
              </span>
            </div>
            <Button onClick={openNew} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white">
              <Plus className="h-4 w-4 mr-2" /> Novo Profissional
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="relative max-w-xl w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prof) => (
          <div key={prof.id} className="bg-white/90 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{prof.nome}</h3>
                  <p className="text-sm text-emerald-700 font-medium">{prof.funcao}</p>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Mail className="h-4 w-4 mr-1" /> {prof.email}
                  </div>
                  {prof.crefito && <p className="text-xs text-gray-500 mt-1">CREFITO: {prof.crefito}</p>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openEdit(prof)} className="text-gray-400 hover:text-emerald-700" title="Editar">
                  <Edit className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(prof.id)} className="text-gray-400 hover:text-red-600" title="Excluir">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProfissionalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingProfissional}
      />
    </div>
  );
};

export default ProfissionaisPage;

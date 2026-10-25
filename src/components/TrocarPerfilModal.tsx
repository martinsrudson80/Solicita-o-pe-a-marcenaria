import React, { useState } from 'react';
import { Empresa, Usuario } from '../types';
import {
  X,
  UserCheck,
  Building,
  Plus,
  Shield,
  HardHat,
  Check,
  LogOut,
} from 'lucide-react';

interface TrocarPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarios: Usuario[];
  usuarioAtivo: Usuario;
  onSelecionarUsuario: (usuarioId: string) => void;
  empresas: Empresa[];
  empresaAtiva: Empresa;
  onSelecionarEmpresa: (empresaId: string) => void;
  onCriarNovaEmpresa: (nomeFantasia: string) => void;
}

export const TrocarPerfilModal: React.FC<TrocarPerfilModalProps> = ({
  isOpen,
  onClose,
  usuarios,
  usuarioAtivo,
  onSelecionarUsuario,
  empresas,
  empresaAtiva,
  onSelecionarEmpresa,
  onCriarNovaEmpresa,
}) => {
  const [novaEmpresaNome, setNovaEmpresaNome] = useState('');
  const [mostrandoNovaEmpresa, setMostrandoNovaEmpresa] = useState(false);

  if (!isOpen) return null;

  const handleCriarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaEmpresaNome.trim()) return;
    onCriarNovaEmpresa(novaEmpresaNome.trim());
    setNovaEmpresaNome('');
    setMostrandoNovaEmpresa(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white" style={{ color: '#ffffff' }}>Alternar Perfil ou Empresa (Multi-Marcenaria)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Seção 1: Selecionar Usuário */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Usuário Conectado
              </span>
              <span className="text-[10px] text-slate-400">
                Teste como Dono ou Marceneiro
              </span>
            </div>

            <div className="space-y-2">
              {usuarios.map((u) => {
                const ativo = u.id === usuarioAtivo.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onSelecionarUsuario(u.id);
                      onClose();
                    }}
                    className={`w-full p-3 text-left rounded-xl border flex items-center justify-between transition-all ${
                      ativo
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                          u.perfil === 'admin'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.perfil === 'admin' ? <Shield size={16} /> : <HardHat size={16} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{u.nome}</div>
                        <div className="text-[11px] text-slate-500">
                          {u.cargo} • {u.perfil === 'admin' ? 'Acesso Master' : 'Acesso Operacional'}
                        </div>
                      </div>
                    </div>

                    {ativo && <Check size={16} className="text-slate-900" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Alternar Marcenaria (Multi-Empresa) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Marcenaria Ativa
              </span>
              <button
                type="button"
                onClick={() => setMostrandoNovaEmpresa(!mostrandoNovaEmpresa)}
                className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
              >
                <Plus size={12} />
                <span>+ Outra Marcenaria</span>
              </button>
            </div>

            {mostrandoNovaEmpresa && (
              <form onSubmit={handleCriarEmpresa} className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nome Fantasia da Nova Marcenaria
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marcenaria Moderna"
                    value={novaEmpresaNome}
                    onChange={(e) => setNovaEmpresaNome(e.target.value)}
                    className="flex-1 h-8 px-2.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="h-8 px-3 bg-slate-900 text-white text-xs font-bold rounded-lg"
                  >
                    Criar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {empresas.map((emp) => {
                const ativa = emp.id === empresaAtiva.id;
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      onSelecionarEmpresa(emp.id);
                      onClose();
                    }}
                    className={`w-full p-2.5 text-left rounded-xl border flex items-center justify-between transition-all ${
                      ativa
                        ? 'border-amber-600 bg-amber-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building size={16} className={ativa ? 'text-amber-700' : 'text-slate-400'} />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{emp.nomeFantasia}</div>
                        <div className="text-[10px] text-slate-500">{emp.razaoSocial}</div>
                      </div>
                    </div>
                    {ativa && <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Ativa</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm('Deseja redefinir para os dados padrão da demonstração?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <LogOut size={12} />
            <span>Redefinir Demonstração</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

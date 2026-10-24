import React, { useState } from 'react';
import { CargoUsuario, PerfilAcesso, Usuario } from '../types';
import {
  UserCheck,
  Shield,
  Plus,
  Trash2,
  Edit2,
  X,
  Phone,
  Mail,
  Check,
} from 'lucide-react';

interface EquipeViewProps {
  usuarios: Usuario[];
  usuarioAtivo: Usuario;
  empresaId: string;
  onAdicionarUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  onAtualizarUsuario: (id: string, usuario: Partial<Usuario>) => void;
  onRemoverUsuario: (id: string) => void;
}

const CARGOS: CargoUsuario[] = [
  'Marceneiro',
  'Ajudante',
  'Projetista',
  'Gerente',
  'Dono / Administrador',
];

export const EquipeView: React.FC<EquipeViewProps> = ({
  usuarios,
  usuarioAtivo,
  empresaId,
  onAdicionarUsuario,
  onAtualizarUsuario,
  onRemoverUsuario,
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState<CargoUsuario>('Marceneiro');
  const [perfil, setPerfil] = useState<PerfilAcesso>('funcionario');

  const isAdmin = usuarioAtivo.perfil === 'admin';

  const abrirModalNovo = () => {
    setUsuarioEmEdicao(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setCargo('Marceneiro');
    setPerfil('funcionario');
    setModalAberto(true);
  };

  const abrirModalEdicao = (u: Usuario) => {
    setUsuarioEmEdicao(u);
    setNome(u.nome);
    setEmail(u.email);
    setTelefone(u.telefone);
    setCargo(u.cargo);
    setPerfil(u.perfil);
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (usuarioEmEdicao) {
      onAtualizarUsuario(usuarioEmEdicao.id, {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        cargo,
        perfil,
      });
    } else {
      onAdicionarUsuario({
        empresaId,
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        cargo,
        perfil,
        ativo: true,
      });
    }

    setModalAberto(false);
  };

  return (
    <div className="space-y-6">
      {/* Topo da Equipe */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <UserCheck size={16} />
            <span>Gestão de Colaboradores</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Equipe da Oficina & Níveis de Acesso</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre os marceneiros, ajudantes e projetistas que criam e acompanham solicitações de corte
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={abrirModalNovo}
            className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Convidar / Cadastrar Funcionário</span>
          </button>
        )}
      </div>

      {/* Grade de Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {usuarios.map((user) => {
          const ehAtivoAtual = user.id === usuarioAtivo.id;

          return (
            <div
              key={user.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                ehAtivoAtual ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {user.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {user.nome}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500">
                        {user.cargo}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => abrirModalEdicao(user)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={13} />
                      </button>
                      {usuarios.length > 1 && !ehAtivoAtual && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remover acesso de ${user.nome}?`)) {
                              onRemoverUsuario(user.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{user.email || 'Sem e-mail'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    <span>{user.telefone || 'Sem telefone'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    user.perfil === 'admin'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {user.perfil === 'admin' ? 'Administrador Master' : 'Funcionário / Marceneiro'}
                </span>

                {ehAtivoAtual && (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check size={13} />
                    <span>Seu Perfil Atual</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Convidar / Editar Funcionário */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {usuarioEmEdicao ? 'Editar Colaborador' : 'Convidar Novo Funcionário'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Profissional *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tiago Alves"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="tiago@oficina.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 97777-1122"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Função / Cargo</label>
                  <select
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value as CargoUsuario)}
                    className="w-full h-10 px-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {CARGOS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nível de Acesso</label>
                  <select
                    value={perfil}
                    onChange={(e) => setPerfil(e.target.value as PerfilAcesso)}
                    className="w-full h-10 px-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="funcionario">Marceneiro (Cria pedidos)</option>
                    <option value="admin">Administrador Master</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

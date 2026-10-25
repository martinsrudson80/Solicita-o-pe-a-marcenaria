import React, { useState, useRef, useEffect } from 'react';
import { AbaAtual, Empresa, Usuario } from '../types';
import { TEMAS } from '../utils/theme';
import {
  MoreVertical,
  Settings,
  Users,
  History,
  UserCheck,
  Plus,
  Shield,
  HardHat,
  Building,
  Layers,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  empresa: Empresa;
  usuarioAtivo: Usuario;
  onAbrirNovaSolicitacao: () => void;
  onAbrirConfiguracoes: () => void;
  onAbrirClientes: () => void;
  onAbrirHistorico: () => void;
  onAbrirEquipe: () => void;
  onAbrirTrocarPerfil: () => void;
  abaAtual: AbaAtual;
  setAbaAtual: (aba: AbaAtual) => void;
}

export const Header: React.FC<HeaderProps> = ({
  empresa,
  usuarioAtivo,
  onAbrirNovaSolicitacao,
  onAbrirConfiguracoes,
  onAbrirClientes,
  onAbrirHistorico,
  onAbrirEquipe,
  onAbrirTrocarPerfil,
  abaAtual,
  setAbaAtual,
}) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const temaConfig = TEMAS[empresa.tema] || TEMAS.azul;

  const isAdmin = usuarioAtivo.perfil === 'admin';

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* 1. NOME DA MARCENARIA EM DESTAQUE (TÍTULO PRINCIPAL DO APP) */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setAbaAtual('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            {empresa.logotipoUrl ? (
              <img
                src={empresa.logotipoUrl}
                alt={empresa.nomeFantasia}
                className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-black text-sm shadow-xs border border-amber-500/30 shrink-0">
                <Layers size={18} />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors truncate">
                {empresa.nomeFantasia || 'Minha Marcenaria'}
              </h1>
              <span className="text-[10px] text-slate-400 block font-medium -mt-0.5 truncate">
                Gestão de Corte MDF & Insumos
              </span>
            </div>
          </button>
        </div>

        {/* 2. NAVEGAÇÃO ENTRE ABAS RÁPIDAS (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAbaAtual('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              abaAtual === 'dashboard'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Pedidos & Cortes
          </button>

          <button
            type="button"
            onClick={() => setAbaAtual('clientes')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              abaAtual === 'clientes'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Clientes & Obras
          </button>
        </nav>

        {/* 3. AÇÕES RÁPIDAS, PERFIL E MENU TRÊS PONTINHOS ⋮ */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Botão Nova Solicitação */}
          <button
            type="button"
            onClick={onAbrirNovaSolicitacao}
            className="h-9 px-3.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nova Solicitação</span>
            <span className="sm:hidden">Novo</span>
          </button>

          {/* Pill de Usuário Ativo */}
          <button
            type="button"
            onClick={onAbrirTrocarPerfil}
            title="Clique para alternar perfil ou empresa"
            className="hidden sm:flex items-center gap-2 h-9 px-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs rounded-xl transition-colors"
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isAdmin ? <Shield size={12} /> : <HardHat size={12} />}
            </div>
            <div className="text-left text-[11px] leading-tight max-w-[120px] truncate">
              <span className="font-bold text-slate-200 block truncate">{usuarioAtivo.nome}</span>
              <span className="text-[9px] text-slate-400 block truncate">
                {isAdmin ? 'Master' : usuarioAtivo.cargo}
              </span>
            </div>
          </button>

          {/* MENU TRÊS PONTINHOS (⋮) EXIGIDO NA ESPECIFICAÇÃO */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuAberto(!menuAberto)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition-colors"
              title="Ações Rápidas (Configurações, Clientes, Histórico, Sair)"
              aria-label="Menu de Ações Rápidas"
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown Menu */}
            {menuAberto && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Marcenaria Conectada
                  </span>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {empresa.nomeFantasia}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {usuarioAtivo.nome} ({usuarioAtivo.cargo})
                  </div>
                </div>

                {/* Itens do Menu dos Três Pontinhos */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuAberto(false);
                    onAbrirConfiguracoes();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Settings size={15} className="text-amber-600" />
                  <div>
                    <span>Configurações do App e da Conta</span>
                    <span className="block text-[10px] font-normal text-slate-400">
                      Nome, Logotipo, Fábrica e Cores
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuAberto(false);
                    onAbrirClientes();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Users size={15} className="text-blue-600" />
                  <div>
                    <span>Cadastro e Lista de Clientes</span>
                    <span className="block text-[10px] font-normal text-slate-400">
                      Obras, endereços e histórico
                    </span>
                  </div>
                </button>



                <button
                  type="button"
                  onClick={() => {
                    setMenuAberto(false);
                    setAbaAtual('pecas_projeto');
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <Layers size={15} className="text-amber-600" />
                  <div>
                    <span>Histórico de Peças por Projeto</span>
                    <span className="block text-[10px] font-normal text-slate-400">
                      Cortes de MDF organizados por projeto
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuAberto(false);
                    onAbrirEquipe();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <HardHat size={15} className="text-emerald-600" />
                  <div>
                    <span>Equipe da Oficina</span>
                    <span className="block text-[10px] font-normal text-slate-400">
                      Marceneiros, ajudantes e acessos
                    </span>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setMenuAberto(false);
                    onAbrirTrocarPerfil();
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 transition-colors"
                >
                  <UserCheck size={15} className="text-slate-600" />
                  <div>
                    <span>Alterar Perfil / Sair (Logout)</span>
                    <span className="block text-[10px] font-normal text-slate-400">
                      Mudar de marceneiro ou empresa
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

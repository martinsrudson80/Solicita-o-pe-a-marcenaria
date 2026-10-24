/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cliente, Empresa, SolicitacaoPedido, StatusPedido, Usuario } from './types';
import {
  addCliente,
  addPedido,
  deleteCliente,
  deletePedido,
  getEmpresaAtiva,
  getEmpresas,
  getClientes,
  getPedidos,
  getUsuarioAtivo,
  getUsuarios,
  saveUsuarios,
  saveEmpresas,
  setEmpresaAtivaId,
  setUsuarioAtivoId,
  updateCliente,
  updateEmpresaAtiva,
  updatePedidoStatus,
} from './utils/storage';
import { TEMAS } from './utils/theme';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ClientesView } from './components/ClientesView';
import { EquipeView } from './components/EquipeView';
import { NovaSolicitacaoModal } from './components/NovaSolicitacaoModal';
import { PedidoDetalhesModal } from './components/PedidoDetalhesModal';
import { ConfiguracoesModal } from './components/ConfiguracoesModal';
import { TrocarPerfilModal } from './components/TrocarPerfilModal';
import { gerarRelatorioPedidoPdf } from './utils/pdfGenerator';
import { abrirWhatsAppPedido } from './utils/whatsapp';

export default function App() {
  // Estado Principal
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtiva, setEmpresaAtiva] = useState<Empresa | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioAtivo, setUsuarioAtivo] = useState<Usuario | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pedidos, setPedidos] = useState<SolicitacaoPedido[]>([]);

  // Abas de visualização
  const [abaAtual, setAbaAtual] = useState<'dashboard' | 'clientes' | 'equipe'>('dashboard');

  // Modais
  const [modalNovaSolicitacao, setModalNovaSolicitacao] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<SolicitacaoPedido | null>(null);
  const [modalConfiguracoes, setModalConfiguracoes] = useState(false);
  const [modalTrocarPerfil, setModalTrocarPerfil] = useState(false);
  const [clientePreSelecionadoId, setClientePreSelecionadoId] = useState<string | null>(null);

  // Inicialização e Carregamento de Dados do Storage
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const todasEmpresas = getEmpresas();
    setEmpresas(todasEmpresas);

    const ativa = getEmpresaAtiva();
    setEmpresaAtiva(ativa);

    const todosUsuarios = getUsuarios(ativa.id);
    setUsuarios(todosUsuarios);

    const usuarioAtual = getUsuarioAtivo();
    setUsuarioAtivo(usuarioAtual);

    const listaClientes = getClientes(ativa.id);
    setClientes(listaClientes);

    const listaPedidos = getPedidos(ativa.id);
    setPedidos(listaPedidos);
  };

  // Atualização da Empresa (Nome, Logo, Tema, WhatsApp fábrica)
  const handleAtualizarEmpresa = (dados: Partial<Empresa>) => {
    const atualizada = updateEmpresaAtiva(dados);
    setEmpresaAtiva(atualizada);
    setEmpresas(getEmpresas());
  };

  // Alternar Empresa Ativa (Multi-Tenant)
  const handleSelecionarEmpresa = (empresaId: string) => {
    setEmpresaAtivaId(empresaId);
    carregarDados();
  };

  // Criar Nova Marcenaria
  const handleCriarNovaEmpresa = (nomeFantasia: string) => {
    const nova: Empresa = {
      id: 'emp-' + Date.now().toString(36),
      nomeFantasia,
      razaoSocial: `${nomeFantasia} ME`,
      cnpjOuCpf: '',
      telefone: '',
      whatsappFabrica: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: 'São Paulo',
        estado: 'SP',
      },
      tema: 'azul',
      criadoEm: new Date().toISOString(),
    };
    const lista = [...empresas, nova];
    saveEmpresas(lista);
    setEmpresas(lista);
    handleSelecionarEmpresa(nova.id);
  };

  // Alternar Usuário Ativo (Dono vs Marceneiro)
  const handleSelecionarUsuario = (usuarioId: string) => {
    setUsuarioAtivoId(usuarioId);
    const u = usuarios.find((item) => item.id === usuarioId);
    if (u) setUsuarioAtivo(u);
  };

  // Criar Pedido
  const handleSalvarPedido = (
    pedidoPayload: Omit<SolicitacaoPedido, 'id' | 'codigo' | 'dataCriacao' | 'dataAtualizacao'>
  ): SolicitacaoPedido => {
    const novo = addPedido(pedidoPayload);
    setPedidos(getPedidos(empresaAtiva?.id));
    return novo;
  };

  // Criar e Disparar WhatsApp diretamente
  const handleSalvarEEnviarWhatsApp = (pedido: SolicitacaoPedido) => {
    if (empresaAtiva) {
      gerarRelatorioPedidoPdf(pedido, empresaAtiva);
      abrirWhatsAppPedido(pedido, empresaAtiva);
    }
  };

  // Atualizar Status do Pedido (Aguardando -> Enviado Corte -> Em Produção -> Concluído)
  const handleAtualizarStatusPedido = (id: string, novoStatus: StatusPedido, nota?: string) => {
    if (!usuarioAtivo) return;
    updatePedidoStatus(id, novoStatus, `${usuarioAtivo.nome} (${usuarioAtivo.cargo})`, nota);
    setPedidos(getPedidos(empresaAtiva?.id));
    if (pedidoSelecionado && pedidoSelecionado.id === id) {
      const atualizados = getPedidos(empresaAtiva?.id);
      const achado = atualizados.find((p) => p.id === id);
      if (achado) setPedidoSelecionado(achado);
    }
  };

  // Excluir Pedido
  const handleExcluirPedido = (id: string) => {
    deletePedido(id);
    setPedidos(getPedidos(empresaAtiva?.id));
  };

  // CRUD Clientes
  const handleSalvarCliente = (clienteDados: Omit<Cliente, 'id' | 'criadoEm'>) => {
    addCliente(clienteDados);
    setClientes(getClientes(empresaAtiva?.id));
  };

  const handleAtualizarCliente = (id: string, clienteDados: Partial<Cliente>) => {
    updateCliente(id, clienteDados);
    setClientes(getClientes(empresaAtiva?.id));
  };

  const handleExcluirCliente = (id: string) => {
    deleteCliente(id);
    setClientes(getClientes(empresaAtiva?.id));
  };

  const handleNovoPedidoComCliente = (clienteId: string) => {
    setClientePreSelecionadoId(clienteId);
    setModalNovaSolicitacao(true);
  };

  // Gestão de Equipe
  const handleAdicionarUsuario = (usuarioDados: Omit<Usuario, 'id'>) => {
    const novo: Usuario = {
      ...usuarioDados,
      id: 'user-' + Date.now().toString(36),
    };
    const lista = [...usuarios, novo];
    saveUsuarios(lista);
    setUsuarios(lista);
  };

  const handleAtualizarUsuario = (id: string, usuarioDados: Partial<Usuario>) => {
    const lista = usuarios.map((u) => (u.id === id ? { ...u, ...usuarioDados } : u));
    saveUsuarios(lista);
    setUsuarios(lista);
    if (usuarioAtivo?.id === id) {
      setUsuarioAtivo({ ...usuarioAtivo, ...usuarioDados });
    }
  };

  const handleRemoverUsuario = (id: string) => {
    const lista = usuarios.filter((u) => u.id !== id);
    saveUsuarios(lista);
    setUsuarios(lista);
  };

  if (!empresaAtiva || !usuarioAtivo) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Carregando marcenaria...</p>
        </div>
      </div>
    );
  }

  const temaConfig = TEMAS[empresaAtiva.tema] || TEMAS.azul;

  return (
    <div
      className={`min-h-screen font-sans ${
        empresaAtiva.tema === 'escuro' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'
      }`}
    >
      {/* CABEÇALHO PRINCIPAL COM O NOME DA MARCENARIA EM DESTAQUE E TRÊS PONTINHOS ⋮ */}
      <Header
        empresa={empresaAtiva}
        usuarioAtivo={usuarioAtivo}
        onAbrirNovaSolicitacao={() => {
          setClientePreSelecionadoId(null);
          setModalNovaSolicitacao(true);
        }}
        onAbrirConfiguracoes={() => setModalConfiguracoes(true)}
        onAbrirClientes={() => setAbaAtual('clientes')}
        onAbrirHistorico={() => setAbaAtual('dashboard')}
        onAbrirEquipe={() => setAbaAtual('equipe')}
        onAbrirTrocarPerfil={() => setModalTrocarPerfil(true)}
        abaAtual={abaAtual}
        setAbaAtual={setAbaAtual}
      />

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {abaAtual === 'dashboard' && (
          <DashboardView
            pedidos={pedidos}
            empresa={empresaAtiva}
            usuarioAtivo={usuarioAtivo}
            onSelecionarPedido={(pedido) => setPedidoSelecionado(pedido)}
            onNovaSolicitacao={() => {
              setClientePreSelecionadoId(null);
              setModalNovaSolicitacao(true);
            }}
          />
        )}

        {abaAtual === 'clientes' && (
          <ClientesView
            clientes={clientes}
            pedidos={pedidos}
            empresaId={empresaAtiva.id}
            onSalvarCliente={handleSalvarCliente}
            onAtualizarCliente={handleAtualizarCliente}
            onExcluirCliente={handleExcluirCliente}
            onNovoPedidoComCliente={handleNovoPedidoComCliente}
          />
        )}

        {abaAtual === 'equipe' && (
          <EquipeView
            usuarios={usuarios}
            usuarioAtivo={usuarioAtivo}
            empresaId={empresaAtiva.id}
            onAdicionarUsuario={handleAdicionarUsuario}
            onAtualizarUsuario={handleAtualizarUsuario}
            onRemoverUsuario={handleRemoverUsuario}
          />
        )}
      </main>

      {/* MODAL: NOVA SOLICITAÇÃO DE CORTE MDF & FERRAGENS */}
      <NovaSolicitacaoModal
        isOpen={modalNovaSolicitacao}
        onClose={() => setModalNovaSolicitacao(false)}
        empresa={empresaAtiva}
        usuarioAtivo={usuarioAtivo}
        clientes={clientes}
        onSalvarPedido={handleSalvarPedido}
        onSalvarEEnviarWhatsApp={handleSalvarEEnviarWhatsApp}
        onNovoClienteModal={() => {
          setModalNovaSolicitacao(false);
          setAbaAtual('clientes');
        }}
      />

      {/* MODAL: DETALHES DO PEDIDO, PDF & WHATSAPP */}
      <PedidoDetalhesModal
        isOpen={!!pedidoSelecionado}
        onClose={() => setPedidoSelecionado(null)}
        pedido={pedidoSelecionado}
        empresa={empresaAtiva}
        usuarioAtivo={usuarioAtivo}
        onAtualizarStatus={handleAtualizarStatusPedido}
        onExcluirPedido={handleExcluirPedido}
      />

      {/* MODAL: CONFIGURAÇÕES E PERSONALIZAÇÃO VISUAL */}
      <ConfiguracoesModal
        isOpen={modalConfiguracoes}
        onClose={() => setModalConfiguracoes(false)}
        empresa={empresaAtiva}
        onSalvarEmpresa={handleAtualizarEmpresa}
      />

      {/* MODAL: ALTERAR PERFIL / SAIR / MULTI-EMPRESA */}
      <TrocarPerfilModal
        isOpen={modalTrocarPerfil}
        onClose={() => setModalTrocarPerfil(false)}
        usuarios={usuarios}
        usuarioAtivo={usuarioAtivo}
        onSelecionarUsuario={handleSelecionarUsuario}
        empresas={empresas}
        empresaAtiva={empresaAtiva}
        onSelecionarEmpresa={handleSelecionarEmpresa}
        onCriarNovaEmpresa={handleCriarNovaEmpresa}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Empresa, FerragemInsumo, PecaMdf, SolicitacaoPedido, StatusPedido, Usuario } from '../types';
import { gerarRelatorioPedidoPdf } from '../utils/pdfGenerator';
import { abrirWhatsAppPedido, formatarMensagemWhatsApp } from '../utils/whatsapp';
import { updatePedido } from '../utils/storage';
import {
  X,
  FileDown,
  Printer,
  Share2,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  Send,
  Building,
  User,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';

interface PedidoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: SolicitacaoPedido | null;
  empresa: Empresa;
  usuarioAtivo: Usuario;
  onAtualizarStatus: (id: string, status: StatusPedido, nota?: string) => void;
  onExcluirPedido: (id: string) => void;
  onAtualizarPedido?: (pedidoAtualizado: SolicitacaoPedido) => void;
}

export const PedidoDetalhesModal: React.FC<PedidoDetalhesModalProps> = ({
  isOpen,
  onClose,
  pedido,
  empresa,
  usuarioAtivo,
  onAtualizarStatus,
  onExcluirPedido,
  onAtualizarPedido,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [numeroWhatsappDestino, setNumeroWhatsappDestino] = useState(empresa.whatsappFabrica || '');
  const [modalWhatsappAberto, setModalWhatsappAberto] = useState(false);
  const [notaStatus, setNotaStatus] = useState('');
  const [historicoExpandido, setHistoricoExpandido] = useState(true);
  const [infoGeraisExpandido, setInfoGeraisExpandido] = useState(true);
  const [pecasExpandido, setPecasExpandido] = useState(true);
  const [ferragensExpandido, setFerragensExpandido] = useState(true);

  // Estado para Edição de Peças do Projeto
  const [modalEditarPecasAberto, setModalEditarPecasAberto] = useState(false);
  const [pecasEditando, setPecasEditando] = useState<PecaMdf[]>([]);

  // Estado para Edição de Ferragens e Insumos do Projeto
  const [modalEditarFerragensAberto, setModalEditarFerragensAberto] = useState(false);
  const [ferragensEditando, setFerragensEditando] = useState<FerragemInsumo[]>([]);

  if (!isOpen || !pedido) return null;

  const handleAbrirEditorPecas = () => {
    setPecasEditando(JSON.parse(JSON.stringify(pedido.pecasMdf)));
    setModalEditarPecasAberto(true);
  };

  const handleAdicionarNovaPeca = () => {
    const nova: PecaMdf = {
      id: 'p-' + Date.now().toString(36),
      nomePeca: `Nova Peça ${pecasEditando.length + 1}`,
      material: 'MDF',
      corPadrao: 'Louro Freijó',
      espessuraMm: 18,
      comprimentoMm: 700,
      larguraMm: 400,
      quantidade: 1,
      fitagem: { c1: true, c2: false, l1: false, l2: false },
      fitaEspessura: '1.0mm',
      observacao: '',
    };
    setPecasEditando([...pecasEditando, nova]);
  };

  const handleRemoverPeca = (id: string) => {
    if (pecasEditando.length <= 1) {
      alert('O projeto precisa ter pelo menos 1 peça.');
      return;
    }
    setPecasEditando(pecasEditando.filter((p) => p.id !== id));
  };

  const handleAtualizarCampoPeca = (id: string, campo: keyof PecaMdf, valor: any) => {
    setPecasEditando(
      pecasEditando.map((p) => {
        if (p.id === id) {
          return { ...p, [campo]: valor };
        }
        return p;
      })
    );
  };

  const handleAtualizarFitagemPeca = (id: string, lado: 'c1' | 'c2' | 'l1' | 'l2', valor: boolean) => {
    setPecasEditando(
      pecasEditando.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            fitagem: {
              ...p.fitagem,
              [lado]: valor,
            },
          };
        }
        return p;
      })
    );
  };

  const handleSalvarPecasEditadas = () => {
    if (!pedido) return;
    const pedidoAtualizado = updatePedido(pedido.id, { pecasMdf: pecasEditando });
    if (pedidoAtualizado) {
      if (onAtualizarPedido) {
        onAtualizarPedido(pedidoAtualizado);
      }
    }
    setModalEditarPecasAberto(false);
  };

  const handleAbrirEditorFerragens = () => {
    setFerragensEditando(JSON.parse(JSON.stringify(pedido.ferragens || [])));
    setModalEditarFerragensAberto(true);
  };

  const handleAdicionarNovaFerragem = () => {
    const nova: FerragemInsumo = {
      id: 'f-' + Date.now().toString(36),
      categoria: 'abertura',
      nomeItem: 'Novo Item / Ferragem',
      quantidade: 1,
      unidade: 'unidades',
      observacoes: '',
    };
    setFerragensEditando([...ferragensEditando, nova]);
  };

  const handleRemoverFerragem = (id: string) => {
    setFerragensEditando(ferragensEditando.filter((f) => f.id !== id));
  };

  const handleAtualizarCampoFerragem = (id: string, campo: keyof FerragemInsumo, valor: any) => {
    setFerragensEditando(
      ferragensEditando.map((f) => {
        if (f.id === id) {
          return { ...f, [campo]: valor };
        }
        return f;
      })
    );
  };

  const handleSalvarFerragensEditadas = () => {
    if (!pedido) return;
    const pedidoAtualizado = updatePedido(pedido.id, { ferragens: ferragensEditando });
    if (pedidoAtualizado) {
      if (onAtualizarPedido) {
        onAtualizarPedido(pedidoAtualizado);
      }
    }
    setModalEditarFerragensAberto(false);
  };

  const totalPecas = pedido.pecasMdf.reduce((acc, p) => acc + p.quantidade, 0);
  const totalAreaM2 = pedido.pecasMdf.reduce(
    (acc, p) => acc + (p.comprimentoMm * p.larguraMm * p.quantidade) / 1000000,
    0
  );
  const totalFerragens = pedido.ferragens?.reduce((acc, f) => acc + f.quantidade, 0) || 0;

  const statusConfig = {
    aguardando_aprovacao: {
      rotulo: 'Aguardando Aprovação',
      corBadge: 'bg-amber-100 text-amber-900 border-amber-300',
      icone: Clock,
      proximo: 'enviado_corte' as StatusPedido,
      proximoRotulo: 'Aprovar & Enviar p/ Corte',
      anterior: null,
      anteriorRotulo: null,
    },
    enviado_corte: {
      rotulo: 'Enviado para Corte',
      corBadge: 'bg-blue-100 text-blue-900 border-blue-300',
      icone: Send,
      proximo: 'em_producao' as StatusPedido,
      proximoRotulo: 'Mudar p/ Em Produção',
      anterior: 'aguardando_aprovacao' as StatusPedido,
      anteriorRotulo: 'Voltar p/ Aguardando',
    },
    em_producao: {
      rotulo: 'Em Produção',
      corBadge: 'bg-purple-100 text-purple-900 border-purple-300',
      icone: Wrench,
      proximo: 'concluido' as StatusPedido,
      proximoRotulo: 'Concluir Pedido',
      anterior: 'enviado_corte' as StatusPedido,
      anteriorRotulo: 'Voltar p/ Enviado a Corte',
    },
    concluido: {
      rotulo: 'Concluído',
      corBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icone: CheckCircle2,
      proximo: null,
      proximoRotulo: null,
      anterior: 'em_producao' as StatusPedido,
      anteriorRotulo: 'Voltar p/ Em Produção',
    },
  }[pedido.status];

  const handleBaixarPdf = () => {
    gerarRelatorioPedidoPdf(pedido, empresa);
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleCopiarMensagem = () => {
    const txt = formatarMensagemWhatsApp(pedido, empresa);
    navigator.clipboard.writeText(txt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleDispararWhatsApp = () => {
    // Primeiro gera/baixa o PDF para que o usuário tenha o arquivo pronto no dispositivo
    gerarRelatorioPedidoPdf(pedido, empresa);
    // Em seguida abre o WhatsApp
    abrirWhatsAppPedido(pedido, empresa, numeroWhatsappDestino);
    setModalWhatsappAberto(false);
  };

  const handleMudarStatus = (novoStatus: StatusPedido) => {
    onAtualizarStatus(pedido.id, novoStatus, notaStatus);
    setNotaStatus('');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 my-auto flex flex-col h-full sm:h-auto sm:max-h-[95vh] overflow-hidden text-slate-900">
        {/* Header do Detalhe */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white" style={{ color: '#ffffff' }}>
                {pedido.projetoNome}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200 mt-0.5" style={{ color: '#e2e8f0' }}>
                <span className="font-bold" style={{ color: '#ffffff' }}>{empresa.nomeFantasia}</span>
                <span style={{ color: '#94a3b8' }}>•</span>
                <span style={{ color: '#f1f5f9' }}>Cliente: <strong style={{ color: '#ffffff' }}>{pedido.clienteNome}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.corBadge}`}
            >
              <statusConfig.icone size={14} />
              <span>{statusConfig.rotulo}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Barra de Ações Rápidas (PDF & WhatsApp) */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBaixarPdf}
              className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileDown size={15} />
              <span>Baixar Relatório PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setModalWhatsappAberto(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Share2 size={15} />
              <span>Enviar via WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopiarMensagem}
              className="px-3 py-2 bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-300 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
            >
              {copiado ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiado ? 'Texto Copiado!' : 'Copiar Texto Resumo'}</span>
            </button>
          </div>

          {/* Ações de Gestão de Status pelo Dono ou Solicitante */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {statusConfig.anterior && (
              <button
                type="button"
                onClick={() => handleMudarStatus(statusConfig.anterior!)}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 h-9 whitespace-nowrap"
                title="Voltar o pedido para a etapa anterior"
              >
                <span>{statusConfig.anteriorRotulo}</span>
              </button>
            )}

            {statusConfig.proximo && (
              <button
                type="button"
                onClick={() => handleMudarStatus(statusConfig.proximo!)}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 h-9 whitespace-nowrap"
              >
                <span>{statusConfig.proximoRotulo}</span>
                <ArrowRight size={14} className="shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Modal de Disparo WhatsApp */}
        {modalWhatsappAberto && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 shrink-0 animate-in fade-in">
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex-1">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <MessageSquare size={16} className="text-emerald-700" />
                  Enviar Pedido para Central de Corte / Fornecedor
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  O sistema baixará o PDF oficial e abrirá a conversa com o resumo técnico pronto.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="WhatsApp da Fábrica (DDD + Número)"
                    value={numeroWhatsappDestino}
                    onChange={(e) => setNumeroWhatsappDestino(e.target.value)}
                    className="h-8 px-3 text-xs bg-white border border-emerald-300 rounded-lg w-64 font-mono font-bold text-emerald-950"
                  />
                  <span className="text-[11px] text-emerald-700">
                    {empresa.whatsappFabrica ? '(Padrão da Empresa)' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalWhatsappAberto(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-emerald-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDispararWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Confirmar & Abrir WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo do Pedido com Rolagem */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Informações da Obra, Marceneiro e Datas com Minimizador */}
          <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden transition-all shadow-2xs">
            <button
              type="button"
              onClick={() => setInfoGeraisExpandido(!infoGeraisExpandido)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User size={15} className="text-slate-600" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Informações Gerais do Pedido (Cliente, Marcenaria & Datas)
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>{infoGeraisExpandido ? 'Minimizar' : 'Expandir'}</span>
                {infoGeraisExpandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {infoGeraisExpandido && (
              <div className="p-3.5 border-t border-slate-200/60 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <User size={12} />
                      Cliente / Obra
                    </span>
                    <p className="text-xs font-bold text-slate-800">{pedido.clienteNome}</p>
                    <p className="text-[11px] text-slate-500">{pedido.clienteTelefone || 'Sem telefone'}</p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin size={11} className="shrink-0 mt-0.5 text-slate-400" />
                      <span className="truncate">{pedido.clienteEndereco}</span>
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Building size={12} />
                      Marcenaria & Responsável
                    </span>
                    <p className="text-xs font-bold text-slate-800">{empresa.nomeFantasia}</p>
                    <p className="text-[11px] text-slate-600">
                      Marceneiro: {pedido.solicitanteNome} ({pedido.solicitanteCargo})
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Fábrica de Corte: {empresa.whatsappFabrica || 'Não definida'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Calendar size={12} />
                      Datas & Métricas
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      Criado em: {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      {totalPecas} peças • {totalAreaM2.toFixed(2)} m²
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono">
                      {pedido.ferragens?.length || 0} tipos de insumos ({totalFerragens} un)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabela 1: Lista de Peças de Corte MDF */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white" style={{ color: '#ffffff' }}>
                  1. Peças Sob Medida MDF ({pedido.pecasMdf.length} linhas / {totalPecas} peças)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAbrirEditorPecas}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Abrir o projeto para adicionar, remover ou editar medidas das peças"
                >
                  <Pencil size={14} />
                  <span>Editar Peças</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPecasExpandido(!pecasExpandido)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  title={pecasExpandido ? 'Minimizar aba de peças' : 'Expandir aba de peças'}
                >
                  <span>{pecasExpandido ? 'Minimizar' : 'Expandir'}</span>
                  {pecasExpandido ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>

            {pecasExpandido && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-300">
                      <th className="py-3 px-3 text-center text-slate-900 font-bold">#</th>
                      <th className="py-3 px-3 text-center text-slate-900 font-bold">Qtd</th>
                      <th className="py-3 px-3 text-slate-900 font-bold">Identificação</th>
                      <th className="py-3 px-3 text-slate-900 font-bold">Material & Cor</th>
                      <th className="py-3 px-3 text-center font-mono text-slate-900 font-bold" style={{ color: '#0f172a' }}>
                        Medidas <span className="text-slate-900 font-bold">(mm)</span>
                      </th>
                      <th className="py-3 px-3 text-center text-slate-900 font-bold" style={{ color: '#0f172a' }}>
                        Fitagem <span className="text-slate-900 font-bold">(C1, C2, L1, L2)</span>
                      </th>
                      <th className="py-3 px-3 text-slate-900 font-bold">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pedido.pecasMdf.map((p, idx) => {
                      const bordas = [
                        p.fitagem.c1 && 'C1',
                        p.fitagem.c2 && 'C2',
                        p.fitagem.l1 && 'L1',
                        p.fitagem.l2 && 'L2',
                      ].filter(Boolean);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900 font-mono text-sm bg-slate-50/60">
                            {p.quantidade}x
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{p.nomePeca}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <span>{p.material} {p.espessuraMm}mm</span>
                            <span className="text-slate-400 block text-[11px]">{p.corPadrao}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                            {p.comprimentoMm} × {p.larguraMm}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {bordas.length > 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {bordas.join(' + ')} ({p.fitaEspessura})
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Sem fita</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">{p.observacao || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabela 2: Ferragens e Insumos */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white" style={{ color: '#ffffff' }}>
                  2. Ferragens, Acessórios & Consumíveis ({(pedido.ferragens || []).length} itens)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAbrirEditorFerragens}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  title="Abrir o projeto para adicionar, remover ou editar ferragens, acessórios e consumíveis"
                >
                  <Wrench size={14} />
                  <span>Editar Ferragens</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFerragensExpandido(!ferragensExpandido)}
                  className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-600"
                  title={ferragensExpandido ? 'Minimizar aba de ferragens' : 'Expandir aba de ferragens'}
                >
                  <span>{ferragensExpandido ? 'Minimizar' : 'Expandir'}</span>
                  {ferragensExpandido ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>

            {ferragensExpandido && (
              <>
                {pedido.ferragens && pedido.ferragens.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-3 text-center">#</th>
                          <th className="py-2.5 px-3">Categoria</th>
                          <th className="py-2.5 px-3">Item Requisitado</th>
                          <th className="py-2.5 px-3 text-center">Quantidade</th>
                          <th className="py-2.5 px-3">Observações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pedido.ferragens.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 text-slate-500 capitalize">{item.categoria}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{item.nomeItem}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                              {item.quantidade} {item.unidade}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">{item.observacoes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-50/50">
                    <p>Nenhuma ferragem ou insumo cadastrado neste pedido.</p>
                    <button
                      type="button"
                      onClick={handleAbrirEditorFerragens}
                      className="mt-2.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Adicionar Ferragens & Consumíveis</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Observações Gerais */}
          {pedido.observacoesGerais && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs">
              <span className="font-bold text-amber-900 block mb-1">
                Instruções de Produção & Observações da Fábrica:
              </span>
              <p className="text-amber-950 leading-relaxed">{pedido.observacoesGerais}</p>
            </div>
          )}

          {/* Histórico de Status */}
          {pedido.historicoStatus && pedido.historicoStatus.length > 0 && (
            <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setHistoricoExpandido(!historicoExpandido)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100/80 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Linha do Tempo / Histórico de Aprovações ({pedido.historicoStatus.length})
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>{historicoExpandido ? 'Minimizar' : 'Expandir'}</span>
                  {historicoExpandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {historicoExpandido && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 space-y-2">
                  {pedido.historicoStatus.map((h, i) => (
                    <div key={i} className="text-xs flex items-start gap-2 text-slate-600">
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">
                        {new Date(h.data).toLocaleDateString('pt-BR')} {new Date(h.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-bold text-slate-800 capitalize">
                        {h.status.replace('_', ' ')}
                      </span>
                      <span>-</span>
                      <span>{h.alteradoPor}</span>
                      {h.nota && <span className="text-slate-500 italic">({h.nota})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onExcluirPedido(pedido.id);
              onClose();
            }}
            className="text-xs font-medium text-rose-600 hover:text-rose-800"
          >
            Excluir Solicitação
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal de Edição de Peças do Projeto */}
      {modalEditarPecasAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col h-full sm:h-auto sm:max-h-[92vh] overflow-hidden text-slate-900 animate-in fade-in">
            {/* Header do Modal de Edição */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Pencil size={18} className="text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white" style={{ color: '#ffffff' }}>
                    Editar & Gerenciar Peças do Projeto
                  </h3>
                  <p className="text-xs text-slate-300" style={{ color: '#cbd5e1' }}>
                    {pedido.projetoNome} — Adicione, remova ou altere dimensões e fitagem das peças
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarPecasAberto(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo com Lista de Peças Editáveis */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Lista de Peças ({pecasEditando.length} itens)
                </span>
                <button
                  type="button"
                  onClick={handleAdicionarNovaPeca}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Adicionar Nova Peça</span>
                </button>
              </div>

              <div className="space-y-3">
                {pecasEditando.map((peca, index) => (
                  <div
                    key={peca.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={peca.nomePeca}
                          onChange={(e) => handleAtualizarCampoPeca(peca.id, 'nomePeca', e.target.value)}
                          placeholder="Nome da peça (ex: Lateral Esquerda)"
                          className="flex-1 h-9 px-3 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-600">Qtd:</span>
                          <input
                            type="number"
                            min={1}
                            value={peca.quantidade}
                            onChange={(e) => handleAtualizarCampoPeca(peca.id, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 h-9 px-2 text-center text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoverPeca(peca.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover esta peça"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Grid de Propriedades */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Material */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Material</label>
                        <select
                          value={peca.material}
                          onChange={(e) => handleAtualizarCampoPeca(peca.id, 'material', e.target.value)}
                          className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                        >
                          <option value="MDF">MDF</option>
                          <option value="MDP">MDP</option>
                          <option value="Porta de Vidro / Espelho">Porta de vidro / espelho</option>
                          <option value="Compensado Naval">Compensado Naval</option>
                          <option value="Fórmica / Revestido">Fórmica / Revestido</option>
                          <option value="Madeira Maciça">Madeira Maciça</option>
                        </select>
                      </div>

                      {/* Cor Padrão */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Cor Padrão</label>
                        <input
                          type="text"
                          value={peca.corPadrao}
                          onChange={(e) => handleAtualizarCampoPeca(peca.id, 'corPadrao', e.target.value)}
                          className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg text-slate-800 font-medium"
                        />
                      </div>

                      {/* Espessura (mm) */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Espessura (mm)</label>
                        <select
                          value={peca.espessuraMm}
                          onChange={(e) => handleAtualizarCampoPeca(peca.id, 'espessuraMm', Number(e.target.value))}
                          className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                        >
                          {[6, 9, 12, 15, 18, 25, 30, 36].map((esp) => (
                            <option key={esp} value={esp}>
                              {esp}mm
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Medidas */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Comprimento × Largura (mm)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={peca.comprimentoMm}
                            onChange={(e) => handleAtualizarCampoPeca(peca.id, 'comprimentoMm', Number(e.target.value))}
                            placeholder="Comp"
                            className="w-full h-8 px-2 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg"
                          />
                          <span className="text-slate-400 font-bold">×</span>
                          <input
                            type="number"
                            value={peca.larguraMm}
                            onChange={(e) => handleAtualizarCampoPeca(peca.id, 'larguraMm', Number(e.target.value))}
                            placeholder="Larg"
                            className="w-full h-8 px-2 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fitagem de Borda */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 bg-slate-50/70 p-2.5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-600">Fitagem:</span>
                        <label className="flex items-center gap-1 cursor-pointer text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={peca.fitagem.c1}
                            onChange={(e) => handleAtualizarFitagemPeca(peca.id, 'c1', e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>C1</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={peca.fitagem.c2}
                            onChange={(e) => handleAtualizarFitagemPeca(peca.id, 'c2', e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>C2</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={peca.fitagem.l1}
                            onChange={(e) => handleAtualizarFitagemPeca(peca.id, 'l1', e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>L1</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer text-xs font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={peca.fitagem.l2}
                            onChange={(e) => handleAtualizarFitagemPeca(peca.id, 'l2', e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>L2</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-600">Espessura Fita:</span>
                        <select
                          value={peca.fitaEspessura}
                          onChange={(e) => handleAtualizarCampoPeca(peca.id, 'fitaEspessura', e.target.value)}
                          className="h-7 px-2 text-xs border border-slate-300 rounded bg-white font-medium"
                        >
                          <option value="0.45mm">0.45mm</option>
                          <option value="1.0mm">1.0mm</option>
                          <option value="2.0mm">2.0mm</option>
                        </select>
                      </div>
                    </div>

                    {/* Observação */}
                    <div>
                      <input
                        type="text"
                        value={peca.observacao || ''}
                        onChange={(e) => handleAtualizarCampoPeca(peca.id, 'observacao', e.target.value)}
                        placeholder="Observação da peça (opcional - ex: usinagem de puxador, furação de dobradiça)"
                        className="w-full h-7 px-2.5 text-[11px] border border-slate-200 rounded text-slate-600 italic bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé do Modal de Edição */}
            <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setModalEditarPecasAberto(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSalvarPecasEditadas}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={15} />
                <span>Salvar Alterações das Peças</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Ferragens e Insumos do Projeto */}
      {modalEditarFerragensAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col h-full sm:h-auto sm:max-h-[92vh] overflow-hidden text-slate-900 animate-in fade-in">
            {/* Header do Modal de Edição de Ferragens */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Wrench size={18} className="text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white" style={{ color: '#ffffff' }}>
                    Editar & Gerenciar Ferragens, Acessórios e Consumíveis
                  </h3>
                  <p className="text-xs text-slate-300" style={{ color: '#cbd5e1' }}>
                    {pedido.projetoNome} — Adicione, remova ou altere quantidades e descrições dos insumos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarFerragensAberto(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo com Lista de Ferragens Editáveis */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Lista de Insumos ({ferragensEditando.length} itens)
                </span>
                <button
                  type="button"
                  onClick={handleAdicionarNovaFerragem}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Adicionar Novo Insumo</span>
                </button>
              </div>

              {ferragensEditando.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-500 font-medium">Nenhum insumo ou ferragem nesta lista.</p>
                  <button
                    type="button"
                    onClick={handleAdicionarNovaFerragem}
                    className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Adicionar Primeiro Item</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ferragensEditando.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={item.nomeItem}
                            onChange={(e) => handleAtualizarCampoFerragem(item.id, 'nomeItem', e.target.value)}
                            placeholder="Nome do item / ferragem (ex: Dobradiça Reta 35mm Slow Close)"
                            className="flex-1 h-9 px-3 text-xs font-bold text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoverFerragem(item.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover este item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Grid de Propriedades do Insumo */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Categoria */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Categoria</label>
                          <select
                            value={item.categoria}
                            onChange={(e) => handleAtualizarCampoFerragem(item.id, 'categoria', e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium capitalize"
                          >
                            <option value="abertura">Abertura / Dobradiças / Pistões</option>
                            <option value="corredicas">Corrediças Gaveta</option>
                            <option value="acessorios">Acessórios / Rodízios / Cabideiros</option>
                            <option value="fitas_consumiveis">Consumíveis / Colas / Fitas / Tapa-Furo</option>
                            <option value="fixacao">Fixação / Parafusos / Cavilhas / Buchas</option>
                            <option value="outros">Outros Insumos</option>
                          </select>
                        </div>

                        {/* Quantidade */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Quantidade</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantidade}
                            onChange={(e) => handleAtualizarCampoFerragem(item.id, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full h-8 px-2 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg"
                          />
                        </div>

                        {/* Unidade */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Unidade de Medida</label>
                          <select
                            value={item.unidade}
                            onChange={(e) => handleAtualizarCampoFerragem(item.id, 'unidade', e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 font-medium capitalize"
                          >
                            <option value="unidades">unidades</option>
                            <option value="pares">pares</option>
                            <option value="metros">metros</option>
                            <option value="barras">barras</option>
                            <option value="caixas">caixas</option>
                            <option value="tubos">tubos</option>
                            <option value="rolos">rolos</option>
                            <option value="kits">kits</option>
                          </select>
                        </div>
                      </div>

                      {/* Observação */}
                      <div>
                        <input
                          type="text"
                          value={item.observacoes || ''}
                          onChange={(e) => handleAtualizarCampoFerragem(item.id, 'observacoes', e.target.value)}
                          placeholder="Observações do item (opcional - marca preferencial, acabamento, especificação)"
                          className="w-full h-7 px-2.5 text-[11px] border border-slate-200 rounded text-slate-600 italic bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé do Modal de Edição de Ferragens */}
            <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setModalEditarFerragensAberto(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSalvarFerragensEditadas}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={15} />
                <span>Salvar Alterações das Ferragens</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

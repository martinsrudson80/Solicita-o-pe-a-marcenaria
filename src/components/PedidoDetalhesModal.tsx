import React, { useState } from 'react';
import { Empresa, SolicitacaoPedido, StatusPedido, Usuario } from '../types';
import { gerarRelatorioPedidoPdf } from '../utils/pdfGenerator';
import { abrirWhatsAppPedido, formatarMensagemWhatsApp } from '../utils/whatsapp';
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
  MessageSquare,
} from 'lucide-react';

interface PedidoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: SolicitacaoPedido | null;
  empresa: Empresa;
  usuarioAtivo: Usuario;
  onAtualizarStatus: (id: string, status: StatusPedido, nota?: string) => void;
  onExcluirPedido: (id: string) => void;
}

export const PedidoDetalhesModal: React.FC<PedidoDetalhesModalProps> = ({
  isOpen,
  onClose,
  pedido,
  empresa,
  usuarioAtivo,
  onAtualizarStatus,
  onExcluirPedido,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [numeroWhatsappDestino, setNumeroWhatsappDestino] = useState(empresa.whatsappFabrica || '');
  const [modalWhatsappAberto, setModalWhatsappAberto] = useState(false);
  const [notaStatus, setNotaStatus] = useState('');

  if (!isOpen || !pedido) return null;

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
      proximoRotulo: 'Aprovar & Enviar para Corte',
    },
    enviado_corte: {
      rotulo: 'Enviado para Corte',
      corBadge: 'bg-blue-100 text-blue-900 border-blue-300',
      icone: Send,
      proximo: 'em_producao' as StatusPedido,
      proximoRotulo: 'Mudar para Em Produção',
    },
    em_producao: {
      rotulo: 'Em Produção',
      corBadge: 'bg-purple-100 text-purple-900 border-purple-300',
      icone: Wrench,
      proximo: 'concluido' as StatusPedido,
      proximoRotulo: 'Finalizar / Marcar Concluído',
    },
    concluido: {
      rotulo: 'Concluído',
      corBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icone: CheckCircle2,
      proximo: null,
      proximoRotulo: null,
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
      <div className="bg-white w-full max-w-4xl rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 my-auto flex flex-col h-full sm:h-auto sm:max-h-[95vh] overflow-hidden">
        {/* Header do Detalhe */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-white">{pedido.projetoNome}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>{empresa.nomeFantasia}</span>
                <span>•</span>
                <span>Cliente: {pedido.clienteNome}</span>
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
          {statusConfig.proximo && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMudarStatus(statusConfig.proximo!)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>{statusConfig.proximoRotulo}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
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
          {/* Informações da Obra, Marceneiro e Datas */}
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

          {/* Tabela 1: Lista de Peças de Corte MDF */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  1. Peças Sob Medida MDF ({pedido.pecasMdf.length} linhas / {totalPecas} peças)
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {totalAreaM2.toFixed(2)} m² total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 text-center">#</th>
                    <th className="py-2.5 px-3 text-center">Qtd</th>
                    <th className="py-2.5 px-3">Identificação</th>
                    <th className="py-2.5 px-3">Material & Cor</th>
                    <th className="py-2.5 px-3 text-center font-mono">Medidas (mm)</th>
                    <th className="py-2.5 px-3 text-center">Fitagem (C1, C2, L1, L2)</th>
                    <th className="py-2.5 px-3">Observações</th>
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
          </div>

          {/* Tabela 2: Ferragens e Insumos */}
          {pedido.ferragens && pedido.ferragens.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-4 py-3 bg-slate-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench size={16} className="text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    2. Ferragens, Acessórios & Consumíveis ({pedido.ferragens.length} itens)
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-300">
                  {totalFerragens} unidades totais
                </span>
              </div>

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
            </div>
          )}

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
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Linha do Tempo / Histórico de Aprovações
              </h4>
              <div className="space-y-2">
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
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm('Tem certeza que deseja remover esta solicitação de pedido?')) {
                onExcluirPedido(pedido.id);
                onClose();
              }
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
    </div>
  );
};

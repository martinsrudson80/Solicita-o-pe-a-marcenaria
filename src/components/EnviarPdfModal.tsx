import React, { useState } from 'react';
import { Empresa, SolicitacaoPedido } from '../types';
import { gerarRelatorioPedidoPdf } from '../utils/pdfGenerator';
import { abrirWhatsAppPedido, formatarMensagemWhatsApp } from '../utils/whatsapp';
import {
  X,
  FileDown,
  Share2,
  Copy,
  Check,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Layers,
  FileText,
} from 'lucide-react';

interface EnviarPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: SolicitacaoPedido | null;
  empresa: Empresa;
}

export const EnviarPdfModal: React.FC<EnviarPdfModalProps> = ({
  isOpen,
  onClose,
  pedido,
  empresa,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [destinoWhatsapp, setDestinoWhatsapp] = useState<'fabrica' | 'cliente' | 'outro'>('fabrica');
  const [numeroCustom, setNumeroCustom] = useState(empresa.whatsappFabrica || '');

  if (!isOpen || !pedido) return null;

  const totalPecas = pedido.pecasMdf.reduce((acc, p) => acc + p.quantidade, 0);
  const totalM2 = pedido.pecasMdf.reduce(
    (acc, p) => acc + (p.comprimentoMm * p.larguraMm * p.quantidade) / 1000000,
    0
  );

  const handleBaixarPdf = () => {
    gerarRelatorioPedidoPdf(pedido, empresa, true);
  };

  const handleEnviarWhatsApp = () => {
    // Baixa o PDF para disponibilizar localmente ao usuário
    const { file } = gerarRelatorioPedidoPdf(pedido, empresa, true);

    let num = empresa.whatsappFabrica;
    if (destinoWhatsapp === 'cliente') {
      num = pedido.clienteTelefone;
    } else if (destinoWhatsapp === 'outro') {
      num = numeroCustom;
    }

    abrirWhatsAppPedido(pedido, empresa, num);
  };

  const handleCompartilharNativo = async () => {
    const { blob, nomeArquivo } = gerarRelatorioPedidoPdf(pedido, empresa, true);

    if (navigator.canShare && blob) {
      try {
        const file = new File([blob], nomeArquivo, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Pedido ${pedido.codigo} - ${pedido.projetoNome}`,
            text: `Segue a lista de corte e insumos para a obra ${pedido.projetoNome} (${empresa.nomeFantasia}).`,
          });
          return;
        }
      } catch (err) {
        // Ignora cancelamento do usuário
      }
    }

    // Fallback: compartilha texto
    const txt = formatarMensagemWhatsApp(pedido, empresa);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido ${pedido.codigo}`,
          text: txt,
        });
      } catch (err) {
        // Fallback para copiar
        navigator.clipboard.writeText(txt);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }
    } else {
      navigator.clipboard.writeText(txt);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  };

  const handleEnviarEmail = () => {
    gerarRelatorioPedidoPdf(pedido, empresa, true);
    const assunto = encodeURIComponent(`Folha de Corte & Insumos - OS ${pedido.codigo} (${pedido.projetoNome})`);
    const textoCompleto = formatarMensagemWhatsApp(pedido, empresa);
    const corpo = encodeURIComponent(
      `Olá!\n\n${textoCompleto}\n\n` +
      `----------------------------------------\n` +
      `Nota: O arquivo PDF oficial baixado em seu computador/celular pode ser anexado a este e-mail.`
    );
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, '_blank');
  };

  const handleCopiarTexto = () => {
    const txt = formatarMensagemWhatsApp(pedido, empresa);
    navigator.clipboard.writeText(txt);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden text-slate-900 animate-in fade-in zoom-in-95">
        {/* Cabeçalho */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <Share2 size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight truncate" style={{ color: '#ffffff' }}>
                Opções de Envio Direto do PDF
              </h2>
              <p className="text-xs text-slate-300 font-mono truncate" style={{ color: '#cbd5e1' }}>
                OS: <strong className="text-white" style={{ color: '#ffffff' }}>{pedido.codigo}</strong> • {pedido.projetoNome}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0 ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Detalhada do Serviço / Ordem de Serviço */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Projeto / Obra:</span>
              <strong className="text-sm font-extrabold text-slate-900">{pedido.projetoNome}</strong>
            </div>
            <div className="flex items-center gap-1 font-mono text-slate-700 font-bold bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-[11px]">
              <Layers size={13} className="text-amber-600 shrink-0" />
              <span>
                {totalPecas} peças ({totalM2.toFixed(2)} m²)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500">Cliente:</span>{' '}
              <strong className="text-slate-900 font-bold">{pedido.clienteNome}</strong>
              {pedido.clienteTelefone && (
                <span className="text-slate-500 block text-[10px] font-mono">
                  Tel: {pedido.clienteTelefone}
                </span>
              )}
            </div>
            <div>
              <span className="text-slate-500">Marceneiro:</span>{' '}
              <strong className="text-slate-800">{pedido.solicitanteNome}</strong>{' '}
              <span className="text-slate-500">({pedido.solicitanteCargo})</span>
            </div>
          </div>

          {pedido.clienteEndereco && (
            <div className="text-[10px] text-slate-500 truncate pt-0.5">
              <span className="font-semibold text-slate-600">Endereço Obra:</span> {pedido.clienteEndereco}
            </div>
          )}
        </div>

        {/* Conteúdo com Opções - Rolável */}
        <div className="p-4 sm:p-5 space-y-4 text-slate-900 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-700">
            Selecione a forma como deseja enviar o relatório PDF oficial:
          </p>

          {/* Opção 1: WhatsApp Direto */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-2">
                <MessageSquare size={16} className="text-emerald-700" />
                1. Enviar pelo WhatsApp
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                Recomendado
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDestinoWhatsapp('fabrica')}
                className={`p-2 rounded-xl text-left border font-bold transition-all ${
                  destinoWhatsapp === 'fabrica'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/50'
                }`}
              >
                <div className="text-[10px] opacity-80 uppercase">Fábrica de Corte</div>
                <div className="truncate text-[11px]">{empresa.whatsappFabrica || 'Não def.'}</div>
              </button>

              <button
                type="button"
                onClick={() => setDestinoWhatsapp('cliente')}
                className={`p-2 rounded-xl text-left border font-bold transition-all ${
                  destinoWhatsapp === 'cliente'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/50'
                }`}
              >
                <div className="text-[10px] opacity-80 uppercase">Cliente da Obra</div>
                <div className="truncate text-[11px]">{pedido.clienteTelefone || 'Sem tel'}</div>
              </button>

              <button
                type="button"
                onClick={() => setDestinoWhatsapp('outro')}
                className={`p-2 rounded-xl text-left border font-bold transition-all ${
                  destinoWhatsapp === 'outro'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-emerald-950 border-emerald-200 hover:bg-emerald-100/50'
                }`}
              >
                <div className="text-[10px] opacity-80 uppercase">Outro Número</div>
                <div className="truncate text-[11px]">Digitar...</div>
              </button>
            </div>

            {destinoWhatsapp === 'outro' && (
              <input
                type="text"
                placeholder="DDD + Número do WhatsApp"
                value={numeroCustom}
                onChange={(e) => setNumeroCustom(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-emerald-300 rounded-xl font-mono text-emerald-950 font-bold"
              />
            )}

            <button
              type="button"
              onClick={handleEnviarWhatsApp}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send size={15} />
              <span>Enviar Mensagem Completa + PDF via WhatsApp</span>
            </button>
          </div>

          {/* Grid de Outras Ações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Download PDF */}
            <button
              type="button"
              onClick={handleBaixarPdf}
              className="p-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors shadow-xs text-left"
            >
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                <FileDown size={18} />
              </div>
              <div>
                <div className="text-slate-900 font-bold">Baixar PDF (.pdf)</div>
                <div className="text-[10px] text-slate-500 font-normal">Salvar arquivo no dispositivo</div>
              </div>
            </button>

            {/* Compartilhar Nativo */}
            <button
              type="button"
              onClick={handleCompartilharNativo}
              className="p-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors shadow-xs text-left"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Smartphone size={18} />
              </div>
              <div>
                <div className="text-slate-900 font-bold">Compartilhar Arquivo</div>
                <div className="text-[10px] text-slate-500 font-normal">Menu nativo do celular/PC</div>
              </div>
            </button>

            {/* E-mail */}
            <button
              type="button"
              onClick={handleEnviarEmail}
              className="p-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors shadow-xs text-left"
            >
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-slate-900 font-bold">Enviar por E-mail</div>
                <div className="text-[10px] text-slate-500 font-normal">Abrir gerenciador de e-mail</div>
              </div>
            </button>

            {/* Copiar Texto Resumo */}
            <button
              type="button"
              onClick={handleCopiarTexto}
              className="p-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs flex items-center gap-2.5 transition-colors shadow-xs text-left"
            >
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                {copiado ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
              </div>
              <div>
                <div className="text-slate-900 font-bold">
                  {copiado ? 'Texto Copiado!' : 'Copiar Texto Completo'}
                </div>
                <div className="text-[10px] text-slate-500 font-normal">Todas as peças e fitagem</div>
              </div>
            </button>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

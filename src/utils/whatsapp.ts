import { Empresa, SolicitacaoPedido } from '../types';

export const formatarMensagemWhatsApp = (pedido: SolicitacaoPedido, empresa: Empresa): string => {
  const totalPecas = pedido.pecasMdf.reduce((acc, p) => acc + p.quantidade, 0);
  const totalM2 = pedido.pecasMdf.reduce(
    (acc, p) => acc + (p.comprimentoMm * p.larguraMm * p.quantidade) / 1000000,
    0
  );
  const totalFerragens = pedido.ferragens?.reduce((acc, f) => acc + f.quantidade, 0) || 0;

  // Destaque das primeiras peças principais
  const resumoPecas = pedido.pecasMdf
    .slice(0, 4)
    .map((p) => `• ${p.quantidade}x ${p.nomePeca} (${p.comprimentoMm}x${p.larguraMm}mm) - ${p.corPadrao} ${p.espessuraMm}mm`)
    .join('\n');

  const maisPecas = pedido.pecasMdf.length > 4 ? `\n• ...e mais ${pedido.pecasMdf.length - 4} item(ns) detalhado(s) no PDF.` : '';

  const msg = `*SOLICITAÇÃO DE CORTE & INSUMOS - ${empresa.nomeFantasia.toUpperCase()}*
📋 *Ordem de Serviço:* ${pedido.codigo}
👤 *Cliente / Obra:* ${pedido.clienteNome}
📐 *Projeto:* ${pedido.projetoNome}
👷 *Marceneiro Responsável:* ${pedido.solicitanteNome} (${pedido.solicitanteCargo})

📦 *RESUMO DO PEDIDO:*
- Total de Peças MDF: *${totalPecas} un* (~${totalM2.toFixed(2)} m²)
- Itens de Ferragem / Insumos: *${pedido.ferragens?.length || 0} tipo(s)* (${totalFerragens} itens no total)

🪵 *PRÉVIA DAS PEÇAS:*
${resumoPecas}${maisPecas}

📍 *Endereço da Entrega:* ${pedido.clienteEndereco || 'Retirada na marcenaria'}
${pedido.observacoesGerais ? `\n⚠️ *Observações:* ${pedido.observacoesGerais}` : ''}

📄 *O arquivo PDF oficial com todas as medidas exatas e fitagem (C1, C2, L1, L2) foi gerado e está anexado para conferência e produção!*

_Enviado via ${empresa.nomeFantasia}_`;

  return msg;
};

export const abrirWhatsAppPedido = (
  pedido: SolicitacaoPedido,
  empresa: Empresa,
  numeroDestinoCustom?: string
) => {
  const texto = formatarMensagemWhatsApp(pedido, empresa);
  // Limpa caracteres especiais do telefone
  const telefoneAlvo = (numeroDestinoCustom || empresa.whatsappFabrica || '')
    .replace(/\D/g, '');

  const encodedText = encodeURIComponent(texto);
  const url = telefoneAlvo 
    ? `https://wa.me/${telefoneAlvo}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  window.open(url, '_blank');
};

import { Empresa, SolicitacaoPedido } from '../types';

export const formatarMensagemWhatsApp = (pedido: SolicitacaoPedido, empresa: Empresa): string => {
  const totalPecas = pedido.pecasMdf.reduce((acc, p) => acc + p.quantidade, 0);
  const totalM2 = pedido.pecasMdf.reduce(
    (acc, p) => acc + (p.comprimentoMm * p.larguraMm * p.quantidade) / 1000000,
    0
  );
  const totalFerragens = pedido.ferragens?.reduce((acc, f) => acc + f.quantidade, 0) || 0;

  const dataFormatada = new Date(pedido.dataCriacao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusLabel = {
    aguardando_aprovacao: '⏳ Aguardando Aprovação',
    enviado_corte: '🚚 Enviado para Corte / Fábrica',
    em_producao: '🔨 Em Produção',
    concluido: '✅ Concluído',
  }[pedido.status] || pedido.status;

  // Formatação completa das peças MDF
  const listaPecasFormatada = pedido.pecasMdf.length > 0
    ? pedido.pecasMdf
        .map((p, index) => {
          const fitas: string[] = [];
          if (p.fitagem?.c1) fitas.push('C1');
          if (p.fitagem?.c2) fitas.push('C2');
          if (p.fitagem?.l1) fitas.push('L1');
          if (p.fitagem?.l2) fitas.push('L2');
          
          const fitagemStr = fitas.length > 0 ? fitas.join(' + ') : 'Sem fitagem (4 lados crus)';
          const fitaDetalhe = fitas.length > 0 ? ` [Fita ${p.fitaEspessura || '0.45mm'}${p.fitaCor ? ` - ${p.fitaCor}` : ''}]` : '';

          let itemTxt = `*${index + 1}.* *${p.quantidade}x* ${p.nomePeca}\n`;
          itemTxt += `   📐 Medida: *${p.comprimentoMm} x ${p.larguraMm} mm* | Espessura: *${p.espessuraMm}mm*\n`;
          itemTxt += `   🎨 Material: ${p.material} (${p.corPadrao})\n`;
          itemTxt += `   ✂️ Bordas: ${fitagemStr}${fitaDetalhe}`;
          if (p.observacao) {
            itemTxt += `\n   📝 Obs: ${p.observacao}`;
          }
          return itemTxt;
        })
        .join('\n\n')
    : '_Nenhuma peça MDF cadastrada neste pedido._';

  // Formatação completa das ferragens e insumos
  const listaFerragensFormatada = pedido.ferragens && pedido.ferragens.length > 0
    ? pedido.ferragens
        .map((f, index) => {
          const catNome = {
            abertura: 'Abertura (Dobradiças/Pistões)',
            corredicas: 'Corrediças',
            acessorios: 'Acessórios & Mobilidade',
            fitas_consumiveis: 'Fitas & Consumíveis',
            fixacao: 'Fixação & Parafusos',
            outros: 'Outros',
          }[f.categoria] || f.categoria;

          let fTxt = `*${index + 1}.* *${f.quantidade} ${f.unidade}* - ${f.nomeItem} (${catNome})`;
          if (f.observacoes) {
            fTxt += `\n   📝 Obs: ${f.observacoes}`;
          }
          return fTxt;
        })
        .join('\n')
    : '_Nenhuma ferragem ou insumo cadastrado neste pedido._';

  const cnpj = empresa.cnpjOuCpf ? ` | CNPJ/CPF: ${empresa.cnpjOuCpf}` : '';
  const telEmpresa = empresa.telefone ? ` | Tel: ${empresa.telefone}` : '';

  const msg = `🏢 *${empresa.nomeFantasia.toUpperCase()}*${cnpj}${telEmpresa}
📋 *FOLHA DE CORTE & REQUISIÇÃO DE INSUMOS*
----------------------------------------
📌 *Ordem de Serviço:* *${pedido.codigo}*
STATUS: *${statusLabel}*
🗓️ *Data de Emissão:* ${dataFormatada}

👤 *DADOS DA OBRA & CLIENTE:*
• *Projeto:* ${pedido.projetoNome}
• *Cliente:* ${pedido.clienteNome}
• *Telefone Cliente:* ${pedido.clienteTelefone || 'Não informado'}
• *Endereço Entrega/Obra:* ${pedido.clienteEndereco || 'Retirada na Oficina'}
• *Responsável / Solicitante:* ${pedido.solicitanteNome} (${pedido.solicitanteCargo})

📊 *RESUMO GERAL DO PEDIDO:*
• Total de Peças MDF: *${totalPecas} peça(s)*
• Área aprox. de chapa: *${totalM2.toFixed(2)} m²*
• Itens de Ferragem/Insumo: *${pedido.ferragens?.length || 0} tipo(s)* (${totalFerragens} un total)

----------------------------------------
🪵 *1. LISTA COMPLETA DE CORTE (PEÇAS MDF)*
----------------------------------------
${listaPecasFormatada}

----------------------------------------
🔩 *2. FERRAGENS, ACESSÓRIOS E INSUMOS*
----------------------------------------
${listaFerragensFormatada}

${pedido.observacoesGerais ? `----------------------------------------\n⚠️ *OBSERVAÇÕES ADICIONAIS DE PRODUÇÃO:*\n${pedido.observacoesGerais}\n` : ''}----------------------------------------
📄 *DOCUMENTO OFICIAL COMPLETO:*
O PDF formatado para impressão também foi gerado e pode ser consultado/anexado para conferência de produção.

_Enviado através do Sistema de Gestão ${empresa.nomeFantasia}_`;

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


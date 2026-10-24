import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Empresa, SolicitacaoPedido } from '../types';

export const gerarRelatorioPedidoPdf = (pedido: SolicitacaoPedido, empresa: Empresa) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 14;

  // Cabeçalho da Marcenaria
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(14, currentY, pageWidth - 28, 22, 'F');

  // Nome da Marcenaria
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(empresa.nomeFantasia.toUpperCase(), 20, currentY + 9);

  // Subtítulo e CNPJ/Telefone
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `${empresa.razaoSocial} | CNPJ: ${empresa.cnpjOuCpf || 'Não informado'} | Tel: ${empresa.telefone || ''}`,
    20,
    currentY + 16
  );

  // Badge da Ordem de Serviço à direita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(pedido.codigo, pageWidth - 22, currentY + 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('FOLHA DE CORTE & INSUMOS', pageWidth - 22, currentY + 16, { align: 'right' });

  currentY += 26;

  // Box de Dados do Pedido e Cliente
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DADOS DA OBRA & CLIENTE:', 18, currentY + 6);
  doc.text('DADOS DA EMISSÃO:', pageWidth / 2 + 6, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  // Coluna Esquerda: Cliente e Obra
  doc.text(`Cliente: ${pedido.clienteNome}`, 18, currentY + 12);
  doc.text(`Telefone: ${pedido.clienteTelefone || 'Não informado'}`, 18, currentY + 17);
  const enderecoQuebrado = doc.splitTextToSize(`Endereço: ${pedido.clienteEndereco || 'Oficina'}`, pageWidth / 2 - 24);
  doc.text(enderecoQuebrado, 18, currentY + 22);

  // Coluna Direita: Emissão
  const dataFormatada = new Date(pedido.dataCriacao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Data/Hora: ${dataFormatada}`, pageWidth / 2 + 6, currentY + 12);
  doc.text(`Responsável: ${pedido.solicitanteNome} (${pedido.solicitanteCargo})`, pageWidth / 2 + 6, currentY + 17);
  doc.text(`Projeto: ${pedido.projetoNome}`, pageWidth / 2 + 6, currentY + 22);

  currentY += 34;

  // Tabela 1: Peças de Corte MDF
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. LISTA DE CORTE DE PEÇAS MDF / CHAPAS SOB MEDIDA', 14, currentY);

  currentY += 3;

  // Cálculo da área m2
  const totalM2 = pedido.pecasMdf.reduce((acc, p) => {
    return acc + (p.comprimentoMm * p.larguraMm * p.quantidade) / 1000000;
  }, 0);

  const totalPecas = pedido.pecasMdf.reduce((acc, p) => acc + p.quantidade, 0);

  const pecasTableBody = pedido.pecasMdf.map((peca, idx) => {
    // Formatação da fitagem: C1, C2, L1, L2
    const fitas: string[] = [];
    if (peca.fitagem.c1) fitas.push('C1');
    if (peca.fitagem.c2) fitas.push('C2');
    if (peca.fitagem.l1) fitas.push('L1');
    if (peca.fitagem.l2) fitas.push('L2');
    const fitagemStr = fitas.length > 0 ? fitas.join(' + ') : 'Sem fita';

    const fitaDetalhe = fitas.length > 0 ? `${peca.fitaEspessura || '0.45mm'}` : '-';

    return [
      String(idx + 1),
      `${peca.quantidade}x`,
      peca.nomePeca,
      `${peca.material} ${peca.espessuraMm}mm`,
      peca.corPadrao,
      `${peca.comprimentoMm} x ${peca.larguraMm}`,
      fitagemStr,
      fitaDetalhe,
      peca.observacao || '-',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [
      ['#', 'Qtd', 'Identificação da Peça', 'Material', 'Cor / Padrão', 'Medidas (mm)', 'Bordas', 'Fita', 'Obs'],
    ],
    body: pecasTableBody,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [51, 65, 85], // Slate-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 22 },
      4: { cellWidth: 26 },
      5: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  // Posição Y pós tabela de peças
  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Resumo de corte
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(`Subtotal Peças: ${totalPecas} un | Área total aproximada de corte: ${totalM2.toFixed(2)} m²`, 14, currentY);

  currentY += 8;

  // Tabela 2: Ferragens e Insumos
  if (pedido.ferragens && pedido.ferragens.length > 0) {
    // Se estiver muito perto do fim da página, cria nova página
    if (currentY > 230) {
      doc.addPage();
      currentY = 16;
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('2. REQUISIÇÃO DE FERRAGENS, ACESSÓRIOS E INSUMOS DA OFICINA', 14, currentY);

    currentY += 3;

    const ferragensTableBody = pedido.ferragens.map((item, idx) => {
      const catNome = {
        abertura: 'Ferragem de Abertura',
        corredicas: 'Corrediças',
        acessorios: 'Acessórios & Mobilidade',
        fitas_consumiveis: 'Fitas & Consumíveis',
        fixacao: 'Fixação & Parafusos',
        outros: 'Outros',
      }[item.categoria] || item.categoria;

      return [
        String(idx + 1),
        catNome,
        item.nomeItem,
        `${item.quantidade} ${item.unidade}`,
        item.observacoes || '-',
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Categoria', 'Descrição do Insumo / Ferragem', 'Quantidade Requisitada', 'Observações / Especificação']],
      body: ferragensTableBody,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        font: 'helvetica',
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [71, 85, 105], // Slate-600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 7, halign: 'center' },
        1: { cellWidth: 38 },
        2: { cellWidth: 65, fontStyle: 'bold' },
        3: { cellWidth: 32, halign: 'center' },
        4: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // Observações Gerais
  if (pedido.observacoesGerais) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, currentY, pageWidth - 28, 16, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('OBSERVAÇÕES ADICIONAIS DE PRODUÇÃO / CORTE:', 18, currentY + 5);
    doc.setFont('helvetica', 'normal');
    const obsText = doc.splitTextToSize(pedido.observacoesGerais, pageWidth - 36);
    doc.text(obsText, 18, currentY + 10);

    currentY += 20;
  }

  // Rodapé e Assinaturas
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = Math.max(currentY + 6, 260);
  }

  // Linhas para carimbo e conferência
  doc.setDrawColor(148, 163, 184);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(20, currentY, 90, currentY);
  doc.line(pageWidth - 90, currentY, pageWidth - 20, currentY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Responsável pela Solicitação / Marcenaria', 55, currentY + 4, { align: 'center' });
  doc.text('Conferência de Recebimento / Fábrica de Corte', pageWidth - 55, currentY + 4, { align: 'center' });

  // Nome do arquivo para download
  const nomeArquivo = `Pedido_${pedido.codigo}_${empresa.nomeFantasia.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);

  return doc;
};

import React, { useState, useMemo } from 'react';
import { Empresa, SolicitacaoPedido, StatusPedido, Usuario } from '../types';
import { TEMAS } from '../utils/theme';
import { gerarRelatorioPedidoPdf } from '../utils/pdfGenerator';
import { abrirWhatsAppPedido } from '../utils/whatsapp';
import { EnviarPdfModal } from './EnviarPdfModal';
import {
  Search,
  Layers,
  Share2,
  Eye,
  Filter,
  Package,
  Ruler,
  Calendar,
  User,
  Wrench,
  CheckCircle2,
  Clock,
  Send,
  Building,
  ChevronDown,
  ChevronUp,
  Tag,
  Scissors,
  Printer,
} from 'lucide-react';

interface HistoricoPecasViewProps {
  pedidos: SolicitacaoPedido[];
  empresa: Empresa;
  usuarioAtivo: Usuario;
  onSelecionarPedido: (pedido: SolicitacaoPedido) => void;
  onNovaSolicitacao: () => void;
}

export const HistoricoPecasView: React.FC<HistoricoPecasViewProps> = ({
  pedidos,
  empresa,
  usuarioAtivo,
  onSelecionarPedido,
  onNovaSolicitacao,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | 'todos'>('todos');
  const [filtroEspessura, setFiltroEspessura] = useState<string>('todas');
  const [projetoExpandido, setProjetoExpandido] = useState<Record<string, boolean>>({});
  const [pedidoParaEnviarPdf, setPedidoParaEnviarPdf] = useState<SolicitacaoPedido | null>(null);

  const temaConfig = TEMAS[empresa.tema] || TEMAS.azul;

  // Lista de espessuras únicas disponíveis no histórico
  const espessurasDisponiveis = useMemo(() => {
    const setEsp = new Set<number>();
    pedidos.forEach((p) => {
      p.pecasMdf.forEach((item) => {
        if (item.espessuraMm) setEsp.add(item.espessuraMm);
      });
    });
    return Array.from(setEsp).sort((a, b) => a - b);
  }, [pedidos]);

  // Filtragem dos pedidos com base em busca e filtros
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
      
      const termo = busca.toLowerCase().trim();
      const matchBusca =
        termo === '' ||
        p.projetoNome.toLowerCase().includes(termo) ||
        p.clienteNome.toLowerCase().includes(termo) ||
        p.codigo.toLowerCase().includes(termo) ||
        p.pecasMdf.some(
          (peca) =>
            peca.nomePeca.toLowerCase().includes(termo) ||
            peca.material.toLowerCase().includes(termo) ||
            peca.corPadrao.toLowerCase().includes(termo)
        );

      const matchEspessura =
        filtroEspessura === 'todas' ||
        p.pecasMdf.some((peca) => peca.espessuraMm.toString() === filtroEspessura);

      return matchStatus && matchBusca && matchEspessura;
    });
  }, [pedidos, busca, filtroStatus, filtroEspessura]);

  // Estatísticas Gerais das peças filtradas
  const metricas = useMemo(() => {
    let totalPecas = 0;
    let totalM2 = 0;
    let totalFerragens = 0;
    const projetosUnicos = new Set<string>();
    const coresEChapas = new Map<string, number>();

    pedidosFiltrados.forEach((p) => {
      if (p.projetoNome) projetosUnicos.add(p.projetoNome.trim());
      
      p.pecasMdf.forEach((peca) => {
        const qtd = peca.quantidade || 0;
        totalPecas += qtd;
        const areaPeca = ((peca.comprimentoMm * peca.larguraMm) / 1000000) * qtd;
        totalM2 += areaPeca;

        const chaveCor = `${peca.material} ${peca.corPadrao} ${peca.espessuraMm}mm`;
        coresEChapas.set(chaveCor, (coresEChapas.get(chaveCor) || 0) + qtd);
      });

      p.ferragens?.forEach((f) => {
        totalFerragens += f.quantidade || 0;
      });
    });

    return {
      totalProjetos: projetosUnicos.size,
      totalPedidosCount: pedidosFiltrados.length,
      totalPecas,
      totalM2,
      totalFerragens,
      topCores: Array.from(coresEChapas.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };
  }, [pedidosFiltrados]);

  // Alterna expansão de um card de projeto
  const toggleExpandir = (id: string) => {
    setProjetoExpandido((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const statusTags: Record<
    StatusPedido,
    { rotulo: string; classe: string; icone: React.ElementType }
  > = {
    aguardando_aprovacao: {
      rotulo: 'Aguardando Aprovação',
      classe: 'bg-amber-100 text-amber-900 border-amber-300',
      icone: Clock,
    },
    enviado_corte: {
      rotulo: 'Enviado p/ Corte',
      classe: 'bg-blue-100 text-blue-900 border-blue-300',
      icone: Send,
    },
    em_producao: {
      rotulo: 'Em Produção',
      classe: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      icone: Wrench,
    },
    concluido: {
      rotulo: 'Concluído',
      classe: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icone: CheckCircle2,
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. CABEÇALHO DA ABA */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <Layers size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Histórico de Peças por Projeto
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Listagem completa de todas as peças de MDF solicitadas, organizadas por projeto com especificações de dimensão, fita de borda e ferragens.
          </p>
        </div>

        <button
          type="button"
          onClick={onNovaSolicitacao}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <Scissors size={16} />
          Nova Ordem de Corte
        </button>
      </div>

      {/* 2. CARDS DE MÉTRICAS E RESUMO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Projetos Ativos</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Building size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metricas.totalProjetos}</div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            em {metricas.totalPedidosCount} solicitação(ões)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Total de Peças</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metricas.totalPecas} <span className="text-xs font-bold text-slate-500">un</span></div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            MDF cortados/solicitados
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Área Total MDF</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Ruler size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metricas.totalM2.toFixed(2)} <span className="text-xs font-bold text-slate-500">m²</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            estimativa de chapa
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Ferragens Solicitadas</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Wrench size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{metricas.totalFerragens} <span className="text-xs font-bold text-slate-500">itens</span></div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            dobradiças, corrediças, etc.
          </span>
        </div>
      </div>

      {/* 3. BARRA DE BUSCA E FILTROS */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome do projeto, cliente, peça, MDF, cor ou OS..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filtros Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700">
            <Filter size={13} className="text-slate-400" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusPedido | 'todos')}
              className="bg-transparent focus:outline-none text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="aguardando_aprovacao">Aguardando Aprovação</option>
              <option value="enviado_corte">Enviado p/ Corte</option>
              <option value="em_producao">Em Produção</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>

          {/* Espessura Filter */}
          {espessurasDisponiveis.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700">
              <Ruler size={13} className="text-slate-400" />
              <select
                value={filtroEspessura}
                onChange={(e) => setFiltroEspessura(e.target.value)}
                className="bg-transparent focus:outline-none text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="todas">Todas Espessuras</option>
                {espessurasDisponiveis.map((esp) => (
                  <option key={esp} value={esp.toString()}>
                    {esp} mm
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 4. LISTA DE PROJETOS E SUAS PEÇAS */}
      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Layers size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum projeto ou peça encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {busca || filtroStatus !== 'todos' || filtroEspessura !== 'todas'
              ? 'Tente ajustar os filtros de busca para encontrar as peças solicitadas.'
              : 'Nenhuma ordem de corte cadastrada no sistema ainda.'}
          </p>
          {(busca || filtroStatus !== 'todos' || filtroEspessura !== 'todas') && (
            <button
              type="button"
              onClick={() => {
                setBusca('');
                setFiltroStatus('todos');
                setFiltroEspessura('todas');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Limpar Todos os Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {pedidosFiltrados.map((pedido) => {
            const isCollapse = projetoExpandido[pedido.id] === false;
            const statusConfig = statusTags[pedido.status] || statusTags.aguardando_aprovacao;
            const StatusIcon = statusConfig.icone;

            // Estatísticas do projeto
            const totalPecasProj = pedido.pecasMdf.reduce((acc, p) => acc + (p.quantidade || 0), 0);
            const totalM2Proj = pedido.pecasMdf.reduce(
              (acc, p) => acc + ((p.comprimentoMm * p.larguraMm) / 1000000) * (p.quantidade || 0),
              0
            );

            // Cores e materiais do projeto
            const materiaisUnicos = Array.from(
              new Set(pedido.pecasMdf.map((p) => `${p.material} ${p.corPadrao} (${p.espessuraMm}mm)`))
            );

            return (
              <div
                key={pedido.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* CABEÇALHO DO CARD DO PROJETO */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/20 text-amber-700 font-black flex items-center justify-center shrink-0">
                      <Layers size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md">
                          {pedido.codigo}
                        </span>
                        <h3 className="text-base font-black text-slate-900 truncate">
                          {pedido.projetoNome}
                        </h3>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusConfig.classe}`}
                        >
                          <StatusIcon size={12} />
                          {statusConfig.rotulo}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <User size={13} className="text-slate-400" />
                          Cliente: <strong className="text-slate-700">{pedido.clienteNome}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-slate-400" />
                          Data:{' '}
                          {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={13} className="text-slate-400" />
                          Solicitante: {pedido.solicitanteNome}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AÇÕES RÁPIDAS DO PROJETO */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setPedidoParaEnviarPdf(pedido)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-tight rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      title="Enviar e compartilhar PDF da folha de corte"
                    >
                      <Share2 size={14} />
                      <span>Enviar PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelecionarPedido(pedido)}
                      className="px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold tracking-tight rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      title="Ver Detalhes do Pedido"
                    >
                      <Eye size={14} className="text-amber-400" />
                      <span>Detalhes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => gerarRelatorioPedidoPdf(pedido, empresa)}
                      className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold tracking-tight rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      title="Baixar PDF do Projeto"
                    >
                      <Printer size={14} className="text-blue-600" />
                      <span>Baixar PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpandir(pedido.id)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors ml-1"
                      title={isCollapse ? 'Expandir Peças' : 'Recolher Peças'}
                    >
                      {isCollapse ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                  </div>
                </div>

                {/* TAGS E SUB-RESUMO DO PROJETO */}
                <div className="px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Tag size={12} className="text-amber-600" />
                      MDFs no Projeto:
                    </span>
                    {materiaisUnicos.map((mat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-md text-[11px] font-semibold"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-slate-600 font-medium">
                    <span>
                      Total: <strong className="text-slate-900">{totalPecasProj} peças</strong>
                    </span>
                    <span>
                      Área: <strong className="text-slate-900">{totalM2Proj.toFixed(2)} m²</strong>
                    </span>
                  </div>
                </div>

                {/* CONTEÚDO EXPANDÍVEL DO PROJETO (TABELA DE PEÇAS MDF) */}
                {!isCollapse && (
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs text-slate-700 border-collapse">
                        <thead>
                          <tr className="bg-slate-200 text-slate-900 uppercase font-black text-[11px] tracking-wider border-b border-slate-300">
                            <th className="py-2.5 px-3 w-10 text-center text-slate-900 font-bold">#</th>
                            <th className="py-2.5 px-3 text-slate-900 font-bold">Nome da Peça</th>
                            <th className="py-2.5 px-3 text-slate-900 font-bold">Material & Cor</th>
                            <th className="py-2.5 px-3 text-center text-slate-900 font-bold">
                              Esp. <span className="text-slate-900 font-bold">(mm)</span>
                            </th>
                            <th className="py-2.5 px-3 text-center text-slate-900 font-bold">
                              Compr. x Larg. <span className="text-slate-900 font-bold">(mm)</span>
                            </th>
                            <th className="py-2.5 px-3 text-center text-slate-900 font-bold">Qtd</th>
                            <th className="py-2.5 px-3 text-center text-slate-900 font-bold">Área Total</th>
                            <th className="py-2.5 px-3 text-slate-900 font-bold">
                              Fitagem <span className="text-slate-900 font-bold">(C1, C2, L1, L2)</span>
                            </th>
                            <th className="py-2.5 px-3 text-slate-900 font-bold">Observações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {pedido.pecasMdf.map((peca, index) => {
                            const areaUnit = (peca.comprimentoMm * peca.larguraMm) / 1000000;
                            const areaTotal = areaUnit * peca.quantidade;
                            const fit = peca.fitagem || { c1: false, c2: false, l1: false, l2: false };
                            const temFitagem = fit.c1 || fit.c2 || fit.l1 || fit.l2;

                            return (
                              <tr key={peca.id || index} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                                  {index + 1}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  {peca.nomePeca}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-slate-800">{peca.material}</div>
                                  <div className="text-[10px] text-slate-500">{peca.corPadrao}</div>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono">
                                    {peca.espessuraMm} mm
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                                  {peca.comprimentoMm} × {peca.larguraMm}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 font-black rounded-lg text-xs border border-amber-500/20">
                                    {peca.quantidade} un
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-medium">
                                  {areaTotal.toFixed(2)} m²
                                </td>
                                <td className="py-2.5 px-3">
                                  {temFitagem ? (
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-1 text-[10px] font-bold">
                                        <span
                                          className={`px-1.5 py-0.5 rounded ${
                                            fit.c1
                                              ? 'bg-amber-600 text-white font-bold'
                                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                                          }`}
                                          title="Comprimento 1"
                                        >
                                          C1
                                        </span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded ${
                                            fit.c2
                                              ? 'bg-amber-600 text-white font-bold'
                                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                                          }`}
                                          title="Comprimento 2"
                                        >
                                          C2
                                        </span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded ${
                                            fit.l1
                                              ? 'bg-amber-600 text-white font-bold'
                                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                                          }`}
                                          title="Largura 1"
                                        >
                                          L1
                                        </span>
                                        <span
                                          className={`px-1.5 py-0.5 rounded ${
                                            fit.l2
                                              ? 'bg-amber-600 text-white font-bold'
                                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                                          }`}
                                          title="Largura 2"
                                        >
                                          L2
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-500">
                                        {peca.fitaEspessura} {peca.fitaCor ? `• ${peca.fitaCor}` : ''}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 italic">Sem fitagem</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-500 italic max-w-[160px] truncate">
                                  {peca.observacao || '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* SEÇÃO DE FERRAGENS SOLICITADAS NO PROJETO (SE HOUVER) */}
                    {pedido.ferragens && pedido.ferragens.length > 0 && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                          <Wrench size={14} className="text-amber-600" />
                          <span>Ferragens e Insumos do Projeto ({pedido.ferragens.length} itens)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {pedido.ferragens.map((ferragem, fIdx) => (
                            <div
                              key={ferragem.id || fIdx}
                              className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                            >
                              <span className="font-semibold text-slate-800 truncate">
                                {ferragem.nomeItem}
                              </span>
                              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200/50">
                                {ferragem.quantidade} {ferragem.unidade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Envio Direto de PDF */}
      <EnviarPdfModal
        isOpen={!!pedidoParaEnviarPdf}
        onClose={() => setPedidoParaEnviarPdf(null)}
        pedido={pedidoParaEnviarPdf}
        empresa={empresa}
      />
    </div>
  );
};

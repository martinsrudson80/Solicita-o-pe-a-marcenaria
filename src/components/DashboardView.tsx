import React, { useState, useRef } from 'react';
import { Empresa, SolicitacaoPedido, StatusPedido, Usuario } from '../types';
import { TEMAS } from '../utils/theme';
import { gerarRelatorioPedidoPdf } from '../utils/pdfGenerator';
import { abrirWhatsAppPedido } from '../utils/whatsapp';
import { EnviarPdfModal } from './EnviarPdfModal';
import {
  Search,
  Plus,
  Clock,
  Send,
  Wrench,
  CheckCircle2,
  FileDown,
  Share2,
  Eye,
  Filter,
  Layers,
  Package,
  Calendar,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Edit3,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface DashboardViewProps {
  pedidos: SolicitacaoPedido[];
  empresa: Empresa;
  usuarioAtivo: Usuario;
  onSelecionarPedido: (pedido: SolicitacaoPedido) => void;
  onNovaSolicitacao: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pedidos,
  empresa,
  usuarioAtivo,
  onSelecionarPedido,
  onNovaSolicitacao,
}) => {
  const [filtroStatus, setFiltroStatus] = useState<StatusPedido | 'todos'>('todos');
  const [busca, setBusca] = useState('');
  const [pedidoParaEnviarPdf, setPedidoParaEnviarPdf] = useState<SolicitacaoPedido | null>(null);
  const temaConfig = TEMAS[empresa.tema] || TEMAS.azul;

  // Se o usuário logado for marceneiro/funcionário, ele vê todos ou tem opção de filtrar os dele
  const [apenasMeusPedidos, setApenasMeusPedidos] = useState(false);

  // Filtragem dos pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    const matchBusca =
      busca.trim() === '' ||
      p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      p.projetoNome.toLowerCase().includes(busca.toLowerCase()) ||
      p.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      p.solicitanteNome.toLowerCase().includes(busca.toLowerCase());
    const matchMeus = !apenasMeusPedidos || p.solicitanteId === usuarioAtivo.id;

    return matchStatus && matchBusca && matchMeus;
  });

  // Métricas agregadas
  const totalPedidos = pedidos.length;
  const aguardandoAprovacao = pedidos.filter((p) => p.status === 'aguardando_aprovacao').length;
  const enviadoCorteCount = pedidos.filter((p) => p.status === 'enviado_corte').length;
  const emProducaoCount = pedidos.filter((p) => p.status === 'em_producao').length;
  const emCorteOuProducao = enviadoCorteCount + emProducaoCount;
  const concluidos = pedidos.filter((p) => p.status === 'concluido').length;

  const scrollTabsRef = useRef<HTMLDivElement>(null);

  const rolarAbas = (direcao: 'esquerda' | 'direita') => {
    if (scrollTabsRef.current) {
      const deslocamento = direcao === 'esquerda' ? -200 : 200;
      scrollTabsRef.current.scrollBy({ left: deslocamento, behavior: 'smooth' });
    }
  };

  const totalPecas = pedidos.reduce(
    (acc, p) => acc + p.pecasMdf.reduce((pAcc, item) => pAcc + item.quantidade, 0),
    0
  );

  const totalM2 = pedidos.reduce(
    (acc, p) =>
      acc +
      p.pecasMdf.reduce(
        (pAcc, item) => pAcc + (item.comprimentoMm * item.larguraMm * item.quantidade) / 1000000,
        0
      ),
    0
  );

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
      rotulo: 'Enviado para Corte',
      classe: 'bg-blue-100 text-blue-900 border-blue-300',
      icone: Send,
    },
    em_producao: {
      rotulo: 'Em Produção',
      classe: 'bg-purple-100 text-purple-900 border-purple-300',
      icone: Wrench,
    },
    concluido: {
      rotulo: 'Concluído',
      classe: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icone: CheckCircle2,
    },
  };

  const [abaCardTres, setAbaCardTres] = useState<'anotacoes' | 'pecas'>('anotacoes');
  const [cardTresExpandido, setCardTresExpandido] = useState(true);
  const [notaTexto, setNotaTexto] = useState(() => {
    return localStorage.getItem('marcenaria_notas_dashboard') || '';
  });
  const [notaSava, setNotaSava] = useState(false);

  const handleSalvarNota = (texto: string) => {
    setNotaTexto(texto);
    localStorage.setItem('marcenaria_notas_dashboard', texto);
    setNotaSava(true);
    setTimeout(() => setNotaSava(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* 1. CARDS DE MÉTRICAS OPERACIONAIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs text-slate-900">
          <div className="flex items-center justify-between text-slate-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Aguardando Aprovação</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {aguardandoAprovacao}
            </span>
            <span className="text-xs font-bold text-slate-600">solicitações</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Requer validação do Dono</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs text-slate-900">
          <div className="flex items-center justify-between text-slate-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Em Corte / Produção</span>
            <Wrench size={16} className="text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {emCorteOuProducao}
            </span>
            <span className="text-xs font-bold text-slate-600">pedidos na fábrica</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Sendo seccionados ou fitados</p>
        </div>

        {/* CARD 3: ABA DE ESCRITA / ANOTAÇÕES & PEÇAS MDF */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs text-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2 pb-1 border-b border-slate-100">
            <div 
              className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold"
              style={{
                height: '40px',
                marginLeft: '-15px',
                marginRight: '0px',
                paddingTop: '3px',
                paddingLeft: '2px',
                paddingRight: '0px',
                paddingBottom: '31px',
              }}
            >
              <button
                type="button"
                onClick={() => setAbaCardTres('anotacoes')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                  abaCardTres === 'anotacoes'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText size={12} />
                <span>Anotações</span>
              </button>
              <button
                type="button"
                onClick={() => setAbaCardTres('pecas')}
                className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                  abaCardTres === 'pecas'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers size={12} />
                <span>Peças MDF</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {abaCardTres === 'anotacoes' && (
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                  {notaSava ? (
                    <span className="text-emerald-600 flex items-center gap-0.5 font-bold">
                      <Check size={11} /> Salvo
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <Edit3 size={11} /> Editável
                    </span>
                  )}
                </span>
              )}
              <button
                type="button"
                onClick={() => setCardTresExpandido(!cardTresExpandido)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                title={cardTresExpandido ? 'Minimizar' : 'Expandir'}
              >
                {cardTresExpandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {cardTresExpandido && (
            abaCardTres === 'anotacoes' ? (
              <div className="flex-1 flex flex-col">
                <textarea
                  value={notaTexto}
                  onChange={(e) => handleSalvarNota(e.target.value)}
                  placeholder="Escreva anotações, recados ou lembretes..."
                  rows={2}
                  className="w-full h-full text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
                  style={{
                    paddingRight: '10px',
                    paddingBottom: '6px',
                    paddingTop: '8px',
                    paddingLeft: '12px',
                    marginLeft: '-1px',
                    marginRight: '-1px',
                    marginTop: '-2px',
                    marginBottom: '-3px',
                  }}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                    {totalPecas}
                  </span>
                  <span className="text-xs font-bold text-slate-600">un (~{totalM2.toFixed(1)} m²)</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1">Chapas sob medida no mês</p>
              </div>
            )
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs text-slate-900">
          <div className="flex items-center justify-between text-slate-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Concluídos</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {concluidos}
            </span>
            <span className="text-xs font-bold text-slate-600">de {totalPedidos} pedidos</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Prontos para montagem</p>
        </div>
      </div>

      {/* 2. BARRA DE BUSCA, FILTROS E NOVO PEDIDO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 text-slate-900">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por OS, cliente, projeto ou marceneiro..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-11 pl-9 pr-3 text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {usuarioAtivo.perfil === 'funcionario' && (
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 px-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={apenasMeusPedidos}
                  onChange={(e) => setApenasMeusPedidos(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Apenas Meus Pedidos</span>
              </label>
            )}

            <button
              type="button"
              onClick={onNovaSolicitacao}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Nova Solicitação</span>
            </button>
          </div>
        </div>

        {/* Filtros de Status (Tabs Segmentadas com Deslize Lateral / Carousel) */}
        <div className="relative flex items-center pt-1 group">
          {/* Botão Rolar Esquerda */}
          <button
            type="button"
            onClick={() => rolarAbas('esquerda')}
            className="hidden sm:flex absolute left-0 z-10 p-1.5 bg-white border border-slate-300 text-slate-700 rounded-full shadow-md hover:bg-slate-100 transition-all active:scale-95 shrink-0"
            title="Deslizar etapas para a esquerda"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Track Deslizante das Etapas */}
          <div
            ref={scrollTabsRef}
            className="flex items-center gap-2 overflow-x-auto py-1.5 px-1 sm:px-7 scrollbar-none scroll-smooth touch-pan-x w-full text-xs font-medium snap-x"
          >
            <button
              type="button"
              onClick={() => setFiltroStatus('todos')}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all snap-start flex items-center gap-1.5 ${
                filtroStatus === 'todos'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              <span>Todos ({pedidos.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('aguardando_aprovacao')}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all snap-start flex items-center gap-1.5 ${
                filtroStatus === 'aguardando_aprovacao'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              <Clock size={13} />
              <span>Aguardando Aprovação ({aguardandoAprovacao})</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('enviado_corte')}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all snap-start flex items-center gap-1.5 ${
                filtroStatus === 'enviado_corte'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              <Send size={13} />
              <span>Enviado para Corte ({enviadoCorteCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('em_producao')}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all snap-start flex items-center gap-1.5 ${
                filtroStatus === 'em_producao'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              <Wrench size={13} />
              <span>Em Produção ({emProducaoCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('concluido')}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all snap-start flex items-center gap-1.5 ${
                filtroStatus === 'concluido'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Concluído ({concluidos})</span>
            </button>
          </div>

          {/* Botão Rolar Direita */}
          <button
            type="button"
            onClick={() => rolarAbas('direita')}
            className="hidden sm:flex absolute right-0 z-10 p-1.5 bg-white border border-slate-300 text-slate-700 rounded-full shadow-md hover:bg-slate-100 transition-all active:scale-95 shrink-0"
            title="Deslizar etapas para a direita"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3. LISTA DE ORDENS DE SERVIÇO / SOLICITAÇÕES */}
      <div className="space-y-3">
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            <Layers size={44} className="mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-base font-semibold text-slate-700">Nenhum pedido encontrado</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {busca || filtroStatus !== 'todos'
                ? 'Tente ajustar os filtros ou o termo de busca.'
                : 'Clique no botão abaixo para gerar sua primeira solicitação de corte MDF e ferragens.'}
            </p>
            <button
              type="button"
              onClick={onNovaSolicitacao}
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Criar Solicitação Agora
            </button>
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => {
            const badge = statusTags[pedido.status];
            const qtdPecas = pedido.pecasMdf.reduce((acc, p) => acc + p.quantidade, 0);
            const m2Pedido = pedido.pecasMdf.reduce(
              (acc, p) => acc + (p.comprimentoMm * p.larguraMm * p.quantidade) / 1000000,
              0
            );
            const qtdFerragens = pedido.ferragens?.reduce((acc, f) => acc + f.quantidade, 0) || 0;

            return (
              <div
                key={pedido.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Lado Esquerdo: Identificação do Pedido */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 ${badge.classe}`}
                    >
                      <badge.icone size={12} />
                      <span>{badge.rotulo}</span>
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelecionarPedido(pedido)}
                    className="text-base font-bold text-slate-900 hover:text-amber-700 transition-colors cursor-pointer truncate"
                  >
                    {pedido.projetoNome}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{pedido.clienteNome}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Marceneiro:</span>
                      <span>{pedido.solicitanteNome}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Layers size={13} className="text-amber-600 shrink-0" />
                      <span>
                        {qtdPecas} peças ({m2Pedido.toFixed(1)} m²)
                      </span>
                    </div>

                    {pedido.ferragens && pedido.ferragens.length > 0 && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Package size={13} className="text-slate-400 shrink-0" />
                        <span>{pedido.ferragens.length} tipos de ferragem</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lado Direito: Ações Rápidas (Enviar PDF Direto, Baixar PDF, Conferir) */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setPedidoParaEnviarPdf(pedido)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-tight rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    title="Enviar e compartilhar PDF da folha de corte"
                  >
                    <Share2 size={14} />
                    <span>Enviar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => gerarRelatorioPedidoPdf(pedido, empresa)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold tracking-tight rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    title="Baixar PDF formatado (.pdf)"
                  >
                    <FileDown size={14} className="text-blue-600" />
                    <span>Baixar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelecionarPedido(pedido)}
                    className="px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold tracking-tight rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    title="Ver detalhes da lista de corte"
                  >
                    <Eye size={14} className="text-amber-400" />
                    <span>Conferir</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

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

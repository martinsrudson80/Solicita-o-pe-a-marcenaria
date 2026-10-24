import React, { useState, useRef } from 'react';
import { Cliente, Empresa, FerragemInsumo, FitagemBorda, PecaMdf, SolicitacaoPedido, Usuario } from '../types';
import { PecaFitagemVisualizer } from './PecaFitagemVisualizer';
import { NumpadModal } from './NumpadModal';
import {
  ArrowLeft,
  MoreVertical,
  Layers,
  Wrench,
  UserPlus,
  Plus,
  Trash2,
  Copy,
  Calculator,
  Send,
  FileText,
  AlertCircle,
  Check,
  ChevronDown,
} from 'lucide-react';

interface NovaSolicitacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa;
  usuarioAtivo: Usuario;
  clientes: Cliente[];
  onSalvarPedido: (pedido: Omit<SolicitacaoPedido, 'id' | 'codigo' | 'dataCriacao' | 'dataAtualizacao'>) => SolicitacaoPedido;
  onSalvarEEnviarWhatsApp: (pedido: SolicitacaoPedido) => void;
  onNovoClienteModal: () => void;
}

const MATERIAIS_OPCOES = ['MDF', 'MDP', 'Compensado Naval', 'Fórmica / Revestido', 'Madeira Maciça'];
const ESPESSURAS_OPCOES = [6, 9, 12, 15, 18, 25, 30, 36, 50];
const CORES_SUGERIDAS = [
  'Louro Freijó',
  'Branco Supremo',
  'Branco TX',
  'Grafite Matt',
  'Preto TX',
  'Carvalho Berlim',
  'Nogueira Boreal',
  'Cinza Sagrado',
];

const PRESETS_FERRAGENS_POR_CATEGORIA: Record<string, string[]> = {
  abertura: [
    'Dobradiça Reta com Amortecedor',
    'Dobradiça Curva com Amortecedor',
    'Dobradiça Super Alta com Amortecedor',
    'Pistão para Porta Basculante',
    'Fecho Toque Magnético (Pulsador Push Open)',
    'Outro item de abertura...',
  ],
  corredicas: [
    'Corrediça Oculta 250mm',
    'Corrediça Oculta 300mm',
    'Corrediça Oculta 350mm',
    'Corrediça Oculta 400mm',
    'Corrediça Oculta 450mm',
    'Corrediça Oculta 500mm',
    'Corrediça Oculta 550mm',
    'Corrediça Oculta 600mm',
    'Corrediça Telescópica 300mm',
    'Corrediça Telescópica 350mm',
    'Corrediça Telescópica 400mm',
    'Corrediça Telescópica 450mm',
    'Corrediça Telescópica 500mm',
    'Corrediça Telescópica 550mm',
    'Corrediça Telescópica 600mm',
    'Outra corrediça...',
  ],
  acessorios: [
    'Cabideiro Oblongo',
    'Suporte de Cabideiro Oblongo',
    'Suporte Cabideiro Oblongo Central',
    'Rodízio de Silicone 50mm com Trava',
    'Rodízio de Silicone 50mm sem Trava',
    'Outro acessório...',
  ],
  fitas_consumiveis: [
    'Rolo Fita de Borda PVC 22mm x 20m',
    'Rolo Fita de Borda PVC 64mm (Engrosso)',
    'Cola de Contato (Cascola) 1kg',
    'Cola Instantânea Cianoacrilato + Ativador',
    'Cola PUR Profissional D4 para Borda',
    'Silicone Acético Incolor Tubo 280g',
    'Silicone Branco Fungicida Tubo 280g',
    'Cartela Tapa-furos Adesivos 12mm',
    'Outro consumível...',
  ],
  fixacao: [
    'Parafuso Chipboard 4.0x16 Cabeça Chata Phillips',
    'Parafuso Chipboard 4.0x25 Cabeça Chata',
    'Parafuso Chipboard 4.0x40 Cabeça Chata',
    'Parafuso Chipboard 3.5x14 para Dobradiças',
    'Bucha Nylon 8mm com Aba',
    'Bucha Drywall Gesso tipo Oca/Fly',
    'Cavilha de Madeira 8x30mm',
    'Kit Tambor Minifix com Pino e Bucha',
    'Cantoneira de Fixação 2 Furos Zincada',
    'Outro item de fixação...',
  ],
};

export const NovaSolicitacaoModal: React.FC<NovaSolicitacaoModalProps> = ({
  isOpen,
  onClose,
  empresa,
  usuarioAtivo,
  clientes,
  onSalvarPedido,
  onSalvarEEnviarWhatsApp,
  onNovoClienteModal,
}) => {
  // Seção 01: Cliente e Projeto
  const [projetoNome, setProjetoNome] = useState('');
  const [clienteId, setClienteId] = useState<string>(clientes[0]?.id || '');
  const [responsavelId, setResponsavelId] = useState<string>(usuarioAtivo.id);

  // Seção 02: Especificações da Peça MDF
  const [pecas, setPecas] = useState<PecaMdf[]>([]);
  const [nomePeca, setNomePeca] = useState('');
  const [material, setMaterial] = useState('MDF');
  const [espessuraMm, setEspessuraMm] = useState<number>(18);
  const [corPadrao, setCorPadrao] = useState('Louro Freijó');
  const [comprimentoMm, setComprimentoMm] = useState<number>(720);
  const [larguraMm, setLarguraMm] = useState<number>(450);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [fitagem, setFitagem] = useState<FitagemBorda>({ c1: true, c2: false, l1: false, l2: false });
  const [fitaEspessura, setFitaEspessura] = useState('1.0mm');
  const [fitaCor, setFitaCor] = useState('');
  const [observacaoPeca, setObservacaoPeca] = useState('');

  // Seção 03: Ferragens e Insumos
  const [ferragens, setFerragens] = useState<FerragemInsumo[]>([]);
  const [categoriaInsumo, setCategoriaInsumo] = useState<string>('abertura');
  const [itemSelecionado, setItemSelecionado] = useState<string>('');
  const [itemNomeCustom, setItemNomeCustom] = useState<string>('');
  const [quantidadeFerragem, setQuantidadeFerragem] = useState<number>(1);
  const [unidadeFerragem, setUnidadeFerragem] = useState<'unidades' | 'pares' | 'metros' | 'caixas' | 'tubos' | 'rolos' | 'kits'>('unidades');
  const [observacaoFerragem, setObservacaoFerragem] = useState('');

  // Observações Gerais
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  // Numpad Touch Modal
  const [numpadAberto, setNumpadAberto] = useState(false);
  const [numpadCampo, setNumpadCampo] = useState<'comprimento' | 'largura'>('comprimento');

  // Refs para navegação suave via botão flutuante
  const secao02Ref = useRef<HTMLDivElement>(null);
  const secao03Ref = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const clienteSelecionado = clientes.find((c) => c.id === clienteId);

  const abrirNumpad = (campo: 'comprimento' | 'largura') => {
    setNumpadCampo(campo);
    setNumpadAberto(true);
  };

  const handleNumpadConfirm = (val: number) => {
    if (numpadCampo === 'comprimento') {
      setComprimentoMm(val);
    } else {
      setLarguraMm(val);
    }
  };

  // Adicionar Peça MDF
  const adicionarPecaNaLista = (e: React.FormEvent) => {
    e.preventDefault();
    setErroValidacao(null);

    if (!nomePeca.trim()) {
      setErroValidacao('Informe o nome / identificação da peça (ex.: Porta esquerda).');
      return;
    }
    if (comprimentoMm <= 0 || larguraMm <= 0) {
      setErroValidacao('Comprimento e largura devem ser maiores que 0 mm.');
      return;
    }

    const novaPeca: PecaMdf = {
      id: 'p-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      nomePeca: nomePeca.trim(),
      material,
      corPadrao,
      espessuraMm,
      comprimentoMm,
      larguraMm,
      quantidade: quantidade || 1,
      fitagem: { ...fitagem },
      fitaEspessura,
      fitaCor: fitaCor.trim() || corPadrao,
      observacao: observacaoPeca.trim(),
    };

    setPecas([...pecas, novaPeca]);
    setNomePeca('');
    setObservacaoPeca('');
    setQuantidade(1);
  };

  const removerPeca = (id: string) => {
    setPecas(pecas.filter((p) => p.id !== id));
  };

  const duplicarPeca = (p: PecaMdf) => {
    setPecas([
      ...pecas,
      {
        ...p,
        id: 'p-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        nomePeca: `${p.nomePeca} (Cópia)`,
      },
    ]);
  };

  // Adicionar Ferragem
  const adicionarFerragemNaLista = (e: React.FormEvent) => {
    e.preventDefault();
    const nomeFinal = itemSelecionado === 'Outro item de abertura...' ||
      itemSelecionado === 'Outra corrediça...' ||
      itemSelecionado === 'Outro acessório...' ||
      itemSelecionado === 'Outro consumível...' ||
      itemSelecionado === 'Outro item de fixação...' ||
      !itemSelecionado
        ? itemNomeCustom.trim()
        : itemSelecionado;

    if (!nomeFinal) {
      setErroValidacao('Selecione ou digite a descrição do item de ferragem.');
      return;
    }

    const novaFerragem: FerragemInsumo = {
      id: 'f-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      categoria: categoriaInsumo as any,
      nomeItem: nomeFinal,
      quantidade: quantidadeFerragem || 1,
      unidade: unidadeFerragem,
      observacoes: observacaoFerragem.trim(),
    };

    setFerragens([...ferragens, novaFerragem]);
    setItemSelecionado('');
    setItemNomeCustom('');
    setObservacaoFerragem('');
    setQuantidadeFerragem(1);
  };

  const removerFerragem = (id: string) => {
    setFerragens(ferragens.filter((f) => f.id !== id));
  };

  // Totais
  const totalPecas = pecas.reduce((acc, p) => acc + p.quantidade, 0);
  const totalAreaM2 = pecas.reduce(
    (acc, p) => acc + (p.comprimentoMm * p.larguraMm * p.quantidade) / 1000000,
    0
  );

  const validarESalvar = (diretoWhatsApp: boolean = false) => {
    setErroValidacao(null);

    if (!projetoNome.trim()) {
      setErroValidacao('Preencha o Nome do projeto / obra (ex.: Cozinha · Apartamento 302).');
      return;
    }

    if (!clienteId || !clienteSelecionado) {
      setErroValidacao('Selecione um cliente cadastrado.');
      return;
    }

    if (pecas.length === 0 && ferragens.length === 0) {
      setErroValidacao('Adicione pelo menos uma peça sob medida ou uma ferragem ao pedido.');
      return;
    }

    const payload: Omit<SolicitacaoPedido, 'id' | 'codigo' | 'dataCriacao' | 'dataAtualizacao'> = {
      empresaId: empresa.id,
      clienteId: clienteSelecionado.id,
      clienteNome: clienteSelecionado.nome,
      clienteTelefone: clienteSelecionado.telefone,
      clienteEndereco: `${clienteSelecionado.enderecoObra.rua}, ${clienteSelecionado.enderecoObra.numero} - ${clienteSelecionado.enderecoObra.bairro}, ${clienteSelecionado.enderecoObra.cidade}/${clienteSelecionado.enderecoObra.estado}`,
      solicitanteId: usuarioAtivo.id,
      solicitanteNome: usuarioAtivo.nome,
      solicitanteCargo: usuarioAtivo.cargo,
      projetoNome: projetoNome.trim(),
      status: 'aguardando_aprovacao',
      pecasMdf: pecas,
      ferragens: ferragens,
      observacoesGerais: observacoesGerais.trim(),
    };

    const novoPedido = onSalvarPedido(payload);

    if (diretoWhatsApp) {
      onSalvarEEnviarWhatsApp(novoPedido);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-100 flex flex-col overflow-y-auto">
        {/* 1. CABEÇALHO SUPERIOR (EXATAMENTE COMO NA FOTO DO USUÁRIO) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 shrink-0 shadow-xs">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            {/* Espaço vazio à esquerda para balancear com o menu ⋮ */}
            <div className="w-8" />

            {/* Nome da Marcenaria Centralizado com Subtítulo */}
            <div className="text-center">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {empresa.nomeFantasia || 'Mettro Quadrado'}
              </h1>
              <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                {empresa.razaoSocial || 'CORTTA · OFICINA & PRODUÇÃO'}
              </p>
            </div>

            {/* Menu ⋮ à direita */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="Fechar ou Mais Opções"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* 2. SUB-BARRA DE NAVEGAÇÃO "← Lista de corte / passa pela aprovação." */}
        <div className="bg-white border-b border-slate-200/80 px-4 py-3 shrink-0">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1 -ml-1 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Lista de corte
              </h2>
              <p className="text-xs text-slate-500 leading-none mt-0.5">
                passa pela aprovação.
              </p>
            </div>
          </div>
        </div>

        {/* 3. CONTEÚDO PRINCIPAL (CARDS SEQUENCIAIS 01, 02, 03) */}
        <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-5 space-y-4 pb-28">
          {erroValidacao && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{erroValidacao}</span>
            </div>
          )}

          {/* CARD 01: CLIENTE E PROJETO (FOTO 3) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            {/* Header do Card 01 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Cliente e projeto
              </h3>
            </div>

            {/* Nome do projeto / obra * */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nome do projeto / obra *
              </label>
              <input
                type="text"
                placeholder="Ex.: Cozinha · Apartamento 302"
                value={projetoNome}
                onChange={(e) => setProjetoNome(e.target.value)}
                className="w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            {/* Cliente cadastrado * */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Cliente cadastrado *
              </label>
              <div className="relative">
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full h-12 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Botão Gerenciar clientes */}
            <button
              type="button"
              onClick={onNovoClienteModal}
              className="w-full h-11 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <UserPlus size={15} />
              <span>Gerenciar clientes</span>
            </button>

            {/* Responsável pelo pedido */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Responsável pelo pedido
              </label>
              <div className="relative">
                <select
                  value={responsavelId}
                  onChange={(e) => setResponsavelId(e.target.value)}
                  className="w-full h-12 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer"
                >
                  <option value={usuarioAtivo.id}>{usuarioAtivo.nome}</option>
                  <option value="user-ricardo">Ricardo Almeida</option>
                  <option value="user-tiago">Tiago Alves</option>
                  <option value="user-lucas">Lucas Pinheiro</option>
                </select>
                <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* CARD 02: ESPECIFICAÇÕES DA PEÇA (FOTO 2) */}
          <div ref={secao02Ref} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            {/* Header do Card 02 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  02
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Especificações da peça
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Medidas em milímetros. Sem margem para dúvidas.
                  </p>
                </div>
              </div>

              <div className="text-slate-400 shrink-0 p-1">
                <Layers size={22} />
              </div>
            </div>

            {/* Formulário da Peça Sob Medida */}
            <form onSubmit={adicionarPecaNaLista} className="space-y-4 pt-1">
              {/* Nome / identificação da peça * */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nome / identificação da peça *
                </label>
                <input
                  type="text"
                  placeholder="Ex.: Porta esquerda"
                  value={nomePeca}
                  onChange={(e) => setNomePeca(e.target.value)}
                  className="w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              {/* Linha 2 Colunas: Material & Espessura (mm) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Material
                  </label>
                  <div className="relative">
                    <select
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full h-12 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                    >
                      {MATERIAIS_OPCOES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Espessura (mm)
                  </label>
                  <div className="relative">
                    <select
                      value={espessuraMm}
                      onChange={(e) => setEspessuraMm(Number(e.target.value))}
                      className="w-full h-12 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer font-bold font-mono"
                    >
                      {ESPESSURAS_OPCOES.map((esp) => (
                        <option key={esp} value={esp}>
                          {esp} mm
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Cor / padrão do material * */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Cor / padrão do material *
                </label>
                <input
                  type="text"
                  placeholder="Louro Freijó"
                  value={corPadrao}
                  onChange={(e) => setCorPadrao(e.target.value)}
                  list="sugestoes-cores-mobile"
                  className="w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
                <datalist id="sugestoes-cores-mobile">
                  {CORES_SUGERIDAS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Linha 2 Colunas: Comprimento (mm) * & Largura (mm) * */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Comprimento (mm) *
                    </label>
                    <button
                      type="button"
                      onClick={() => abrirNumpad('comprimento')}
                      className="text-[10px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-md transition-colors shadow-2xs whitespace-nowrap shrink-0"
                      title="Abrir Calculadora de Desconto e Medida da Oficina"
                    >
                      <Calculator size={11} className="text-amber-700 shrink-0" />
                      <span>Oficina</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    value={comprimentoMm || ''}
                    onChange={(e) => setComprimentoMm(parseInt(e.target.value, 10) || 0)}
                    placeholder="720"
                    className="w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Largura (mm) *
                    </label>
                    <button
                      type="button"
                      onClick={() => abrirNumpad('largura')}
                      className="text-[10px] text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-md transition-colors shadow-2xs whitespace-nowrap shrink-0"
                      title="Abrir Calculadora de Desconto e Medida da Oficina"
                    >
                      <Calculator size={11} className="text-amber-700 shrink-0" />
                      <span>Oficina</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    value={larguraMm || ''}
                    onChange={(e) => setLarguraMm(parseInt(e.target.value, 10) || 0)}
                    placeholder="450"
                    className="w-full h-12 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Fitagem de Borda Interativa C1, C2, L1, L2 */}
              <div className="pt-1">
                <PecaFitagemVisualizer
                  fitagem={fitagem}
                  onChange={setFitagem}
                  comprimentoMm={comprimentoMm}
                  larguraMm={larguraMm}
                  espessuraMm={espessuraMm}
                  corPadrao={corPadrao}
                  fitaEspessura={fitaEspessura}
                />
              </div>

              {/* Quantidade de Peças */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Quantidade de Peças *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidade || ''}
                  onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-12 px-3 text-center text-base font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Botão de Adicionar Peça */}
              <button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-xs transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span>Adicionar Peça à Lista de Corte</span>
              </button>
            </form>

            {/* Lista de Peças Já Adicionadas */}
            {pecas.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Peças no Pedido ({pecas.length} tipos / {totalPecas} un)</span>
                  <span className="font-mono text-amber-700">~{totalAreaM2.toFixed(2)} m²</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {pecas.map((p, idx) => {
                    const bordas = [
                      p.fitagem.c1 && 'C1',
                      p.fitagem.c2 && 'C2',
                      p.fitagem.l1 && 'L1',
                      p.fitagem.l2 && 'L2',
                    ].filter(Boolean);

                    return (
                      <div
                        key={p.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {p.quantidade}x {p.nomePeca}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {p.comprimentoMm} × {p.larguraMm} mm • {p.material} {p.espessuraMm}mm ({p.corPadrao})
                          </div>
                          <div className="text-[10px] text-amber-800 mt-0.5">
                            Bordas: {bordas.length > 0 ? `${bordas.join('+')} (${p.fitaEspessura})` : 'Sem fita'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => duplicarPeca(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
                            title="Duplicar peça"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removerPeca(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Remover peça"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CARD 03: FERRAGENS E INSUMOS (FOTO 1) */}
          <div ref={secao03Ref} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            {/* Header do Card 03 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  03
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Ferragens e insumos
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Da montagem ao acabamento, no mesmo pedido.
                  </p>
                </div>
              </div>

              <div className="text-slate-400 shrink-0 p-1">
                <Wrench size={22} />
              </div>
            </div>

            {/* Formulário de Ferragem / Insumo */}
            <form onSubmit={adicionarFerragemNaLista} className="space-y-4 pt-1">
              {/* Categoria de insumo */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Categoria de insumo
                </label>
                <div className="relative">
                  <select
                    value={categoriaInsumo}
                    onChange={(e) => {
                      setCategoriaInsumo(e.target.value);
                      setItemSelecionado('');
                    }}
                    className="w-full h-12 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="abertura">Ferragens de abertura</option>
                    <option value="corredicas">Corrediças</option>
                    <option value="acessorios">Acessórios & mobilidade</option>
                    <option value="fitas_consumiveis">Fitas & consumíveis</option>
                    <option value="fixacao">Fixação & parafusos</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Item * */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Item *
                </label>
                <div className="relative">
                  <select
                    value={itemSelecionado}
                    onChange={(e) => setItemSelecionado(e.target.value)}
                    className="w-full h-12 px-3.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="">Selecione um item</option>
                    {(PRESETS_FERRAGENS_POR_CATEGORIA[categoriaInsumo] || []).map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Se escolheu item custom ou deseja digitar livremente */}
                {(itemSelecionado === '' || itemSelecionado.startsWith('Outro')) && (
                  <input
                    type="text"
                    placeholder="Ou digite o nome do insumo sob medida..."
                    value={itemNomeCustom}
                    onChange={(e) => setItemNomeCustom(e.target.value)}
                    className="w-full h-11 px-3.5 mt-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                )}
              </div>

              {/* Linha 2 Colunas: Quantidade * & Unidade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantidadeFerragem || ''}
                    onChange={(e) => setQuantidadeFerragem(parseInt(e.target.value, 10) || 1)}
                    placeholder="1"
                    className="w-full h-12 px-3.5 text-center text-base font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Unidade
                  </label>
                  <div className="relative">
                    <select
                      value={unidadeFerragem}
                      onChange={(e) => setUnidadeFerragem(e.target.value as any)}
                      className="w-full h-12 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
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
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Medidas / especificações / observações */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Medidas / especificações / observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex.: telescópica 45 cm; parafuso 4,0 × 16; rodízio 50 mm"
                  value={observacaoFerragem}
                  onChange={(e) => setObservacaoFerragem(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              {/* Botão Adicionar Ferragem */}
              <button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-xs transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                <span>Inserir Insumo no Pedido</span>
              </button>
            </form>

            {/* Lista de Insumos Adicionados */}
            {ferragens.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  Insumos Requisitados ({ferragens.length} itens)
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {ferragens.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">
                          {item.quantidade} {item.unidade} - {item.nomeItem}
                        </span>
                        {item.observacoes && (
                          <span className="text-[10px] text-slate-500 italic block truncate">
                            {item.observacoes}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removerFerragem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CARD 04: OBSERVAÇÕES FINAIS DA OFICINA */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Observações Gerais de Entrega / Produção
            </label>
            <textarea
              rows={2}
              placeholder="Ex.: Embalar com plástico bolha; conferir sentido do veio no Freijó; fita de 2mm bem refilada..."
              value={observacoesGerais}
              onChange={(e) => setObservacoesGerais(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </main>

        {/* 5. BARRA INFERIOR FIXA DE FINALIZAÇÃO (NÃO BLOQUEIA, FICANDO FIXA NO RODAPÉ) */}
        <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:py-3.5 shadow-lg">
          <div className="max-w-xl mx-auto flex flex-col gap-2">
            {/* Resumo em linha única */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{totalPecas} peças MDF</span>
                <span>•</span>
                <span>{ferragens.length} insumos</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                ~{totalAreaM2.toFixed(1)} m²
              </span>
            </div>

            {/* Botões de Ação */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => validarESalvar(false)}
                className="h-12 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText size={15} />
                <span>Salvar Pedido</span>
              </button>

              <button
                type="button"
                onClick={() => validarESalvar(true)}
                className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Send size={15} />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* MODAL NUMPAD TOUCH PARA OFICINA */}
      <NumpadModal
        isOpen={numpadAberto}
        onClose={() => setNumpadAberto(false)}
        title={numpadCampo === 'comprimento' ? 'Comprimento / Altura' : 'Largura'}
        initialValue={numpadCampo === 'comprimento' ? comprimentoMm : larguraMm}
        onConfirm={handleNumpadConfirm}
      />
    </>
  );
};

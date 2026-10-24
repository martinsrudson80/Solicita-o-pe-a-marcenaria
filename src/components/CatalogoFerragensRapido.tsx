import React, { useState } from 'react';
import { CategoriaFerragem, FerragemInsumo, UnidadeFerragem } from '../types';
import { Plus, Search, Trash2, Package, Check, Sparkles } from 'lucide-react';

interface CatalogoFerragensRapidoProps {
  itensSelecionados: FerragemInsumo[];
  onAddOrUpdateItem: (item: FerragemInsumo) => void;
  onRemoveItem: (id: string) => void;
}

interface ItemPreset {
  categoria: CategoriaFerragem;
  nome: string;
  unidadePadrao: UnidadeFerragem;
  qtdSugerida: number;
}

const CATALOGO_PRESETS: ItemPreset[] = [
  // Abertura
  { categoria: 'abertura', nome: 'Dobradiça Reta com Amortecedor', unidadePadrao: 'unidades', qtdSugerida: 4 },
  { categoria: 'abertura', nome: 'Dobradiça Curva com Amortecedor', unidadePadrao: 'unidades', qtdSugerida: 2 },
  { categoria: 'abertura', nome: 'Dobradiça Super Alta com Amortecedor', unidadePadrao: 'unidades', qtdSugerida: 2 },
  { categoria: 'abertura', nome: 'Pistão para Porta Basculante', unidadePadrao: 'unidades', qtdSugerida: 2 },
  { categoria: 'abertura', nome: 'Fecho Toque Magnético (Pulsador Push Open)', unidadePadrao: 'unidades', qtdSugerida: 2 },

  // Corrediças
  { categoria: 'corredicas', nome: 'Corrediça Oculta 250mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Oculta 300mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Oculta 350mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Oculta 400mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Oculta 450mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Oculta 500mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Oculta 550mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Oculta 600mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Telescópica 300mm', unidadePadrao: 'pares', qtdSugerida: 1 },
  { categoria: 'corredicas', nome: 'Corrediça Telescópica 350mm', unidadePadrao: 'pares', qtdSugerida: 1 },
  { categoria: 'corredicas', nome: 'Corrediça Telescópica 400mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Telescópica 450mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Telescópica 500mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Telescópica 550mm', unidadePadrao: 'pares', qtdSugerida: 2 },
  { categoria: 'corredicas', nome: 'Corrediça Telescópica 600mm', unidadePadrao: 'pares', qtdSugerida: 2 },

  // Acessórios e Mobilidade
  { categoria: 'acessorios', nome: 'Cabideiro Oblongo', unidadePadrao: 'barras', qtdSugerida: 1 },
  { categoria: 'acessorios', nome: 'Suporte de Cabideiro Oblongo', unidadePadrao: 'pares', qtdSugerida: 1 },
  { categoria: 'acessorios', nome: 'Suporte Cabideiro Oblongo Central', unidadePadrao: 'unidades', qtdSugerida: 1 },
  { categoria: 'acessorios', nome: 'Rodízio de Silicone 50mm com Trava', unidadePadrao: 'unidades', qtdSugerida: 4 },
  { categoria: 'acessorios', nome: 'Rodízio de Silicone 50mm sem Trava', unidadePadrao: 'unidades', qtdSugerida: 4 },

  // Fitas e Consumíveis
  { categoria: 'fitas_consumiveis', nome: 'Rolo Fita de Borda PVC 22mm x 20m (Padrão Chapa)', unidadePadrao: 'rolos', qtdSugerida: 1 },
  { categoria: 'fitas_consumiveis', nome: 'Rolo Fita de Borda PVC 64mm (Para Engrosso)', unidadePadrao: 'rolos', qtdSugerida: 1 },
  { categoria: 'fitas_consumiveis', nome: 'Cola de Contato (Cascola) 1kg', unidadePadrao: 'tubos', qtdSugerida: 1 },
  { categoria: 'fitas_consumiveis', nome: 'Cola Instantânea de Cianoacrilato 100g com Ativador Spray', unidadePadrao: 'kits', qtdSugerida: 1 },
  { categoria: 'fitas_consumiveis', nome: 'Cola PUR Profissional D4 para Borda/Madeira', unidadePadrao: 'tubos', qtdSugerida: 1 },
  { categoria: 'fitas_consumiveis', nome: 'Silicone Acético Incolor Tubo 280g', unidadePadrao: 'tubos', qtdSugerida: 2 },
  { categoria: 'fitas_consumiveis', nome: 'Silicone Branco Fungicida Tubo 280g', unidadePadrao: 'tubos', qtdSugerida: 1 },
  { categoria: 'fitas_consumiveis', nome: 'Cartela Tapa-furos Adesivos 12mm (Cor do MDF)', unidadePadrao: 'unidades', qtdSugerida: 2 },

  // Fixação
  { categoria: 'fixacao', nome: 'Parafuso Chipboard 4.0x16 Cabeça Chata Phillips', unidadePadrao: 'caixas', qtdSugerida: 1 },
  { categoria: 'fixacao', nome: 'Parafuso Chipboard 4.0x25 Cabeça Chata', unidadePadrao: 'caixas', qtdSugerida: 1 },
  { categoria: 'fixacao', nome: 'Parafuso Chipboard 4.0x40 Cabeça Chata', unidadePadrao: 'caixas', qtdSugerida: 1 },
  { categoria: 'fixacao', nome: 'Parafuso Chipboard 3.5x14 Cabeça Chata (Para Dobradiças)', unidadePadrao: 'caixas', qtdSugerida: 1 },
  { categoria: 'fixacao', nome: 'Bucha de Fixação Nylon 8mm com Aba', unidadePadrao: 'caixas', qtdSugerida: 1 },
  { categoria: 'fixacao', nome: 'Bucha para Drywall Gesso tipo Oca/Fly', unidadePadrao: 'unidades', qtdSugerida: 20 },
  { categoria: 'fixacao', nome: 'Cavilha de Madeira Ripada 8x30mm', unidadePadrao: 'unidades', qtdSugerida: 50 },
  { categoria: 'fixacao', nome: 'Kit Minifix / Tambor VB com Pino e Bucha Plástica', unidadePadrao: 'unidades', qtdSugerida: 20 },
  { categoria: 'fixacao', nome: 'Cantoneira de Fixação 2 Furos Metal Zincado (Lzinho)', unidadePadrao: 'unidades', qtdSugerida: 20 },
];

export const CatalogoFerragensRapido: React.FC<CatalogoFerragensRapidoProps> = ({
  itensSelecionados,
  onAddOrUpdateItem,
  onRemoveItem,
}) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaFerragem | 'todas'>('todas');
  const [busca, setBusca] = useState('');
  
  // Custom item form state
  const [customNome, setCustomNome] = useState('');
  const [customQtd, setCustomQtd] = useState(1);
  const [customUnidade, setCustomUnidade] = useState<UnidadeFerragem>('unidades');
  const [customCategoria, setCustomCategoria] = useState<CategoriaFerragem>('abertura');
  const [customObs, setCustomObs] = useState('');

  const categoriasTabs: Array<{ id: CategoriaFerragem | 'todas'; rotulo: string }> = [
    { id: 'todas', rotulo: 'Todos' },
    { id: 'abertura', rotulo: 'Abertura (Dobradiças & Pistões)' },
    { id: 'corredicas', rotulo: 'Corrediças' },
    { id: 'acessorios', rotulo: 'Acessórios & Rodízios' },
    { id: 'fitas_consumiveis', rotulo: 'Fitas & Consumíveis' },
    { id: 'fixacao', rotulo: 'Fixação & Parafusos' },
  ];

  const presetsFiltrados = CATALOGO_PRESETS.filter((p) => {
    const matchCat = categoriaAtiva === 'todas' || p.categoria === categoriaAtiva;
    const matchBusca = busca.trim() === '' || p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const adicionarPreset = (preset: ItemPreset) => {
    const novo: FerragemInsumo = {
      id: 'ferr-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      categoria: preset.categoria,
      nomeItem: preset.nome,
      quantidade: preset.qtdSugerida,
      unidade: preset.unidadePadrao,
      observacoes: '',
    };
    onAddOrUpdateItem(novo);
  };

  const adicionarCustomizado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNome.trim()) return;

    const novo: FerragemInsumo = {
      id: 'ferr-' + Date.now().toString(36),
      categoria: customCategoria,
      nomeItem: customNome.trim(),
      quantidade: Number(customQtd) || 1,
      unidade: customUnidade,
      observacoes: customObs.trim(),
    };
    onAddOrUpdateItem(novo);

    setCustomNome('');
    setCustomQtd(1);
    setCustomObs('');
  };

  return (
    <div className="space-y-5">
      {/* Itens Já Adicionados ao Pedido */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-amber-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Ferragens e Insumos na Solicitação ({itensSelecionados.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Total itens somados: {itensSelecionados.reduce((a, b) => a + b.quantidade, 0)}
          </span>
        </div>

        {itensSelecionados.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Package size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">Nenhuma ferragem ou insumo adicionado ainda</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Clique nos itens rápidos abaixo ou adicione itens personalizados
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {itensSelecionados.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {item.nomeItem}
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-medium">
                      {item.categoria}
                    </span>
                  </div>
                  {item.observacoes && (
                    <p className="text-[11px] text-slate-500 mt-0.5 italic">
                      Obs: {item.observacoes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) =>
                        onAddOrUpdateItem({
                          ...item,
                          quantidade: Math.max(1, parseInt(e.target.value, 10) || 1),
                        })
                      }
                      className="w-16 h-8 text-center font-bold font-mono text-sm border border-slate-300 rounded-lg bg-white"
                    />
                    <select
                      value={item.unidade}
                      onChange={(e) =>
                        onAddOrUpdateItem({
                          ...item,
                          unidade: e.target.value as UnidadeFerragem,
                        })
                      }
                      className="h-8 text-xs font-medium border border-slate-300 rounded-lg bg-white px-2"
                    >
                      <option value="unidades">unidades</option>
                      <option value="pares">pares</option>
                      <option value="metros">metros</option>
                      <option value="caixas">caixas</option>
                      <option value="tubos">tubos</option>
                      <option value="rolos">rolos</option>
                      <option value="kits">kits</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remover insumo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Catálogo de Adição Rápida */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Catálogo de Ferragens & Insumos Padronizados
            </h4>
          </div>

          {/* Busca no catálogo */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ferragem, parafuso..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Abas de Categorias */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categoriasTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoriaAtiva(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                categoriaAtiva === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              {tab.rotulo}
            </button>
          ))}
        </div>

        {/* Grade de Presets Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
          {presetsFiltrados.map((preset, idx) => {
            const jaAdicionado = itensSelecionados.some((i) => i.nomeItem === preset.nome);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => adicionarPreset(preset)}
                className={`p-2.5 text-left rounded-lg border text-xs transition-all flex items-start justify-between gap-2 ${
                  jaAdicionado
                    ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                    : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-medium leading-snug line-clamp-2">{preset.nome}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Padrão: {preset.qtdSugerida} {preset.unidadePadrao}
                  </div>
                </div>
                <span
                  className={`p-1 rounded-md shrink-0 ${
                    jaAdicionado ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {jaAdicionado ? <Check size={12} /> : <Plus size={12} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulário de Item Personalizado */}
      <form onSubmit={adicionarCustomizado} className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          + Adicionar Outro Insumo Sob Medida / Fora de Linha
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Nome ou Descrição do Insumo
            </label>
            <input
              type="text"
              placeholder="Ex: Puxador Cava Alumínio Preto 200mm"
              value={customNome}
              onChange={(e) => setCustomNome(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Qtd</label>
            <input
              type="number"
              min="1"
              value={customQtd}
              onChange={(e) => setCustomQtd(parseInt(e.target.value, 10) || 1)}
              className="w-full h-9 px-2 text-center text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Unidade</label>
            <select
              value={customUnidade}
              onChange={(e) => setCustomUnidade(e.target.value as UnidadeFerragem)}
              className="w-full h-9 px-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="unidades">unidades</option>
              <option value="pares">pares</option>
              <option value="metros">metros</option>
              <option value="caixas">caixas</option>
              <option value="tubos">tubos</option>
              <option value="rolos">rolos</option>
              <option value="kits">kits</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={!customNome.trim()}
              className="w-full h-9 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Inserir Insumo</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

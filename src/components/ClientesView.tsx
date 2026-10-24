import React, { useState } from 'react';
import { Cliente, SolicitacaoPedido } from '../types';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  X,
  Building,
  CheckCircle,
} from 'lucide-react';

interface ClientesViewProps {
  clientes: Cliente[];
  pedidos: SolicitacaoPedido[];
  empresaId: string;
  onSalvarCliente: (cliente: Omit<Cliente, 'id' | 'criadoEm'>) => void;
  onAtualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  onExcluirCliente: (id: string) => void;
  onNovoPedidoComCliente: (clienteId: string) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clientes,
  pedidos,
  empresaId,
  onSalvarCliente,
  onAtualizarCliente,
  onExcluirCliente,
  onNovoPedidoComCliente,
}) => {
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null);

  // Form fields
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [complemento, setComplemento] = useState('');
  const [cep, setCep] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const clientesFiltrados = clientes.filter((c) => {
    const q = busca.toLowerCase();
    return c.nome.toLowerCase().includes(q) || c.telefone.includes(q);
  });

  const abrirModalNovo = () => {
    setClienteEmEdicao(null);
    setNome('');
    setTelefone('');
    setRua('');
    setNumero('');
    setBairro('');
    setCidade('São Paulo');
    setEstado('SP');
    setComplemento('');
    setCep('');
    setObservacoes('');
    setModalAberto(true);
  };

  const abrirModalEdicao = (c: Cliente) => {
    setClienteEmEdicao(c);
    setNome(c.nome);
    setTelefone(c.telefone);
    setRua(c.enderecoObra.rua || '');
    setNumero(c.enderecoObra.numero || '');
    setBairro(c.enderecoObra.bairro || '');
    setCidade(c.enderecoObra.cidade || '');
    setEstado(c.enderecoObra.estado || 'SP');
    setComplemento(c.enderecoObra.complemento || '');
    setCep(c.enderecoObra.cep || '');
    setObservacoes(c.observacoes || '');
    setModalAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const dados = {
      empresaId,
      nome: nome.trim(),
      telefone: telefone.trim(),
      enderecoObra: {
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        complemento: complemento.trim(),
        cep: cep.trim(),
      },
      observacoes: observacoes.trim(),
    };

    if (clienteEmEdicao) {
      onAtualizarCliente(clienteEmEdicao.id, dados);
    } else {
      onSalvarCliente(dados);
    }

    setModalAberto(false);
  };

  return (
    <div className="space-y-6">
      {/* Topo do Módulo de Clientes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Users size={16} />
            <span>Cadastro & Obras</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Clientes e Locais de Montagem</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie os clientes e seus endereços de entrega para emissão rápida de planos de corte
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalNovo}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cliente por nome ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
        />
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400">
            <Users size={40} className="mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">Nenhum cliente encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Cadastre o primeiro cliente da marcenaria clicando no botão acima
            </p>
          </div>
        ) : (
          clientesFiltrados.map((cliente) => {
            const pedidosCliente = pedidos.filter((p) => p.clienteId === cliente.id);

            return (
              <div
                key={cliente.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {cliente.nome}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => abrirModalEdicao(cliente)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar cliente"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Excluir o cliente ${cliente.nome}?`)) {
                            onExcluirCliente(cliente.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir cliente"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <a
                        href={`https://wa.me/${cliente.telefone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {cliente.telefone}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        {cliente.enderecoObra.rua}, {cliente.enderecoObra.numero}
                        {cliente.enderecoObra.complemento && ` - ${cliente.enderecoObra.complemento}`}
                        <br />
                        {cliente.enderecoObra.bairro} - {cliente.enderecoObra.cidade}/
                        {cliente.enderecoObra.estado}
                      </span>
                    </div>

                    {cliente.observacoes && (
                      <div className="mt-2.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                        <span className="font-semibold block text-slate-700">Regras da Obra:</span>
                        {cliente.observacoes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {pedidosCliente.length} pedido(s) registrado(s)
                  </span>

                  <button
                    type="button"
                    onClick={() => onNovoPedidoComCliente(cliente.id)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
                  >
                    <span>Criar Pedido MDF</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro / Edição de Cliente */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {clienteEmEdicao ? 'Editar Cliente & Obra' : 'Novo Cliente / Obra'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Mendes"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Endereço da Obra / Instalação
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Rua / Av</label>
                    <input
                      type="text"
                      placeholder="Ex: Rua das Figueiras"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Número</label>
                    <input
                      type="text"
                      placeholder="Ex: 780"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Bairro</label>
                    <input
                      type="text"
                      placeholder="Ex: Jardins"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Cidade</label>
                    <input
                      type="text"
                      placeholder="Ex: São Paulo"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">UF</label>
                    <input
                      type="text"
                      placeholder="SP"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Complemento / Torre / Apto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Apto 802 - Torre A"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações da Entrega / Condomínio
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Horário do elevador de serviço das 9h às 16h; portaria exige RG."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

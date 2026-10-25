import React, { useState } from 'react';
import { Empresa, TemaId } from '../types';
import {
  X,
  Building,
  Image,
  Phone,
  FileText,
  MapPin,
  Upload,
} from 'lucide-react';

interface ConfiguracoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa;
  onSalvarEmpresa: (dados: Partial<Empresa>) => void;
}

export const ConfiguracoesModal: React.FC<ConfiguracoesModalProps> = ({
  isOpen,
  onClose,
  empresa,
  onSalvarEmpresa,
}) => {
  const [nomeFantasia, setNomeFantasia] = useState(empresa.nomeFantasia);
  const [razaoSocial, setRazaoSocial] = useState(empresa.razaoSocial);
  const [cnpjOuCpf, setCnpjOuCpf] = useState(empresa.cnpjOuCpf);
  const [telefone, setTelefone] = useState(empresa.telefone);
  const [whatsappFabrica, setWhatsappFabrica] = useState(empresa.whatsappFabrica);
  const [tema, setTema] = useState<TemaId>(empresa.tema || 'azul');
  const [logotipoUrl, setLogotipoUrl] = useState(empresa.logotipoUrl || '');
  
  // Endereço
  const [rua, setRua] = useState(empresa.endereco.rua || '');
  const [numero, setNumero] = useState(empresa.endereco.numero || '');
  const [bairro, setBairro] = useState(empresa.endereco.bairro || '');
  const [cidade, setCidade] = useState(empresa.endereco.cidade || '');
  const [estado, setEstado] = useState(empresa.endereco.estado || 'SP');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogotipoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarEmpresa({
      nomeFantasia: nomeFantasia.trim(),
      razaoSocial: razaoSocial.trim(),
      cnpjOuCpf: cnpjOuCpf.trim(),
      telefone: telefone.trim(),
      whatsappFabrica: whatsappFabrica.trim(),
      tema,
      logotipoUrl,
      endereco: {
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building size={18} className="text-amber-400" />
            <h3 className="text-base font-bold">Configurações da Marcenaria & Identidade Visual</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* 2. DADOS CORPORATIVOS & NOME NO CABEÇALHO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Building size={15} className="text-amber-600" />
              <span>Identidade Corporativa & Cabeçalho</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome da Marcenaria (Título Principal do App) *
              </label>
              <input
                type="text"
                required
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                placeholder="Ex: Marcenaria Costa"
                className="w-full h-11 px-3.5 text-sm font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Este nome será exibido em destaque no topo do sistema para todos os marceneiros e nos relatórios em PDF.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Razão Social</label>
                <input
                  type="text"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Ex: Costa Móveis Sob Medida Ltda"
                  className="w-full h-10 px-3 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ / CPF</label>
                <input
                  type="text"
                  value={cnpjOuCpf}
                  onChange={(e) => setCnpjOuCpf(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full h-10 px-3 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telefone da Oficina
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full h-10 px-3 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  WhatsApp da Fábrica / Central de Corte Parceira
                </label>
                <input
                  type="text"
                  value={whatsappFabrica}
                  onChange={(e) => setWhatsappFabrica(e.target.value)}
                  placeholder="5511999998888 (com DDI e DDD)"
                  className="w-full h-10 px-3 text-xs font-bold text-slate-900 bg-white border border-emerald-400 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Número pré-carregado no botão "Enviar via WhatsApp" dos pedidos
                </p>
              </div>
            </div>
          </div>

          {/* 3. LOGOTIPO DA EMPRESA */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Image size={15} className="text-amber-600" />
              <span>Logotipo da Marcenaria</span>
            </div>

            <div className="flex items-center gap-4">
              {logotipoUrl ? (
                <div className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-white p-1 shrink-0">
                  <img
                    src={logotipoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setLogotipoUrl('')}
                    className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs"
                    title="Remover logotipo"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <Building size={24} className="opacity-40 mb-1" />
                  <span className="text-[9px]">Sem logo</span>
                </div>
              )}

              <div className="flex-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors">
                  <Upload size={14} />
                  <span>Escolher imagem do Logotipo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  Recomendado imagem PNG ou JPG transparente de até 2MB. Usado no cabeçalho do PDF.
                </p>
              </div>
            </div>
          </div>

          {/* 4. ENDEREÇO DA OFICINA */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <MapPin size={15} className="text-amber-600" />
              <span>Endereço da Oficina / Fábrica</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rua / Av</label>
                <input
                  type="text"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Número</label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bairro</label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">UF</label>
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

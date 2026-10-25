export type CargoUsuario = 
  | 'Marceneiro'
  | 'Ajudante'
  | 'Projetista'
  | 'Gerente'
  | 'Dono / Administrador';

export type PerfilAcesso = 'admin' | 'funcionario';

export type StatusPedido = 
  | 'aguardando_aprovacao'
  | 'enviado_corte'
  | 'em_producao'
  | 'concluido';

export type AbaAtual = 'dashboard' | 'clientes' | 'equipe' | 'pecas_projeto';


export type TemaId = 'azul' | 'grafite' | 'madeira' | 'verde' | 'escuro';

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento?: string;
  cep?: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjOuCpf: string;
  telefone: string;
  whatsappFabrica: string; // Telefone do fornecedor / central de corte para envio via WhatsApp
  endereco: Endereco;
  logotipoUrl?: string;
  tema: TemaId;
  criadoEm: string;
}

export interface Usuario {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: CargoUsuario;
  perfil: PerfilAcesso;
  ativo: boolean;
}

export interface Cliente {
  id: string;
  empresaId: string;
  nome: string;
  telefone: string;
  enderecoObra: Endereco;
  observacoes?: string;
  criadoEm: string;
}

export interface FitagemBorda {
  c1: boolean; // Comprimento 1
  c2: boolean; // Comprimento 2
  l1: boolean; // Largura 1
  l2: boolean; // Largura 2
}

export interface PecaMdf {
  id: string;
  nomePeca: string;
  material: string; // MDF, MDP, Compensado, etc.
  corPadrao: string; // Branco Supremo, Louro Freijó, Grafite, etc.
  espessuraMm: number; // 6, 15, 18, 25
  comprimentoMm: number;
  larguraMm: number;
  quantidade: number;
  fitagem: FitagemBorda;
  fitaEspessura: string; // 0.45mm, 1mm, 2mm
  fitaCor?: string;
  observacao?: string;
}

export type CategoriaFerragem = 
  | 'abertura'
  | 'corredicas'
  | 'acessorios'
  | 'fitas_consumiveis'
  | 'fixacao'
  | 'outros';

export type UnidadeFerragem = 
  | 'unidades'
  | 'pares'
  | 'metros'
  | 'barras'
  | 'caixas'
  | 'tubos'
  | 'rolos'
  | 'kits';

export interface FerragemInsumo {
  id: string;
  categoria: CategoriaFerragem;
  nomeItem: string;
  quantidade: number;
  unidade: UnidadeFerragem;
  observacoes?: string;
}

export interface HistoricoStatusItem {
  status: StatusPedido;
  data: string;
  alteradoPor: string;
  nota?: string;
}

export interface SolicitacaoPedido {
  id: string;
  codigo: string; // Ex: OS-1042
  empresaId: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEndereco: string;
  solicitanteId: string;
  solicitanteNome: string;
  solicitanteCargo: string;
  projetoNome: string;
  status: StatusPedido;
  dataCriacao: string;
  dataAtualizacao: string;
  pecasMdf: PecaMdf[];
  ferragens: FerragemInsumo[];
  observacoesGerais?: string;
  historicoStatus?: HistoricoStatusItem[];
}

import { Cliente, Empresa, FerragemInsumo, PecaMdf, SolicitacaoPedido, Usuario } from '../types';

const STORAGE_KEYS = {
  EMPRESAS: 'cortemarcenaria_empresas',
  EMPRESA_ATIVA_ID: 'cortemarcenaria_empresa_ativa_id',
  USUARIOS: 'cortemarcenaria_usuarios',
  USUARIO_ATIVO_ID: 'cortemarcenaria_usuario_ativo_id',
  CLIENTES: 'cortemarcenaria_clientes',
  PEDIDOS: 'cortemarcenaria_pedidos',
};

// Dados padrão iniciais
const INITIAL_EMPRESA: Empresa = {
  id: 'emp-costa-01',
  nomeFantasia: 'Mettro Quadrado',
  razaoSocial: 'CORTTA · OFICINA & PRODUÇÃO',
  cnpjOuCpf: '34.892.109/0001-44',
  telefone: '(11) 98765-4321',
  whatsappFabrica: '5511999998888', // Fábrica de corte parceira
  endereco: {
    rua: 'Av. dos Marceneiros',
    numero: '450',
    bairro: 'Distrito Industrial',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '04850-100',
    complemento: 'Galpão 03',
  },
  tema: 'azul',
  criadoEm: '2026-01-15T09:00:00Z',
};

const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'user-01',
    empresaId: 'emp-costa-01',
    nome: 'Ricardo Almeida',
    email: 'ricardo@mettroquadrado.com.br',
    telefone: '(11) 98765-4321',
    cargo: 'Marceneiro',
    perfil: 'admin',
    ativo: true,
  },
  {
    id: 'user-02',
    empresaId: 'emp-costa-01',
    nome: 'Tiago Alves',
    email: 'tiago@mettroquadrado.com.br',
    telefone: '(11) 97777-1122',
    cargo: 'Marceneiro',
    perfil: 'funcionario',
    ativo: true,
  },
  {
    id: 'user-03',
    empresaId: 'emp-costa-01',
    nome: 'Lucas Pinheiro',
    email: 'lucas@mettroquadrado.com.br',
    telefone: '(11) 96666-3344',
    cargo: 'Projetista',
    perfil: 'funcionario',
    ativo: true,
  },
];

const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'cli-01',
    empresaId: 'emp-costa-01',
    nome: 'Carlos Eduardo Mendes',
    telefone: '(11) 99123-4567',
    enderecoObra: {
      rua: 'Rua das Figueiras',
      numero: '780',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      estado: 'SP',
      complemento: 'Apto 802 - Torre A',
      cep: '01423-000',
    },
    observacoes: 'Entrega somente entre 09:00 e 16:30 pelo elevador de serviço. Portaria exige identificação prévia.',
    criadoEm: '2026-02-10T14:30:00Z',
  },
  {
    id: 'cli-02',
    empresaId: 'emp-costa-01',
    nome: 'Dra. Renata Silveira',
    telefone: '(11) 98234-5678',
    enderecoObra: {
      rua: 'Alameda Santos',
      numero: '1200',
      bairro: 'Cerqueira César',
      cidade: 'São Paulo',
      estado: 'SP',
      complemento: 'Conjunto 504 - Edifício Prime',
      cep: '01418-100',
    },
    observacoes: 'Consultório odontológico. Obras e ruídos pesados autorizados somente aos sábados.',
    criadoEm: '2026-03-01T10:00:00Z',
  },
  {
    id: 'cli-03',
    empresaId: 'emp-costa-01',
    nome: 'Marcos Vinícius Toledo',
    telefone: '(11) 97345-6789',
    enderecoObra: {
      rua: 'Alameda dos Ipês',
      numero: '45',
      bairro: 'Condomínio Quinta da Baroneza',
      cidade: 'Bragança Paulista',
      estado: 'SP',
      cep: '12900-000',
    },
    observacoes: 'Casa ampla com pé direito duplo. Descarregamento direto na garagem lateral.',
    criadoEm: '2026-03-15T11:20:00Z',
  },
];

const INITIAL_PEDIDOS: SolicitacaoPedido[] = [
  {
    id: 'ped-1024',
    codigo: 'OS-1024',
    empresaId: 'emp-costa-01',
    clienteId: 'cli-01',
    clienteNome: 'Carlos Eduardo Mendes',
    clienteTelefone: '(11) 99123-4567',
    clienteEndereco: 'Rua das Figueiras, 780 - Apto 802, Jardins, São Paulo/SP',
    solicitanteId: 'user-02',
    solicitanteNome: 'Tiago Alves',
    solicitanteCargo: 'Marceneiro',
    projetoNome: 'Cozinha Planejada e Torre Quente',
    status: 'enviado_corte',
    dataCriacao: '2026-04-18T08:30:00Z',
    dataAtualizacao: '2026-04-18T14:15:00Z',
    observacoesGerais: 'Fita de borda de 1mm em todas as portas externas e 0.45mm nas prateleiras internas.',
    pecasMdf: [
      {
        id: 'p-1',
        nomePeca: 'Lateral Torre Quente Esquerda',
        material: 'MDF',
        corPadrao: 'Louro Freijó',
        espessuraMm: 18,
        comprimentoMm: 2200,
        larguraMm: 600,
        quantidade: 1,
        fitagem: { c1: true, c2: false, l1: true, l2: true },
        fitaEspessura: '1.0mm',
        fitaCor: 'Louro Freijó',
        observacao: 'Furar para minifix e cavilhas',
      },
      {
        id: 'p-2',
        nomePeca: 'Lateral Torre Quente Direita',
        material: 'MDF',
        corPadrao: 'Louro Freijó',
        espessuraMm: 18,
        comprimentoMm: 2200,
        larguraMm: 600,
        quantidade: 1,
        fitagem: { c1: true, c2: false, l1: true, l2: true },
        fitaEspessura: '1.0mm',
        fitaCor: 'Louro Freijó',
      },
      {
        id: 'p-3',
        nomePeca: 'Portas Armário Aéreo Superior',
        material: 'MDF',
        corPadrao: 'Branco Supremo',
        espessuraMm: 18,
        comprimentoMm: 800,
        larguraMm: 396,
        quantidade: 4,
        fitagem: { c1: true, c2: true, l1: true, l2: true },
        fitaEspessura: '1.0mm',
        fitaCor: 'Branco Supremo',
        observacao: 'Furar 2 canecos de dobradiça 35mm por porta',
      },
      {
        id: 'p-4',
        nomePeca: 'Prateleiras Internas Móveis',
        material: 'MDF',
        corPadrao: 'Branco Supremo',
        espessuraMm: 15,
        comprimentoMm: 764,
        larguraMm: 360,
        quantidade: 6,
        fitagem: { c1: true, c2: false, l1: false, l2: false },
        fitaEspessura: '0.45mm',
        fitaCor: 'Branco Supremo',
      },
      {
        id: 'p-5',
        nomePeca: 'Fundo Gavetões Inferiores',
        material: 'MDF',
        corPadrao: 'Branco Supremo',
        espessuraMm: 6,
        comprimentoMm: 750,
        larguraMm: 480,
        quantidade: 3,
        fitagem: { c1: false, c2: false, l1: false, l2: false },
        fitaEspessura: '0.45mm',
      },
    ],
    ferragens: [
      {
        id: 'f-1',
        categoria: 'abertura',
        nomeItem: 'Dobradiça Reta com Amortecedor (Slow Close)',
        quantidade: 8,
        unidade: 'unidades',
        observacoes: 'Marca FGVTN ou Blum',
      },
      {
        id: 'f-2',
        categoria: 'corredicas',
        nomeItem: 'Corrediça Oculta com Fechamento Suave 500mm',
        quantidade: 3,
        unidade: 'pares',
        observacoes: 'Capacidade 45kg para gavetões de panelas',
      },
      {
        id: 'f-3',
        categoria: 'fixacao',
        nomeItem: 'Parafuso Chipboard 4.0x16 Cabeça Chata Phillips',
        quantidade: 1,
        unidade: 'caixas',
        observacoes: 'Caixa com 500 unidades',
      },
      {
        id: 'f-4',
        categoria: 'fixacao',
        nomeItem: 'Parafuso Chipboard 4.0x40 Cabeça Chata',
        quantidade: 1,
        unidade: 'caixas',
        observacoes: 'Para montagem de caixarias',
      },
      {
        id: 'f-5',
        categoria: 'fitas_consumiveis',
        nomeItem: 'Tapa-furos Adesivo Louro Freijó 12mm',
        quantidade: 3,
        unidade: 'cartelas' as any,
        observacoes: 'Combinação exata com padrão Arauco',
      },
      {
        id: 'f-6',
        categoria: 'acessorios',
        nomeItem: 'Pé Regulável Plástico Reforçado Preto 100mm a 150mm',
        quantidade: 8,
        unidade: 'unidades',
        observacoes: 'Com presilha para rodapé removível',
      },
    ],
    historicoStatus: [
      {
        status: 'aguardando_aprovacao',
        data: '2026-04-18T08:30:00Z',
        alteradoPor: 'Tiago Alves',
        nota: 'Pedido cadastrado após conferência de medidas in loco.',
      },
      {
        status: 'enviado_corte',
        data: '2026-04-18T14:15:00Z',
        alteradoPor: 'Roberto Costa (Admin)',
        nota: 'Aprovado e enviado para a central de corte via WhatsApp.',
      },
    ],
  },
  {
    id: 'ped-1025',
    codigo: 'OS-1025',
    empresaId: 'emp-costa-01',
    clienteId: 'cli-02',
    clienteNome: 'Dra. Renata Silveira',
    clienteTelefone: '(11) 98234-5678',
    clienteEndereco: 'Alameda Santos, 1200 - Conjunto 504, Cerqueira César, São Paulo/SP',
    solicitanteId: 'user-03',
    solicitanteNome: 'Lucas Pinheiro',
    solicitanteCargo: 'Projetista',
    projetoNome: 'Bancada Clínica e Gaveteiro Odontológico',
    status: 'aguardando_aprovacao',
    dataCriacao: '2026-04-20T10:00:00Z',
    dataAtualizacao: '2026-04-20T10:00:00Z',
    observacoesGerais: 'Tampo superior em MDF 25mm resistente à umidade com borda de 2mm.',
    pecasMdf: [
      {
        id: 'p-201',
        nomePeca: 'Tampo Superior Bancada',
        material: 'MDF',
        corPadrao: 'Branco Supremo',
        espessuraMm: 25,
        comprimentoMm: 1600,
        larguraMm: 600,
        quantidade: 1,
        fitagem: { c1: true, c2: true, l1: true, l2: true },
        fitaEspessura: '2.0mm',
        fitaCor: 'Branco Supremo',
      },
      {
        id: 'p-202',
        nomePeca: 'Frente de Gaveta Clínica',
        material: 'MDF',
        corPadrao: 'Grafite Matt',
        espessuraMm: 18,
        comprimentoMm: 450,
        larguraMm: 160,
        quantidade: 4,
        fitagem: { c1: true, c2: true, l1: true, l2: true },
        fitaEspessura: '1.0mm',
        fitaCor: 'Grafite Matt',
      },
    ],
    ferragens: [
      {
        id: 'f-201',
        categoria: 'corredicas',
        nomeItem: 'Corrediça Telescópica 450mm com Amortecedor',
        quantidade: 4,
        unidade: 'pares',
        observacoes: 'Para gavetas de instrumentos',
      },
      {
        id: 'f-202',
        categoria: 'acessorios',
        nomeItem: 'Rodízio de Silicone 50mm com Trava',
        quantidade: 4,
        unidade: 'unidades',
        observacoes: 'Base giratória para movimentação suave sem riscar porcelanato',
      },
    ],
    historicoStatus: [
      {
        status: 'aguardando_aprovacao',
        data: '2026-04-20T10:00:00Z',
        alteradoPor: 'Lucas Pinheiro',
        nota: 'Aguardando validação do Dono da Marcenaria para disparo do corte.',
      },
    ],
  },
];

export const getEmpresas = (): Empresa[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMPRESAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify([INITIAL_EMPRESA]));
      return [INITIAL_EMPRESA];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [INITIAL_EMPRESA];
  }
};

export const saveEmpresas = (empresas: Empresa[]) => {
  localStorage.setItem(STORAGE_KEYS.EMPRESAS, JSON.stringify(empresas));
};

export const getEmpresaAtiva = (): Empresa => {
  const empresas = getEmpresas();
  const ativaId = localStorage.getItem(STORAGE_KEYS.EMPRESA_ATIVA_ID);
  const found = empresas.find((e) => e.id === ativaId);
  if (found) return found;
  if (empresas.length > 0) {
    localStorage.setItem(STORAGE_KEYS.EMPRESA_ATIVA_ID, empresas[0].id);
    return empresas[0];
  }
  saveEmpresas([INITIAL_EMPRESA]);
  localStorage.setItem(STORAGE_KEYS.EMPRESA_ATIVA_ID, INITIAL_EMPRESA.id);
  return INITIAL_EMPRESA;
};

export const setEmpresaAtivaId = (empresaId: string) => {
  localStorage.setItem(STORAGE_KEYS.EMPRESA_ATIVA_ID, empresaId);
};

export const updateEmpresaAtiva = (dadosAtualizados: Partial<Empresa>): Empresa => {
  const empresas = getEmpresas();
  const ativa = getEmpresaAtiva();
  const index = empresas.findIndex((e) => e.id === ativa.id);
  if (index !== -1) {
    empresas[index] = { ...empresas[index], ...dadosAtualizados };
    saveEmpresas(empresas);
    return empresas[index];
  }
  return ativa;
};

export const getUsuarios = (empresaId?: string): Usuario[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    const users: Usuario[] = raw ? JSON.parse(raw) : INITIAL_USUARIOS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(INITIAL_USUARIOS));
    }
    if (empresaId) {
      return users.filter((u) => u.empresaId === empresaId);
    }
    return users;
  } catch (e) {
    return INITIAL_USUARIOS;
  }
};

export const saveUsuarios = (usuarios: Usuario[]) => {
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
};

export const deleteUsuario = (id: string) => {
  const all = getUsuarios();
  const filtered = all.filter((u) => u.id !== id);
  saveUsuarios(filtered);
};

export const getUsuarioAtivo = (): Usuario => {
  const empresa = getEmpresaAtiva();
  const usuarios = getUsuarios(empresa.id);
  const ativaId = localStorage.getItem(STORAGE_KEYS.USUARIO_ATIVO_ID);
  const found = usuarios.find((u) => u.id === ativaId);
  if (found) return found;
  if (usuarios.length > 0) {
    localStorage.setItem(STORAGE_KEYS.USUARIO_ATIVO_ID, usuarios[0].id);
    return usuarios[0];
  }
  // Fallback se não houver usuários na empresa
  const adminPadrao: Usuario = {
    id: `admin-${empresa.id}`,
    empresaId: empresa.id,
    nome: 'Administrador Master',
    email: 'admin@empresa.com.br',
    telefone: empresa.telefone,
    cargo: 'Dono / Administrador',
    perfil: 'admin',
    ativo: true,
  };
  usuarios.push(adminPadrao);
  saveUsuarios(getUsuarios().concat([adminPadrao]));
  localStorage.setItem(STORAGE_KEYS.USUARIO_ATIVO_ID, adminPadrao.id);
  return adminPadrao;
};

export const setUsuarioAtivoId = (usuarioId: string) => {
  localStorage.setItem(STORAGE_KEYS.USUARIO_ATIVO_ID, usuarioId);
};

export const getClientes = (empresaId?: string): Cliente[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTES);
    const clients: Cliente[] = raw ? JSON.parse(raw) : INITIAL_CLIENTES;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(INITIAL_CLIENTES));
    }
    if (empresaId) {
      return clients.filter((c) => c.empresaId === empresaId);
    }
    return clients;
  } catch (e) {
    return INITIAL_CLIENTES;
  }
};

export const saveClientes = (clientes: Cliente[]) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
};

export const addCliente = (cliente: Omit<Cliente, 'id' | 'criadoEm'>): Cliente => {
  const todos = getClientes();
  const novo: Cliente = {
    ...cliente,
    id: 'cli-' + Date.now().toString(36),
    criadoEm: new Date().toISOString(),
  };
  saveClientes([novo, ...todos]);
  return novo;
};

export const updateCliente = (id: string, dados: Partial<Cliente>): Cliente | null => {
  const todos = getClientes();
  const idx = todos.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  todos[idx] = { ...todos[idx], ...dados };
  saveClientes(todos);
  return todos[idx];
};

export const deleteCliente = (id: string) => {
  const todos = getClientes();
  saveClientes(todos.filter((c) => c.id !== id));
};

export const getPedidos = (empresaId?: string): SolicitacaoPedido[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PEDIDOS);
    const orders: SolicitacaoPedido[] = raw ? JSON.parse(raw) : INITIAL_PEDIDOS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(INITIAL_PEDIDOS));
    }
    if (empresaId) {
      return orders.filter((o) => o.empresaId === empresaId);
    }
    return orders;
  } catch (e) {
    return INITIAL_PEDIDOS;
  }
};

export const savePedidos = (pedidos: SolicitacaoPedido[]) => {
  localStorage.setItem(STORAGE_KEYS.PEDIDOS, JSON.stringify(pedidos));
};

export const addPedido = (
  pedido: Omit<SolicitacaoPedido, 'id' | 'codigo' | 'dataCriacao' | 'dataAtualizacao'>
): SolicitacaoPedido => {
  const todos = getPedidos();
  const nextNum = 1000 + todos.length + 1;
  const novo: SolicitacaoPedido = {
    ...pedido,
    id: 'ped-' + Date.now().toString(36),
    codigo: `OS-${nextNum}`,
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
    historicoStatus: [
      {
        status: pedido.status || 'aguardando_aprovacao',
        data: new Date().toISOString(),
        alteradoPor: `${pedido.solicitanteNome} (${pedido.solicitanteCargo})`,
        nota: 'Pedido criado no sistema.',
      },
    ],
  };
  savePedidos([novo, ...todos]);
  return novo;
};

export const updatePedido = (id: string, dados: Partial<SolicitacaoPedido>): SolicitacaoPedido | null => {
  const todos = getPedidos();
  const idx = todos.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  todos[idx] = { ...todos[idx], ...dados, dataAtualizacao: new Date().toISOString() };
  savePedidos(todos);
  return todos[idx];
};

export const updatePedidoStatus = (
  id: string,
  novoStatus: SolicitacaoPedido['status'],
  alteradoPor: string,
  nota?: string
): SolicitacaoPedido | null => {
  const todos = getPedidos();
  const idx = todos.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  const historicoAtual = todos[idx].historicoStatus || [];
  const novoItem = {
    status: novoStatus,
    data: new Date().toISOString(),
    alteradoPor,
    nota: nota || `Status alterado para ${novoStatus.replace('_', ' ').toUpperCase()}`,
  };

  todos[idx] = {
    ...todos[idx],
    status: novoStatus,
    dataAtualizacao: new Date().toISOString(),
    historicoStatus: [novoItem, ...historicoAtual],
  };

  savePedidos(todos);
  return todos[idx];
};

export const deletePedido = (id: string) => {
  const todos = getPedidos();
  savePedidos(todos.filter((p) => p.id !== id));
};

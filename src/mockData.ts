export type User = {
  id: number
  nome: string
  email: string
  nivel: number
}

export type Projeto = {
  id: number
  nome: string
  status: string
  descricao?: string
}

export type TarefaKanban = {
  id: number
  titulo: string
  descricao?: string
  status: string
  versao: number
  projeto_id: number
  prioridade?: string
}

export type Marco = {
  titulo: string
  data_marco: string
  concluido: number
}

export type Entregavel = {
  titulo: string
  url_arquivo: string | null
}

// Mock users
export const MOCK_USERS: Record<string, { senha: string; user: User }> = {
  'gestor@demo.local': {
    senha: 'admin123',
    user: { id: 1, nome: 'Gestor Demo', email: 'gestor@demo.local', nivel: 1 },
  },
  'cliente@demo.local': {
    senha: 'cliente123',
    user: { id: 2, nome: 'Cliente Demo', email: 'cliente@demo.local', nivel: 21 },
  },
}

// Mock projects
export const MOCK_PROJETOS: Projeto[] = [
  {
    id: 1,
    nome: 'Sistema de Gestão',
    status: 'em_desenvolvimento',
    descricao: 'Desenvolvimento do sistema de gestão de projetos',
  },
  {
    id: 2,
    nome: 'Portal Web',
    status: 'planejamento',
    descricao: 'Criação do portal web para clientes',
  },
  {
    id: 3,
    nome: 'API REST',
    status: 'concluido',
    descricao: 'Backend API para integração com terceiros',
  },
]

// Mock tasks - usando localStorage para persistência
const MOCK_TAREFAS_INICIAL: TarefaKanban[] = [
  {
    id: 1,
    titulo: 'Definir requisitos',
    descricao: 'Levantar todos os requisitos do projeto',
    status: 'done',
    versao: 1,
    projeto_id: 1,
    prioridade: 'alta',
  },
  {
    id: 2,
    titulo: 'Desenhar arquitetura',
    descricao: 'Criar diagrama arquitetural do sistema',
    status: 'doing',
    versao: 1,
    projeto_id: 1,
    prioridade: 'alta',
  },
  {
    id: 3,
    titulo: 'Implementar autenticação',
    descricao: 'Sistema de login e autenticação',
    status: 'doing',
    versao: 1,
    projeto_id: 1,
    prioridade: 'alta',
  },
  {
    id: 4,
    titulo: 'Criar dashboard',
    descricao: 'Dashboard principal da aplicação',
    status: 'todo',
    versao: 1,
    projeto_id: 1,
    prioridade: 'média',
  },
  {
    id: 5,
    titulo: 'Testes unitários',
    descricao: 'Implementar testes para os componentes',
    status: 'todo',
    versao: 1,
    projeto_id: 1,
    prioridade: 'média',
  },
]

const TAREFAS_STORAGE_KEY = 'mock_tarefas'

export function getMockTarefas(): TarefaKanban[] {
  if (typeof window === 'undefined') return MOCK_TAREFAS_INICIAL
  const stored = localStorage.getItem(TAREFAS_STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(TAREFAS_STORAGE_KEY, JSON.stringify(MOCK_TAREFAS_INICIAL))
    return MOCK_TAREFAS_INICIAL
  }
  try {
    return JSON.parse(stored) as TarefaKanban[]
  } catch {
    return MOCK_TAREFAS_INICIAL
  }
}

export function saveMockTarefas(tarefas: TarefaKanban[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TAREFAS_STORAGE_KEY, JSON.stringify(tarefas))
}

// Mock milestones
const MOCK_MARCOS_INICIAL: Marco[] = [
  { titulo: 'Conclusão dos requisitos', data_marco: '2026-05-30', concluido: 1 },
  { titulo: 'Prototipagem', data_marco: '2026-06-15', concluido: 0 },
  { titulo: 'Desenvolvimento alfa', data_marco: '2026-07-30', concluido: 0 },
  { titulo: 'Testes e validação', data_marco: '2026-08-30', concluido: 0 },
]

const MARCOS_STORAGE_KEY = 'mock_marcos'

export function getMockMarcos(): Marco[] {
  if (typeof window === 'undefined') return MOCK_MARCOS_INICIAL
  const stored = localStorage.getItem(MARCOS_STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(MARCOS_STORAGE_KEY, JSON.stringify(MOCK_MARCOS_INICIAL))
    return MOCK_MARCOS_INICIAL
  }
  try {
    return JSON.parse(stored) as Marco[]
  } catch {
    return MOCK_MARCOS_INICIAL
  }
}

export function saveMockMarcos(marcos: Marco[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MARCOS_STORAGE_KEY, JSON.stringify(marcos))
}

// Mock deliverables
const MOCK_ENTREGAVEIS_INICIAL: Entregavel[] = [
  { titulo: 'Documento de Requisitos', url_arquivo: 'https://example.com/docs/requisitos.pdf' },
  { titulo: 'Diagrama de Arquitetura', url_arquivo: 'https://example.com/docs/arquitetura.pdf' },
  { titulo: 'Manual do Usuário', url_arquivo: null },
]

const ENTREGAVEIS_STORAGE_KEY = 'mock_entregaveis'

export function getMockEntregaveis(): Entregavel[] {
  if (typeof window === 'undefined') return MOCK_ENTREGAVEIS_INICIAL
  const stored = localStorage.getItem(ENTREGAVEIS_STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(ENTREGAVEIS_STORAGE_KEY, JSON.stringify(MOCK_ENTREGAVEIS_INICIAL))
    return MOCK_ENTREGAVEIS_INICIAL
  }
  try {
    return JSON.parse(stored) as Entregavel[]
  } catch {
    return MOCK_ENTREGAVEIS_INICIAL
  }
}

export function saveMockEntregaveis(entregaveis: Entregavel[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ENTREGAVEIS_STORAGE_KEY, JSON.stringify(entregaveis))
}

// Local storage key
const AUTH_STORAGE_KEY = 'mock_auth_user'

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

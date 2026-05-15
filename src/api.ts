import {
  MOCK_USERS,
  MOCK_PROJETOS,
  getMockTarefas,
  saveMockTarefas,
  getMockMarcos,
  saveMockMarcos,
  getMockEntregaveis,
  saveMockEntregaveis,
  getCurrentUser,
  setCurrentUser,
  type User,
  type Projeto,
  type TarefaKanban,
  type Marco,
  type Entregavel,
} from './mockData'

export type { User }

// Simula um delay de rede para parecer mais realista
function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 300))
}

// Simulação de API com dados mockados
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  await simulateNetworkDelay()

  const method = init?.method || 'GET'
  const body = init?.body ? JSON.parse(init.body as string) : null

  // Auth endpoints
  if (path === '/ApiAuth/me') {
    const user = getCurrentUser()
    return { ok: true, user } as T
  }

  if (path === '/ApiAuth/login') {
    const { email, senha } = body
    const userEntry = MOCK_USERS[email]
    if (!userEntry || userEntry.senha !== senha) {
      throw new Error('Email ou senha inválidos')
    }
    setCurrentUser(userEntry.user)
    return { ok: true, user: userEntry.user } as T
  }

  if (path === '/ApiAuth/logout') {
    setCurrentUser(null)
    return { ok: true } as T
  }

  if (path === '/ApiAuth/registrarConvite') {
    const { token, nome, senha } = body
    // Simula validação do token
    if (!token || token.length < 3) {
      throw new Error('Token inválido')
    }
    // Cria novo usuário com perfil cliente
    const newUser: User = {
      id: Math.floor(Math.random() * 10000),
      nome,
      email: `user-${Date.now()}@invite.local`,
      nivel: 21, // cliente
    }
    setCurrentUser(newUser)
    return { ok: true, user: newUser } as T
  }

  // Check if user is authenticated for other endpoints
  const user = getCurrentUser()
  if (!user) {
    throw new Error('Não autenticado')
  }

  // Project endpoints
  if (path === '/ApiProjeto/index') {
    return { ok: true, projetos: MOCK_PROJETOS } as T
  }

  if (path.startsWith('/ApiProjeto/detalhe/x/')) {
    const id = parseInt(path.split('/').pop() || '0')
    const projeto = MOCK_PROJETOS.find((p) => p.id === id)
    if (!projeto) throw new Error('Projeto não encontrado')
    return { ok: true, projeto } as T
  }

  if (path === '/ApiProjeto/criar' && method === 'POST') {
    const { nome, status } = body
    const newProjeto: Projeto = {
      id: Math.max(...MOCK_PROJETOS.map((p) => p.id)) + 1,
      nome,
      status,
      descricao: '',
    }
    MOCK_PROJETOS.push(newProjeto)
    return { ok: true, projeto: newProjeto } as T
  }

  // Task endpoints
  if (path.startsWith('/ApiTarefa/lista/projeto/')) {
    const projectId = parseInt(path.split('/').pop() || '0')
    const tarefas = getMockTarefas().filter((t) => t.projeto_id === projectId)
    return { ok: true, tarefas } as T
  }

  if (path === '/ApiTarefa/moverStatus' && method === 'POST') {
    const { id, versao, status } = body
    const tarefas = getMockTarefas()
    const tarefaIndex = tarefas.findIndex((t) => t.id === id && t.versao === versao)
    if (tarefaIndex === -1) throw new Error('Tarefa não encontrada')
    const tarefaAtualizada = {
      ...tarefas[tarefaIndex],
      status,
      versao: versao + 1,
    }
    tarefas[tarefaIndex] = tarefaAtualizada
    saveMockTarefas(tarefas)
    return { ok: true, tarefa: tarefaAtualizada } as T
  }

  if (path === '/ApiTarefa/criar' && method === 'POST') {
    const { projeto_id, titulo, status, descricao } = body
    const tarefas = getMockTarefas()
    const newTarefa: TarefaKanban = {
      id: Math.max(...tarefas.map((t) => t.id), 0) + 1,
      projeto_id,
      titulo,
      descricao: descricao || '',
      status: status || 'todo',
      versao: 1,
      prioridade: 'média',
    }
    tarefas.push(newTarefa)
    saveMockTarefas(tarefas)
    return { ok: true, tarefa: newTarefa } as T
  }

  if (path === '/ApiTarefa/atualizar' && method === 'POST') {
    const { id, versao, titulo, descricao, status, prioridade, data_prevista } = body
    const tarefas = getMockTarefas()
    const tarefaIndex = tarefas.findIndex((t) => t.id === id && t.versao === versao)
    if (tarefaIndex === -1) throw new Error('Tarefa não encontrada')
    const tarefaAtualizada = {
      ...tarefas[tarefaIndex],
      titulo,
      descricao: descricao || '',
      status,
      prioridade: prioridade || 'média',
      versao: versao + 1,
    }
    tarefas[tarefaIndex] = tarefaAtualizada
    saveMockTarefas(tarefas)
    return { ok: true, tarefa: tarefaAtualizada } as T
  }

  if (path === '/ApiTarefa/excluir' && method === 'POST') {
    const { id } = body
    const tarefas = getMockTarefas()
    const filtered = tarefas.filter((t) => t.id !== id)
    saveMockTarefas(filtered)
    return { ok: true } as T
  }

  // Milestone endpoints
  if (path.startsWith('/ApiMarco/lista/projeto/')) {
    return { ok: true, marcos: getMockMarcos() } as T
  }

  if (path === '/ApiMarco/criar' && method === 'POST') {
    const { projeto_id, titulo, data_marco, concluido } = body
    const marcos = getMockMarcos()
    const newMarco: Marco = { titulo, data_marco, concluido: concluido || 0 }
    marcos.push(newMarco)
    saveMockMarcos(marcos)
    return { ok: true, marco: newMarco } as T
  }

  // Deliverable endpoints
  if (path.startsWith('/ApiEntregavel/lista/projeto/')) {
    return { ok: true, entregaveis: getMockEntregaveis() } as T
  }

  if (path === '/ApiEntregavel/criar' && method === 'POST') {
    const { projeto_id, titulo, url_arquivo, visivel_cliente } = body
    const entregaveis = getMockEntregaveis()
    const newEnt: Entregavel = { titulo, url_arquivo: url_arquivo || null }
    entregaveis.push(newEnt)
    saveMockEntregaveis(entregaveis)
    return { ok: true, entregavel: newEnt } as T
  }

  // Invite endpoint
  if (path === '/ApiConvite/criar' && method === 'POST') {
    const { projeto_id, email } = body
    // Simula geração de token
    const token = `token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    return { ok: true, modo: 'convite', token, detail: `Convite enviado para ${email}` } as T
  }

  throw new Error(`Endpoint não encontrado: ${path}`)
}

export function isGestor(nivel: number) {
  return nivel === 1 || nivel === 11
}

/** Usuário com perfil "cliente" explícito (nível 21 no seed). */
export function isCliente(nivel: number) {
  return nivel === 21
}

/** Área /client: qualquer usuário autenticado que não é gestor (inclui cliente e outros níveis convidados). */
export function isPainelCliente(nivel: number) {
  return !isGestor(nivel)
}


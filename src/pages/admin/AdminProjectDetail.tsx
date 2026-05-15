import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../auth'

type Projeto = Record<string, unknown>
type Tarefa = {
  id: number
  projeto_id: number
  titulo: string
  descricao: string
  status: string
  prioridade: number
  data_prevista: string | null
  versao: number
}
type Marco = { id: number; projeto_id: number; titulo: string; data_marco: string; concluido: number }
type Entregavel = {
  id: number
  projeto_id: number
  titulo: string
  url_arquivo: string | null
  visivel_cliente: number
}

export default function AdminProjectDetail() {
  const { id } = useParams()
  const pid = Number(id)
  const nav = useNavigate()
  const { logout } = useAuth()

  const [projeto, setProjeto] = useState<Projeto | null>(null)
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [marcos, setMarcos] = useState<Marco[]>([])
  const [entregaveis, setEntregaveis] = useState<Entregavel[]>([])
  const [err, setErr] = useState('')

  const [novaTarefa, setNovaTarefa] = useState('')
  const [edit, setEdit] = useState<Tarefa | null>(null)

  const [marcoTitulo, setMarcoTitulo] = useState('')
  const [marcoData, setMarcoData] = useState('')

  const [entTitulo, setEntTitulo] = useState('')
  const [entUrl, setEntUrl] = useState('')
  const [entVisivel, setEntVisivel] = useState(true)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')

  const load = useCallback(async () => {
    if (!pid) return
    setErr('')
    try {
      const [p, t, m, e] = await Promise.all([
        api<{ ok: boolean; projeto: Projeto }>(`/ApiProjeto/detalhe/x/${pid}`),
        api<{ ok: boolean; tarefas: Tarefa[] }>(`/ApiTarefa/lista/projeto/${pid}`),
        api<{ ok: boolean; marcos: Marco[] }>(`/ApiMarco/lista/projeto/${pid}`),
        api<{ ok: boolean; entregaveis: Entregavel[] }>(`/ApiEntregavel/lista/projeto/${pid}`),
      ])
      setProjeto(p.projeto)
      setTarefas(t.tarefas)
      setMarcos(m.marcos)
      setEntregaveis(e.entregaveis)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro')
    }
  }, [pid])

  useEffect(() => {
    void load()
  }, [load])

  async function addTarefa(e: React.FormEvent) {
    e.preventDefault()
    if (!novaTarefa.trim()) return
    await api('/ApiTarefa/criar', {
      method: 'POST',
      body: JSON.stringify({ projeto_id: pid, titulo: novaTarefa.trim(), status: 'todo' }),
    })
    setNovaTarefa('')
    await load()
  }

  async function saveTarefa(e: React.FormEvent) {
    e.preventDefault()
    if (!edit) return
    await api('/ApiTarefa/atualizar', {
      method: 'POST',
      body: JSON.stringify({
        id: edit.id,
        versao: edit.versao,
        titulo: edit.titulo,
        descricao: edit.descricao,
        status: edit.status,
        prioridade: edit.prioridade,
        data_prevista: edit.data_prevista || null,
      }),
    })
    setEdit(null)
    await load()
  }

  async function delTarefa(t: Tarefa) {
    if (!confirm('Excluir tarefa?')) return
    await api('/ApiTarefa/excluir', { method: 'POST', body: JSON.stringify({ id: t.id }) })
    await load()
  }

  async function addMarco(e: React.FormEvent) {
    e.preventDefault()
    if (!marcoTitulo.trim() || !marcoData) return
    await api('/ApiMarco/criar', {
      method: 'POST',
      body: JSON.stringify({
        projeto_id: pid,
        titulo: marcoTitulo.trim(),
        data_marco: marcoData,
        concluido: 0,
      }),
    })
    setMarcoTitulo('')
    setMarcoData('')
    await load()
  }

  async function addEnt(e: React.FormEvent) {
    e.preventDefault()
    if (!entTitulo.trim()) return
    await api('/ApiEntregavel/criar', {
      method: 'POST',
      body: JSON.stringify({
        projeto_id: pid,
        titulo: entTitulo.trim(),
        url_arquivo: entUrl.trim() || null,
        visivel_cliente: entVisivel ? 1 : 0,
      }),
    })
    setEntTitulo('')
    setEntUrl('')
    setEntVisivel(true)
    await load()
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteMsg('')
    const res = await api<{ ok: boolean; modo: string; token?: string; detail?: string }>('/ApiConvite/criar', {
      method: 'POST',
      body: JSON.stringify({ projeto_id: pid, email: inviteEmail.trim() }),
    })
    if (res.modo === 'vinculado') {
      setInviteMsg(res.detail || 'Cliente vinculado.')
    } else {
      setInviteMsg(`Token (guarde e envie ao cliente): ${res.token}`)
    }
    setInviteEmail('')
  }

  if (!pid) return <p>ID inválido</p>

  return (
    <div className="layout-admin">
      <aside className="sidebar">
        <div className="brand" style={{ marginBottom: '1.25rem' }}>
          ProjetoHub
        </div>
        <nav>
          <Link to="/admin">Projetos</Link>
        </nav>
        <button type="button" className="btn btn-ghost" style={{ marginTop: '2rem' }} onClick={() => void logout()}>
          Sair
        </button>
      </aside>
      <div className="layout-main">
        <p>
          <Link to="/admin">← Voltar</Link>
        </p>
        {err ? <p className="err">{err}</p> : null}
        {projeto ? (
          <header style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ margin: '0 0 0.25rem' }}>{String(projeto.nome)}</h1>
            <span className="badge">{String(projeto.status)}</span>
          </header>
        ) : (
          <p style={{ color: 'var(--muted)' }}>Carregando…</p>
        )}

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Convidar cliente</h2>
          <form onSubmit={sendInvite} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              placeholder="e-mail do cliente"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{
                flex: 1,
                minWidth: 200,
                padding: '0.55rem',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
              }}
            />
            <button type="submit" className="btn btn-primary">
              Enviar convite
            </button>
          </form>
          {inviteMsg ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.75rem' }}>{inviteMsg}</p>
          ) : null}
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Tarefas</h2>
          <form onSubmit={addTarefa} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              placeholder="Nova tarefa"
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              style={{
                flex: 1,
                padding: '0.55rem',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
              }}
            />
            <button type="submit" className="btn btn-primary">
              Adicionar
            </button>
          </form>
          <table className="data">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Versão</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tarefas.map((t) => (
                <tr key={t.id}>
                  <td>{t.titulo}</td>
                  <td>{t.status}</td>
                  <td>{t.versao}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setEdit(t)}>
                      Editar
                    </button>{' '}
                    <button type="button" className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => void delTarefa(t)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Marcos</h2>
            <form onSubmit={addMarco} className="grid" style={{ marginBottom: '1rem' }}>
              <input placeholder="Título" value={marcoTitulo} onChange={(e) => setMarcoTitulo(e.target.value)} />
              <input type="date" value={marcoData} onChange={(e) => setMarcoData(e.target.value)} />
              <button type="submit" className="btn btn-primary">
                Adicionar marco
              </button>
            </form>
            <ul style={{ paddingLeft: '1.1rem', color: 'var(--muted)' }}>
              {marcos.map((m) => (
                <li key={m.id}>
                  {m.titulo} — {m.data_marco} {m.concluido ? '✓' : ''}
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Entregáveis</h2>
            <form onSubmit={addEnt} className="grid" style={{ marginBottom: '1rem' }}>
              <input placeholder="Título" value={entTitulo} onChange={(e) => setEntTitulo(e.target.value)} />
              <input placeholder="URL (opcional)" value={entUrl} onChange={(e) => setEntUrl(e.target.value)} />
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                <input type="checkbox" checked={entVisivel} onChange={(e) => setEntVisivel(e.target.checked)} /> Visível
                ao cliente
              </label>
              <button type="submit" className="btn btn-primary">
                Adicionar
              </button>
            </form>
            <ul style={{ paddingLeft: '1.1rem', color: 'var(--muted)' }}>
              {entregaveis.map((x) => (
                <li key={x.id}>
                  {x.titulo} {x.visivel_cliente ? '' : '(interno)'}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button style={{ marginTop: '1.1rem'}}type="button" className="btn btn-danger" onClick={() => nav('/admin')}>
          Voltar
        </button>
      </div>

      {edit ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 20,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 420 }}>
            <h3 style={{ marginTop: 0 }}>Editar tarefa</h3>
            <form onSubmit={saveTarefa}>
              <div className="field">
                <label>Título</label>
                <input value={edit.titulo} onChange={(e) => setEdit({ ...edit, titulo: e.target.value })} />
              </div>
              <div className="field">
                <label>Descrição</label>
                <textarea value={edit.descricao} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
              </div>
              <div className="field">
                <label>Status</label>
                <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                  {['backlog', 'todo', 'doing', 'review', 'done'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Prioridade</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={edit.prioridade}
                  onChange={(e) => setEdit({ ...edit, prioridade: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <label>Data prevista</label>
                <input
                  type="date"
                  value={edit.data_prevista || ''}
                  onChange={(e) => setEdit({ ...edit, data_prevista: e.target.value || null })}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Versão otimista: {edit.versao}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

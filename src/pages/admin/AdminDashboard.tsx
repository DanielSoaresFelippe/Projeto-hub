import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../auth'

type Projeto = {
  id: number
  nome: string
  status: string
  descricao?: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [err, setErr] = useState('')
  const [nome, setNome] = useState('')
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      const res = await api<{ ok: boolean; projetos: Projeto[] }>('/ApiProjeto/index')
      setProjetos(res.projetos)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao carregar')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setCreating(true)
    setErr('')
    try {
      await api('/ApiProjeto/criar', {
        method: 'POST',
        body: JSON.stringify({ nome: nome.trim(), status: 'planejamento' }),
      })
      setNome('')
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="layout-admin">
      <aside className="sidebar">
        <div className="brand" style={{ marginBottom: '1.25rem' }}>
          ProjetoHub
        </div>
        <nav>
          <Link className="active" to="/admin">
            Projetos
          </Link>
        </nav>
        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
          {user?.nome}
          <br />
          <button type="button" className="btn btn-ghost" style={{ marginTop: '1.75rem' }} onClick={() => void logout()}>
            Sair
          </button>
        </div>
      </aside>
      <div className="layout-main" style = {{padding:'1em'}}>
        <h1 style={{ marginTop: 0 }}>Projetos</h1>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Novo projeto</h2>
          <form onSubmit={criar} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              placeholder="Nome do projeto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{
                flex: 1,
                minWidth: 200,
                padding: '0.55rem 0.65rem',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
              }}
            />
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Salvando…' : 'Criar'}
            </button>
          </form>
        </div>
        {err ? <p className="err">{err}</p> : null}
        <div className="project-grid">
          {projetos.map((p) => (
            <Link
              key={p.id}
              to={`/admin/projeto/${p.id}`}
              className="project-card-square project-card-square--link"
            >
              <span className="project-card-square__badge">{p.status}</span>
              <span className="project-card-square__title">{p.nome}</span>
              {p.descricao ? <span className="project-card-square__desc">{p.descricao}</span> : null}
            </Link>
          ))}
        </div>
        {projetos.length === 0 && !err ? (
          <p style={{ color: 'var(--muted)' }}>Nenhum projeto ainda. Crie o primeiro acima.</p>
        ) : null}
      </div>
    </div>
  )
}

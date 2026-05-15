import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../auth'
import ClientKanban, { type TarefaKanban } from '../../components/ClientKanban'

type Projeto = { id: number; nome: string; status: string; descricao?: string }
type Marco = { titulo: string; data_marco: string; concluido: number }
type Entregavel = { titulo: string; url_arquivo: string | null }

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [sel, setSel] = useState<number | null>(null)
  const [det, setDet] = useState<{
    projeto: Projeto | null
    tarefas: TarefaKanban[]
    marcos: Marco[]
    entregaveis: Entregavel[]
  } | null>(null)
  const [err, setErr] = useState('')

  const loadProjetos = useCallback(async () => {
    try {
      const res = await api<{ ok: boolean; projetos: Projeto[] }>('/ApiProjeto/index')
      setProjetos(res.projetos)
      if (res.projetos.length) setSel((s) => s ?? res.projetos[0].id)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro')
    }
  }, [])

  useEffect(() => {
    void loadProjetos()
  }, [loadProjetos])

  const loadDetalhe = useCallback(async (projetoId: number) => {
    try {
      const [p, t, m, e] = await Promise.all([
        api<{ ok: boolean; projeto: Projeto }>(`/ApiProjeto/detalhe/x/${projetoId}`),
        api<{ ok: boolean; tarefas: TarefaKanban[] }>(`/ApiTarefa/lista/projeto/${projetoId}`),
        api<{ ok: boolean; marcos: Marco[] }>(`/ApiMarco/lista/projeto/${projetoId}`),
        api<{ ok: boolean; entregaveis: Entregavel[] }>(`/ApiEntregavel/lista/projeto/${projetoId}`),
      ])
      setDet({ projeto: p.projeto, tarefas: t.tarefas, marcos: m.marcos, entregaveis: e.entregaveis })
      setErr('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro')
    }
  }, [])

  useEffect(() => {
    if (!sel) return
    void loadDetalhe(sel)
  }, [sel, loadDetalhe])

  return (
    <div>
      <header className="topbar">
        <span className="brand">ProjetoHub — Cliente</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{user?.nome}</span>
          <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
            Sair
          </button>
        </div>
      </header>
      <main className="shell">
        <h1 style={{ marginTop: '1rem' }}>Meus projetos</h1>
        {err ? <p className="err">{err}</p> : null}

        <div className="project-grid" role="list">
          {projetos.map((p) => (
            <button
              key={p.id}
              type="button"
              role="listitem"
              className={`project-card-square ${sel === p.id ? 'project-card-square--active' : ''}`}
              onClick={() => setSel(p.id)}
            >
              <span className="project-card-square__badge">{p.status}</span>
              <span className="project-card-square__title">{p.nome}</span>
              {p.descricao ? <span className="project-card-square__desc">{p.descricao}</span> : null}
            </button>
          ))}
        </div>

        {det?.projeto ? (
          <>
            <section className="client-detail-head card">
              <h2 style={{ marginTop: 0 }}>{det.projeto.nome}</h2>
              <p className="badge">{det.projeto.status}</p>
              {det.projeto.descricao ? <p style={{ color: 'var(--muted)' }}>{det.projeto.descricao}</p> : null}
            </section>

            <section className="client-kanban-section">
              <h2 className="section-title">Tarefas — quadro Kanban</h2>
              <p className="section-sub">Arraste os cartões entre as colunas. O status é salvo no servidor (controle de versão).</p>
              <ClientKanban
                tarefas={det.tarefas}
                onTarefasUpdated={(list) => setDet((d) => (d ? { ...d, tarefas: list } : d))}
              />
            </section>

            <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Cronograma</h3>
                <ul className="muted-list">
                  {det.marcos.map((m) => (
                    <li key={m.titulo + m.data_marco}>
                      {m.titulo} — {m.data_marco} {m.concluido ? '✓' : ''}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Entregáveis</h3>
                <ul className="muted-list">
                  {det.entregaveis.map((x) => (
                    <li key={x.titulo}>
                      {x.titulo}
                      {x.url_arquivo ? (
                        <>
                          {' '}
                          —{' '}
                          <a href={x.url_arquivo} target="_blank" rel="noreferrer">
                            link
                          </a>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--muted)' }}>Selecione um projeto acima ou aguarde o convite do gestor.</p>
        )}
        <p style={{ marginTop: '2rem' }}>
          <Link to="/">Início</Link>
        </p>
      </main>
    </div>
  )
}

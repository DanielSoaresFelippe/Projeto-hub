import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'

export default function AcceptInvite() {
  const [params] = useSearchParams()
  const tokenFromUrl = params.get('token') || ''
  const { refresh } = useAuth()
  const nav = useNavigate()

  const [token, setToken] = useState(tokenFromUrl)
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setOk('')
    try {
      await api('/ApiAuth/registrarConvite', {
        method: 'POST',
        body: JSON.stringify({ token, nome, senha }),
      })
      setOk('Conta criada. Redirecionando…')
      await refresh()
      nav('/client', { replace: true })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro')
    }
  }

  return (
    <div>
      <header className="topbar">
        <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'var(--text)' }}>
          ProjetoHub
        </Link>
      </header>
      <main className="shell" style={{ maxWidth: 420, paddingTop: '2rem' }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Aceitar convite</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Cole o token enviado pelo gestor e defina nome e senha para sua conta de cliente.
          </p>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="token">Token</label>
              <input id="token" value={token} onChange={(e) => setToken(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="nome">Nome completo</label>
              <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="senha">Senha (mín. 6)</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                required
              />
            </div>
            {err ? <p className="err">{err}</p> : null}
            {ok ? <p className="ok">{ok}</p> : null}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Criar conta e entrar
            </button>
          </form>
          <p style={{ marginTop: '1rem' }}>
            <Link to="/login">Já tenho conta</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

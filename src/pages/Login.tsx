import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isGestor, isPainelCliente } from '../api'
import { useAuth } from '../auth'

export default function Login() {
  const { login, user, loading } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (loading || !user) return
    if (isGestor(user.nivel)) nav('/admin', { replace: true })
    else if (isPainelCliente(user.nivel)) nav('/client', { replace: true })
  }, [loading, user, nav])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      const u = await login(email, senha)
      if (isGestor(u.nivel)) nav('/admin')
      else if (isPainelCliente(u.nivel)) nav('/client')
      else nav('/')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha no login')
    }
  }

  return (
    <div>
      <header className="topbar">
        <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'var(--text)' }}>
          ProjetoHub
        </Link>
      </header>
      <main className="shell" style={{ maxWidth: 420, paddingTop: '3rem' }}>
        <div className="card">
          <h1 style={{ marginTop: 0, fontSize: '1.35rem' }}>Entrar</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '-0.25rem' }}>
            Demo: <code>gestor@demo.local</code> / <code>admin123</code> ou <code>cliente@demo.local</code> /{' '}
            <code>cliente123</code>
          </p>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            {err ? <p className="err">{err}</p> : null}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Continuar
            </button>
          </form>
          <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            Convite novo? <Link to="/aceitar-convite">Aceitar convite</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

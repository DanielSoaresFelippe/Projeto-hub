import { Navigate, Route, Routes } from 'react-router-dom'
import { isGestor, isPainelCliente } from './api'
import { useAuth } from './auth'
import AcceptInvite from './pages/AcceptInvite'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProjectDetail from './pages/admin/AdminProjectDetail'
import ClientDashboard from './pages/client/ClientDashboard'
import Landing from './pages/Landing'
import Login from './pages/Login'

function RequireGestor({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="shell">Carregando…</p>
  if (!user) return <Navigate to="/login" replace />
  if (!isGestor(user.nivel)) return <Navigate to="/client" replace />
  return <>{children}</>
}

function RequirePainelCliente({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <p className="shell">Carregando…</p>
  if (!user) return <Navigate to="/login" replace />
  if (!isPainelCliente(user.nivel)) return <Navigate to="/admin" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/aceitar-convite" element={<AcceptInvite />} />
      <Route
        path="/admin"
        element={
          <RequireGestor>
            <AdminDashboard />
          </RequireGestor>
        }
      />
      <Route
        path="/admin/projeto/:id"
        element={
          <RequireGestor>
            <AdminProjectDetail />
          </RequireGestor>
        }
      />
      <Route
        path="/client"
        element={
          <RequirePainelCliente>
            <ClientDashboard />
          </RequirePainelCliente>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, type User } from './api'

type AuthState = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  login: (email: string, senha: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await api<{ ok: boolean; user: User | null }>('/ApiAuth/me')
      setUser(res.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, senha: string) => {
    const res = await api<{ ok: boolean; user: User }>('/ApiAuth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    })
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    await api<{ ok: boolean }>('/ApiAuth/logout', { method: 'POST', body: '{}' })
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, refresh, login, logout }),
    [user, loading, refresh, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora de AuthProvider')
  return ctx
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { apiClient } from '@/lib/apiClient'
import type { UserRole } from '@/types'

interface AuthContextValue {
  session: Session | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // El rol real (admin/driver) vive en public.users, no en el JWT de
    // Supabase, asi que se resuelve pidiendoselo al backend (que ya sabe
    // leer el TenantId/Role via el middleware JWT).
    const loadRole = async (hasSession: boolean) => {
      if (!hasSession) {
        if (mounted) setRole(null)
        return
      }
      try {
        const { data } = await apiClient.get<{ role: UserRole }>('/api/users/me')
        if (mounted) setRole(data.role)
      } catch {
        if (mounted) setRole(null)
      }
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadRole(!!data.session)
      if (mounted) setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      void loadRole(!!newSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

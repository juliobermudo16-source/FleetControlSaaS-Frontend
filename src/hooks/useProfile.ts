import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { AppUser } from '@/types'

export function useProfile() {
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    apiClient
      .get<AppUser>('/api/users/me')
      .then((res) => {
        if (mounted) setProfile(res.data)
      })
      .catch(() => {
        if (mounted) setError('No se pudo cargar tu perfil.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return { profile, loading, error }
}

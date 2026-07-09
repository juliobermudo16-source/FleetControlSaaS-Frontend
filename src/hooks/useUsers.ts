import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { AppUser, InviteUserRequest } from '@/types'

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    setError(null)
    apiClient
      .get<AppUser[]>('/api/users')
      .then((res) => setUsers(res.data))
      .catch(() => setError('No se pudo cargar la lista de usuarios.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const inviteUser = useCallback(
    async (dto: InviteUserRequest) => {
      await apiClient.post<AppUser>('/api/users/invite', dto)
      fetchUsers()
    },
    [fetchUsers]
  )

  return { users, loading, error, refetch: fetchUsers, inviteUser }
}

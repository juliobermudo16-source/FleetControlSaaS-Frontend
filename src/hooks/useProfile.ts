import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { AppUser, UpdateProfileRequest } from '@/types'

export function useProfile() {
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(() => {
    setLoading(true)
    apiClient
      .get<AppUser>('/api/users/me')
      .then((res) => setProfile(res.data))
      .catch(() => setError('No se pudo cargar tu perfil.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(async (dto: UpdateProfileRequest) => {
    const res = await apiClient.put<AppUser>('/api/users/me', dto)
    setProfile(res.data)
  }, [])

  const uploadAvatar = useCallback(async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const res = await apiClient.post<AppUser>('/api/users/me/avatar', form)
    setProfile(res.data)
  }, [])

  return { profile, loading, error, updateProfile, uploadAvatar }
}

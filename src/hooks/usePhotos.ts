import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { VehiclePhoto } from '@/types'

export function usePhotos(vehicleId: string) {
  const [photos, setPhotos] = useState<VehiclePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = useCallback(() => {
    setLoading(true)
    apiClient
      .get<VehiclePhoto[]>(`/api/photos/vehicle/${vehicleId}`)
      .then((res) => setPhotos(res.data))
      .catch(() => setError('No se pudieron cargar las fotos.'))
      .finally(() => setLoading(false))
  }, [vehicleId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const uploadPhoto = useCallback(
    async (file: File, isPrimary: boolean) => {
      const form = new FormData()
      form.append('file', file)
      form.append('vehicleId', vehicleId)
      form.append('isPrimary', String(isPrimary))
      await apiClient.post('/api/photos/upload', form)
      fetchPhotos()
    },
    [vehicleId, fetchPhotos]
  )

  const deletePhoto = useCallback(
    async (photoId: string) => {
      await apiClient.delete(`/api/photos/${photoId}`)
      fetchPhotos()
    },
    [fetchPhotos]
  )

  return { photos, loading, error, uploadPhoto, deletePhoto }
}

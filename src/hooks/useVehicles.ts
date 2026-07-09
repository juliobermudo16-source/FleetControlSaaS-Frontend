import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { CreateVehicleRequest, UpdateVehicleRequest, Vehicle } from '@/types'

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = useCallback(() => {
    setLoading(true)
    apiClient
      .get<Vehicle[]>('/api/vehicles')
      .then((res) => setVehicles(res.data))
      .catch(() => setError('No se pudo cargar la lista de vehiculos.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const createVehicle = useCallback(
    async (dto: CreateVehicleRequest) => {
      await apiClient.post<Vehicle>('/api/vehicles', dto)
      fetchVehicles()
    },
    [fetchVehicles]
  )

  const updateVehicle = useCallback(
    async (id: string, dto: UpdateVehicleRequest) => {
      await apiClient.put<Vehicle>(`/api/vehicles/${id}`, dto)
      fetchVehicles()
    },
    [fetchVehicles]
  )

  const deleteVehicle = useCallback(
    async (id: string) => {
      await apiClient.delete(`/api/vehicles/${id}`)
      fetchVehicles()
    },
    [fetchVehicles]
  )

  const reportMileage = useCallback(
    async (id: string, newMileage: number) => {
      await apiClient.post<Vehicle>(`/api/vehicles/${id}/report-mileage`, { newMileage })
      fetchVehicles()
    },
    [fetchVehicles]
  )

  return { vehicles, loading, error, refetch: fetchVehicles, createVehicle, updateVehicle, deleteVehicle, reportMileage }
}

import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { Vehicle } from '@/types'

export function useVehicle(id: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicle = useCallback(() => {
    setLoading(true)
    apiClient
      .get<Vehicle>(`/api/vehicles/${id}`)
      .then((res) => setVehicle(res.data))
      .catch(() => setError('No se pudo cargar el vehiculo.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchVehicle()
  }, [fetchVehicle])

  return { vehicle, loading, error, refetch: fetchVehicle }
}

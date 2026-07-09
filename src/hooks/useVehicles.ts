import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { Vehicle } from '@/types'

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

  return { vehicles, loading, error, refetch: fetchVehicles }
}

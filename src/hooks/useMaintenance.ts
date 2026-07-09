import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { CreateMaintenanceLogRequest, MaintenanceLog, MaintenanceStatus } from '@/types'

export function useMaintenance(vehicleId: string) {
  const [statuses, setStatuses] = useState<MaintenanceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatuses = useCallback(() => {
    setLoading(true)
    apiClient
      .get<MaintenanceStatus[]>(`/api/maintenance/vehicle/${vehicleId}/status`)
      .then((res) => setStatuses(res.data))
      .catch(() => setError('No se pudo cargar el historial de mantenimiento.'))
      .finally(() => setLoading(false))
  }, [vehicleId])

  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  const registerMaintenance = useCallback(
    async (dto: CreateMaintenanceLogRequest) => {
      await apiClient.post('/api/maintenance', dto)
      fetchStatuses()
    },
    [fetchStatuses]
  )

  const getHistory = useCallback(async () => {
    const res = await apiClient.get<MaintenanceLog[]>(`/api/maintenance/vehicle/${vehicleId}/history`)
    return res.data
  }, [vehicleId])

  return { statuses, loading, error, registerMaintenance, getHistory }
}

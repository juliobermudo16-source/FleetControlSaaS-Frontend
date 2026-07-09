import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { DashboardSummary } from '@/types'

export function useDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    apiClient
      .get<DashboardSummary>('/api/dashboard/summary')
      .then((res) => {
        if (mounted) setData(res.data)
      })
      .catch(() => {
        if (mounted) setError('No se pudo cargar el resumen del dashboard.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return { data, loading, error }
}

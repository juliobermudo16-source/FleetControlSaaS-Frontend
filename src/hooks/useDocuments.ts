import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/apiClient'
import type { DocumentType, VehicleDocument } from '@/types'

export function useDocuments(vehicleId: string) {
  const [documents, setDocuments] = useState<VehicleDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(() => {
    setLoading(true)
    apiClient
      .get<VehicleDocument[]>(`/api/documents/vehicle/${vehicleId}`)
      .then((res) => setDocuments(res.data))
      .catch(() => setError('No se pudieron cargar los documentos.'))
      .finally(() => setLoading(false))
  }, [vehicleId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const uploadDocument = useCallback(
    async (file: File, documentType: DocumentType, issueDate: string, expirationDate: string) => {
      const form = new FormData()
      form.append('file', file)
      form.append('vehicleId', vehicleId)
      form.append('documentType', documentType)
      form.append('issueDate', issueDate)
      form.append('expirationDate', expirationDate)
      await apiClient.post('/api/documents/upload', form)
      fetchDocuments()
    },
    [vehicleId, fetchDocuments]
  )

  const getDownloadUrl = useCallback(async (documentId: string) => {
    const res = await apiClient.get<{ url: string }>(`/api/documents/${documentId}/download-url`)
    return res.data.url
  }, [])

  const updateDocumentDates = useCallback(
    async (documentId: string, issueDate: string, expirationDate: string) => {
      await apiClient.put(`/api/documents/${documentId}`, { issueDate, expirationDate })
      fetchDocuments()
    },
    [fetchDocuments]
  )

  const deleteDocument = useCallback(
    async (documentId: string) => {
      await apiClient.delete(`/api/documents/${documentId}`)
      fetchDocuments()
    },
    [fetchDocuments]
  )

  return { documents, loading, error, uploadDocument, getDownloadUrl, updateDocumentDates, deleteDocument }
}

import { useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'
import { AlertTriangle, ArrowLeft, Camera, FileDown, FileText, Pencil, Plus, Star, Trash2, Wrench, Download, X, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useVehicle } from '@/hooks/useVehicle'
import { usePhotos } from '@/hooks/usePhotos'
import { useDocuments } from '@/hooks/useDocuments'
import { useMaintenance } from '@/hooks/useMaintenance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'
import type { DocumentType, MaintenanceStatus, Vehicle, VehicleDocument } from '@/types'

function apiErrorMessage(err: unknown, fallback: string) {
  return (isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined) ?? fallback
}

function formatDate(iso: string | null) {
  if (!iso) return 'Nunca'
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  Soat: 'SOAT',
  RevisionTecnica: 'Revision Tecnica',
  TarjetaPropiedad: 'Tarjeta de Propiedad',
}

export function VehicleDetail() {
  const { id } = useParams<{ id: string }>()
  const { role } = useAuth()
  const isAdmin = role === 'admin'
  const { vehicle, loading, error } = useVehicle(id!)

  if (loading) return <p className="text-text-muted">Cargando vehiculo...</p>
  if (error) return <p className="text-red">{error}</p>
  if (!vehicle) return null

  return (
    <div className="space-y-6">
      <Link to="/vehicles" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} /> Volver a vehiculos
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{vehicle.licensePlate}</h1>
          <p className="text-sm text-text-muted">
            {vehicle.brand} {vehicle.model} · {vehicle.manufactureYear} · {vehicle.color ?? 'Sin color'} ·{' '}
            {vehicle.currentMileage.toLocaleString()} km
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={vehicle.overallAlertStatus}>{vehicle.overallAlertStatus}</Badge>
          <ReportButton vehicle={vehicle} />
        </div>
      </div>

      <PhotosSection vehicleId={vehicle.id} isAdmin={isAdmin} />
      <DocumentsSection vehicleId={vehicle.id} isAdmin={isAdmin} />
      <MaintenanceSection vehicleId={vehicle.id} isAdmin={isAdmin} />
    </div>
  )
}

// ─── Reporte ────────────────────────────────────────────────────────────

function ReportButton({ vehicle }: { vehicle: Vehicle }) {
  const { statuses } = useMaintenance(vehicle.id)
  const { documents } = useDocuments(vehicle.id)

  const handleDownload = () => {
    const html = buildReportHtml(vehicle, statuses, documents)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-${vehicle.licensePlate}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" className="gap-1.5" onClick={handleDownload}>
      <FileDown size={14} /> Descargar reporte
    </Button>
  )
}

function buildReportHtml(vehicle: Vehicle, statuses: MaintenanceStatus[], documents: VehicleDocument[]) {
  const generatedAt = new Date().toLocaleString('es-PE')

  const maintenanceRows = statuses
    .map(
      (m) => `
        <tr>
          <td>${m.maintenanceTypeName}</td>
          <td>${formatDate(m.lastServiceDate)}</td>
          <td>${m.lastServiceMileage.toLocaleString('es-PE')} km</td>
          <td>${m.intervalKm.toLocaleString('es-PE')} km</td>
          <td>${m.wearPercentage.toFixed(0)}%</td>
          <td>${m.status}</td>
        </tr>`
    )
    .join('')

  const documentRows = documents
    .map(
      (d) => `
        <tr>
          <td>${DOCUMENT_TYPE_LABELS[d.documentType]}</td>
          <td>${formatDate(d.issueDate)}</td>
          <td>${formatDate(d.expirationDate)}</td>
          <td>${d.daysUntilExpiration <= 0 ? 'Vencido' : `${d.daysUntilExpiration} dias`}</td>
          <td>${d.status}</td>
        </tr>`
    )
    .join('')

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Reporte ${vehicle.licensePlate}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #0f172a; padding: 32px; max-width: 800px; margin: 0 auto; }
  h1 { margin-bottom: 4px; }
  .subtitle { color: #64748b; margin-top: 0; }
  h2 { margin-top: 32px; border-bottom: 2px solid #f97316; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  th { color: #64748b; text-transform: uppercase; font-size: 11px; }
  .empty { color: #64748b; font-size: 14px; margin-top: 12px; }
  .meta { color: #94a3b8; font-size: 12px; margin-top: 40px; }
  .print-btn { margin-top: 24px; padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
  <h1>Reporte de vehiculo — ${vehicle.licensePlate}</h1>
  <p class="subtitle">${vehicle.brand} ${vehicle.model} · ${vehicle.manufactureYear} · ${vehicle.color ?? 'Sin color'} · ${vehicle.currentMileage.toLocaleString('es-PE')} km</p>

  <h2>Mantenimiento</h2>
  ${
    statuses.length === 0
      ? '<p class="empty">No hay tipos de mantenimiento configurados.</p>'
      : `<table>
    <thead><tr><th>Tipo</th><th>Ultimo servicio</th><th>Km del servicio</th><th>Intervalo</th><th>Desgaste</th><th>Estado</th></tr></thead>
    <tbody>${maintenanceRows}</tbody>
  </table>`
  }

  <h2>Documentos</h2>
  ${
    documents.length === 0
      ? '<p class="empty">No hay documentos cargados.</p>'
      : `<table>
    <thead><tr><th>Tipo</th><th>Emision</th><th>Vencimiento</th><th>Dias restantes</th><th>Estado</th></tr></thead>
    <tbody>${documentRows}</tbody>
  </table>`
  }

  <button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
  <p class="meta">Generado el ${generatedAt}</p>
</body>
</html>`
}

// ─── Fotos ──────────────────────────────────────────────────────────────

function PhotosSection({ vehicleId, isAdmin }: { vehicleId: string; isAdmin: boolean }) {
  const { photos, loading, uploadPhoto, deletePhoto } = usePhotos(vehicleId)
  const [uploading, setUploading] = useState(false)
  const [isPrimary, setIsPrimary] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadPhoto(file, isPrimary)
      toast.success('Foto subida')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo subir la foto.'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!window.confirm('¿Eliminar esta foto?')) return
    try {
      await deletePhoto(photoId)
      toast.success('Foto eliminada')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo eliminar la foto.'))
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Camera size={16} /> Fotos
        </CardTitle>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-text-muted normal-case">
              <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
              Marcar como principal
            </label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Button variant="outline" className="gap-1.5" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <Plus size={14} /> {uploading ? 'Subiendo...' : 'Subir foto'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-text-muted">Cargando fotos...</p>}
        {!loading && photos.length === 0 && <p className="text-sm text-text-muted">Aun no hay fotos de este vehiculo.</p>}
        {!loading && photos.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {photos.map((p) => (
              <div key={p.id} className="relative group">
                <img
                  src={p.url}
                  alt="Foto del vehiculo"
                  className={cn('h-32 w-40 rounded-lg object-cover border', p.isPrimary ? 'border-primary' : 'border-border')}
                />
                {p.isPrimary && (
                  <span className="absolute top-1 left-1 rounded-full bg-primary p-1 text-white">
                    <Star size={12} />
                  </span>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="absolute top-1 right-1 rounded-full bg-red p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Eliminar foto"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Documentos ─────────────────────────────────────────────────────────

function DocumentsSection({ vehicleId, isAdmin }: { vehicleId: string; isAdmin: boolean }) {
  const { documents, loading, uploadDocument, getDownloadUrl, updateDocumentDates, deleteDocument } = useDocuments(vehicleId)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editIssueDate, setEditIssueDate] = useState('')
  const [editExpirationDate, setEditExpirationDate] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const handleDownload = async (documentId: string) => {
    try {
      const url = await getDownloadUrl(documentId)
      window.open(url, '_blank')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo generar el enlace de descarga.'))
    }
  }

  const startEdit = (d: { id: string; issueDate: string; expirationDate: string }) => {
    setEditingId(d.id)
    setEditIssueDate(d.issueDate)
    setEditExpirationDate(d.expirationDate)
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (documentId: string) => {
    setSavingEdit(true)
    try {
      await updateDocumentDates(documentId, editIssueDate, editExpirationDate)
      toast.success('Documento actualizado')
      setEditingId(null)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo actualizar el documento.'))
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('¿Eliminar este documento? Esta accion no se puede deshacer.')) return
    try {
      await deleteDocument(documentId)
      toast.success('Documento eliminado')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo eliminar el documento.'))
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <FileText size={16} /> Documentos (SOAT, Revision Tecnica, Tarjeta de Propiedad)
        </CardTitle>
        {isAdmin && (
          <Button variant="outline" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> Subir documento
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <DocumentUploadForm
            onUpload={uploadDocument}
            onDone={() => setShowForm(false)}
          />
        )}

        {loading && <p className="text-sm text-text-muted">Cargando documentos...</p>}
        {!loading && documents.length === 0 && <p className="text-sm text-text-muted">Aun no hay documentos cargados.</p>}
        {!loading && documents.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted text-xs uppercase">
                <th className="p-2 font-medium">Tipo</th>
                <th className="p-2 font-medium">Emision</th>
                <th className="p-2 font-medium">Vencimiento</th>
                <th className="p-2 font-medium">Estado</th>
                <th className="p-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => {
                const isEditing = editingId === d.id
                return (
                  <tr key={d.id} className="border-b border-border last:border-0">
                    <td className="p-2 font-medium">{DOCUMENT_TYPE_LABELS[d.documentType]}</td>
                    {isEditing ? (
                      <>
                        <td className="p-2">
                          <input
                            type="date"
                            value={editIssueDate}
                            onChange={(e) => setEditIssueDate(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={editExpirationDate}
                            onChange={(e) => setEditExpirationDate(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                          />
                        </td>
                        <td className="p-2 text-text-muted">—</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => saveEdit(d.id)}
                              disabled={savingEdit}
                              className="text-green hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                              aria-label="Guardar cambios"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={savingEdit}
                              className="text-text-muted hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                              aria-label="Cancelar edicion"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2 text-text-muted">{formatDate(d.issueDate)}</td>
                        <td className="p-2 text-text-muted">{formatDate(d.expirationDate)}</td>
                        <td className="p-2">
                          <Badge status={d.status}>
                            {d.daysUntilExpiration <= 0 ? 'Vencido' : `${d.daysUntilExpiration} dias`}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => handleDownload(d.id)} className="text-primary hover:underline inline-flex items-center gap-1">
                              <Download size={13} /> Descargar
                            </button>
                            {isAdmin && (
                              <>
                                <button onClick={() => startEdit(d)} className="text-text-muted hover:text-text" aria-label="Editar fechas">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => handleDelete(d.id)} className="text-red hover:opacity-80" aria-label="Eliminar documento">
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}

interface DocumentUploadFormProps {
  onUpload: (file: File, documentType: DocumentType, issueDate: string, expirationDate: string) => Promise<void>
  onDone: () => void
}

function DocumentUploadForm({ onUpload, onDone }: DocumentUploadFormProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('Soat')
  const [issueDate, setIssueDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Selecciona un archivo PDF.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onUpload(file, documentType, issueDate, expirationDate)
      toast.success('Documento subido')
      onDone()
    } catch (err) {
      const message = apiErrorMessage(err, 'No se pudo subir el documento.')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end rounded-lg border border-border p-3">
      <div>
        <label className="text-sm text-text-muted">Tipo</label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="Soat">SOAT</option>
          <option value="RevisionTecnica">Revision Tecnica</option>
          <option value="TarjetaPropiedad">Tarjeta de Propiedad</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-text-muted">Fecha de emision</label>
        <input
          type="date"
          required
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-sm text-text-muted">Fecha de vencimiento</label>
        <input
          type="date"
          required
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-sm text-text-muted">Archivo (PDF)</label>
        <input
          type="file"
          required
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm"
        />
      </div>
      <div className="md:col-span-5 flex items-start gap-2 rounded-lg bg-yellow/10 border border-yellow/30 p-3 text-sm text-text">
        <AlertTriangle size={16} className="text-yellow mt-0.5 shrink-0" />
        <span>
          Esta accion es irreversible: una vez registrado, solo un administrador podra editar las fechas o eliminarlo.
          Si ya existe un documento de este tipo para el vehiculo, sera reemplazado.
        </span>
      </div>
      <Button type="submit" disabled={loading} className="md:col-span-5 text-base py-3">
        {loading ? 'Guardando...' : 'Guardar documento'}
      </Button>
      {error && <p className="md:col-span-5 text-sm text-red">{error}</p>}
    </form>
  )
}

// ─── Mantenimiento ──────────────────────────────────────────────────────

function MaintenanceSection({ vehicleId, isAdmin }: { vehicleId: string; isAdmin: boolean }) {
  const { statuses, loading, registerMaintenance } = useMaintenance(vehicleId)
  const [showForm, setShowForm] = useState(false)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Wrench size={16} /> Mantenimiento
        </CardTitle>
        {isAdmin && (
          <Button variant="outline" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
            <Plus size={14} /> Registrar mantenimiento
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <MaintenanceForm
            vehicleId={vehicleId}
            types={statuses}
            onRegister={registerMaintenance}
            onDone={() => setShowForm(false)}
          />
        )}

        {loading && <p className="text-sm text-text-muted">Cargando mantenimientos...</p>}
        {!loading && statuses.length === 0 && <p className="text-sm text-text-muted">No hay tipos de mantenimiento configurados.</p>}
        {!loading && statuses.length > 0 && (
          <div className="space-y-3">
            {statuses.map((m) => (
              <div key={m.maintenanceTypeId} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{m.maintenanceTypeName}</span>
                  <Badge status={m.status}>{m.wearPercentage.toFixed(0)}%</Badge>
                </div>
                <ProgressBar percentage={m.wearPercentage} status={m.status} />
                <div className="flex items-center justify-between text-xs text-text-muted mt-1.5">
                  <span>Ultimo servicio: {formatDate(m.lastServiceDate)} ({m.lastServiceMileage.toLocaleString()} km)</span>
                  <span>Cada {m.intervalKm.toLocaleString()} km</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MaintenanceFormProps {
  vehicleId: string
  types: { maintenanceTypeId: string; maintenanceTypeName: string; currentMileage: number }[]
  onRegister: (dto: { vehicleId: string; maintenanceTypeId: string; mileageAtService: number; serviceDate: string; cost: number; notes?: string | null }) => Promise<void>
  onDone: () => void
}

function MaintenanceForm({ vehicleId, types, onRegister, onDone }: MaintenanceFormProps) {
  const [maintenanceTypeId, setMaintenanceTypeId] = useState(types[0]?.maintenanceTypeId ?? '')
  const [mileageAtService, setMileageAtService] = useState(String(types[0]?.currentMileage ?? 0))
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [cost, setCost] = useState('0')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onRegister({
        vehicleId,
        maintenanceTypeId,
        mileageAtService: Number(mileageAtService),
        serviceDate,
        cost: Number(cost),
        notes: notes || null,
      })
      toast.success('Mantenimiento registrado')
      onDone()
    } catch (err) {
      const message = apiErrorMessage(err, 'No se pudo registrar el mantenimiento.')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end rounded-lg border border-border p-3">
      <div>
        <label className="text-sm text-text-muted">Tipo</label>
        <select
          value={maintenanceTypeId}
          onChange={(e) => setMaintenanceTypeId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {types.map((t) => (
            <option key={t.maintenanceTypeId} value={t.maintenanceTypeId}>
              {t.maintenanceTypeName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm text-text-muted">Km al servicio</label>
        <input
          type="number"
          required
          min={0}
          value={mileageAtService}
          onChange={(e) => setMileageAtService(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-sm text-text-muted">Fecha</label>
        <input
          type="date"
          required
          value={serviceDate}
          onChange={(e) => setServiceDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-sm text-text-muted">Costo (S/)</label>
        <input
          type="number"
          required
          min={0}
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Guardando...' : 'Registrar'}
      </Button>
      <div className="md:col-span-5">
        <label className="text-sm text-text-muted">Notas (opcional)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Detalles del servicio..."
        />
      </div>
      {error && <p className="md:col-span-5 text-sm text-red">{error}</p>}
    </form>
  )
}

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'
import { Eye, Pencil, Plus, Trash2, Gauge } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useVehicles } from '@/hooks/useVehicles'
import { useUsers } from '@/hooks/useUsers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { CreateVehicleRequest, UpdateVehicleRequest, Vehicle, VehicleStatus } from '@/types'

function apiErrorMessage(err: unknown, fallback: string) {
  return (isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined) ?? fallback
}

export function Vehicles() {
  const { role, session } = useAuth()
  const isAdmin = role === 'admin'
  const { vehicles, loading, error, createVehicle, updateVehicle, deleteVehicle, reportMileage } = useVehicles()

  const [formVehicle, setFormVehicle] = useState<Vehicle | 'new' | null>(null)
  const [mileageVehicle, setMileageVehicle] = useState<Vehicle | null>(null)

  if (loading) return <p className="text-text-muted">Cargando vehiculos...</p>
  if (error) return <p className="text-red">{error}</p>

  const handleDelete = async (v: Vehicle) => {
    if (!window.confirm(`¿Eliminar el vehiculo ${v.licensePlate}? Esta accion no se puede deshacer.`)) return
    try {
      await deleteVehicle(v.id)
      toast.success(`Vehiculo ${v.licensePlate} eliminado`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo eliminar el vehiculo.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{isAdmin ? 'Flota de vehiculos' : 'Mi vehiculo asignado'}</h1>
        {isAdmin && (
          <Button onClick={() => setFormVehicle('new')} className="gap-2">
            <Plus size={16} /> Agregar vehiculo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <Card key={v.id}>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{v.licensePlate}</h3>
                <Badge status={v.overallAlertStatus}>{v.overallAlertStatus}</Badge>
              </div>
              <p className="text-sm text-text-muted">
                {v.brand} {v.model} · {v.manufactureYear} · {v.color ?? 'Sin color'}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Kilometraje actual</span>
                <span className="font-medium">{v.currentMileage.toLocaleString()} km</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Conductor</span>
                <span className="font-medium">{v.assignedDriverName ?? 'Sin asignar'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Estado</span>
                <span className="font-medium">{v.status === 'Active' ? 'Activo' : v.status === 'Maintenance' ? 'En mantenimiento' : 'Inactivo'}</span>
              </div>

              <Link to={`/vehicles/${v.id}`}>
                <Button variant="outline" className="w-full gap-1.5">
                  <Eye size={14} /> Ver detalle (fotos, documentos, mantenimiento)
                </Button>
              </Link>

              <div className="flex gap-2 pt-1">
                {isAdmin && (
                  <>
                    <Button variant="outline" className="flex-1 gap-1.5" onClick={() => setFormVehicle(v)}>
                      <Pencil size={14} /> Editar
                    </Button>
                    <Button variant="destructive" className="gap-1.5 px-3" onClick={() => handleDelete(v)}>
                      <Trash2 size={14} />
                    </Button>
                  </>
                )}
                {!isAdmin && v.assignedDriverId === session?.user.id && (
                  <Button variant="outline" className="flex-1 gap-1.5" onClick={() => setMileageVehicle(v)}>
                    <Gauge size={14} /> Reportar kilometraje
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {vehicles.length === 0 && (
          <p className="text-text-muted col-span-full">
            {isAdmin ? 'Aun no hay vehiculos registrados.' : 'No tienes un vehiculo asignado.'}
          </p>
        )}
      </div>

      {formVehicle && (
        <VehicleFormModal
          vehicle={formVehicle === 'new' ? null : formVehicle}
          onClose={() => setFormVehicle(null)}
          onCreate={createVehicle}
          onUpdate={updateVehicle}
        />
      )}

      {mileageVehicle && (
        <ReportMileageModal
          vehicle={mileageVehicle}
          onClose={() => setMileageVehicle(null)}
          onReport={reportMileage}
        />
      )}
    </div>
  )
}

interface VehicleFormModalProps {
  vehicle: Vehicle | null
  onClose: () => void
  onCreate: (dto: CreateVehicleRequest) => Promise<void>
  onUpdate: (id: string, dto: UpdateVehicleRequest) => Promise<void>
}

function VehicleFormModal({ vehicle, onClose, onCreate, onUpdate }: VehicleFormModalProps) {
  const isEdit = !!vehicle
  const { users } = useUsers()
  const drivers = users.filter((u) => u.role === 'driver')

  const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate ?? '')
  const [brand, setBrand] = useState(vehicle?.brand ?? '')
  const [model, setModel] = useState(vehicle?.model ?? '')
  const [manufactureYear, setManufactureYear] = useState(String(vehicle?.manufactureYear ?? new Date().getFullYear()))
  const [color, setColor] = useState(vehicle?.color ?? '')
  const [currentMileage, setCurrentMileage] = useState(String(vehicle?.currentMileage ?? 0))
  const [assignedDriverId, setAssignedDriverId] = useState(vehicle?.assignedDriverId ?? '')
  const [status, setStatus] = useState<VehicleStatus>(vehicle?.status ?? 'Active')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEdit) {
        await onUpdate(vehicle.id, {
          brand,
          model,
          color: color || null,
          currentMileage: Number(currentMileage),
          assignedDriverId: assignedDriverId || null,
          status,
        })
        toast.success(`Vehiculo ${vehicle.licensePlate} actualizado`)
      } else {
        await onCreate({
          licensePlate,
          brand,
          model,
          manufactureYear: Number(manufactureYear),
          color: color || null,
          currentMileage: Number(currentMileage),
          assignedDriverId: assignedDriverId || null,
        })
        toast.success(`Vehiculo ${licensePlate.toUpperCase()} creado`)
      }
      onClose()
    } catch (err) {
      const message = apiErrorMessage(err, 'No se pudo guardar el vehiculo. Intenta de nuevo.')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={isEdit ? `Editar ${vehicle.licensePlate}` : 'Nuevo vehiculo'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-text-muted">Placa</label>
            <input
              required
              disabled={isEdit}
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
              placeholder="ABC-123"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Año</label>
            <input
              type="number"
              required
              disabled={isEdit}
              value={manufactureYear}
              onChange={(e) => setManufactureYear(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-60"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Marca</label>
            <input
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Toyota"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Modelo</label>
            <input
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Hilux"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Color</label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Blanco"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Kilometraje actual</label>
            <input
              type="number"
              required
              min={0}
              value={currentMileage}
              onChange={(e) => setCurrentMileage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Conductor asignado</label>
            <select
              value={assignedDriverId}
              onChange={(e) => setAssignedDriverId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="">Sin asignar</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName}
                </option>
              ))}
            </select>
          </div>
          {isEdit && (
            <div>
              <label className="text-sm text-text-muted">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="Active">Activo</option>
                <option value="Maintenance">En mantenimiento</option>
                <option value="Inactive">Inactivo</option>
              </select>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear vehiculo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

interface ReportMileageModalProps {
  vehicle: Vehicle
  onClose: () => void
  onReport: (id: string, newMileage: number) => Promise<void>
}

function ReportMileageModal({ vehicle, onClose, onReport }: ReportMileageModalProps) {
  const [newMileage, setNewMileage] = useState(String(vehicle.currentMileage))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onReport(vehicle.id, Number(newMileage))
      toast.success('Kilometraje actualizado')
      onClose()
    } catch (err) {
      const message = apiErrorMessage(err, 'No se pudo reportar el kilometraje.')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={`Reportar kilometraje — ${vehicle.licensePlate}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-text-muted">Kilometraje actual: {vehicle.currentMileage.toLocaleString()} km</label>
          <input
            type="number"
            required
            min={vehicle.currentMileage}
            value={newMileage}
            onChange={(e) => setNewMileage(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && <p className="text-sm text-red">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

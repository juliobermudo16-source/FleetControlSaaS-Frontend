import { useAuth } from '@/context/AuthContext'
import { useVehicles } from '@/hooks/useVehicles'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Vehicles() {
  const { role } = useAuth()
  const { vehicles, loading, error } = useVehicles()

  if (loading) return <p className="text-text-muted">Cargando vehiculos...</p>
  if (error) return <p className="text-red">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{role === 'admin' ? 'Flota de vehiculos' : 'Mi vehiculo asignado'}</h1>
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
            </CardContent>
          </Card>
        ))}

        {vehicles.length === 0 && (
          <p className="text-text-muted col-span-full">
            {role === 'admin' ? 'Aun no hay vehiculos registrados.' : 'No tienes un vehiculo asignado.'}
          </p>
        )}
      </div>
    </div>
  )
}

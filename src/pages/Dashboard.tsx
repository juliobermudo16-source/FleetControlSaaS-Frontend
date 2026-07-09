import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Link } from 'react-router-dom'
import { AlertTriangle, Car, DollarSign, ShieldCheck, Truck } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'

const COLORS = { Verde: '#16a34a', Amarillo: '#ca8a04', Rojo: '#dc2626' }

export function Dashboard() {
  const { data, loading, error } = useDashboard()

  if (loading) return <p className="text-text-muted">Cargando dashboard...</p>
  if (error) return <p className="text-red">{error}</p>
  if (!data) return null

  const chartData = [
    { name: 'Verde', value: data.greenCount },
    { name: 'Amarillo', value: data.yellowCount },
    { name: 'Rojo', value: data.redCount },
  ].filter((d) => d.value > 0)

  const healthPercentage = data.totalVehicles > 0 ? Math.round((data.greenCount / data.totalVehicles) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard ejecutivo</h1>
        <p className="text-sm text-text-muted">Vista general de la salud de tu flota</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-hidden border-t-4 border-t-primary transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Truck size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Total de vehiculos</p>
              <p className="text-3xl font-bold text-primary">{data.totalVehicles}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-t-4 border-t-yellow transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 pt-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow/10">
              <DollarSign size={22} className="text-yellow" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Costo estimado proximo</p>
              <p className="text-3xl font-bold text-yellow">S/ {data.estimatedUpcomingCost.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'overflow-hidden border-t-4 transition-shadow hover:shadow-md',
            data.urgentVehicles.length > 0 ? 'border-t-red' : 'border-t-green'
          )}
        >
          <CardContent className="flex items-center gap-4 pt-5">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                data.urgentVehicles.length > 0 ? 'bg-red/10' : 'bg-green/10'
              )}
            >
              <AlertTriangle size={22} className={data.urgentVehicles.length > 0 ? 'text-red' : 'text-green'} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Mantenimientos urgentes</p>
              <p className={cn('text-3xl font-bold', data.urgentVehicles.length > 0 ? 'text-red' : 'text-green')}>
                {data.urgentVehicles.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grafico de dona: distribucion del estado de la flota */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Estado de la flota</CardTitle>
          </CardHeader>
          <CardContent className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {data.totalVehicles > 0 && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                <span className={cn('text-2xl font-bold', healthPercentage === 100 ? 'text-green' : 'text-text')}>
                  {healthPercentage}%
                </span>
                <span className="text-[10px] uppercase tracking-wide text-text-muted">Saludable</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de vehiculos urgentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vehiculos que requieren atencion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.urgentVehicles.length === 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-green/10 p-4 text-sm text-green">
                <ShieldCheck size={20} />
                No hay vehiculos en estado critico. Toda la flota esta al dia.
              </div>
            )}
            {data.urgentVehicles.map((v) => {
              const urgentMaintenance = v.maintenanceItems.filter((m) => m.status !== 'Green')
              const urgentDocuments = v.documentItems.filter((d) => d.status !== 'Green')
              return (
                <Link
                  key={v.vehicleId}
                  to={`/vehicles/${v.vehicleId}`}
                  className={cn(
                    'block rounded-lg border-l-4 border border-border p-3 space-y-2.5 transition-shadow hover:shadow-md hover:bg-surface-hover',
                    v.overallStatus === 'Red' ? 'border-l-red' : 'border-l-yellow'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {v.photoUrl ? (
                      <img
                        src={v.photoUrl}
                        alt={`Foto de ${v.licensePlate}`}
                        className="h-12 w-16 shrink-0 rounded-md object-cover border border-border"
                      />
                    ) : (
                      <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-surface-hover text-text-muted">
                        <Car size={20} />
                      </div>
                    )}
                    <div className="flex flex-1 items-center justify-between">
                      <p className="font-medium">{v.licensePlate}</p>
                      <Badge status={v.overallStatus}>{v.overallStatus}</Badge>
                    </div>
                  </div>

                  {urgentMaintenance.map((m) => (
                    <div key={m.maintenanceTypeId}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-text-muted">{m.maintenanceTypeName}</span>
                        <span className={cn('font-medium', m.status === 'Red' ? 'text-red' : 'text-yellow')}>
                          {m.wearPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <ProgressBar percentage={m.wearPercentage} status={m.status} />
                    </div>
                  ))}

                  {urgentDocuments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {urgentDocuments.map((d) => (
                        <Badge key={d.documentId} status={d.status} className="text-[10px]">
                          {d.documentType}: {d.daysUntilExpiration <= 0 ? 'vencido' : `${d.daysUntilExpiration}d`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

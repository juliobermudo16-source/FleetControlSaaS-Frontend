import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { AlertTriangle, DollarSign, Truck } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const COLORS = { Verde: '#22c55e', Amarillo: '#eab308', Rojo: '#ef4444' }

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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard ejecutivo</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Total de vehiculos</CardTitle>
            <Truck size={18} className="text-text-muted" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalVehicles}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Costo estimado proximo</CardTitle>
            <DollarSign size={18} className="text-text-muted" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">S/ {data.estimatedUpcomingCost.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Mantenimientos urgentes</CardTitle>
            <AlertTriangle size={18} className="text-yellow" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.urgentVehicles.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Grafico de dona: distribucion del estado de la flota */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Estado de la flota</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#171a21', border: '1px solid #262b35' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lista de vehiculos urgentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vehiculos que requieren atencion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.urgentVehicles.length === 0 && (
              <p className="text-sm text-text-muted">No hay vehiculos en estado critico. Toda la flota esta al dia.</p>
            )}
            {data.urgentVehicles.map((v) => (
              <div key={v.vehicleId} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{v.licensePlate}</p>
                  <p className="text-xs text-text-muted">
                    {v.maintenanceItems.filter((m) => m.status !== 'Green').length} mantenimiento(s) ·{' '}
                    {v.documentItems.filter((d) => d.status !== 'Green').length} documento(s) por revisar
                  </p>
                </div>
                <Badge status={v.overallStatus}>{v.overallStatus}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

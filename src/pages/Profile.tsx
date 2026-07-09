import { Mail, Phone, ShieldCheck, User } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export function Profile() {
  const { profile, loading, error } = useProfile()

  if (loading) return <p className="text-text-muted">Cargando perfil...</p>
  if (error) return <p className="text-red">{error}</p>
  if (!profile) return null

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-bold">Mi perfil</h1>
        <p className="text-sm text-text-muted">Tus datos como usuario del sistema</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {initials(profile.fullName) || <User size={22} />}
          </div>
          <div>
            <CardTitle className="normal-case text-text text-base">{profile.fullName}</CardTitle>
            <Badge status={profile.isActive ? 'Green' : undefined} className="mt-1">
              {profile.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck size={16} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Rol</p>
              <p className="font-medium">{profile.role === 'admin' ? 'Administrador' : 'Conductor'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Correo electronico</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-text-muted shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Telefono</p>
              <p className="font-medium">{profile.phone ?? 'No registrado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

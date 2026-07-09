import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { useUsers } from '@/hooks/useUsers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AppUser, UserRole } from '@/types'
import { Plus, RotateCcw, UserPlus, UserX } from 'lucide-react'

function apiErrorMessage(err: unknown, fallback: string) {
  return (isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined) ?? fallback
}

export function Users() {
  const { role, session } = useAuth()
  const { users, loading, error, inviteUser, deactivateUser, reactivateUser } = useUsers()
  const [showForm, setShowForm] = useState(false)

  if (role !== 'admin') {
    return <p className="text-text-muted">Solo un administrador puede ver esta seccion.</p>
  }

  const handleDeactivate = async (u: AppUser) => {
    if (!window.confirm(`¿Eliminar a ${u.fullName}? Perdera acceso al sistema y se desasignara de sus vehiculos.`)) return
    try {
      await deactivateUser(u.id)
      toast.success(`${u.fullName} fue eliminado`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo eliminar al usuario.'))
    }
  }

  const handleReactivate = async (u: AppUser) => {
    try {
      await reactivateUser(u.id)
      toast.success(`${u.fullName} fue reactivado`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo reactivar al usuario.'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Usuarios</h1>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          <Plus size={16} /> Invitar usuario
        </Button>
      </div>

      {showForm && <InviteUserForm onInvited={() => setShowForm(false)} onInvite={inviteUser} />}

      {loading && <p className="text-text-muted">Cargando usuarios...</p>}
      {error && <p className="text-red">{error}</p>}

      {!loading && !error && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="p-3 font-medium">Nombre</th>
                  <th className="p-3 font-medium">Correo</th>
                  <th className="p-3 font-medium">Rol</th>
                  <th className="p-3 font-medium">Estado</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === session?.user.id
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{u.fullName}</td>
                      <td className="p-3 text-text-muted">{u.email}</td>
                      <td className="p-3 capitalize">{u.role === 'admin' ? 'Administrador' : 'Conductor'}</td>
                      <td className="p-3">
                        <Badge className={u.isActive ? 'bg-green/15 text-green border-green/30' : 'bg-surface-hover text-text-muted border-border'}>
                          {u.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-text-muted">Tu cuenta</span>
                        ) : u.isActive ? (
                          <button onClick={() => handleDeactivate(u)} className="text-red hover:opacity-80 inline-flex items-center gap-1 text-xs">
                            <UserX size={13} /> Eliminar
                          </button>
                        ) : (
                          <button onClick={() => handleReactivate(u)} className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                            <RotateCcw size={13} /> Reactivar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-text-muted">
                      Aun no hay usuarios invitados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface InviteUserFormProps {
  onInvite: (dto: { fullName: string; email: string; role: UserRole; phone?: string | null }) => Promise<void>
  onInvited: () => void
}

function InviteUserForm({ onInvite, onInvited }: InviteUserFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('driver')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onInvite({ fullName, email, role })
      toast.success(`Invitacion enviada a ${email}`)
      onInvited()
    } catch (err) {
      const message = isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined
      const finalMessage = message ?? 'No se pudo invitar al usuario. Intenta de nuevo.'
      setError(finalMessage)
      toast.error(finalMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <UserPlus size={18} className="text-primary" />
        <CardTitle className="normal-case text-text text-base">Invitar nuevo usuario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm text-text-muted">Nombre completo</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Juan Perez"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Correo electronico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="conductor@empresa.com"
            />
          </div>
          <div>
            <label className="text-sm text-text-muted">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="driver">Conductor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Invitando...' : 'Enviar invitacion'}
          </Button>

          {error && <p className="md:col-span-4 text-sm text-red">{error}</p>}
        </form>
      </CardContent>
    </Card>
  )
}

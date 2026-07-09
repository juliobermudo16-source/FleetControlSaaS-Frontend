import { useRef, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'
import { Camera, Mail, ShieldCheck, User } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function apiErrorMessage(err: unknown, fallback: string) {
  return (isAxiosError(err) ? (err.response?.data as { error?: string } | undefined)?.error : undefined) ?? fallback
}

export function Profile() {
  const { profile, loading, error, updateProfile, uploadAvatar } = useProfile()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [formInitializedFor, setFormInitializedFor] = useState<string | null>(null)

  if (loading) return <p className="text-text-muted">Cargando perfil...</p>
  if (error) return <p className="text-red">{error}</p>
  if (!profile) return null

  if (formInitializedFor !== profile.id) {
    setFullName(profile.fullName)
    setPhone(profile.phone ?? '')
    setFormInitializedFor(profile.id)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ fullName, phone: phone || null })
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo actualizar el perfil.'))
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      await uploadAvatar(file)
      toast.success('Foto de perfil actualizada')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'No se pudo subir la foto de perfil.'))
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-bold">Mi perfil</h1>
        <p className="text-sm text-text-muted">Tus datos como usuario del sistema</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <div className="relative shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Foto de perfil" className="h-14 w-14 rounded-full object-cover border border-border" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {initials(profile.fullName) || <User size={22} />}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
              aria-label="Cambiar foto de perfil"
            >
              <Camera size={12} />
            </button>
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

          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-border">
            <div>
              <label className="text-sm text-text-muted">Nombre completo</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-text-muted">Telefono</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="999888777"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

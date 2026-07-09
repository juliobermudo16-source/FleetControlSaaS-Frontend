import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, KeyRound } from 'lucide-react'

/// Se usa tanto para "olvide mi contrasena" como para aceptar una invitacion
/// de administrador: en ambos casos Supabase redirige aqui con una sesion
/// temporal ya activa (leida automaticamente del hash de la URL), y este
/// formulario solo pide la contrasena nueva/definitiva.
export function ResetPassword() {
  const [ready, setReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
      setReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasSession(true)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError('No se pudo actualizar la contrasena. El enlace pudo haber expirado.')
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <KeyRound className="text-primary" size={32} />
          <CardTitle className="text-lg text-text normal-case">Establecer contrasena</CardTitle>
          <p className="text-xs text-text-muted">Elige la contrasena que usaras para ingresar</p>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-sm text-text-muted text-center">Verificando enlace...</p>
          ) : !hasSession ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-red">
                Este enlace no es valido o ya expiro. Solicita uno nuevo.
              </p>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-text-muted">Nueva contrasena</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:border-primary"
                    placeholder="Minimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-text-muted hover:text-text"
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar contrasena'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

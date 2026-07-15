import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Truck } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) {
      setError('Credenciales invalidas. Verifica tu correo y contrasena.')
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <Truck className="text-primary" size={32} />
          <CardTitle className="text-lg text-text normal-case">Sistemas Forever</CardTitle>
          <p className="text-xs text-text-muted">Control de flota de vehiculos</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-text-muted">Correo electronico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="admin@empresa.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-text-muted">Contrasena</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contrasena?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:border-primary"
                  placeholder="********"
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
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

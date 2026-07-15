import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Truck, Bell, Building2, ShieldCheck } from 'lucide-react'

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
    <div className="min-h-screen bg-background flex">
      {/* Left: form */}
      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-[45%]">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Truck className="text-primary" size={28} />
            </div>
            <h1 className="text-lg font-semibold text-text">FleetControl SaaS</h1>
            <p className="text-xs text-text-muted">Control de flota de vehiculos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-text-muted">Correo electronico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
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
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 pr-10 text-sm outline-none focus:border-primary"
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
        </div>
      </div>

      {/* Right: eye-catching visual panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[55%]">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 45%, #0f172a 100%)' }}
        />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-black/20 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
          <div>
            <h2 className="max-w-md text-3xl font-semibold leading-tight">
              Tu flota, bajo control, en tiempo real.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/80">
              Mantenimiento, documentos y conductores de todas tus empresas, en un solo lugar.
            </p>
          </div>

          {/* Illustration: road + truck */}
          <div className="relative my-8 h-56">
            <svg viewBox="0 0 400 200" className="h-full w-full" fill="none">
              <ellipse cx="200" cy="175" rx="180" ry="14" fill="black" opacity="0.15" />
              <rect x="20" y="150" width="360" height="10" rx="5" fill="white" opacity="0.25" />
              <rect x="0" y="150" width="20" height="10" fill="white" opacity="0" />
              {[40, 100, 160, 220, 280, 340].map((x) => (
                <rect key={x} x={x} y="153.5" width="18" height="3" rx="1.5" fill="white" opacity="0.6" />
              ))}
              {/* truck body */}
              <rect x="90" y="90" width="130" height="55" rx="8" fill="white" opacity="0.95" />
              <rect x="220" y="65" width="70" height="80" rx="8" fill="white" opacity="0.95" />
              <rect x="234" y="80" width="42" height="30" rx="4" fill="#0f172a" opacity="0.85" />
              <circle cx="140" cy="150" r="18" fill="#0f172a" />
              <circle cx="140" cy="150" r="7" fill="white" />
              <circle cx="255" cy="150" r="18" fill="#0f172a" />
              <circle cx="255" cy="150" r="7" fill="white" />
              <rect x="286" y="118" width="10" height="16" rx="2" fill="#f97316" />
            </svg>
          </div>

          {/* floating stat cards */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <Building2 size={18} />
              <span className="text-sm font-medium">Multiempresa</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <Bell size={18} />
              <span className="text-sm font-medium">Alertas automaticas</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <ShieldCheck size={18} />
              <span className="text-sm font-medium">Acceso seguro (JWT)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

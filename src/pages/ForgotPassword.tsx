import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KeyRound } from 'lucide-react'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError('No se pudo enviar el correo de recuperacion. Intenta de nuevo.')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <KeyRound className="text-primary" size={32} />
          <CardTitle className="text-lg text-text normal-case">Recuperar contrasena</CardTitle>
          <p className="text-xs text-text-muted">Te enviaremos un enlace para restablecerla</p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-text">
                Si <strong>{email}</strong> esta registrado, recibiras un correo con instrucciones en unos minutos.
              </p>
              <Link to="/login" className="text-sm text-primary hover:underline">
                Volver al inicio de sesion
              </Link>
            </div>
          ) : (
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

              {error && <p className="text-sm text-red">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
              </Button>

              <Link to="/login" className="block text-center text-sm text-text-muted hover:text-text">
                Volver al inicio de sesion
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

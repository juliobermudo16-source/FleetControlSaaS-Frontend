import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { Login } from '@/pages/Login'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { Dashboard } from '@/pages/Dashboard'
import { Vehicles } from '@/pages/Vehicles'
import { Users } from '@/pages/Users'
import { AlertTriangle } from 'lucide-react'

function ConfigMissingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-3">
        <AlertTriangle className="mx-auto text-red" size={32} />
        <h1 className="text-lg font-bold">Falta configuracion de Supabase</h1>
        <p className="text-sm text-text-muted">
          No se encontraron <code className="text-text">VITE_SUPABASE_URL</code> y/o{' '}
          <code className="text-text">VITE_SUPABASE_ANON_KEY</code>. Si esto esta desplegado en
          Vercel, agrega esas variables en Settings → Environment Variables y vuelve a desplegar
          (se incrustan en el build, agregarlas despues no basta).
        </p>
      </div>
    </div>
  )
}

function App() {
  if (!isSupabaseConfigured) {
    return <ConfigMissingScreen />
  }

  return (
    <AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            fontSize: '0.875rem',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

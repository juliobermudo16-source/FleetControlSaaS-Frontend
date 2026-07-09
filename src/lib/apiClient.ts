import axios from 'axios'
import { supabase } from './supabaseClient'

// Cliente HTTP hacia la API de .NET. Un interceptor adjunta automaticamente
// el JWT de la sesion activa de Supabase Auth en cada request, que el
// SupabaseJwtMiddleware del backend valida y usa para resolver TenantId/Role.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
})

apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si el backend responde 401 (token invalido/expirado), se cierra la sesion
// local para forzar un nuevo login.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

import { createClient } from '@supabase/supabase-js'

// Estas variables se configuran en el archivo .env (ver .env.example) y se
// usan SOLO para Supabase Auth (login/registro) desde el frontend. Todas las
// operaciones de negocio pasan por la API de .NET, nunca directo a la BD.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// createClient() lanza una excepcion sincrona si la URL esta vacia o mal
// formada, lo que tumba TODO el arbol de React en blanco sin ningun mensaje
// (occurre tipicamente cuando faltan las env vars en el deploy de Vercel).
// Se detecta el caso ANTES de llamar a createClient para poder mostrar un
// error legible en vez de una pantalla en blanco (ver App.tsx).
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
)

if (!isSupabaseConfigured) {
  console.error('Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (revisa tu archivo .env o las Environment Variables de Vercel)')
}

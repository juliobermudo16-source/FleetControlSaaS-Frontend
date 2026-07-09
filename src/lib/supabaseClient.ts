import { createClient } from '@supabase/supabase-js'

// Estas variables se configuran en el archivo .env (ver .env.example) y se
// usan SOLO para Supabase Auth (login/registro) desde el frontend. Todas las
// operaciones de negocio pasan por la API de .NET, nunca directo a la BD.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (revisa tu archivo .env)')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

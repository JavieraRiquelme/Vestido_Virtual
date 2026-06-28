import { supabase } from '../lib/supabase'

const USUARIO_KEY = 'closy_usuario_id'
const DEMO_KEY    = 'closy_demo'

export function guardarSesion(token, usuarioId) {
  localStorage.setItem('closy_token', token)
  localStorage.setItem(USUARIO_KEY, String(usuarioId))
}

export async function cerrarSesion() {
  await supabase.auth.signOut()
  localStorage.removeItem('closy_token')
  localStorage.removeItem(USUARIO_KEY)
  localStorage.removeItem(DEMO_KEY)
}

export function getToken() {
  return localStorage.getItem('closy_token')
}

export function getUsuarioId() {
  const id = localStorage.getItem(USUARIO_KEY)
  return id ? parseInt(id, 10) : null
}

export function estaAutenticado() {
  return Boolean(getToken())
}

export function activarDemo() {
  localStorage.setItem(DEMO_KEY, '1')
  guardarSesion('DEMO', 0)
}

export function esDemoMode() {
  return localStorage.getItem(DEMO_KEY) === '1'
}

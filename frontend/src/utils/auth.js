const TOKEN_KEY   = 'closy_token'
const USUARIO_KEY = 'closy_usuario_id'
const DEMO_KEY    = 'closy_demo'

export function guardarSesion(token, usuarioId) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USUARIO_KEY, String(usuarioId))
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USUARIO_KEY)
  localStorage.removeItem(DEMO_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
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

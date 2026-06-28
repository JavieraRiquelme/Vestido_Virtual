import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { guardarSesion, activarDemo } from '../utils/auth'
import './Auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Login() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      // Si no tiene @ es un username → buscar email primero
      let emailLogin = email.trim()
      if (!emailLogin.includes('@')) {
        const res = await fetch(`${API}/usuarios/email-by-username?username=${encodeURIComponent(emailLogin)}`)
        if (!res.ok) throw new Error('Email o contraseña incorrectos')
        const d = await res.json()
        emailLogin = d.email
      }

      const { data, error: sbError } = await supabase.auth.signInWithPassword({ email: emailLogin, password })
      if (sbError) {
        throw new Error(
          sbError.message.includes('Invalid login credentials')
            ? 'Email o contraseña incorrectos'
            : sbError.message
        )
      }

      const res = await fetch(`${API}/auth/supabase-sync`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.session.access_token}` },
        body:    JSON.stringify({}),
      })
      const sync = await res.json()
      if (!res.ok) throw new Error(sync.detail || 'Error al conectar con el servidor')

      guardarSesion(data.session.access_token, sync.usuario_id)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <img src="/logo.png" alt="Klosy" className="auth__logo" />
        <h1 className="auth__titulo">¡Bienvenida a Klosy!</h1>
        <p className="auth__subtitulo">Inicia sesión para ver tu closet virtual</p>

        <form className="auth__form" onSubmit={enviar}>
          <label className="auth__label">
            Email o usuario
            <input
              className="auth__input"
              type="text"
              placeholder="tu@email.com o tu_usuario"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="auth__label">
            Contraseña
            <input
              className="auth__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <p className="auth__error">{error}</p>}

          <button className="auth__btn" type="submit" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <p style={{ textAlign: 'right', margin: 0 }}>
            <Link className="auth__link" style={{ fontSize: '0.85rem' }} to="/recuperar-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </form>

        <p className="auth__link-texto">
          ¿No tienes cuenta?{' '}
          <Link className="auth__link" to="/registro">Regístrate aquí</Link>
        </p>

        <div className="auth__separador"><span>o</span></div>

        <button
          className="auth__btn-demo"
          type="button"
          onClick={() => { activarDemo(); navigate('/') }}
        >
          Explorar sin cuenta →
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { guardarSesion, activarDemo } from '../utils/auth'
import './Auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  function cambiar(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al iniciar sesión')

      guardarSesion(data.access_token, data.usuario_id)
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
        <img src="/logo.png" alt="Closy" className="auth__logo" />
        <h1 className="auth__titulo">¡Bienvenida a Closy!</h1>
        <p className="auth__subtitulo">Inicia sesión para ver tu closet virtual</p>

        <form className="auth__form" onSubmit={enviar}>
          <label className="auth__label">
            Usuario
            <input
              className="auth__input"
              type="text"
              name="username"
              placeholder="tu_usuario"
              value={form.username}
              onChange={cambiar}
              autoComplete="username"
            />
          </label>

          <label className="auth__label">
            Contraseña
            <input
              className="auth__input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={cambiar}
              autoComplete="current-password"
            />
          </label>

          {error && <p className="auth__error">{error}</p>}

          <button className="auth__btn" type="submit" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth__link-texto">
          ¿No tienes cuenta?{' '}
          <Link className="auth__link" to="/registro">
            Regístrate aquí
          </Link>
        </p>

        <div className="auth__separador">
          <span>o</span>
        </div>

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

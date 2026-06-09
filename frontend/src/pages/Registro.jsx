import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { guardarSesion } from '../utils/auth'
import './Auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    nombre: '',
    password: '',
  })
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
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al registrarse')

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
        <h1 className="auth__titulo">Crea tu cuenta</h1>
        <p className="auth__subtitulo">Empieza a organizar tu closet virtual</p>

        <form className="auth__form" onSubmit={enviar}>
          <label className="auth__label">
            Nombre
            <input
              className="auth__input"
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={cambiar}
              autoComplete="name"
            />
          </label>

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
            Email
            <input
              className="auth__input"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={cambiar}
              autoComplete="email"
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
              autoComplete="new-password"
            />
          </label>

          {error && <p className="auth__error">{error}</p>}

          <button className="auth__btn" type="submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth__link-texto">
          ¿Ya tienes cuenta?{' '}
          <Link className="auth__link" to="/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

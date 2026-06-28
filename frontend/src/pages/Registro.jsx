import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { guardarSesion } from '../utils/auth'
import './Auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', nombre: '', password: '' })
  const [error,    setError]    = useState(null)
  const [cargando, setCargando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  function cambiar(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setCargando(true)
    try {
      const { data, error: sbError } = await supabase.auth.signUp({
        email:    form.email,
        password: form.password,
        options: {
          data: { nombre: form.nombre, username: form.username },
        },
      })
      if (sbError) throw new Error(sbError.message)

      if (!data.session) {
        // Supabase requiere confirmación de email
        setConfirmar(true)
        return
      }

      // Sesión inmediata (email confirm desactivado en Supabase)
      const res = await fetch(`${API}/auth/supabase-sync`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.session.access_token}` },
        body:    JSON.stringify({ nombre: form.nombre, username: form.username }),
      })
      const sync = await res.json()
      if (!res.ok) throw new Error(sync.detail || 'Error al crear cuenta')

      guardarSesion(data.session.access_token, sync.usuario_id)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  if (confirmar) {
    return (
      <div className="auth">
        <div className="auth__card">
          <img src="/logo.png" alt="Klosy" className="auth__logo" />
          <h1 className="auth__titulo">Revisa tu email</h1>
          <p className="auth__subtitulo" style={{ marginTop: 8 }}>
            Te enviamos un enlace de confirmación a <strong>{form.email}</strong>.
            Haz clic en el enlace para activar tu cuenta y luego inicia sesión.
          </p>
          <Link className="auth__btn" style={{ textAlign: 'center', marginTop: 16, textDecoration: 'none' }} to="/login">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <img src="/logo.png" alt="Klosy" className="auth__logo" />
        <h1 className="auth__titulo">Crea tu cuenta</h1>
        <p className="auth__subtitulo">Empieza a organizar tu closet virtual</p>

        <form className="auth__form" onSubmit={enviar}>
          <label className="auth__label">
            Nombre
            <input className="auth__input" type="text" name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={cambiar} required autoComplete="name" />
          </label>
          <label className="auth__label">
            Usuario
            <input className="auth__input" type="text" name="username" placeholder="tu_usuario" value={form.username} onChange={cambiar} required autoComplete="username" />
          </label>
          <label className="auth__label">
            Email
            <input className="auth__input" type="email" name="email" placeholder="tu@email.com" value={form.email} onChange={cambiar} required autoComplete="email" />
          </label>
          <label className="auth__label">
            Contraseña
            <input className="auth__input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={cambiar} required autoComplete="new-password" />
          </label>

          {error && <p className="auth__error">{error}</p>}

          <button className="auth__btn" type="submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth__link-texto">
          ¿Ya tienes cuenta?{' '}
          <Link className="auth__link" to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

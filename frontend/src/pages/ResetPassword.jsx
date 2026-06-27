import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import './Auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ResetPassword() {
  const [params]           = useSearchParams()
  const navigate           = useNavigate()
  const token              = params.get('token') || ''

  const [password,  setPassword]  = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error,     setError]     = useState(null)
  const [ok,        setOk]        = useState(false)
  const [cargando,  setCargando]  = useState(false)

  if (!token) {
    return (
      <div className="auth">
        <div className="auth__card">
          <img src="/logo.png" alt="Klosy" className="auth__logo" />
          <p className="auth__error">Enlace inválido. Solicita uno nuevo.</p>
          <Link className="auth__btn" style={{ textAlign: 'center', marginTop: 16, textDecoration: 'none' }} to="/recuperar-password">
            Solicitar enlace
          </Link>
        </div>
      </div>
    )
  }

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setCargando(true)
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, nueva_password: password }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.detail || 'Error al actualizar')
      setOk(true)
      setTimeout(() => navigate('/login'), 2500)
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
        <h1 className="auth__titulo">Nueva contraseña</h1>

        {ok ? (
          <p className="auth__subtitulo" style={{ marginTop: 8 }}>
            ¡Contraseña actualizada! Redirigiendo al inicio de sesión...
          </p>
        ) : (
          <>
            <p className="auth__subtitulo">Elige una contraseña nueva para tu cuenta.</p>
            <form className="auth__form" onSubmit={enviar} style={{ width: '100%' }}>
              <label className="auth__label">
                Nueva contraseña
                <input
                  className="auth__input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </label>
              <label className="auth__label">
                Confirmar contraseña
                <input
                  className="auth__input"
                  type="password"
                  placeholder="••••••••"
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </label>

              {error && <p className="auth__error">{error}</p>}

              <button className="auth__btn" type="submit" disabled={cargando || !password || !confirmar}>
                {cargando ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

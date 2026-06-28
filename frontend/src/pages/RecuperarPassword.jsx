import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin

export default function RecuperarPassword() {
  const [email,    setEmail]    = useState('')
  const [enviado,  setEnviado]  = useState(false)
  const [error,    setError]    = useState(null)
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/reset-password`,
      })
      if (sbError) throw new Error(sbError.message)
      setEnviado(true)
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
        <h1 className="auth__titulo">Recuperar contraseña</h1>

        {enviado ? (
          <>
            <p className="auth__subtitulo" style={{ marginTop: 8 }}>
              Si ese email está registrado, recibirás un enlace en los próximos minutos.
              Revisa también tu carpeta de spam.
            </p>
            <Link className="auth__btn" style={{ textAlign: 'center', marginTop: 16, textDecoration: 'none' }} to="/login">
              Volver al inicio de sesión
            </Link>
          </>
        ) : (
          <>
            <p className="auth__subtitulo">
              Ingresa tu email y te enviaremos un enlace para crear una nueva contraseña.
            </p>
            <form className="auth__form" onSubmit={enviar} style={{ width: '100%' }}>
              <label className="auth__label">
                Email
                <input
                  className="auth__input"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              {error && <p className="auth__error">{error}</p>}

              <button className="auth__btn" type="submit" disabled={cargando || !email}>
                {cargando ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
            <p className="auth__link-texto">
              <Link className="auth__link" to="/login">← Volver</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

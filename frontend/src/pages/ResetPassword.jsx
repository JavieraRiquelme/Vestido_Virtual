import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function ResetPassword() {
  const [searchParams]         = useSearchParams()
  const navigate               = useNavigate()
  const code                   = searchParams.get('code')

  const [listo,     setListo]     = useState(false)
  const [password,  setPassword]  = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error,     setError]     = useState(null)
  const [ok,        setOk]        = useState(false)
  const [cargando,  setCargando]  = useState(false)

  useEffect(() => {
    if (!code) return
    supabase.auth.exchangeCodeForSession(code)
      .then(({ error: sbError }) => {
        if (sbError) setError('Enlace inválido o expirado. Solicita uno nuevo.')
        else setListo(true)
      })
  }, [code])

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6)   { setError('Mínimo 6 caracteres'); return }
    setCargando(true)
    try {
      const { error: sbError } = await supabase.auth.updateUser({ password })
      if (sbError) throw new Error(sbError.message)
      setOk(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  if (!code) {
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

  return (
    <div className="auth">
      <div className="auth__card">
        <img src="/logo.png" alt="Klosy" className="auth__logo" />
        <h1 className="auth__titulo">Nueva contraseña</h1>

        {ok ? (
          <p className="auth__subtitulo" style={{ marginTop: 8 }}>
            ¡Contraseña actualizada! Redirigiendo...
          </p>
        ) : error && !listo ? (
          <>
            <p className="auth__error">{error}</p>
            <Link className="auth__btn" style={{ textAlign: 'center', marginTop: 16, textDecoration: 'none' }} to="/recuperar-password">
              Solicitar nuevo enlace
            </Link>
          </>
        ) : listo ? (
          <>
            <p className="auth__subtitulo">Elige una contraseña nueva para tu cuenta.</p>
            <form className="auth__form" onSubmit={enviar} style={{ width: '100%' }}>
              <label className="auth__label">
                Nueva contraseña
                <input className="auth__input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
              </label>
              <label className="auth__label">
                Confirmar contraseña
                <input className="auth__input" type="password" placeholder="••••••••" value={confirmar} onChange={e => setConfirmar(e.target.value)} required autoComplete="new-password" />
              </label>
              {error && <p className="auth__error">{error}</p>}
              <button className="auth__btn" type="submit" disabled={cargando || !password || !confirmar}>
                {cargando ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </form>
          </>
        ) : (
          <p className="auth__subtitulo">Verificando enlace...</p>
        )}
      </div>
    </div>
  )
}

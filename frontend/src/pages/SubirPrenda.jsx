import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuarioId, esDemoMode } from '../utils/auth'
import './SubirPrenda.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CLIMAS = ['frío', 'templado', 'cálido']

export default function SubirPrenda() {
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [categorias, setCategorias] = useState([])
  const [preview, setPreview] = useState(null)
  const [archivo, setArchivo] = useState(null)
  const [form, setForm] = useState({
    nombre: '',
    categoria_id: '',
    color: '',
    ideal_clima: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const CATEGORIAS_DEMO = [
    { id: 1, nombre: "Parte de arriba (manga larga)" },
    { id: 2, nombre: "Parte de arriba (manga corta)" },
    { id: 3, nombre: "Parte de abajo (largo)" },
    { id: 4, nombre: "Parte de abajo (corto)" },
    { id: 5, nombre: "Zapatos" },
    { id: 6, nombre: "Accesorios" },
  ]

  useEffect(() => {
    if (esDemoMode()) { setCategorias(CATEGORIAS_DEMO); return }
    fetch(`${API}/categorias/`)
      .then((r) => r.json())
      .then(setCategorias)
      .catch(() => {})
  }, [])

  function seleccionarImagen(e) {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setPreview(URL.createObjectURL(file))
  }

  function cambiar(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function enviar(e) {
    e.preventDefault()
    if (!archivo) { setError('Selecciona una imagen.'); return }
    if (!form.nombre.trim()) { setError('Escribe un nombre.'); return }
    if (!form.categoria_id) { setError('Elige una categoría.'); return }

    setError(null)
    setEnviando(true)

    const data = new FormData()
    data.append('imagen', archivo)
    data.append('usuario_id', getUsuarioId())
    data.append('categoria_id', form.categoria_id)
    data.append('nombre', form.nombre.trim())
    if (form.color) data.append('color', form.color.trim())
    if (form.ideal_clima) data.append('ideal_clima', form.ideal_clima)

    if (esDemoMode()) {
      await new Promise((r) => setTimeout(r, 600))
      navigate('/mi-closet')
      return
    }

    try {
      const res = await fetch(`${API}/prendas/subir`, {
        method: 'POST',
        body: data,
      })
      if (!res.ok) throw new Error('Error al guardar la prenda.')
      navigate('/mi-closet')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="subir">
      <button className="subir__volver" onClick={() => navigate('/mi-closet')}>
        ← Volver
      </button>

      <h1 className="subir__titulo">Agregar prenda</h1>

      <form className="subir__form" onSubmit={enviar}>
        <div
          className={`subir__foto${preview ? ' subir__foto--con-imagen' : ''}`}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Vista previa" className="subir__preview" />
          ) : (
            <>
              <span className="subir__foto-icono">📷</span>
              <span className="subir__foto-texto">Toca para agregar foto</span>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={seleccionarImagen}
        />

        <label className="subir__label">
          Nombre
          <input
            className="subir__input"
            type="text"
            name="nombre"
            placeholder="ej: Polera blanca"
            value={form.nombre}
            onChange={cambiar}
          />
        </label>

        <label className="subir__label">
          Categoría
          <select
            className="subir__input"
            name="categoria_id"
            value={form.categoria_id}
            onChange={cambiar}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="subir__label">
          Color <span className="subir__opcional">(opcional)</span>
          <input
            className="subir__input"
            type="text"
            name="color"
            placeholder="ej: azul marino"
            value={form.color}
            onChange={cambiar}
          />
        </label>

        <label className="subir__label">
          Clima ideal <span className="subir__opcional">(opcional)</span>
          <select
            className="subir__input"
            name="ideal_clima"
            value={form.ideal_clima}
            onChange={cambiar}
          >
            <option value="">Sin preferencia</option>
            {CLIMAS.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="subir__error">{error}</p>}

        <button
          className="subir__btn"
          type="submit"
          disabled={enviando}
        >
          {enviando ? 'Guardando...' : 'Guardar prenda'}
        </button>
      </form>
    </div>
  )
}

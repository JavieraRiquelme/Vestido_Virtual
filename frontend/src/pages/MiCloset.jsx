import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuarioId, esDemoMode } from '../utils/auth'
import { MOCK_PRENDAS } from '../utils/mockData'
import './MiCloset.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const FILTROS = [
  { label: 'Todas',         ids: null },
  { label: 'Parte de arriba', ids: [1, 2] },
  { label: 'Parte de abajo', ids: [3, 4] },
  { label: 'Zapatos',       ids: [5] },
  { label: 'Accesorios',    ids: [6] },
]

export default function MiCloset() {
  const navigate = useNavigate()
  const [prendas, setPrendas]     = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)
  const [filtro, setFiltro]       = useState(null)

  useEffect(() => {
    if (esDemoMode()) {
      setPrendas(MOCK_PRENDAS)
      setCargando(false)
      return
    }
    fetch(`${API}/prendas/usuario/${getUsuarioId()}`)
      .then((r) => r.json())
      .then((data) => {
        setPrendas(Array.isArray(data) ? data : [])
        setCargando(false)
      })
      .catch(() => {
        setError('No se pudo cargar el closet.')
        setCargando(false)
      })
  }, [])

  const prendasVisibles = filtro
    ? prendas.filter((p) => filtro.includes(p.categoria_id))
    : prendas

  return (
    <div className="closet">
      <h1 className="closet__titulo">Mi Closet</h1>

      {/* Chips de filtro */}
      {!cargando && !error && prendas.length > 0 && (
        <div className="closet__filtros">
          {FILTROS.map((f) => (
            <button
              key={f.label}
              className={`closet__chip${filtro === f.ids ? ' closet__chip--activo' : ''}`}
              onClick={() => setFiltro(f.ids)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {cargando && <p className="closet__mensaje">Cargando prendas...</p>}
      {error && <p className="closet__mensaje closet__mensaje--error">{error}</p>}

      {!cargando && !error && prendas.length === 0 && (
        <div className="closet__vacio">
          <img src="/logo.png" alt="Closy" className="closet__vacio-logo" />
          <p>Tu closet está vacío.</p>
          <p>¡Agrega tu primera prenda!</p>
        </div>
      )}

      {!cargando && !error && prendasVisibles.length === 0 && prendas.length > 0 && (
        <p className="closet__mensaje">Nada en esta categoría todavía.</p>
      )}

      <div className="closet__grid">
        {prendasVisibles.map((prenda) => (
          <div key={prenda.id} className="closet__card">
            {prenda.imagen_url ? (
              <img
                className="closet__card-img"
                src={prenda.imagen_url}
                alt={prenda.nombre}
              />
            ) : (
              <div className="closet__card-placeholder" />
            )}
            <p className="closet__card-nombre">{prenda.nombre}</p>
            {prenda.color && (
              <p className="closet__card-meta">{prenda.color}</p>
            )}
          </div>
        ))}
      </div>

      <button
        className="closet__fab"
        onClick={() => navigate('/subir-prenda')}
        aria-label="Agregar prenda"
      >
        +
      </button>
    </div>
  )
}

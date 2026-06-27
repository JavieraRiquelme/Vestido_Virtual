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

const CLIMA_OPTS = ['frio', 'templado', 'calido']

export default function MiCloset() {
  const navigate = useNavigate()
  const [prendas, setPrendas]       = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)
  const [filtro, setFiltro]         = useState(null)
  const [editando, setEditando]     = useState(null)   // prenda en edición
  const [editForm, setEditForm]     = useState({})
  const [guardando, setGuardando]   = useState(false)

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

  const handleEliminar = async (prenda) => {
    if (!window.confirm(`¿Eliminar "${prenda.nombre}"?`)) return
    if (esDemoMode()) {
      setPrendas(prev => prev.filter(p => p.id !== prenda.id))
      return
    }
    try {
      const res = await fetch(`${API}/prendas/${prenda.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPrendas(prev => prev.filter(p => p.id !== prenda.id))
    } catch {
      alert('No se pudo eliminar la prenda.')
    }
  }

  const abrirEdicion = (prenda) => {
    setEditando(prenda)
    setEditForm({ nombre: prenda.nombre, color: prenda.color || '', ideal_clima: prenda.ideal_clima || '' })
  }

  const handleGuardar = async () => {
    if (!editForm.nombre.trim()) return
    if (esDemoMode()) {
      setPrendas(prev => prev.map(p => p.id === editando.id ? { ...p, ...editForm } : p))
      setEditando(null)
      return
    }
    setGuardando(true)
    try {
      const res = await fetch(`${API}/prendas/${editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id:   editando.usuario_id,
          categoria_id: editando.categoria_id,
          nombre:       editForm.nombre.trim(),
          color:        editForm.color || null,
          ideal_clima:  editForm.ideal_clima || null,
          imagen_url:   editando.imagen_url,
        }),
      })
      if (!res.ok) throw new Error()
      const actualizada = await res.json()
      setPrendas(prev => prev.map(p => p.id === editando.id ? actualizada : p))
      setEditando(null)
    } catch {
      alert('No se pudo guardar los cambios.')
    } finally {
      setGuardando(false)
    }
  }

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
            <div className="closet__card-acciones">
              <button
                className="closet__card-btn closet__card-btn--editar"
                onClick={() => abrirEdicion(prenda)}
                aria-label="Editar"
              >
                ✏️
              </button>
              <button
                className="closet__card-btn closet__card-btn--eliminar"
                onClick={() => handleEliminar(prenda)}
                aria-label="Eliminar"
              >
                ✕
              </button>
            </div>
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

      {/* Modal de edición */}
      {editando && (
        <div className="closet__modal-overlay" onClick={() => setEditando(null)}>
          <div className="closet__modal" onClick={e => e.stopPropagation()}>
            <div className="closet__modal-header">
              <span>Editar prenda</span>
              <button onClick={() => setEditando(null)}>✕</button>
            </div>
            <label className="closet__modal-label">Nombre</label>
            <input
              className="closet__modal-input"
              value={editForm.nombre}
              onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
            />
            <label className="closet__modal-label">Color</label>
            <input
              className="closet__modal-input"
              value={editForm.color}
              placeholder="ej: azul marino"
              onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
            />
            <label className="closet__modal-label">Clima ideal</label>
            <select
              className="closet__modal-input"
              value={editForm.ideal_clima}
              onChange={e => setEditForm(f => ({ ...f, ideal_clima: e.target.value }))}
            >
              <option value="">Sin especificar</option>
              {CLIMA_OPTS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              className="closet__modal-guardar"
              onClick={handleGuardar}
              disabled={guardando || !editForm.nombre.trim()}
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

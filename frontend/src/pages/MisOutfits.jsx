import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getOutfitsUsuario, eliminarOutfit } from "../services/outfits"
import { esDemoMode, getUsuarioId } from "../utils/auth"
import { MOCK_OUTFITS, MOCK_OUTFIT_PRENDAS } from "../utils/mockData"
import "./MisOutfits.css"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const OCASION_CFG = {
  1: { label: "Universidad", bg: "linear-gradient(145deg,#C6C2F2,#9B96E0)" },
  2: { label: "Trabajo",     bg: "linear-gradient(145deg,#3C3C3E,#262628)" },
  3: { label: "Casual",      bg: "linear-gradient(145deg,#E8EC9A,#D6DC82)" },
  4: { label: "Fiesta",      bg: "linear-gradient(145deg,#E88092,#DB6072)" },
  5: { label: "Deporte",     bg: "linear-gradient(145deg,#D6DC82,#C8CE60)" },
  6: { label: "Cita",        bg: "linear-gradient(145deg,#DB6072,#C04060)" },
}
const DEFAULT_BG = "linear-gradient(145deg,#C6C2F2,#9B96E0)"
const CLIMA_LABEL = { frio: "Frío", templado: "Templado", calor: "Calor" }

export default function MisOutfits() {
  const navigate = useNavigate()

  const [outfits,    setOutfits]    = useState([])
  const [cargando,   setCargando]   = useState(true)
  const [error,      setError]      = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [covers,     setCovers]     = useState({})  // { outfitId: imagen_url }

  useEffect(() => { cargarOutfits() }, [])

  const cargarOutfits = async () => {
    setCargando(true); setError(null)
    if (esDemoMode()) {
      setOutfits(MOCK_OUTFITS)
      // Portadas desde mock
      const c = {}
      Object.entries(MOCK_OUTFIT_PRENDAS).forEach(([id, prendas]) => {
        const primera = prendas.find(p => p.imagen_url)
        if (primera) c[parseInt(id)] = primera.imagen_url
      })
      setCovers(c)
      setCargando(false)
      return
    }
    try {
      const data = await getOutfitsUsuario(getUsuarioId())
      setOutfits(data)
      cargarPortadas(data)
    } catch {
      setError("No se pudieron cargar los outfits.")
    } finally {
      setCargando(false)
    }
  }

  // Carga progresiva: busca la primera prenda con imagen de cada outfit
  const cargarPortadas = (lista) => {
    lista.forEach(async outfit => {
      try {
        const res = await fetch(`${API}/outfits/${outfit.id}/prendas`)
        const prendas = await res.json()
        const primera = Array.isArray(prendas) && prendas.find(p => p.imagen_url)
        if (primera) setCovers(prev => ({ ...prev, [outfit.id]: primera.imagen_url }))
      } catch {}
    })
  }

  const handleEliminar = async (outfitId) => {
    if (esDemoMode()) { setOutfits(prev => prev.filter(o => o.id !== outfitId)); return }
    setEliminando(outfitId)
    try {
      await eliminarOutfit(outfitId)
      setOutfits(prev => prev.filter(o => o.id !== outfitId))
    } catch {
      setError("No se pudo eliminar el outfit.")
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div className="outfits">
      {/* Header */}
      <div className="outfits__header">
        <h1 className="outfits__titulo">Mis Outfits</h1>
        <button className="outfits__btn-nuevo" onClick={() => navigate("/recomendaciones")}>
          + Nuevo
        </button>
      </div>

      {error && <p className="outfits__error">{error}</p>}

      {/* Cargando */}
      {cargando && (
        <div className="outfits__cargando">
          <div className="outfits__spinner" />
          <p>Cargando tus outfits…</p>
        </div>
      )}

      {/* Vacío */}
      {!cargando && outfits.length === 0 && (
        <div className="outfits__vacio">
          <img src="/logo.png" alt="Closy" className="outfits__vacio-logo" />
          <p>Aún no tienes outfits guardados.</p>
          <p>¡Pídele a Closy que te arme uno!</p>
          <button onClick={() => navigate("/recomendaciones")}>Crear mi primer outfit</button>
        </div>
      )}

      {/* Galería */}
      <div className="outfits__galeria">
        {outfits.map(outfit => {
          const cfg    = OCASION_CFG[outfit.ocasion_id]
          const portada = covers[outfit.id]

          return (
            <div
              key={outfit.id}
              className="outfits__card"
              onClick={() => navigate(`/outfit/${outfit.id}`)}
            >
              {/* Imagen real o gradiente */}
              {portada ? (
                <img src={portada} alt={outfit.nombre} className="outfits__card-img" />
              ) : (
                <div
                  className="outfits__card-grad"
                  style={{ background: cfg?.bg ?? DEFAULT_BG }}
                >
                  <div className="outfits__card-dots" />
                </div>
              )}

              {/* Botón eliminar */}
              <button
                className="outfits__card-del"
                onClick={e => { e.stopPropagation(); handleEliminar(outfit.id) }}
                disabled={eliminando === outfit.id}
                aria-label="Eliminar"
              >
                {eliminando === outfit.id ? "·" : "×"}
              </button>

              {/* Info overlay */}
              <div className="outfits__card-info">
                <p className="outfits__card-nombre">{outfit.nombre}</p>
                <div className="outfits__card-chips">
                  {cfg && <span className="outfits__chip">{cfg.label}</span>}
                  {outfit.ideal_clima && (
                    <span className="outfits__chip outfits__chip--clima">
                      {CLIMA_LABEL[outfit.ideal_clima] || outfit.ideal_clima}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { esDemoMode } from "../utils/auth"
import { MOCK_OUTFITS, MOCK_OUTFIT_PRENDAS } from "../utils/mockData"
import "./OutfitDetalle.css"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const OCASION_LABEL = { 1: "Universidad", 2: "Trabajo", 3: "Casual" }
const CLIMA_COLOR   = { frio: "#93c5fd", templado: "#fbbf24", calor: "#fb923c" }
const CATEGORIA_NOMBRE = {
  1: "Manga larga", 2: "Manga corta",
  3: "Parte de abajo (largo)", 4: "Parte de abajo (corto)",
  5: "Zapatos", 6: "Accesorio",
}

export default function OutfitDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [outfit, setOutfit]   = useState(null)
  const [prendas, setPrendas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const outfitId = parseInt(id, 10)

    if (esDemoMode()) {
      const o = MOCK_OUTFITS.find((x) => x.id === outfitId)
      setOutfit(o || null)
      setPrendas(MOCK_OUTFIT_PRENDAS[outfitId] || [])
      setCargando(false)
      return
    }

    Promise.all([
      fetch(`${API}/outfits/${outfitId}`).then((r) => r.json()),
      fetch(`${API}/outfits/${outfitId}/prendas`).then((r) => r.json()),
    ])
      .then(([o, p]) => { setOutfit(o); setPrendas(Array.isArray(p) ? p : []) })
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) return <div className="detalle__loading">Cargando...</div>
  if (!outfit)  return <div className="detalle__loading">Outfit no encontrado.</div>

  const accentColor = CLIMA_COLOR[outfit.ideal_clima] || "#e9d5ff"

  return (
    <div className="detalle">
      <button className="detalle__volver" onClick={() => navigate("/mis-outfits")}>
        ← Volver
      </button>

      <div className="detalle__header" style={{ borderLeft: `4px solid ${accentColor}` }}>
        <h1 className="detalle__nombre">{outfit.nombre}</h1>
        <div className="detalle__tags">
          {outfit.ocasion_id && (
            <span className="detalle__tag detalle__tag--ocasion">
              {OCASION_LABEL[outfit.ocasion_id] || "Ocasión"}
            </span>
          )}
          {outfit.ideal_clima && (
            <span className="detalle__tag detalle__tag--clima">
              {outfit.ideal_clima}
            </span>
          )}
        </div>
        {outfit.created_at && (
          <p className="detalle__fecha">
            {new Date(outfit.created_at).toLocaleDateString("es-CL", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="detalle__acciones">
        <button
          className="detalle__btn-pizarron"
          onClick={() => navigate("/pizarron", { state: { prendas } })}
          disabled={prendas.length === 0}
        >
          Editar en pizarrón
        </button>
      </div>

      <h2 className="detalle__subtitulo">Prendas del outfit</h2>

      {prendas.length === 0 ? (
        <p className="detalle__vacio">No hay prendas registradas para este outfit.</p>
      ) : (
        <div className="detalle__grid">
          {prendas.map((p) => (
            <div key={p.id} className="detalle__card">
              {p.imagen_url ? (
                <img src={p.imagen_url} alt={p.nombre} className="detalle__card-img" />
              ) : (
                <div className="detalle__card-placeholder">👗</div>
              )}
              <p className="detalle__card-nombre">{p.nombre}</p>
              <p className="detalle__card-cat">{CATEGORIA_NOMBRE[p.categoria_id] || "Prenda"}</p>
              {p.color && <p className="detalle__card-color">{p.color}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
